import React from 'react';
import { 
  Users, 
  Award, 
  BookOpen, 
  ShoppingBag, 
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  GraduationCap,
  HeartHandshake,
  DollarSign
} from 'lucide-react';

export const EcosystemFeatures: React.FC = () => {
  const features = [
    {
      icon: <GraduationCap size={22} className="text-amber-500" />,
      title: 'Experienced Faculty',
      description: 'Dedicated subject experts led by founder Priyanshu Sir providing strong concept mastery.'
    },
    {
      icon: <Award size={22} className="text-blue-500" />,
      title: 'CBSE Curriculum',
      description: '100% aligned with NCERT textbooks, board exam patterns, and chapter-wise learning goals.'
    },
    {
      icon: <DollarSign size={22} className="text-emerald-500" />,
      title: 'Affordable Fees',
      description: 'High-quality coaching made accessible with reasonable monthly tuition fee structures.'
    },
    {
      icon: <CalendarCheck size={22} className="text-purple-500" />,
      title: 'Regular Tests',
      description: 'Bi-weekly unit assessments and board-pattern mock exams with detailed score feedback.'
    },
    {
      icon: <BookOpen size={22} className="text-indigo-500" />,
      title: 'Study Material',
      description: 'Free NCERT formula sheets, solved worksheets, and previous year question paper archives.'
    },
    {
      icon: <Users size={22} className="text-rose-500" />,
      title: 'Personal Attention',
      description: 'Strict limit of 25 students per batch ensuring individual focus and daily doubt clearing.'
    }
  ];

  return (
    <section className="py-10 sm:py-16 bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            <span>Why Choose Sunshine Classes</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Built for Academic Excellence & Board Success
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A trusted learning environment in Pihani combining experienced guidance, structured curriculum, and personalized student support.
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

