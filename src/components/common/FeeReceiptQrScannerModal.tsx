import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Printer, 
  ExternalLink, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  User, 
  Calendar, 
  CreditCard,
  FlipHorizontal,
  Zap,
  ArrowRight
} from 'lucide-react';
import jsQR from 'jsqr';
import { FeeReceipt, Student } from '../../types';
import { generateReceiptPdf } from '../../lib/pdfGenerator';
import SunshineLogo from '../SunshineLogo';

export interface FeeReceiptQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeReceipts?: FeeReceipt[];
  students?: Student[];
  jwtToken?: string;
  onViewInLedger?: (receipt: FeeReceipt) => void;
}

export interface VerifiedReceiptData {
  receiptNumber: string;
  studentName: string;
  studentRollNo?: string;
  studentClass?: string;
  preferredBatch?: string;
  amount: number;
  paymentDate: string;
  status: 'VALID' | 'VOID' | 'PENDING' | 'AUTHENTIC';
  paymentMode?: string;
  transactionId?: string;
  month?: string;
  receivedBy?: string;
  rawReceipt?: FeeReceipt;
}

export const FeeReceiptQrScannerModal: React.FC<FeeReceiptQrScannerModalProps> = ({
  isOpen,
  onClose,
  feeReceipts = [],
  students = [],
  jwtToken,
  onViewInLedger
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanning & Processing states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifiedReceiptData | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Media refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Audio beep feedback using AudioContext synthesis
  const playScanBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High clear A5 tone
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio autoplay or permissions disabled, silently ignore
    }
  }, []);

  // Helper to extract receipt number from arbitrary URL, path or raw token
  const extractReceiptNumber = useCallback((rawScannedText: string): string => {
    const text = (rawScannedText || '').trim();
    if (!text) return '';

    // Check if it's a verification URL: .../verify/receipt/:receiptNumber
    const verifyMatch = text.match(/\/verify\/receipt\/([A-Za-z0-9_-]+)/i);
    if (verifyMatch && verifyMatch[1]) {
      return verifyMatch[1].trim();
    }

    // Check if it's a URL query param: ...?receiptNumber=REC-xxx or ...?id=REC-xxx
    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const parsedUrl = new URL(text);
        const paramId = parsedUrl.searchParams.get('receiptNumber') || 
                        parsedUrl.searchParams.get('receipt') || 
                        parsedUrl.searchParams.get('id');
        if (paramId) return paramId.trim();

        const pathnameParts = parsedUrl.pathname.split('/').filter(Boolean);
        const lastPart = pathnameParts[pathnameParts.length - 1];
        if (lastPart) return lastPart.trim();
      }
    } catch {
      // Not a valid URL, continue
    }

    return text;
  }, []);

  // Verification processor: Checks local database first, then tries backend API
  const handleVerifyReceiptNumber = useCallback(async (receiptIdentifier: string) => {
    const cleanId = extractReceiptNumber(receiptIdentifier);
    if (!cleanId) return;

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      // 1. First, check local/synced feeReceipts array
      const localMatch = feeReceipts.find(r => 
        (r.receiptNumber && r.receiptNumber.toLowerCase() === cleanId.toLowerCase()) ||
        (r.id && r.id.toLowerCase() === cleanId.toLowerCase()) ||
        (r.paymentId && r.paymentId.toLowerCase() === cleanId.toLowerCase())
      );

      // Resolve student profile if available
      const matchedStudent = localMatch 
        ? students.find(s => s.id === localMatch.studentId || (localMatch.rollNo && s.rollNo === localMatch.rollNo))
        : null;

      if (localMatch) {
        setVerificationResult({
          receiptNumber: localMatch.receiptNumber || localMatch.id,
          studentName: localMatch.studentName || matchedStudent?.name || 'Verified Student',
          studentRollNo: localMatch.rollNo || matchedStudent?.rollNo || 'N/A',
          studentClass: localMatch.class || matchedStudent?.class || 'N/A',
          preferredBatch: localMatch.preferredBatch || matchedStudent?.preferredBatch || 'Regular Batch',
          amount: Number(localMatch.amountPaid ?? localMatch.amount ?? 0),
          paymentDate: localMatch.date || (localMatch as any).generatedAt || new Date().toISOString().split('T')[0],
          status: 'AUTHENTIC',
          paymentMode: localMatch.paymentMode || localMatch.paymentMethod || 'CASH',
          transactionId: localMatch.transactionId || 'OFFICIAL_SETTLEMENT',
          month: localMatch.month || (localMatch.monthsCovered && localMatch.monthsCovered.join(', ')) || 'Current Session',
          receivedBy: localMatch.receivedBy || (localMatch as any).generatedBy || 'Sunshine Accounts Office',
          rawReceipt: localMatch
        });
        setIsVerifying(false);
        return;
      }

      // 2. Query public verification endpoint: /verify/receipt/:cleanId
      let apiVerified = false;
      try {
        const res = await fetch(`/verify/receipt/${encodeURIComponent(cleanId)}`);
        const json = await res.json();
        if (json.success && json.data) {
          apiVerified = true;
          const apiData = json.data;
          setVerificationResult({
            receiptNumber: apiData.receiptNumber || cleanId,
            studentName: apiData.studentName || 'Student',
            studentRollNo: apiData.rollNo || 'N/A',
            studentClass: apiData.class || 'N/A',
            preferredBatch: apiData.preferredBatch || 'Regular Batch',
            amount: Number(apiData.amount || 0),
            paymentDate: apiData.paymentDate || new Date().toISOString(),
            status: apiData.status || 'VALID',
            paymentMode: apiData.paymentMode || 'CASH',
            transactionId: apiData.transactionId || 'VERIFIED',
            month: apiData.month || 'Current Session',
            receivedBy: apiData.receivedBy || 'Sunshine Accounts Office'
          });
        }
      } catch (networkErr) {
        console.warn('[FeeReceiptQrScanner] Online verify fallback warning:', networkErr);
      }

      // 3. If public verification endpoint did not find it, try authenticated fee API if token exists
      if (!apiVerified && jwtToken) {
        try {
          const authRes = await fetch(`/api/fees/receipt/${encodeURIComponent(cleanId)}`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
          });
          const authJson = await authRes.json();
          if (authJson.success && authJson.data) {
            apiVerified = true;
            const item = authJson.data;
            setVerificationResult({
              receiptNumber: item.receiptNumber || item.id,
              studentName: item.studentName || 'Student',
              studentRollNo: item.rollNo || 'N/A',
              studentClass: item.class || 'N/A',
              preferredBatch: item.preferredBatch || 'Regular Batch',
              amount: Number(item.amount || item.amountPaid || 0),
              paymentDate: item.generatedAt || item.date || new Date().toISOString(),
              status: 'VALID',
              paymentMode: item.paymentMode || 'CASH',
              transactionId: item.transactionId || 'VERIFIED',
              month: item.monthsCovered ? item.monthsCovered.join(', ') : item.month || 'Current Session',
              receivedBy: item.generatedBy || 'Sunshine Accounts Office'
            });
          }
        } catch {
          // Fall through to error
        }
      }

      if (!apiVerified) {
        setVerificationError(`No matching fee receipt found for ID "${cleanId}". The receipt may have been purged, voided, or the QR code belongs to an external document.`);
      }
    } catch (err: any) {
      setVerificationError(`Verification check failed: ${err?.message || 'Server unreachable'}`);
    } finally {
      setIsVerifying(false);
    }
  }, [extractReceiptNumber, feeReceipts, students, jwtToken]);

  // Handle successful QR detection
  const onQrDecoded = useCallback((detectedText: string) => {
    if (isVerifying || !isScanningRef.current) return;
    
    // Stop scanning loop temporarily
    isScanningRef.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    playScanBeep();
    handleVerifyReceiptNumber(detectedText);
  }, [isVerifying, playScanBeep, handleVerifyReceiptNumber]);

  // Real-time camera video frame analysis loop
  const scanVideoFrame = useCallback(() => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && code.data.trim().length > 0) {
          onQrDecoded(code.data);
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
  }, [onQrDecoded]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCameraActive(false);

    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        isScanningRef.current = true;
        animationFrameId.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('[FeeReceiptQrScanner] Camera start failed:', err);
      let msg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser settings or switch to Image Upload / Manual Entry.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No video camera detected on your device. Use the Image Upload or Manual Entry tab instead.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Camera is currently in use by another application.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  }, [cameraFacing, scanVideoFrame]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Manage camera lifecycle based on modal visibility and active mode
  useEffect(() => {
    if (isOpen && activeMode === 'camera' && !verificationResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, verificationResult, startCamera, stopCamera]);

  // Decode uploaded image file
  const handleImageFile = useCallback((file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setVerificationError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setVerificationError(null);
    setIsVerifying(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setVerificationError('Could not initialize canvas context for QR processing.');
            setIsVerifying(false);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data && code.data.trim()) {
            playScanBeep();
            handleVerifyReceiptNumber(code.data);
          } else {
            setIsVerifying(false);
            setVerificationError('No QR code detected in the selected image. Make sure the QR code on the receipt is clear, in-focus, and well-lit.');
          }
        } catch (procErr: any) {
          setIsVerifying(false);
          setVerificationError(`Failed to parse image QR: ${procErr?.message || 'Unknown processing error'}`);
        }
      };
      img.onerror = () => {
        setIsVerifying(false);
        setVerificationError('Could not load the image file. It may be corrupted or unsupported.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [handleVerifyReceiptNumber, playScanBeep]);

  // Reset scanner to scan another receipt immediately
  const handleResetForNextScan = () => {
    setVerificationResult(null);
    setVerificationError(null);
    setManualInput('');
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  // Switch camera between environment (back) and user (front)
  const handleFlipCamera = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Download PDF receipt from verified result
  const handleDownloadPdf = async () => {
    if (!verificationResult) return;
    setIsDownloadingPdf(true);
    try {
      const studentAdapter: Student = {
        id: verificationResult.studentRollNo || 'std-verified',
        userId: 'u-student',
        rollNo: verificationResult.studentRollNo || 'N/A',
        name: verificationResult.studentName,
        class: verificationResult.studentClass || 'Class 10',
        fatherName: '',
        motherName: '',
        dob: '2010-01-01',
        gender: 'Other',
        address: '',
        mobile: '',
        whatsapp: '',
        parentMobile: '',
        email: '',
        preferredBatch: verificationResult.preferredBatch || 'Regular Batch',
        preferredTiming: 'Evening',
        admissionDate: '2026-01-01',
        attendancePercentage: 100
      };

      const receiptAdapter: FeeReceipt = verificationResult.rawReceipt || {
        id: verificationResult.receiptNumber,
        receiptNumber: verificationResult.receiptNumber,
        studentId: studentAdapter.id,
        studentName: verificationResult.studentName,
        class: verificationResult.studentClass || 'Class 10',
        month: verificationResult.month || 'Current Session',
        amountPaid: verificationResult.amount,
        paymentMethod: (verificationResult.paymentMode as any) || 'CASH',
        date: verificationResult.paymentDate,
        transactionId: verificationResult.transactionId,
        receivedBy: verificationResult.receivedBy
      };

      const docObj = generateReceiptPdf(receiptAdapter, studentAdapter);
      docObj.save(`Verified-Receipt-${verificationResult.receiptNumber}.pdf`);
    } catch (err) {
      console.error('[FeeReceiptQrScanner] PDF download error:', err);
      alert('Could not generate PDF receipt download.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Print verified receipt
  const handlePrint = () => {
    if (!verificationResult) return;
    try {
      const studentAdapter: Student = {
        id: verificationResult.studentRollNo || 'std-verified',
        userId: 'u-student',
        rollNo: verificationResult.studentRollNo || 'N/A',
        name: verificationResult.studentName,
        class: verificationResult.studentClass || 'Class 10',
        fatherName: '',
        motherName: '',
        dob: '2010-01-01',
        gender: 'Other',
        address: '',
        mobile: '',
        whatsapp: '',
        parentMobile: '',
        email: '',
        preferredBatch: verificationResult.preferredBatch || 'Regular Batch',
        preferredTiming: 'Evening',
        admissionDate: '2026-01-01',
        attendancePercentage: 100
      };

      const receiptAdapter: FeeReceipt = verificationResult.rawReceipt || {
        id: verificationResult.receiptNumber,
        receiptNumber: verificationResult.receiptNumber,
        studentId: studentAdapter.id,
        studentName: verificationResult.studentName,
        class: verificationResult.studentClass || 'Class 10',
        month: verificationResult.month || 'Current Session',
        amountPaid: verificationResult.amount,
        paymentMethod: (verificationResult.paymentMode as any) || 'CASH',
        date: verificationResult.paymentDate,
        transactionId: verificationResult.transactionId,
        receivedBy: verificationResult.receivedBy
      };

      const docObj = generateReceiptPdf(receiptAdapter, studentAdapter);
      const pdfBlob = docObj.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        docObj.save(`Receipt-${verificationResult.receiptNumber}.pdf`);
      }
    } catch {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-fee-receipt-qr-scanner-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        id="modal-fee-receipt-qr-scanner"
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 my-6 overflow-hidden relative flex flex-col max-h-[92vh]"
      >
        {/* Top brand accent bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-900 via-brand-orange to-indigo-700 w-full shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-900 dark:text-indigo-400 shadow-xs">
                <QrCode size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  Rapid Fee Receipt QR Scanner
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Live Auditor
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Point device camera at any Sunshine fee receipt QR code for instantaneous cryptographic validation.
                </p>
              </div>
            </div>

            <button
              id="btn-close-qr-scanner-modal"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close QR Scanner"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Switcher Tabs (Only shown when not displaying result) */}
          {!verificationResult && (
            <div className="flex items-center gap-2 mt-4 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl" id="nav-scanner-modes">
              <button
                id="btn-tab-scanner-camera"
                type="button"
                onClick={() => {
                  setActiveMode('camera');
                  setVerificationError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeMode === 'camera'
                    ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Camera size={14} /> Live Camera
              </button>

              <button
                id="btn-tab-scanner-upload"
                type="button"
                onClick={() => {
                  setActiveMode('upload');
                  setVerificationError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeMode === 'upload'
                    ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Upload size={14} /> Upload Screenshot
              </button>

              <button
                id="btn-tab-scanner-manual"
                type="button"
                onClick={() => {
                  setActiveMode('manual');
                  setVerificationError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeMode === 'manual'
                    ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Search size={14} /> Manual ID
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* 1. VERIFICATION RESULT VIEW */}
          {verificationResult ? (
            <div id="panel-verification-result" className="space-y-5 animate-fade-in">
              {/* Status Header Badge */}
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 p-5 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle2 size={28} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                  Payment Verified &amp; Cryptographically Authentic
                </span>
                <h4 className="font-display font-black text-xl text-slate-900 dark:text-white mt-2">
                  ₹{verificationResult.amount.toLocaleString('en-IN')} Settled
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                  Receipt #{verificationResult.receiptNumber}
                </p>
              </div>

              {/* Verified Details Grid */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 divide-y divide-slate-200/80 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <User size={13} className="text-indigo-600" />
                    {verificationResult.studentName}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Roll No &amp; Class</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Roll #{verificationResult.studentRollNo || 'N/A'} • {verificationResult.studentClass} ({verificationResult.preferredBatch || 'Regular Batch'})
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Billing Month / Cycle</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    {verificationResult.month}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Payment Method</span>
                  <span className="font-bold text-indigo-900 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                    {verificationResult.paymentMode}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Transaction / UTR Reference</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[240px]">
                    {verificationResult.transactionId}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Date Issued &amp; Officer</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {new Date(verificationResult.paymentDate).toLocaleDateString()} • {verificationResult.receivedBy}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  id="btn-scan-another-receipt"
                  type="button"
                  onClick={handleResetForNextScan}
                  className="rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs px-4 py-2.5 flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <RefreshCw size={14} /> Scan Next Receipt
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-print-scanned-receipt"
                    type="button"
                    onClick={handlePrint}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs px-3.5 py-2.5 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer size={14} /> Print
                  </button>

                  <button
                    id="btn-download-scanned-receipt-pdf"
                    type="button"
                    disabled={isDownloadingPdf}
                    onClick={handleDownloadPdf}
                    className="rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Download size={14} />
                    {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
                  </button>

                  <a
                    id="btn-open-scanned-public-portal"
                    href={`/verify/receipt/${encodeURIComponent(verificationResult.receiptNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-400 font-bold text-xs px-3 py-2.5 flex items-center gap-1 hover:underline transition"
                  >
                    Public Link <ExternalLink size={12} />
                  </a>

                  {onViewInLedger && verificationResult.rawReceipt && (
                    <button
                      id="btn-view-in-student-ledger"
                      type="button"
                      onClick={() => {
                        if (verificationResult.rawReceipt) {
                          onViewInLedger(verificationResult.rawReceipt);
                          onClose();
                        }
                      }}
                      className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2.5 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      View in Ledger <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 2. SCANNER INPUT VIEWS */
            <div className="space-y-4">
              {/* Feedback Error Notice */}
              {verificationError && (
                <div id="notice-scanner-error" className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Verification Error</p>
                    <p className="mt-0.5 leading-relaxed text-[11px]">{verificationError}</p>
                  </div>
                  <button
                    id="btn-dismiss-scanner-error"
                    type="button"
                    onClick={() => setVerificationError(null)}
                    className="text-rose-500 hover:text-rose-800 p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* MODE A: LIVE CAMERA */}
              {activeMode === 'camera' && (
                <div className="space-y-3">
                  <div 
                    id="container-camera-viewfinder"
                    className="relative w-full aspect-4/3 max-h-[380px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-inner"
                  >
                    <video
                      id="video-qr-camera-stream"
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <canvas
                      id="canvas-qr-frame-processor"
                      ref={canvasRef}
                      className="hidden"
                    />

                    {/* Camera Viewfinder Overlay & Target Bracket Guides */}
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                        {/* Semi-transparent dimmed surrounding */}
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                          {/* Corner Reticle Accents */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                          {/* Animated Vertical Scanline */}
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce-slow" />
                        </div>

                        <span className="absolute bottom-4 text-center text-[10px] text-white/90 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          Center QR Code Inside Box
                        </span>
                      </div>
                    )}

                    {/* Camera Loading or Error State */}
                    {!isCameraActive && !cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 p-4 text-center">
                        <div className="w-8 h-8 border-3 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-300">Initializing camera feed...</span>
                      </div>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 gap-3 p-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                          <AlertCircle size={24} />
                        </div>
                        <p className="text-xs text-rose-300 font-bold max-w-xs">{cameraError}</p>
                        <div className="flex gap-2 mt-1">
                          <button
                            id="btn-retry-camera"
                            type="button"
                            onClick={startCamera}
                            className="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <RefreshCw size={12} /> Retry
                          </button>
                          <button
                            id="btn-switch-upload-mode"
                            type="button"
                            onClick={() => setActiveMode('upload')}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                          >
                            <Upload size={12} /> Upload Screenshot
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Top Right Floating Controls */}
                    {isCameraActive && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto">
                        <button
                          id="btn-flip-scanner-camera"
                          type="button"
                          onClick={handleFlipCamera}
                          className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl border border-white/20 transition cursor-pointer shadow"
                          title="Flip Camera (Front/Rear)"
                        >
                          <FlipHorizontal size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    High-speed zero latency QR decoding with instantaneous ledger verification.
                  </p>
                </div>
              )}

              {/* MODE B: UPLOAD IMAGE / SCREENSHOT */}
              {activeMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    id="dropzone-qr-image-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-brand-orange bg-orange-50/50 dark:bg-orange-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-850'
                    }`}
                    onClick={() => {
                      document.getElementById('input-qr-image-upload')?.click();
                    }}
                  >
                    <input
                      id="input-qr-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-900 dark:text-indigo-400 mb-3 shadow-xs">
                      <Upload size={28} />
                    </div>

                    <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">
                      Drop Receipt Image or Browse File
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Supports phone photos of paper receipts, PDF screenshots, WhatsApp shared receipts, or digital downloads.
                    </p>

                    <span className="mt-4 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs px-4 py-2 shadow-sm transition">
                      Choose Receipt Image
                    </span>
                  </div>
                </div>
              )}

              {/* MODE C: MANUAL ID ENTRY */}
              {activeMode === 'manual' && (
                <div className="space-y-4">
                  <form
                    id="form-manual-qr-entry"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyReceiptNumber(manualInput);
                    }}
                    className="space-y-3"
                  >
                    <label 
                      htmlFor="input-manual-receipt-id" 
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Enter Receipt Number or Verification URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="input-manual-receipt-id"
                        type="text"
                        required
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="e.g. REC-20260724-1234 or paste QR URL"
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-800 dark:text-white shadow-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        id="btn-manual-verify-submit"
                        type="submit"
                        disabled={isVerifying || !manualInput.trim()}
                        className="rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs px-4 py-2.5 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search size={14} /> Verify
                      </button>
                    </div>
                  </form>

                  {/* Quick Examples */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Recent Receipts on Record ({feeReceipts.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                      {feeReceipts.slice(0, 6).map((r) => {
                        const recId = r.receiptNumber || r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            id={`btn-sample-receipt-${r.id}`}
                            onClick={() => {
                              setManualInput(recId);
                              handleVerifyReceiptNumber(recId);
                            }}
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-[10px] font-bold text-indigo-900 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-600 transition cursor-pointer"
                          >
                            {recId} • {r.studentName}
                          </button>
                        );
                      })}
                      {feeReceipts.length === 0 && (
                        <span className="text-[11px] text-slate-400">No cached receipts loaded yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {isVerifying && (
                <div id="status-scanner-verifying" className="flex items-center justify-center gap-2.5 py-3 text-indigo-900 dark:text-indigo-300">
                  <div className="w-5 h-5 border-2 border-indigo-900 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">Cryptographically checking receipt validity...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <SunshineLogo size={20} showText={false} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Sunshine Classes Accounts Security &amp; Ledger
            </span>
          </div>

          <button
            id="btn-close-scanner-bottom"
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeReceiptQrScannerModal;
