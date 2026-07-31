/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  HelpCircle, 
  User, 
  Calendar, 
  Building2, 
  CreditCard, 
  Award,
  ChevronRight,
  Download,
  Printer,
  Check
} from 'lucide-react';
import { CloudinaryUpload } from '../CloudinaryUpload';

interface AdmissionsPageProps {
  admName: string;
  setAdmName: (v: string) => void;
  admDob: string;
  setAdmDob: (v: string) => void;
  admGender: string;
  setAdmGender: (v: string) => void;
  admClass: string;
  setAdmClass: (v: string) => void;
  admPrevSchool: string;
  setAdmPrevSchool: (v: string) => void;
  admAadhar: string;
  setAdmAadhar: (v: string) => void;
  admFather: string;
  setAdmFather: (v: string) => void;
  admMother: string;
  setAdmMother: (v: string) => void;
  admPhone: string;
  setAdmPhone: (v: string) => void;
  admWhatsapp: string;
  setAdmWhatsapp: (v: string) => void;
  admAddress: string;
  setAdmAddress: (v: string) => void;
  admBatch: string;
  setAdmBatch: (v: string) => void;
  admTiming: string;
  setAdmTiming: (v: string) => void;
  admPhotoUrl: string;
  setAdmPhotoUrl: (v: string) => void;
  generatedAdmId: string | null;
  handleAdmissionSubmit: (e: React.FormEvent) => void;
  subConfig: any;
  onNavigateSection: (sec: string) => void;
  resetForm?: () => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({
  admName,
  setAdmName,
  admDob,
  setAdmDob,
  admGender,
  setAdmGender,
  admClass,
  setAdmClass,
  admPrevSchool,
  setAdmPrevSchool,
  admAadhar,
  setAdmAadhar,
  admFather,
  setAdmFather,
  admMother,
  setAdmMother,
  admPhone,
  setAdmPhone,
  admWhatsapp,
  setAdmWhatsapp,
  admAddress,
  setAdmAddress,
  admBatch,
  setAdmBatch,
  admTiming,
  setAdmTiming,
  admPhotoUrl,
  setAdmPhotoUrl,
  generatedAdmId,
  handleAdmissionSubmit,
  subConfig,
  onNavigateSection,
  resetForm
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const admissionSteps = [
    { num: '01', title: 'Submit Online Application', desc: 'Fill student & parent profile in under 2 minutes.' },
    { num: '02', title: 'Get Instant Registration ID', desc: 'Receive digital admission slip with tracking ID.' },
    { num: '03', title: 'Campus Verification & Seat Lock', desc: 'Visit Pihani campus with documents to finalize batch timing.' }
  ];

  const requiredDocuments = [
    'Student Passport Size Photo (Digital upload or 2 physical copies)',
    '12-Digit Student Aadhar Card Number / Copy',
    'Previous Academic Year Marksheet / Report Card',
    'Parent Active Contact Mobile Number for WhatsApp Attendance Alerts'
  ];

  const faqs = [
    {
      q: 'Is there an entrance test for Class 6 to 10 admissions?',
      a: 'We conduct a friendly diagnostic assessment to gauge your child’s baseline in Science and Math so we can place them in the most suitable batch.'
    },
    {
      q: 'When do classes start after online registration?',
      a: 'Once your registration ID is generated, you can attend 3 trial classes immediately from the next working day while document verification is completed.'
    },
    {
      q: 'Can fees be paid monthly or quarterly?',
      a: 'Yes, we offer flexible monthly, quarterly, half-yearly, and annual fee payment options with zero registration overheads.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      
      {/* 1. ADMISSIONS HERO HEADER */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-24 pb-16 border-b border-indigo-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 rounded-full">
            <Sparkles size={14} />
            <span>Academic Session 2026-27 Admissions Open</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
            Secure Your Child’s Seat at Sunshine Classes
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Apply online for Class 6 to Class 10 tuition batches in Pihani, Hardoi. Direct admission with zero hidden registration charges.
          </p>

          {/* Admission Process Steps Bar */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 text-left">
            {admissionSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-black text-xs">
                  <span>STEP {step.num}</span>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                <h2 className="font-display font-bold text-xs text-white">{step.title}</h2>
                <p className="text-[11px] text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form or Confirmation Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {generatedAdmId ? (
            /* DIGITAL ADMISSION SLIP (CONFIRMATION STATE) */
            <div id="card-admission-confirmation" className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center">
                    <Check size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Application Received</span>
                    <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">Admission Registration Complete</h2>
                  </div>
                </div>
                
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Application ID</span>
                  <span className="font-display font-black text-amber-600 dark:text-amber-400 text-lg">{generatedAdmId}</span>
                </div>
              </div>

              {/* Summary Details Box */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Student Details</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{admName || 'Registered Student'}</p>
                  <p className="text-slate-500">Applied Class: <span className="font-bold text-slate-800 dark:text-slate-200">{admClass}</span></p>
                  <p className="text-slate-500">Allocated Batch: <span className="font-bold text-slate-800 dark:text-slate-200">{admBatch}</span></p>
                  <p className="text-slate-500">Timings: <span className="font-bold text-slate-800 dark:text-slate-200">{admTiming}</span></p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Parent & Contact Info</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Father: {admFather || 'Parent'}</p>
                  <p className="text-slate-500">Contact Number: <span className="font-bold text-slate-800 dark:text-slate-200">{admPhone}</span></p>
                  <p className="text-slate-500">WhatsApp Number: <span className="font-bold text-slate-800 dark:text-slate-200">{admWhatsapp}</span></p>
                  <p className="text-slate-500">Aadhar: <span className="font-bold text-slate-800 dark:text-slate-200">{admAadhar || 'Submitted'}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <p className="font-bold">Next Steps for Parent:</p>
                <p>1. Please visit Sunshine Classes campus opposite Subhash Park in Pihani within 3 days.</p>
                <p>2. Bring 2 passport photos and previous report card to lock your batch seat.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="btn-print-admission-slip"
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print Digital Slip</span>
                </button>

                {resetForm && (
                  <button
                    id="btn-new-admission-app"
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* ONLINE ADMISSION FORM */
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Online Registration</span>
                <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                  Student Enrolment Form 2026-27
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fill in student information carefully. Form generates an instant digital application ID.
                </p>
              </div>

              <form onSubmit={handleAdmissionSubmit} className="space-y-6">
                
                {/* 1. STUDENT IDENTITY */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                    1. Student Personal Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <CloudinaryUpload
                        id="adm-photo-picker"
                        folder="students"
                        cloudName={subConfig.cloudinaryCloudName}
                        uploadPreset={subConfig.cloudinaryUploadPreset}
                        apiKey={subConfig.cloudinaryApiKey}
                        maxSizeMB={subConfig.cloudinaryMaxFileSize}
                        initialUrl={admPhotoUrl}
                        onUploadSuccess={(url) => setAdmPhotoUrl(url)}
                        onFileDeleted={() => setAdmPhotoUrl('')}
                        allowedTypes={['jpg', 'jpeg', 'png', 'webp']}
                        label="Student Passport Photo (Optional Upload)"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Student Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="adm-input-name"
                        type="text"
                        required
                        value={admName}
                        onChange={(e) => setAdmName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="adm-input-dob"
                        type="date"
                        required
                        value={admDob}
                        onChange={(e) => setAdmDob(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Gender
                      </label>
                      <select
                        id="adm-select-gender"
                        value={admGender}
                        onChange={(e) => setAdmGender(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Class Seeking Admission <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="adm-select-class"
                        value={admClass}
                        onChange={(e) => {
                          const selectedClass = e.target.value;
                          setAdmClass(selectedClass);
                          if (selectedClass === 'Class 10') {
                            setAdmBatch('Class 10 - Board Specialist');
                            setAdmTiming('06:00 AM & 04:00 PM');
                          } else if (selectedClass === 'Class 9') {
                            setAdmBatch('Class 9 - Foundation Group');
                            setAdmTiming('07:00 AM & 05:00 PM');
                          } else if (selectedClass === 'Class 8') {
                            setAdmBatch('Class 8 - Apex Learning');
                            setAdmTiming('03:00 PM - 05:00 PM');
                          } else if (selectedClass === 'Class 7') {
                            setAdmBatch('Class 7 - Middle School');
                            setAdmTiming('03:00 PM - 04:30 PM');
                          } else {
                            setAdmBatch('Class 6 - Junior Foundation');
                            setAdmTiming('02:00 PM - 03:30 PM');
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      >
                        <option value="Class 10">Class 10 (Board Batch)</option>
                        <option value="Class 9">Class 9 (Board Foundation)</option>
                        <option value="Class 8">Class 8 (Apex Learning)</option>
                        <option value="Class 7">Class 7 (Middle School)</option>
                        <option value="Class 6">Class 6 (Junior Foundation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Previous School Name
                      </label>
                      <input
                        id="adm-input-prev-school"
                        type="text"
                        value={admPrevSchool}
                        onChange={(e) => setAdmPrevSchool(e.target.value)}
                        placeholder="Name of current/previous school..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        12-Digit Student Aadhar Number
                      </label>
                      <input
                        id="adm-input-aadhar"
                        type="text"
                        maxLength={12}
                        value={admAadhar}
                        onChange={(e) => setAdmAadhar(e.target.value.replace(/\D/g, ''))}
                        placeholder="12 digit number..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PARENTAL & CONTACT DETAILS */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                    2. Parent & Communication Details
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Father's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="adm-input-father"
                        type="text"
                        required
                        value={admFather}
                        onChange={(e) => setAdmFather(e.target.value)}
                        placeholder="Father full name..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mother's Name
                      </label>
                      <input
                        id="adm-input-mother"
                        type="text"
                        value={admMother}
                        onChange={(e) => setAdmMother(e.target.value)}
                        placeholder="Mother full name..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Primary Mobile Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="adm-input-phone"
                        type="tel"
                        required
                        maxLength={10}
                        value={admPhone}
                        onChange={(e) => setAdmPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        WhatsApp Number for Reports <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="adm-input-whatsapp"
                        type="tel"
                        required
                        maxLength={10}
                        value={admWhatsapp}
                        onChange={(e) => setAdmWhatsapp(e.target.value.replace(/\D/g, ''))}
                        placeholder="WhatsApp contact number..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Residential Address in Pihani/Hardoi <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="adm-textarea-address"
                        rows={2}
                        required
                        value={admAddress}
                        onChange={(e) => setAdmAddress(e.target.value)}
                        placeholder="Enter full locality address..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    id="btn-submit-admission-form"
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Generate Admission Application ID</span>
                    <ArrowRight size={16} />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    🔒 No payment required now. Your registration reserves a seat queue spot.
                  </p>
                </div>

              </form>

            </div>
          )}

        </div>

        {/* Right Information & Requirements Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Required Documents Card */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <FileText size={18} />
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Required Documents</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bring these items when visiting campus to lock student seat:
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Helpline & Address Card */}
          <div className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-950 text-white space-y-4 shadow-lg">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Campus Admissions Desk</span>
            
            <h3 className="font-display font-bold text-base text-white">Need Personal Guidance?</h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Visit our counseling center directly or speak with Er. R. K. Verma for course recommendations.
            </p>

            <div className="pt-2 space-y-2 text-xs border-t border-indigo-900">
              <p className="flex items-center gap-2 text-slate-200">
                <Building2 size={14} className="text-amber-400 shrink-0" />
                <span>Subhash Park Road, Pihani, Hardoi</span>
              </p>
              <p className="flex items-center gap-2 text-slate-200">
                <Phone size={14} className="text-amber-400 shrink-0" />
                <a href="tel:8707738284" className="font-bold text-amber-300 hover:underline">8707738284</a>
              </p>
            </div>
          </div>

          {/* Admission FAQs Accordion */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Admission FAQs</h3>
            
            <div className="space-y-2 pt-1">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <button
                    id={`btn-adm-faq-${idx}`}
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-left font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer py-1"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight size={14} className={`transition-transform ${activeFaq === idx ? 'rotate-90 text-amber-500' : 'text-slate-400'}`} />
                  </button>
                  {activeFaq === idx && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
