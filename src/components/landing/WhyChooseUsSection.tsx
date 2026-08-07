import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  ClipboardCheck, 
  HelpCircle, 
  TrendingUp, 
  UserCheck, 
  Wallet, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  HeartHandshake,
  Star,
  Users
} from 'lucide-react';
import { InstituteStrength } from '../../types';
import { SEED_INSTITUTE_STRENGTHS } from '../../data';

interface WhyChooseUsSectionProps {
  strengths?: InstituteStrength[];
}

// Icon mapper helper
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'GraduationCap':
      return <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
    case 'BookOpen':
      return <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    case 'ClipboardCheck':
      return <ClipboardCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    case 'HelpCircle':
      return <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    case 'TrendingUp':
      return <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    case 'UserCheck':
      return <UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
    case 'Wallet':
      return <Wallet className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
    case 'Award':
      return <Award className="w-6 h-6 text-amber-500" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-6 h-6 text-blue-500" />;
    default:
      return <Sparkles className="w-6 h-6 text-amber-500" />;
  }
};

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ strengths }) => {
  const items = (strengths && strengths.length > 0) ? strengths : SEED_INSTITUTE_STRENGTHS;

  return (
    <section id="why-choose-us-section" className="py-8 sm:py-20 bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-brand-orange dark:text-amber-400 inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20">
            <Award size={14} />
            <span>Why Choose Sunshine Classes</span>
          </span>
          <h2 className="font-display text-xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built on Academic Excellence & Proven Results
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Discover why hundreds of parents in Pihani trust Sunshine Classes for their children's board preparation, conceptual clarity, and academic transformation.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              id={`why-choose-card-${item.id || idx}`}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-3 sm:space-y-4 hover:border-amber-400/80 dark:hover:border-amber-500/60 transition-all duration-300 shadow-xs hover:shadow-md group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-2.5 sm:space-y-3">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                    {getIconComponent(item.iconName)}
                  </div>
                  {item.badge && (
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full px-2.5 py-0.5 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <CheckCircle size={13} className="shrink-0 text-amber-500" />
                <span>Sunshine Standard</span>
              </div>
            </div>
          ))}
        </div>

        {/* Callout Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-orange/5 to-indigo-500/10 border border-amber-500/20 p-4 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="space-y-1 max-w-2xl">
            <h4 className="font-display text-sm sm:text-lg font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <HeartHandshake className="text-brand-orange shrink-0" size={18} />
              <span>Ready to give your child the Sunshine Advantage?</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Join our interactive tuition batches today or schedule a campus walkthrough with our founding faculty.
            </p>
          </div>
          <a
            id="btn-why-choose-enroll-cta"
            href="/enroll"
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-5 sm:px-6 py-3 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center w-full sm:w-auto"
          >
            Apply For Admission →
          </a>
        </div>

      </div>
    </section>
  );
};
