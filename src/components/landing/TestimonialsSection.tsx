import React, { useState } from 'react';
import { Star, MessageSquare, Plus, CheckCircle2, Upload, X } from 'lucide-react';
import { Testimonial } from '../../types';

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  onSubmitReview?: (review: Omit<Testimonial, 'id'>) => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onSubmitReview
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'PARENT' | 'STUDENT'>('STUDENT');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const defaultTestimonials: Testimonial[] = [
    {
      id: 't1',
      name: 'Ramesh Chandra Mishra',
      role: 'PARENT',
      rating: 5,
      content: 'My daughter Priya secured 98.4% in Class 10 Board exams. Priyanshu Sir’s daily doubt clinic and test series made all the difference.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
    },
    {
      id: 't2',
      name: 'Anuj Soni',
      role: 'STUDENT',
      rating: 5,
      content: 'The NCERT step-by-step formula sheets and Sunshine Store sample papers helped me master science numericals easily.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
    },
    {
      id: 't3',
      name: 'Sunita Sharma',
      role: 'PARENT',
      rating: 5,
      content: 'Small batch size of 25 students gives peace of mind. Regular progress updates and parent-teacher meetings keep us informed.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60'
    }
  ];

  const listToDisplay = (testimonials && testimonials.length > 0) ? testimonials : defaultTestimonials;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    if (onSubmitReview) {
      onSubmitReview({
        name: name.trim(),
        role,
        rating,
        content: content.trim(),
        avatarUrl: role === 'STUDENT' 
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

  return (
    <section className="py-8 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-slate-100 dark:border-slate-800 pb-4 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-xl text-left">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              <span>Student & Parent Reviews</span>
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Trusted by Parents & Students Across Pihani
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Read real feedback from students and parents enrolled in Sunshine Classes tuitions and board prep batches.
            </p>
          </div>

          <button
            id="btn-homepage-write-review"
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-3 shadow-md transition-all cursor-pointer min-h-[44px] shrink-0"
          >
            <Plus size={16} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listToDisplay.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-6 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all shadow-xs"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                  “{t.content}”
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-display font-black text-xs text-slate-900 dark:text-white">
                    {t.name}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    {t.role === 'PARENT' ? 'Parent Review' : 'Student Review'}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Modal for Write Review */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Write a Student/Parent Review
                </h3>
                <button
                  id="btn-close-review-modal"
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Review Submitted!</h4>
                  <p className="text-xs text-slate-500">Thank you for sharing your experience with Sunshine Classes.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        I am a...
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="PARENT">Parent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Rating
                      </label>
                      <select
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Review / Feedback
                    </label>
                    <textarea
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
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
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
