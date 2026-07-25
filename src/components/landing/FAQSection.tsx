import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I apply for online admission at Sunshine Classes?',
      a: 'Click on the "Enroll Now Online" button on our website header or hero section. Select your academic class (Classes 1 to 10) and preferred batch timing, enter student details, and submit. Our receptionist will verify your application and issue login credentials.'
    },
    {
      q: 'What are the batch timings and student capacities per class?',
      a: 'We maintain a strict maximum capacity of 25 students per class to ensure 1-on-1 focus. Class 10 runs at 06:00 AM & 04:00 PM, Class 9 at 07:00 AM & 05:00 PM, Classes 5-8 from 03:00 PM to 05:00 PM, and Classes 1-4 from 02:00 PM to 04:00 PM.'
    },
    {
      q: 'Are free study materials and NCERT solutions included?',
      a: 'Yes! All enrolled students receive free digital access to chapter formula sheets, step-by-step NCERT solved proofs, practice worksheets, and previous 10-year board question papers.'
    },
    {
      q: 'How can I purchase textbooks or sample papers from Sunshine Store?',
      a: 'Visit the "Sunshine Store" tab on our top navigation bar to explore our book depot. You can view product details and click "Order on WhatsApp" or pick up directly from our campus store opposite Subhash Park in Pihani.'
    },
    {
      q: 'What is the monthly tuition fee structure?',
      a: 'Fees are transparently set by class group: Class 10 Board Batch is ₹1,200/mo, Class 9 Foundation is ₹1,000/mo, Classes 5 to 8 Apex is ₹700/mo, and Classes 1 to 4 Junior is ₹500/mo. Receipts are generated automatically upon payment.'
    },
    {
      q: 'Are parent-teacher meetings and progress reports conducted?',
      a: 'Yes. We hold monthly parent-teacher meetings (PTMs) following bi-weekly unit assessment test results. Parents can also log into our ERP student portal anytime to track attendance and marks.'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Find quick answers regarding admissions, fees, batch timings, study materials, and Sunshine Store.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all"
              >
                <button
                  id={`faq-toggle-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white hover:text-amber-500 cursor-pointer min-h-[44px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
