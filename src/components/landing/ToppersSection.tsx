import React from 'react';
import { 
  Trophy, 
  Award, 
  ArrowRight, 
  Sparkles,
  Medal,
  Star
} from 'lucide-react';

interface Topper {
  id?: string;
  name: string;
  score: string;
  rank: string;
  desc?: string;
  img?: string;
  year?: string;
}

interface ToppersSectionProps {
  toppers?: Topper[];
  onNavigateResults?: () => void;
}

export const ToppersSection: React.FC<ToppersSectionProps> = ({ 
  toppers = [],
  onNavigateResults 
}) => {
  const defaultToppers: Topper[] = [
    { 
      id: 'top1', 
      name: 'Priya Mishra', 
      score: '98.4%', 
      rank: 'State Merit Rank 4', 
      desc: 'Class 10 Board Topper with perfect score in Mathematics & Science numericals.',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      year: '2025'
    },
    { 
      id: 'top2', 
      name: 'Anuj Soni', 
      score: '96.2%', 
      rank: 'Hardoi District Rank 1', 
      desc: 'Flawless performance in Class 10 Board Physics & Chemistry theory papers.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      year: '2025'
    },
    { 
      id: 'top3', 
      name: 'Aditi Shukla', 
      score: '95.0%', 
      rank: 'Pihani Zone Rank 1', 
      desc: 'Outstanding scores in Mathematics proofs and English grammatical assessments.',
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      year: '2025'
    }
  ];

  const itemsToDisplay = (toppers && toppers.length > 0 ? toppers : defaultToppers).slice(0, 3);

  return (
    <section id="results-preview" className="py-10 sm:py-16 bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Trophy size={14} />
            <span>Board Exam Toppers</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Our Proud Class 10 Merit List
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Celebrating top district ranks and historic score records achieved by students trained at Sunshine Classes.
          </p>
        </div>

        {/* Max 3 Topper Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {itemsToDisplay.map((top, idx) => (
            <div
              key={top.id || idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-amber-400 transition-all text-center space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Photo with Badge */}
                <div className="relative mx-auto h-20 w-20 rounded-full border-4 border-amber-300 dark:border-amber-500/60 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  <img 
                    src={top.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                    alt={top.name}
                    width={80}
                    height={80}
                    loading="lazy" 
                    decoding="async" 
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-[8px] font-black uppercase py-0.5">
                    {top.year || '2025'}
                  </div>
                </div>

                {/* Rank & Name */}
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider block">
                    {top.rank}
                  </span>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white mt-0.5">
                    {top.name}
                  </h3>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">
                    {top.score}
                  </span>
                </div>

                {top.desc && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug font-medium line-clamp-2">
                    {top.desc}
                  </p>
                )}
              </div>

              {/* Achievement Badge */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <Medal size={12} className="text-amber-500" />
                <span>NCERT Concept Master</span>
              </div>
            </div>
          ))}
        </div>

        {/* View All Results CTA */}
        <div className="text-center pt-2">
          <button
            id="btn-homepage-view-full-merit-list"
            onClick={() => onNavigateResults ? onNavigateResults() : (window.location.href = '#results')}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-6 py-3 shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <span>View Full Merit List & Historic Results</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
};
