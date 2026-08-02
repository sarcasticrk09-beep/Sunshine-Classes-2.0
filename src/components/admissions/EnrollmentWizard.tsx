/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  School, 
  MapPin, 
  Upload, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Calendar,
  CreditCard,
  Building,
  Check,
  Save,
  RotateCcw
} from 'lucide-react';
import { User as UserType, Admission, Batch, ClassEntity } from '../../types';
import { CloudinaryUpload } from '../CloudinaryUpload';

interface EnrollmentWizardProps {
  currentUser: UserType | null;
  classes?: ClassEntity[];
  batches?: Batch[];
  initialClass?: string;
  existingApplication?: Admission | null;
  onSubmitApplication: (data: Omit<Admission, 'id' | 'date'>) => Promise<void>;
  onCancel?: () => void;
  onSuccessNavigate?: () => void;
}

const DEFAULT_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];

const DEFAULT_BATCHES = [
  { id: 'b1', name: 'Class 10 Morning Board Specialist', time: '07:00 AM - 09:00 AM', fee: 1800 },
  { id: 'b2', name: 'Class 10 Evening Board Specialist', time: '04:00 PM - 06:00 PM', fee: 1800 },
  { id: 'b3', name: 'Class 9 Foundation Regular', time: '08:00 AM - 10:00 AM', fee: 1500 },
  { id: 'b4', name: 'Class 8 Primary Achievers', time: '03:00 PM - 05:00 PM', fee: 1200 },
];

export const EnrollmentWizard: React.FC<EnrollmentWizardProps> = ({
  currentUser,
  classes = [],
  batches = [],
  initialClass = 'Class 10',
  existingApplication = null,
  onSubmitApplication,
  onCancel,
  onSuccessNavigate
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Pre-filled account info
    studentName: currentUser?.name || existingApplication?.studentName || '',
    mobile: currentUser?.phone || existingApplication?.mobile || '',
    parentName: currentUser?.parentName || existingApplication?.fatherName || '',
    parentMobile: currentUser?.parentMobile || existingApplication?.parentMobile || '',
    email: currentUser?.email || existingApplication?.email || '',

    // Step 2: Academic Details
    className: existingApplication?.className || initialClass,
    previousSchool: existingApplication?.previousSchool || '',
    board: existingApplication?.board || 'CBSE',
    preferredBatch: existingApplication?.preferredBatch || 'Class 10 Morning Board Specialist',
    preferredTiming: existingApplication?.preferredTiming || '07:00 AM - 09:00 AM',
    preferredStartMonth: existingApplication?.preferredStartMonth || 'April 2026',
    gender: existingApplication?.gender || 'Male',
    dob: existingApplication?.dob || '2011-05-15',
    paymentPlan: (existingApplication?.paymentPlan || 'Monthly') as 'Monthly' | 'Quarterly' | 'Yearly',

    // Step 3: Address
    houseFlat: existingApplication?.houseFlat || '',
    areaLocality: existingApplication?.areaLocality || '',
    city: existingApplication?.city || 'Pihani',
    district: existingApplication?.district || 'Hardoi',
    state: existingApplication?.state || 'Uttar Pradesh',
    pincode: existingApplication?.pincode || '241406',

    // Step 4: Documents (Optional)
    photoUrl: existingApplication?.photoUrl || '',
    birthCertUrl: existingApplication?.birthCertUrl || '',
    aadhar: existingApplication?.aadhar || '',
    schoolIdUrl: existingApplication?.schoolIdUrl || '',
    marksheetUrl: existingApplication?.marksheetUrl || '',
    documentUrl: existingApplication?.documentUrl || ''
  });

  // Draft Auto-Save Key
  const draftKey = `sunshine_enroll_draft_${currentUser?.id || 'guest'}`;

  // Restore Draft if exists & not editing an existing application
  useEffect(() => {
    if (!existingApplication) {
      try {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Always keep currentUser account info fresh
            studentName: currentUser?.name || parsed.studentName,
            mobile: currentUser?.phone || parsed.mobile,
            parentName: currentUser?.parentName || parsed.parentName,
            parentMobile: currentUser?.parentMobile || parsed.parentMobile,
            email: currentUser?.email || parsed.email
          }));
        }
      } catch (err) {
        console.warn("Could not load draft:", err);
      }
    }
  }, [currentUser, existingApplication]);

  // Save draft on state changes
  useEffect(() => {
    if (!existingApplication && !successMessage) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      } catch (err) {
        // ignore
      }
    }
  }, [formData, draftKey, existingApplication, successMessage]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!formData.studentName || !formData.mobile || !formData.parentName || !formData.parentMobile) {
        setErrorMessage("Please fill in account details.");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.className || !formData.board || !formData.dob) {
        setErrorMessage("Please complete current class, board, and date of birth.");
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.areaLocality || !formData.city || !formData.pincode) {
        setErrorMessage("Please fill in locality, city, and pincode.");
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.houseFlat ? formData.houseFlat + ', ' : ''}${formData.areaLocality}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}`;

      // Calculate monthly fee based on class
      let calculatedMonthlyFee = 1500;
      if (classes && classes.length > 0) {
        const matchingClass = classes.find(c => c.name.toLowerCase() === formData.className.toLowerCase());
        if (matchingClass && matchingClass.fee) {
          calculatedMonthlyFee = matchingClass.fee;
        }
      } else if (formData.className.includes('10')) {
        calculatedMonthlyFee = 1800;
      } else if (formData.className.includes('9')) {
        calculatedMonthlyFee = 1600;
      } else if (formData.className.includes('8') || formData.className.includes('7') || formData.className.includes('6')) {
        calculatedMonthlyFee = 1400;
      }

      await onSubmitApplication({
        userId: currentUser?.id,
        studentName: formData.studentName,
        fatherName: formData.parentName,
        motherName: 'N/A',
        dob: formData.dob,
        gender: formData.gender,
        className: formData.className,
        previousSchool: formData.previousSchool,
        mobile: formData.mobile,
        whatsapp: formData.mobile,
        parentMobile: formData.parentMobile,
        email: formData.email,
        address: fullAddress,
        houseFlat: formData.houseFlat,
        areaLocality: formData.areaLocality,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        board: formData.board,
        preferredStartMonth: formData.preferredStartMonth,
        paymentPlan: formData.paymentPlan,
        aadhar: formData.aadhar,
        photoUrl: formData.photoUrl,
        birthCertUrl: formData.birthCertUrl,
        schoolIdUrl: formData.schoolIdUrl,
        marksheetUrl: formData.marksheetUrl,
        documentUrl: formData.documentUrl || formData.birthCertUrl,
        preferredBatch: formData.preferredBatch,
        preferredTiming: formData.preferredTiming,
        monthlyFee: calculatedMonthlyFee,
        status: 'PENDING'
      });

      // Clear local draft
      try {
        localStorage.removeItem(draftKey);
      } catch (e) { /* ignore */ }

      setSuccessMessage(true);
      if (onSuccessNavigate) {
        setTimeout(() => {
          onSuccessNavigate();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { num: 1, name: 'Account Info', icon: User },
    { num: 2, name: 'Academic Details', icon: School },
    { num: 3, name: 'Address Details', icon: MapPin },
    { num: 4, name: 'Documents', icon: Upload },
    { num: 5, name: 'Confirm & Submit', icon: CheckCircle2 }
  ];

  if (successMessage) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-100 p-8 text-center max-w-2xl mx-auto shadow-xl">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Application Submitted Successfully!</h3>
        <p className="text-xs text-slate-500 font-semibold mt-2 max-w-md mx-auto leading-relaxed">
          Your enrollment application for <strong className="text-brand-blue">{formData.className}</strong> has been received by Sunshine Classes Administration.
        </p>
        <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400 font-medium">Applicant Name:</span>
            <span className="font-bold text-slate-800">{formData.studentName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400 font-medium">Applied Course:</span>
            <span className="font-bold text-slate-800">{formData.className} ({formData.board})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Application Status:</span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">PENDING ADMIN REVIEW</span>
          </div>
        </div>
        <button
          type="button"
          id="btn-goto-student-dashboard"
          onClick={() => { if (onSuccessNavigate) onSuccessNavigate(); }}
          className="mt-6 w-full py-3 bg-brand-blue text-white rounded-xl font-extrabold text-xs shadow-md hover:bg-brand-blue-hover transition-all cursor-pointer"
        >
          View Admission Status on Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <School size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2">
              <Sparkles size={12} />
              <span>Academic Session 2026–27 Enrollment</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {existingApplication ? 'Update & Resubmit Enrollment' : 'Sunshine Classes Student Enrollment'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
              One-time account application. No duplicate forms or paperwork required.
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar Header */}
        <div className="mt-8 grid grid-cols-5 gap-1 md:gap-2">
          {stepTitles.map((st) => {
            const Icon = st.icon;
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} className="flex flex-col items-center text-center">
                <div 
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isDone 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : isCurrent 
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 font-extrabold shadow-md' 
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 hidden sm:block ${isCurrent ? 'text-amber-300' : isDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {st.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-6 md:p-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-xs text-rose-700 font-semibold">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Account Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-brand-blue" />
                <span>Step 1: Verified Account Information</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                This information is tied to your verified login account and will be used for official records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Student Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={formData.studentName}
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 cursor-not-allowed shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Student Registered Mobile</label>
                <input
                  type="text"
                  readOnly
                  value={formData.mobile}
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 cursor-not-allowed shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  placeholder="Enter parent full name"
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Parent Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.parentMobile}
                  onChange={(e) => handleChange('parentMobile', e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Zero duplicate registration. This profile data connects to your future Student ID & Parent SMS portal.</span>
            </div>
          </div>
        )}

        {/* STEP 2: Academic Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <School size={20} className="text-brand-blue" />
                <span>Step 2: Academic & Course Selection</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Select your targeting class cohort, board, preferred timing and payment plan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Applying for Class *</label>
                <select
                  value={formData.className}
                  onChange={(e) => handleChange('className', e.target.value)}
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                >
                  {DEFAULT_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Educational Board *</label>
                <select
                  value={formData.board}
                  onChange={(e) => handleChange('board', e.target.value)}
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                >
                  <option value="CBSE">CBSE Board</option>
                  <option value="UP Board">UP Board (English / Hindi Medium)</option>
                  <option value="ICSE">ICSE Board</option>
                  <option value="Other">Other State Board</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current / Previous School Name</label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={(e) => handleChange('previousSchool', e.target.value)}
                  placeholder="e.g. St. Xavier's School Pihani"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Batch Timing *</label>
                <select
                  value={formData.preferredBatch}
                  onChange={(e) => {
                    const selected = DEFAULT_BATCHES.find(b => b.name === e.target.value);
                    handleChange('preferredBatch', e.target.value);
                    if (selected) handleChange('preferredTiming', selected.time);
                  }}
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                >
                  {DEFAULT_BATCHES.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.time})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Start Month *</label>
                <select
                  value={formData.preferredStartMonth}
                  onChange={(e) => handleChange('preferredStartMonth', e.target.value)}
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                >
                  <option value="April 2026">April 2026 (New Session)</option>
                  <option value="May 2026">May 2026</option>
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                <div className="flex items-center gap-3 pt-1">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label key={g} className={`flex-1 py-2 text-center rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${formData.gender === g ? 'bg-brand-blue text-white border-brand-blue shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="sr-only"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fee Payment Plan</label>
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { id: 'Monthly', label: 'Monthly' },
                    { id: 'Quarterly', label: 'Quarterly (5% Off)' },
                    { id: 'Yearly', label: 'Yearly (10% Off)' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleChange('paymentPlan', p.id)}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${formData.paymentPlan === p.id ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Address */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <MapPin size={20} className="text-brand-blue" />
                <span>Step 3: Residential Address</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Used for offline correspondence, emergency contact and physical verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat No / Street Address</label>
                <input
                  type="text"
                  value={formData.houseFlat}
                  onChange={(e) => handleChange('houseFlat', e.target.value)}
                  placeholder="e.g. House No. 42, Mohalla Quazi"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality *</label>
                <input
                  type="text"
                  value={formData.areaLocality}
                  onChange={(e) => handleChange('areaLocality', e.target.value)}
                  placeholder="e.g. Main Market Road, Pihani"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Town *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Pihani"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="Hardoi"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Uttar Pradesh"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                  placeholder="241406"
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Documents (Optional) */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Upload size={20} className="text-brand-blue" />
                  <span>Step 4: Supporting Documents (Optional)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  You may upload your photo and certificates now or complete this step later in your student portal.
                </p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full border border-indigo-100">
                Upload Later Allowed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">Passport Student Photo</label>
                <CloudinaryUpload
                  value={formData.photoUrl}
                  onChange={(url) => handleChange('photoUrl', url)}
                  folder="sunshine_students"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">Birth Certificate / Aadhar Card Image</label>
                <CloudinaryUpload
                  value={formData.birthCertUrl || formData.documentUrl}
                  onChange={(url) => {
                    handleChange('birthCertUrl', url);
                    handleChange('documentUrl', url);
                  }}
                  folder="sunshine_documents"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">Aadhar Card Number</label>
                <input
                  type="text"
                  maxLength={12}
                  value={formData.aadhar}
                  onChange={(e) => handleChange('aadhar', e.target.value.replace(/\D/g, ''))}
                  placeholder="12-digit Aadhar Number"
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-blue outline-none transition-all mt-2"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">Previous Class Marksheet / Report Card</label>
                <CloudinaryUpload
                  value={formData.marksheetUrl}
                  onChange={(url) => handleChange('marksheetUrl', url)}
                  folder="sunshine_marksheets"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Summary & Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span>Step 5: Review & Confirm Application</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Please verify all details before submitting to Sunshine Classes Admissions Office.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Applicant Name</span>
                  <span className="font-extrabold text-slate-800 text-sm">{formData.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Target Class & Board</span>
                  <span className="font-extrabold text-brand-blue text-sm">{formData.className} ({formData.board})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Parent / Guardian Name</span>
                  <span className="font-bold text-slate-800">{formData.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Parent Contact</span>
                  <span className="font-bold text-slate-800">{formData.parentMobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Selected Batch Timing</span>
                  <span className="font-bold text-slate-800">{formData.preferredBatch} ({formData.preferredTiming})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Preferred Start Month</span>
                  <span className="font-bold text-slate-800">{formData.preferredStartMonth}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400 font-medium block">Residential Address</span>
                  <span className="font-bold text-slate-800">{formData.houseFlat ? `${formData.houseFlat}, ` : ''}{formData.areaLocality}, {formData.city}, {formData.district}, {formData.state} - {formData.pincode}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium flex items-start gap-3">
              <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Instant Admin Verification:</strong> Upon submission, your application will enter <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">PENDING</code> status. Once approved by administration, your permanent Student ID & Portal ERP features will be activated automatically.
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              id="btn-wizard-prev"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Previous Step</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              id="btn-wizard-next"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>Save & Continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              id="btn-wizard-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="animate-spin" size={16} />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Submit Enrollment Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
