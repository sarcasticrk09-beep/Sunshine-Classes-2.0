import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  CreditCard, 
  GraduationCap, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { FeeReceipt, Student } from '../../types';
import { generateReceiptPdf } from '../../lib/pdfGenerator';
import SunshineLogo from '../SunshineLogo';
import QRCode from 'qrcode';

export interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: FeeReceipt | null;
  student?: Student | null;
  title?: string;
  subtitle?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  receipt,
  student,
  title = 'Payment Successful!',
  subtitle = 'Official fee payment has been recorded. Your verified PDF receipt is ready for instant download.'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedReceiptId, setCopiedReceiptId] = useState(false);

  if (!isOpen || !receipt) {
    return null;
  }

  // Normalize student and receipt properties defensively
  const resolvedReceiptId = receipt.id || receipt.receiptNumber || receipt.receiptId || `REC-${Date.now()}`;
  const studentName = receipt.studentName || student?.name || 'Student';
  const studentClass = receipt.class || receipt.className || student?.class || 'Class 10';
  const studentRollNo = student?.rollNo || receipt.rollNo || receipt.rollNumber || student?.id || receipt.studentId || 'N/A';
  const preferredBatch = student?.preferredBatch || receipt.preferredBatch || 'Regular Batch';
  const billingMonth = receipt.month || (receipt.monthsCovered && receipt.monthsCovered[0]) || 'Current Session';
  const amountPaid = Number(receipt.amountPaid ?? receipt.amount ?? 0);
  const paymentMethod = receipt.paymentMethod || receipt.paymentMode || 'CASH';
  const paymentDate = receipt.date || receipt.generatedAt || new Date().toISOString().split('T')[0];
  const transactionId = receipt.transactionId || 'N/A';
  const receivedBy = receipt.receivedBy || receipt.generatedBy || 'Sunshine Accounts Office';

  const resolvedStudent: Student = {
    id: student?.id || receipt.studentId || 'N/A',
    userId: student?.userId || 'u-student',
    rollNo: studentRollNo,
    name: studentName,
    class: studentClass,
    fatherName: student?.fatherName || '',
    motherName: student?.motherName || '',
    dob: student?.dob || '2010-01-01',
    gender: student?.gender || 'Other',
    address: student?.address || '',
    mobile: student?.mobile || '',
    whatsapp: student?.whatsapp || '',
    parentMobile: student?.parentMobile || '',
    email: student?.email || '',
    preferredBatch: preferredBatch,
    preferredTiming: student?.preferredTiming || 'Evening',
    admissionDate: student?.admissionDate || '2026-01-01',
    attendancePercentage: student?.attendancePercentage || 95
  };

  const resolvedReceipt: FeeReceipt = {
    ...receipt,
    id: resolvedReceiptId,
    studentId: resolvedStudent.id,
    studentName: studentName,
    class: studentClass,
    month: billingMonth,
    amountPaid: amountPaid,
    paymentMethod: paymentMethod as any,
    date: paymentDate,
    transactionId: transactionId,
    receivedBy: receivedBy,
    notes: receipt.notes || ''
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const docObj = generateReceiptPdf(resolvedReceipt, resolvedStudent);
      
      try {
        // Stamp public verification QR code onto receipt if origin is accessible
        const verifyUrl = `${window.location.origin}/verify/receipt/${resolvedReceiptId}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });
        docObj.addImage(qrDataUrl, 'PNG', 20, 145, 25, 25);
      } catch (qrErr) {
        // Soft fallback: proceed with download if QR code generation fails
        console.warn('[PaymentSuccessModal] QR stamp warning:', qrErr);
      }

      docObj.save(`Receipt-${resolvedReceiptId}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('[PaymentSuccessModal] PDF download error:', err);
      alert('Could not download PDF receipt. Please try printing or view history.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      const docObj = generateReceiptPdf(resolvedReceipt, resolvedStudent);
      const pdfBlob = docObj.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        // Fallback if popup blocked: direct download
        handleDownloadPdf();
      }
    } catch (err) {
      console.error('[PaymentSuccessModal] Print preview error:', err);
      handleDownloadPdf();
    }
  };

  const handleCopyReceiptId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(resolvedReceiptId);
      setCopiedReceiptId(true);
      setTimeout(() => setCopiedReceiptId(false), 2000);
    }
  };

  return (
    <div 
      id="modal-fee-payment-success-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
    >
      <div 
        id="modal-fee-payment-success"
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 my-8 overflow-hidden relative"
      >
        {/* Top brand gradient accent bar */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 w-full" />

        {/* Modal Inner Content */}
        <div className="p-6 sm:p-7">
          {/* Header Row with Branding and Close Button */}
          <div className="flex items-center justify-between pb-4 mb-2">
            <div className="flex items-center gap-2.5">
              <SunshineLogo size={28} showText={false} />
              <div>
                <span className="font-display font-black text-xs tracking-wider text-slate-900 dark:text-white uppercase">Sunshine Classes</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block -mt-0.5">ERP Accounts & Fee Ledger</span>
              </div>
            </div>
            <button
              id="btn-close-payment-modal-top"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal and stay on dashboard"
            >
              <X size={18} />
            </button>
          </div>

          {/* Success Hero Header */}
          <div className="text-center py-3">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xs">
              <CheckCircle2 size={34} className="animate-pulse" />
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div 
            id="card-receipt-summary"
            className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-4 text-xs space-y-3"
          >
            {/* Receipt Number Tag & Copy */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-1.5">
                <FileText size={13} className="text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Receipt No:</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-xs">{resolvedReceiptId}</span>
              </div>
              <button
                id="btn-copy-receipt-id"
                type="button"
                onClick={handleCopyReceiptId}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                title="Copy Receipt Number"
              >
                {copiedReceiptId ? (
                  <>
                    <Check size={11} className="text-emerald-500" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Key Information 2-Column Grid */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div className="flex items-start gap-1.5">
                <User size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Student Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{studentName}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <GraduationCap size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Class / Roll</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{studentClass} • {studentRollNo}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Calendar size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Billing Month</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{billingMonth}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <CreditCard size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Payment Mode</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{paymentMethod}</span>
                </div>
              </div>

              {transactionId && transactionId !== 'N/A' && (
                <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Txn Reference UTR:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{transactionId}</span>
                </div>
              )}
            </div>

            {/* Financial Settlement Highlight Bar */}
            <div className="border-t border-slate-200/80 dark:border-slate-700 pt-3 mt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid Amount</span>
                <div className="font-display font-black text-xl text-emerald-600 dark:text-emerald-400 flex items-baseline gap-0.5">
                  <span className="text-sm">₹</span>
                  <span>{amountPaid.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 font-mono">.00</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold">
                <ShieldCheck size={13} />
                <span>Verified & Settled</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="mt-6 space-y-2.5">
            {/* Primary Download Button */}
            <button
              id="btn-download-pdf-receipt"
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className={`w-full rounded-2xl py-3 px-4 text-xs font-black text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                downloadSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-brand-orange hover:bg-amber-600 active:scale-[0.99]'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Generating PDF Receipt...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check size={16} />
                  <span>PDF Downloaded Successfully!</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download PDF Receipt</span>
                </>
              )}
            </button>

            {/* Secondary Action Grid (Print & Return to Dashboard) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-print-receipt"
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 py-2.5 px-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>

              <button
                id="btn-close-payment-success-modal"
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 py-2.5 px-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={14} className="text-emerald-500" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Discreet Footer Note */}
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-4">
            You remain on your dashboard without page reloads. The receipt is also permanently archived in your history.
          </p>
        </div>
      </div>
    </div>
  );
};
