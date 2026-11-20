import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MessageCircle,
  Phone,
  X
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CLASS_10_CRASH_COURSE_DATA,
  TEACHER_IMPACT_AWARD_DATA
} from '../../data/crashCourseAwardData';
import { trackContactClick } from '../SEOHead';

interface CrashCourseLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_SLIDES = 2;
const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

const SLIDE_LABELS = ['Class 10 Crash Course', 'EduCart Impact Award'] as const;

const SLIDE_VARIANTS = {
  enter: (dir: 1 | -1) => ({
    opacity: 0,
    x: dir * 48,
    scale: 0.97
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 380, damping: 21, mass: 0.85 },
      scale: { type: 'spring' as const, stiffness: 420, damping: 22 },
      opacity: { duration: 0.16 }
    }
  },
  exit: (dir: 1 | -1) => ({
    opacity: 0,
    x: dir * -36,
    scale: 0.98,
    transition: {
      duration: 0.14,
      ease: [0.4, 0, 1, 1] as const
    }
  })
};

export const CrashCourseLaunchModal: React.FC<CrashCourseLaunchModalProps> = ({
  isOpen,
  onClose
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const goToSlide = useCallback(
    (nextIndex: 0 | 1, pauseAuto = true) => {
      if (pauseAuto) setIsAutoPaused(true);
      setActiveSlide((prev) => {
        if (prev === nextIndex) return prev;
        setDirection(nextIndex > prev ? 1 : -1);
        return nextIndex;
      });
    },
    []
  );

  const handleStepSlide = useCallback((delta: 1 | -1, pauseAuto = true) => {
    if (pauseAuto) setIsAutoPaused(true);
    setDirection(delta);
    setActiveSlide((prev) => ((prev + delta + TOTAL_SLIDES) % TOTAL_SLIDES) as 0 | 1);
  }, []);

  // Reset to Slide 1 and unpause whenever modal opens fresh
  useEffect(() => {
    if (isOpen) {
      setActiveSlide(0);
      setDirection(1);
      setIsAutoPaused(false);
    }
  }, [isOpen]);

  // Body scroll lock + keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        handleStepSlide(1, true);
      } else if (event.key === 'ArrowLeft') {
        handleStepSlide(-1, true);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleStepSlide]);

  // Gentle auto-slide between Slide 1 & Slide 2 (pauses on any user interaction)
  useEffect(() => {
    if (!isOpen || isAutoPaused) return;

    const intervalId = window.setInterval(() => {
      setDirection(1);
      setActiveSlide((prev) => ((prev + 1) % TOTAL_SLIDES) as 0 | 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [isOpen, isAutoPaused]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      touchStartXRef.current = event.touches[0].clientX;
      setIsAutoPaused(true);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || event.changedTouches.length === 0) return;
    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      handleStepSlide(deltaX < 0 ? 1 : -1, true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="modal-crash-course-launch-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="heading-crash-course-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
        >
          <motion.div
            id="modal-crash-course-launch"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 72, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 56, scale: 0.98 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.16 }
                : {
                    y: { type: 'spring', stiffness: 320, damping: 28, mass: 0.9 },
                    scale: { type: 'spring', stiffness: 340, damping: 28 },
                    opacity: { duration: 0.2 }
                  }
            }
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsAutoPaused(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-[390px] sm:max-w-[430px] max-h-[86dvh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-left flex flex-col"
          >
            {/* Compact Top Close Trigger */}
            <button
              id="btn-close-crash-course-popup"
              type="button"
              onClick={onClose}
              aria-label="Close announcement pop-up"
              className="absolute top-2.5 right-2.5 z-20 min-h-[44px] min-w-[44px] rounded-xl bg-slate-950/45 hover:bg-slate-950/65 text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <X size={18} />
            </button>

            {/* Single-Slide Stage */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                {activeSlide === 0 ? (
                  <motion.div
                    key="slide-crash-course"
                    id="slide-popup-crash-course"
                    custom={direction}
                    variants={prefersReducedMotion ? undefined : SLIDE_VARIANTS}
                    initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
                    animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
                    exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
                  >
                    {/* Compact Navy Header Band */}
                    <div className="bg-[#0B2545] text-white px-5 pt-5 pb-4 pr-14 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                        <GraduationCap size={14} className="shrink-0" />
                        <span>{CLASS_10_CRASH_COURSE_DATA.kicker}</span>
                      </div>
                      <h2
                        id="heading-crash-course-popup"
                        className="font-display text-xl sm:text-2xl font-bold tracking-tight leading-snug [text-wrap:balance]"
                      >
                        {CLASS_10_CRASH_COURSE_DATA.headline}
                      </h2>
                      <p className="text-xs font-medium text-slate-200 tabular-nums">
                        {CLASS_10_CRASH_COURSE_DATA.statusLine}
                      </p>
                    </div>

                    {/* Focused Maths & Science Highlights */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {CLASS_10_CRASH_COURSE_DATA.summary}
                      </p>

                      <ul className="space-y-2">
                        {CLASS_10_CRASH_COURSE_DATA.highlights.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-snug"
                          >
                            <CheckCircle2
                              size={15}
                              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="slide-teacher-award"
                    id="slide-popup-teacher-award"
                    custom={direction}
                    variants={prefersReducedMotion ? undefined : SLIDE_VARIANTS}
                    initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
                    animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
                    exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
                  >
                    {/* Framed Full Portrait Stage (Zero cropping of face or EduCart plaque) */}
                    <div className="bg-[#0B2545] px-4 pt-4 pb-3 flex items-center justify-center">
                      <div className="h-52 sm:h-60 w-full flex items-center justify-center">
                        {!imgError ? (
                          <img
                            src={TEACHER_IMPACT_AWARD_DATA.photoUrl}
                            alt={TEACHER_IMPACT_AWARD_DATA.photoAlt}
                            referrerPolicy="no-referrer"
                            decoding="async"
                            onError={() => setImgError(true)}
                            className="h-full w-auto max-w-full rounded-xl object-contain border border-white/15 shadow-lg"
                          />
                        ) : (
                          <div className="h-full w-full rounded-xl bg-slate-900/70 border border-amber-400/30 flex flex-col items-center justify-center gap-2 p-4 text-center text-white">
                            <Award size={28} className="text-amber-300" />
                            <p className="font-display text-sm font-bold">
                              {TEACHER_IMPACT_AWARD_DATA.recipientName}
                            </p>
                            <p className="text-xs text-amber-300">
                              {TEACHER_IMPACT_AWARD_DATA.awardTitle}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Award Title & Mentor Message */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        <Award size={13} className="shrink-0" />
                        <span>{TEACHER_IMPACT_AWARD_DATA.awardTitle}</span>
                      </div>

                      <h2
                        id="heading-crash-course-popup"
                        className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug"
                      >
                        {TEACHER_IMPACT_AWARD_DATA.recipientName} · Sunshine Classes
                      </h2>

                      <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        “{TEACHER_IMPACT_AWARD_DATA.popupMentorMessage}”
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Compact Slide Controls Row (Arrows + Dots) */}
            <div className="px-3 sm:px-4 py-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/80">
              <button
                id="btn-crash-course-slide-prev"
                type="button"
                onClick={() => handleStepSlide(-1, true)}
                aria-label="Previous slide"
                className="min-h-[44px] min-w-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Announcement slides">
                {SLIDE_LABELS.map((label, idx) => {
                  const slideIdx = idx as 0 | 1;
                  const isCurrent = activeSlide === slideIdx;
                  return (
                    <button
                      key={label}
                      id={`btn-crash-course-slide-dot-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      aria-label={`Show slide ${idx + 1}: ${label}`}
                      onClick={() => goToSlide(slideIdx, true)}
                      className="min-h-[44px] px-1.5 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-200 ${
                          isCurrent
                            ? 'w-6 bg-amber-500'
                            : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums pl-1 whitespace-nowrap">
                  {activeSlide + 1} / {TOTAL_SLIDES}
                </span>
              </div>

              <button
                id="btn-crash-course-slide-next"
                type="button"
                onClick={() => handleStepSlide(1, true)}
                aria-label="Next slide"
                className="min-h-[44px] min-w-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Persistent Thumb-Zone Conversion Actions */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  id="btn-crash-course-popup-whatsapp"
                  href={CLASS_10_CRASH_COURSE_DATA.whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContactClick('whatsapp', 'crash_course_popup')}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <MessageCircle size={15} className="shrink-0" />
                  <span>WhatsApp</span>
                </a>

                <a
                  id="btn-crash-course-popup-call"
                  href={`tel:${CLASS_10_CRASH_COURSE_DATA.callNumber}`}
                  onClick={() => trackContactClick('phone', 'crash_course_popup')}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Phone size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrashCourseLaunchModal;
