/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Printer, Copy, Check, Phone, Mail, MapPin, Globe, Award, CheckCircle2 } from 'lucide-react';
import SunshineLogo from '../SunshineLogo';

interface LegalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalDocumentsModal: React.FC<LegalDocumentsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" id="legal-documents-modal-overlay">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <SunshineLogo className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-tight flex items-center gap-2" id="legal-modal-title">
                Sunshine Classes Pihani
                <span className="text-xs bg-amber-500/30 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Official Legal Policy
                </span>
              </h2>
              <p className="text-xs text-indigo-200">Excellence in Education • Hardoi, Uttar Pradesh</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-print-legal-doc"
              type="button"
              onClick={handlePrint}
              className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Print Policy Document"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              id="btn-close-legal-modal"
              type="button"
              onClick={onClose}
              className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              id="tab-terms-of-admission"
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText size={15} />
              <span>Terms of Admission & Code of Conduct</span>
            </button>
            <button
              id="tab-privacy-policy"
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Privacy Policy & Data Protection</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden md:block">
            Last Updated: Academic Session 2026-2027
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-h-[calc(90vh-140px)]">
          {activeTab === 'terms' ? (
            <div className="space-y-6" id="content-terms-of-admission">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-amber-200 space-y-1">
                <h3 className="font-display font-bold text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Award size={18} className="text-amber-600 dark:text-amber-400" />
                  SUNSHINE CLASSES — ADMISSION TERMS & CODE OF CONDUCT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  By enrolling at Sunshine Classes (Pihani, Hardoi), students and parents/guardians agree to adhere strictly to all academic, financial, and behavioral standards outlined below.
                </p>
              </div>

              {/* 13 Rules & Detailed Terms */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">1</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Punctuality & Arrival</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Students must arrive strictly on time for all scheduled classes. Late entry disturbs lectures and may lead to denial of entry for that session.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">2</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Attendance Requirement</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Regular attendance is mandatory. No fee adjustments, carry-forward credits, or concessions are granted for student absences.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">3</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Academic Work & Tests</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    All homework, Daily Practice Worksheets (DPPs), and weekly offline/online mock tests must be completed and submitted punctually.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">4</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Campus Discipline</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Students must maintain high standards of discipline and show utmost respect to faculty members, administrative staff, and fellow batchmates.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">5</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Mobile Phone Policy</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Mobile phones are permitted on campus but must remain switched off or silent during lectures unless authorized by the teaching faculty.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">6</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Monthly Fee Timeline</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Monthly tuition fees must be deposited within the first 5 days of the calendar month or registration anniversary date.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">7</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Billing Frequency</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Tuition fees are charged strictly on a monthly cycle or agreed advance tenure plan. Fees once paid are non-refundable.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">8</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Late Fee & Suspension</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Delay in fee payment beyond prescribed deadlines will result in temporary suspension from classes and ERP student portal access.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">9</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Advance Payment Discounts</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Parents may pay tuition fees Quarterly (3 Months), Half-Yearly (6 Months), or Yearly in advance to claim institution fee discounts.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">10</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Property Damage Liability</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Any physical or digital damage caused to institute property, furniture, or equipment will be assessed and billed directly to the parent/guardian.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">11</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Schedule Amendments</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    The management reserves the full right to adjust batch timings, faculty rosters, or institute operational rules whenever academic needs arise.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs">12</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Cancellation of Admission</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Student admission may be cancelled immediately for repeated misconduct, persistent non-attendance, or non-clearance of fee arrears.
                  </p>
                </div>

                <div className="p-4 sm:col-span-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-500/10 space-y-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs">13</span>
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">Final Authority Clause</h4>
                  <p className="text-xs text-slate-700 dark:text-amber-100 font-medium">
                    The decision of SUNSHINE CLASSES management shall be final, definitive, and binding in all academic, financial, and administrative matters.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6" id="content-privacy-policy">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-indigo-200 space-y-1">
                <h3 className="font-display font-bold text-base text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
                  SUNSHINE CLASSES — PRIVACY POLICY & DATA PROTECTION STATEMENT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This Privacy Policy details how Sunshine Classes collects, stores, uses, and safeguards student, parent, and visitor data across physical forms and the Sunshine ERP platform.
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                    1. Information We Collect
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                     font-semibold <li><strong>Student Identity Data:</strong> Full Name, Date of Birth, Gender, Class/Grade, School Name, and Photograph.</li>
                    <li><strong>Parent & Guardian Credentials:</strong> Father’s Name, Mother’s Name, Father’s Aadhaar details (for security verification), and Residential Address.</li>
                    <li><strong>Contact Information:</strong> Student Mobile, Primary Parent Phone Number, WhatsApp Number, and Email Address.</li>
                    <li><strong>Academic & Financial Records:</strong> Class attendance, test scores, homework logs, fee receipts, and payment transaction references.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                    2. Purpose of Data Processing
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Collected data is processed exclusively for administrative, academic, and communication purposes:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                    <li>Issuing unique Roll Numbers, student ID cards, and ERP login credentials.</li>
                    <li>Sending academic progress reports, exam schedules, and instant WhatsApp attendance alerts.</li>
                    <li>Processing monthly fee collection, generating GST-compliant digital receipts, and verifying online UPI payments.</li>
                    <li>Maintaining security and student safety across our Pihani campus premises.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                    3. Data Security & Storage Assurance
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    We implement strict enterprise-grade security controls:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong>No Data Commercialization:</strong> Sunshine Classes strictly guarantees that student and parent data is NEVER sold, rented, or traded to third-party telemarketers or advertisers.</li>
                    <li><strong>Encryption & Cloud Safeguards:</strong> Digital records stored on Sunshine ERP are encrypted in transit and at rest using modern HTTPS/SSL protocols.</li>
                    <li><strong>Restricted Access:</strong> Access to Aadhaar details and phone numbers is strictly restricted to authorized administrative staff under strict confidentiality.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                    4. Parent Rights & Access Requests
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Parents and legal guardians reserve the right to review, update, or correct their child’s profile information stored in the ERP database at any time by contacting the institute office.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Official Contact Footer Box */}
          <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin size={14} className="text-red-500" />
                <span>Sunshine Classes Campus Office</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">Mohalla Mishrana, Opposite Subhash Park, Pihani, Hardoi, UP</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-slate-600 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-1"><Phone size={12} className="text-indigo-500" /> 8707738284</span>
                <span className="flex items-center gap-1"><Mail size={12} className="text-amber-500" /> sunshineclassespihani@gmail.com</span>
                <span className="flex items-center gap-1"><Globe size={12} className="text-emerald-500" /> sunshineclasses.net</span>
              </div>
            </div>

            <button
              id="btn-copy-legal-text"
              type="button"
              onClick={() => handleCopyText(activeTab === 'terms' ? 'SUNSHINE CLASSES ADMISSION RULES...\n(13 Rules)' : 'SUNSHINE CLASSES PRIVACY POLICY...')}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Policy Text'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 size={16} />
            <span>Official Sunshine Classes ERP Document</span>
          </div>

          <button
            id="btn-confirm-close-legal"
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            I Understand & Close
          </button>
        </div>

      </div>
    </div>
  );
};
