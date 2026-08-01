import React from 'react';
import { GraduationCap, BookOpen, ShoppingBag, ArrowRight, ShieldCheck, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onNavigateSection: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateSection }) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 py-10 lg:py-16 border-b border-slate-200/60 dark:border-slate-800/60">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column - Headline, Text & 3 CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Small Trust Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-700 dark:text-amber-400 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Admissions Open 2026–27</span>
              <span className="text-amber-400 dark:text-amber-600">•</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Classes 1 to 10</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Pihani's Premier Center for{' '}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 bg-clip-text text-transparent">
                CBSE Coaching & Academic Excellence
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl">
              Empowering students with experienced teachers, personalized guidance, structured test series, free NCERT study material, and campus book depot at Sunshine Store in Pihani, Hardoi.
            </p>

            {/* Three CTA Buttons as specified in Sprint 2 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              
              {/* CTA 1: Enroll Now */}
              <button
                id="btn-hero-enroll-now"
                onClick={() => onNavigateSection('admissions')}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 shadow-md hover:shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer min-h-[46px] focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                <GraduationCap size={18} />
                <span>Enroll Now</span>
                <ArrowRight size={16} />
              </button>

              {/* CTA 2: Browse Study Material */}
              <button
                id="btn-hero-browse-study-material"
                onClick={() => navigate('/resources')}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm px-5 py-3.5 active:scale-[0.98] transition-all cursor-pointer min-h-[46px] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                <BookOpen size={18} className="text-emerald-500" />
                <span>Browse Study Material</span>
              </button>

              {/* CTA 3: Visit Sunshine Store */}
              <button
                id="btn-hero-visit-sunshine-store"
                onClick={() => navigate('/books')}
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-extrabold text-xs sm:text-sm px-5 py-3.5 active:scale-[0.98] transition-all cursor-pointer min-h-[46px] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                <ShoppingBag size={18} className="text-amber-500" />
                <span>Visit Sunshine Store</span>
              </button>

            </div>

            {/* Quick Micro-Trust Signals */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>100% Board Pass Rate</span>
              </span>
              <span className="flex items-center gap-1">
                <Award size={14} className="text-amber-500" />
                <span>District Board Toppers</span>
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} className="text-blue-500 fill-blue-500" />
                <span>Affordable Batch Tuition</span>
              </span>
            </div>

          </div>

          {/* Right Column - Clean Minimal Educational Illustration / Academic Badge */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">Sunshine Advantage</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Pihani's Dedicated Coaching Institute</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Est. 2018
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl font-black text-amber-500 font-display">100%</span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Board Success</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Class 10 CBSE Results</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl font-black text-blue-500 font-display">25</span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Max Batch Size</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Personalized Attention</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl font-black text-emerald-500 font-display">Free</span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">NCERT Notes</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Chapterwise Worksheets</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl font-black text-purple-500 font-display">Store</span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Book Depot</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">On-Campus Essentials</p>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 italic bg-amber-500/5 dark:bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/10">
                  "Guiding Pihani students towards academic mastery and top board ranks."
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};


