import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Star,
  Plus,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Quote
} from 'lucide-react';
import { AnimatePresence, motion, PanInfo, useReducedMotion } from 'motion/react';
import { Testimonial } from '../../types';
import {
  fetchSunshineGoogleMapsReviews,
  GoogleMapsReviewsResponse,
  SUNSHINE_GOOGLE_MAPS_URL
} from '../../services/googleMapsReviewsService';

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  onSubmitReview?: (review: Omit<Testimonial, 'id'>) => void;
}

interface UnifiedReviewCard {
  id: string;
  name: string;
  subtitle: string;
  rating: number;
  content: string;
  avatarUrl?: string;
  source: 'google' | 'site';
  authorUri?: string;
  reviewUri?: string;
  relativeTime?: string;
}

const LEGACY_PLACEHOLDER_REVIEW_IDS = new Set(['tstml1', 't1', 't2', 't3']);
const LEGACY_PLACEHOLDER_REVIEW_NAMES = new Set([
  'sanjay verma (parent of rahul verma)',
  'ramesh chandra mishra',
  'anuj soni',
  'sunita sharma'
]);

const isPlaceholderTestimonial = (t: Testimonial): boolean => {
  const idLower = String(t.id || '').trim().toLowerCase();
  const nameLower = String(t.name || '').trim().toLowerCase();
  return (
    LEGACY_PLACEHOLDER_REVIEW_IDS.has(idLower) ||
    LEGACY_PLACEHOLDER_REVIEW_NAMES.has(nameLower)
  );
};

const CAROUSEL_SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 56 : -56,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -56 : 56,
    opacity: 0
  })
};

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const useCardsPerView = (): number => {
  const getCount = (): number => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [cardsPerView, setCardsPerView] = useState<number>(getCount);

  useEffect(() => {
    const onResize = () => setCardsPerView(getCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return cardsPerView;
};

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onSubmitReview
}) => {
  const prefersReducedMotion = useReducedMotion();
  const cardsPerView = useCardsPerView();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'PARENT' | 'STUDENT'>('STUDENT');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Live Google Maps Places API (New) reviews state
  const [googleData, setGoogleData] = useState<GoogleMapsReviewsResponse | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'google'>('all');
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Record<string, boolean>>({});

  // Carousel state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchSunshineGoogleMapsReviews(controller.signal)
      .then((res) => {
        if (!active) return;
        setGoogleData(res);
      })
      .finally(() => {
        if (active) setIsLoadingGoogle(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const siteReviews = useMemo<UnifiedReviewCard[]>(() => {
    const base = (testimonials || []).filter((t) => !isPlaceholderTestimonial(t));
    return base.map((t) => ({
      id: t.id,
      name: t.name,
      subtitle: t.role === 'PARENT' ? 'Parent Review' : 'Student Review',
      rating: t.rating || 5,
      content: t.content,
      avatarUrl: t.avatarUrl,
      source: 'site'
    }));
  }, [testimonials]);

  const googleReviews = useMemo<UnifiedReviewCard[]>(() => {
    if (!googleData || !Array.isArray(googleData.reviews) || googleData.reviews.length === 0) {
      return [];
    }
    return googleData.reviews.map((r) => ({
      id: r.id,
      name: r.authorName,
      subtitle: r.relativePublishTimeDescription || 'Google Maps Review',
      rating: r.rating || 5,
      content: r.text,
      avatarUrl: r.authorPhotoUri || undefined,
      source: 'google',
      authorUri: r.authorUri,
      reviewUri: r.googleMapsUri,
      relativeTime: r.relativePublishTimeDescription
    }));
  }, [googleData]);

  const allCards = useMemo<UnifiedReviewCard[]>(() => {
    if (sourceFilter === 'google' && googleReviews.length > 0) {
      return googleReviews;
    }
    // Feature live Google Maps reviews first, followed by verified portal reviews
    return [...googleReviews, ...siteReviews];
  }, [sourceFilter, googleReviews, siteReviews]);

  const totalPages = Math.max(1, Math.ceil(allCards.length / cardsPerView));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const goToPage = (nextPage: number, explicitDirection?: number) => {
    if (totalPages <= 1) return;
    const wrapped = ((nextPage % totalPages) + totalPages) % totalPages;
    const dir = explicitDirection ?? (wrapped >= currentPage ? 1 : -1);
    setSlideDirection(dir);
    setCurrentPage(wrapped);
  };

  const handleNext = () => goToPage(currentPage + 1, 1);
  const handlePrev = () => goToPage(currentPage - 1, -1);

  // Gentle auto-advance that respects reduced motion & user interaction
  useEffect(() => {
    if (prefersReducedMotion || isPaused || showReviewModal || totalPages <= 1) return;
    const timer = window.setInterval(() => {
      setSlideDirection(1);
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isPaused, showReviewModal, totalPages]);

  const visibleCards = useMemo(() => {
    const start = currentPage * cardsPerView;
    const slice = allCards.slice(start, start + cardsPerView);
    // Keep desktop/tablet grid balanced on the final page when wrapping
    if (slice.length < cardsPerView && allCards.length >= cardsPerView) {
      const needed = cardsPerView - slice.length;
      return [...slice, ...allCards.slice(0, needed)];
    }
    return slice;
  }, [allCards, currentPage, cardsPerView]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (totalPages <= 1) return;
    if (info.offset.x <= -48 || info.velocity.x <= -320) {
      handleNext();
    } else if (info.offset.x >= 48 || info.velocity.x >= 320) {
      handlePrev();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;
    setIsPaused(false);
    if (startX === null || endX === null || totalPages <= 1) return;
    const deltaX = endX - startX;
    if (deltaX <= -44) handleNext();
    else if (deltaX >= 44) handlePrev();
  };

  const handleCarouselKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    if (onSubmitReview) {
      onSubmitReview({
        name: name.trim(),
        role,
        rating,
        content: content.trim(),
        avatarUrl:
          role === 'STUDENT'
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowReviewModal(false);
      setName('');
      setContent('');
    }, 2000);
  };

  const googleMapsReviewsHref = googleData?.reviewsUri || googleData?.googleMapsUrl || SUNSHINE_GOOGLE_MAPS_URL;
  const googleMapsWriteHref = googleData?.writeAReviewUri || googleData?.googleMapsUrl || SUNSHINE_GOOGLE_MAPS_URL;
  const hasGoogleRating = typeof googleData?.rating === 'number' && googleData.rating > 0;

  return (
    <section
      id="section-testimonials-carousel"
      className="py-8 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 border-b border-slate-100 dark:border-slate-800 pb-4 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl text-left">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              <span>Student & Parent Reviews</span>
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Trusted by Parents & Students Across Pihani
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Swipe through verified feedback from Sunshine Classes students and live reviews from Google Maps.
            </p>

            {/* Live Google Maps Rating Summary & Direct Link */}
            <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <a
                id="link-testimonials-google-maps-profile"
                href={googleMapsReviewsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <MapPin size={14} className="text-amber-500 shrink-0" />
                {hasGoogleRating ? (
                  <>
                    <span className="font-black text-slate-900 dark:text-white">
                      {googleData?.rating?.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-0.5" aria-hidden="true">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={
                            idx < Math.round(googleData?.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }
                        />
                      ))}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">
                      ({googleData?.userRatingCount ?? googleReviews.length} on Google Maps)
                    </span>
                  </>
                ) : (
                  <span>View Sunshine Classes on Google Maps</span>
                )}
                <ExternalLink size={12} className="text-slate-400" />
              </a>

              {googleReviews.length > 0 && siteReviews.length > 0 && (
                <div className="inline-flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                  <button
                    id="btn-testimonials-filter-all"
                    type="button"
                    onClick={() => {
                      setSourceFilter('all');
                      setCurrentPage(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      sourceFilter === 'all'
                        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    All ({googleReviews.length + siteReviews.length})
                  </button>
                  <button
                    id="btn-testimonials-filter-google"
                    type="button"
                    onClick={() => {
                      setSourceFilter('google');
                      setCurrentPage(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      sourceFilter === 'google'
                        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Google Maps ({googleReviews.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              id="link-testimonials-write-google-review"
              href={googleMapsWriteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-3 transition-all min-h-[44px]"
            >
              <MapPin size={15} className="text-amber-500" />
              <span>Rate on Google</span>
            </a>
            <button
              id="btn-homepage-write-review"
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <Plus size={16} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Dynamic Swipeable Testimonials Carousel */}
        <div
          id="container-testimonials-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Student and parent reviews"
          tabIndex={0}
          onKeyDown={handleCarouselKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-3xl"
        >
          {isLoadingGoogle && allCards.length === 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-56 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse p-6"
                />
              ))}
            </div>
          ) : allCards.length === 0 ? (
            <div
              id="empty-testimonials-state"
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-8 text-center space-y-3"
            >
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Read verified student and parent reviews directly on Google Maps.
              </p>
              <a
                id="link-empty-testimonials-google-maps"
                href={googleMapsReviewsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 shadow-sm transition-colors min-h-[44px]"
              >
                <MapPin size={15} />
                <span>Open Google Maps Reviews</span>
                <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            <div className="overflow-hidden py-1">
              <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                <motion.div
                  key={`${sourceFilter}-${cardsPerView}-${currentPage}`}
                  custom={slideDirection}
                  variants={prefersReducedMotion ? undefined : CAROUSEL_SLIDE_VARIANTS}
                  initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
                  animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
                  exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.15 }
                      : {
                          x: { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 },
                          opacity: { duration: 0.2 }
                        }
                  }
                  drag={totalPages > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={handleDragEnd}
                  className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 cursor-grab active:cursor-grabbing select-none"
                >
                  {visibleCards.map((card, cardIdx) => {
                    const showAvatarImg = Boolean(card.avatarUrl) && !brokenAvatarIds[card.id];
                    return (
                      <article
                        key={`${card.id}-${cardIdx}`}
                        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-6 flex flex-col justify-between gap-5 hover:border-amber-400/80 transition-colors shadow-xs min-h-[230px]"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className="flex items-center gap-0.5"
                              aria-label={`${card.rating} out of 5 stars`}
                            >
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={15}
                                  className={
                                    i < card.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-slate-700'
                                  }
                                />
                              ))}
                            </div>

                            {card.source === 'google' ? (
                              <a
                                id={`link-google-review-source-${cardIdx}`}
                                href={card.reviewUri || googleMapsReviewsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              >
                                <MapPin size={11} className="text-amber-500" />
                                <span>Google Maps</span>
                              </a>
                            ) : (
                              <Quote size={16} className="text-amber-400/70 shrink-0" />
                            )}
                          </div>

                          <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-5">
                            “{card.content}”
                          </p>
                        </div>

                        {/* Reviewer Attribution */}
                        <div className="pt-3.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center gap-3">
                          {showAvatarImg ? (
                            <img
                              src={card.avatarUrl}
                              alt={`Reviewer ${card.name} - Sunshine Classes Pihani`}
                              onError={() =>
                                setBrokenAvatarIds((prev) => ({ ...prev, [card.id]: true }))
                              }
                              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-display font-black text-xs flex items-center justify-center border border-amber-200/70 dark:border-amber-800 shrink-0">
                              {getInitials(card.name)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            {card.source === 'google' && card.authorUri ? (
                              <a
                                id={`link-google-review-author-${cardIdx}`}
                                href={card.authorUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-display font-black text-xs text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 truncate block transition-colors"
                              >
                                {card.name}
                              </a>
                            ) : (
                              <h4 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                                {card.name}
                              </h4>
                            )}
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
                              {card.subtitle}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Carousel Controls Bar */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" role="tablist" aria-label="Review slides">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const isActive = idx === currentPage;
                  return (
                    <button
                      key={idx}
                      id={`btn-testimonials-dot-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show review slide ${idx + 1} of ${totalPages}`}
                      onClick={() => goToPage(idx)}
                      className="p-1.5 cursor-pointer flex items-center justify-center min-h-[36px] min-w-[24px]"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'w-7 bg-amber-500'
                            : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-amber-400/70'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums mr-1">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  id="btn-testimonials-prev"
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous reviews"
                  className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  id="btn-testimonials-next"
                  type="button"
                  onClick={handleNext}
                  aria-label="Next reviews"
                  className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Write Review */}
        {showReviewModal && (
          <div
            id="modal-write-review"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Write a Student/Parent Review
                </h3>
                <button
                  id="btn-close-review-modal"
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Review Submitted!</h4>
                  <p className="text-xs text-slate-500">
                    Thank you for sharing your experience with Sunshine Classes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <label
                      htmlFor="input-review-name"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="input-review-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="select-review-role"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        I am a...
                      </label>
                      <select
                        id="select-review-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'PARENT' | 'STUDENT')}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="PARENT">Parent</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="select-review-rating"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Rating
                      </label>
                      <select
                        id="select-review-rating"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value={5}>5 Stars (Excellent)</option>
                        <option value={4}>4 Stars (Very Good)</option>
                        <option value={3}>3 Stars (Good)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="textarea-review-content"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Your Review / Feedback
                    </label>
                    <textarea
                      id="textarea-review-content"
                      required
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your experience regarding classes, faculty, or study material..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      id="btn-cancel-review-modal"
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-submit-review-modal"
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Publish Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
