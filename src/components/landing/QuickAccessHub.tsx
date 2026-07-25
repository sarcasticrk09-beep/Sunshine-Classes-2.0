import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  ShoppingBag, 
  Award, 
  PhoneCall, 
  ArrowRight,
  Sparkles,
  School
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAccessHubProps {
  onNavigateSection: (section: string) => void;
}

export const QuickAccessHub: React.FC<QuickAccessHubProps> = ({ onNavigateSection }) => {
  const navigate = useNavigate();

  const hubCards = [
    {
      id: 'admissions',
      title: 'Admissions',
      subtitle: 'Classes 1 to 10',
      description: 'Online application & batch seat reservation',
      icon: <GraduationCap size={22} className="text-amber-500" />,
      badge: 'Open 2026-27',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      action: () => onNavigateSection('admissions')
    },
    {
      id: 'courses',
      title: 'Courses',
      subtitle: 'Classroom Batches',
      description: 'Schedules, tuition fees & subject coverage',
      icon: <School size={22} className="text-blue-500" />,
      badge: 'Max 25 / Batch',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      action: () => onNavigateSection('courses')
    },
    {
      id: 'study-material',
      title: 'Study Material',
      subtitle: 'Free Digital Notes',
      description: 'NCERT formula sheets, worksheets & PYQs',
      icon: <BookOpen size={22} className="text-emerald-500" />,
      badge: 'Free PDFs',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      action: () => navigate('/resources')
    },
    {
      id: 'sunshine-store',
      title: 'Sunshine Store',
      subtitle: 'Book Depot & Kits',
      description: 'Textbooks, sample papers & stationery',
      icon: <ShoppingBag size={22} className="text-rose-500" />,
      badge: 'Campus Depot',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      action: () => navigate('/books')
    },
    {
      id: 'board-results',
      title: 'Board Results',
      subtitle: 'Merit Toppers',
      description: 'Class 10 state & district rank holders',
      icon: <Award size={22} className="text-purple-500" />,
      badge: '98.4% Top Marks',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      action: () => onNavigateSection('results')
    },
    {
      id: 'contact',
      title: 'Contact',
      subtitle: 'Pihani Helpdesk',
      description: 'Location map, office hours & WhatsApp',
      icon: <PhoneCall size={22} className="text-indigo-500" />,
      badge: 'Instant Desk',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      action: () => onNavigateSection('contact')
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            <span>Fast Navigation Hub</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Quick Access Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select a service below to jump directly to admissions, batch schedules, free notes, store catalog, or merit list.
          </p>
        </div>

        {/* 6 Hub Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {hubCards.map((card) => (
            <button
              key={card.id}
              id={`hub-card-${card.id}`}
              onClick={card.action}
              className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 text-left flex flex-col justify-between hover:border-amber-500 dark:hover:border-amber-400 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer min-h-[160px]"
            >
              <div className="space-y-3">
                
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {card.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                    {card.subtitle}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                    {card.description}
                  </p>
                </div>

              </div>

              {/* Bottom Action Hint */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                <span>Explore</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>

            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
