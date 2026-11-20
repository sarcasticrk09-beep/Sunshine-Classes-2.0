import React, { useState } from 'react';
import { ArrowRight, Award, MessageCircle, Phone } from 'lucide-react';
import {
  CLASS_10_CRASH_COURSE_DATA,
  TEACHER_IMPACT_AWARD_DATA
} from '../../data/crashCourseAwardData';
import { trackCTAClick, trackContactClick } from '../SEOHead';

interface TeacherImpactAwardSectionProps {
  onOpenCrashCourse: () => void;
}

export const TeacherImpactAwardSection: React.FC<TeacherImpactAwardSectionProps> = ({
  onOpenCrashCourse
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="section-teacher-impact-award"
      className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Portrait Column: Uncropped Award Photo */}
          <div className="lg:col-span-5">
            <figure className="max-w-md mx-auto lg:max-w-none space-y-3">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                {!imgError ? (
                  <img
                    src={TEACHER_IMPACT_AWARD_DATA.photoUrl}
                    alt={TEACHER_IMPACT_AWARD_DATA.photoAlt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-center bg-[#0B2545] text-white">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <Award size={32} />
                    </div>
                    <p className="font-display text-lg font-bold">
                      {TEACHER_IMPACT_AWARD_DATA.recipientName}
                    </p>
                    <p className="text-xs text-amber-300">
                      {TEACHER_IMPACT_AWARD_DATA.awardTitle}
                    </p>
                  </div>
                )}
              </div>

              <figcaption className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 px-0.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {TEACHER_IMPACT_AWARD_DATA.recipientName}
                </span>
                <span className="truncate text-amber-700 dark:text-amber-400 font-medium">
                  {TEACHER_IMPACT_AWARD_DATA.awardTitle}
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Editorial Recognition & Mentor Message Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Award size={15} className="shrink-0" />
                <span>National Recognition · {TEACHER_IMPACT_AWARD_DATA.awardTitle}</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight [text-wrap:balance]">
                Priyanshu Gupta Honored with the EduCart Teacher Impact Award
              </h2>

              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                {TEACHER_IMPACT_AWARD_DATA.recipientRole}
              </p>
            </div>

            {/* Official EduCart Citation */}
            <div className="rounded-2xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/55 dark:bg-amber-950/20 p-5 space-y-2">
              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                “{TEACHER_IMPACT_AWARD_DATA.plaqueCitation}”
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Awarded by {TEACHER_IMPACT_AWARD_DATA.awardIssuer} · 2026–2027
              </p>
            </div>

            {/* Personal Message from Priyanshu Gupta */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                A Message from Priyanshu Sir
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-[68ch]">
                {TEACHER_IMPACT_AWARD_DATA.spotlightMessage}
              </p>
            </div>

            {/* Crash Course Tie-In & Direct Action Controls */}
            <div className="pt-2 space-y-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                {CLASS_10_CRASH_COURSE_DATA.kicker} · {CLASS_10_CRASH_COURSE_DATA.statusLine}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="btn-award-open-crash-course"
                  type="button"
                  onClick={() => {
                    trackCTAClick('view_crash_course_from_award', 'teacher_impact_award_section');
                    onOpenCrashCourse();
                  }}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <span>Class 10 Crash Course</span>
                  <ArrowRight size={15} className="shrink-0" />
                </button>

                <a
                  id="btn-award-whatsapp-inquiry"
                  href={CLASS_10_CRASH_COURSE_DATA.whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContactClick('whatsapp', 'teacher_impact_award_section')}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <MessageCircle size={16} className="shrink-0" />
                  <span>WhatsApp for Free Demo</span>
                </a>

                <a
                  id="btn-award-call-direct"
                  href={`tel:${CLASS_10_CRASH_COURSE_DATA.callNumber}`}
                  onClick={() => trackContactClick('phone', 'teacher_impact_award_section')}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Phone size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{CLASS_10_CRASH_COURSE_DATA.callDisplay}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherImpactAwardSection;
