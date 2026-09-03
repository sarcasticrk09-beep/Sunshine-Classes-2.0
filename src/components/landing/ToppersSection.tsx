import React from 'react';
import { Trophy, ArrowRight, GraduationCap } from 'lucide-react';
import { Topper } from '../../types';
import { TopperCard } from '../merit/TopperCard';

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
      id: 'top-sheet-1', 
      name: 'Alaukik Mani Bajpai', 
      percentage: '91.60%', 
      studentClass: 'Class 10',
      academicYear: '2024',
      board: 'CBSE',
      achievementCaption: 'Subjects: Maths, Science, Social Science, Hindi, English',
      isFeatured: true,
      status: 'PUBLISHED'
    },
    { 
      id: 'top-sheet-2', 
      name: 'Uday Gupta', 
      percentage: '90.80%', 
      studentClass: 'Class 10',
      academicYear: '2026',
      board: 'CBSE',
      achievementCaption: 'Subjects: English, Hindi, Maths Standard, Social Science, Science, Information Technology',
      isFeatured: true,
      status: 'PUBLISHED'
    },
    { 
      id: 'top-sheet-rajeev', 
      name: 'Rajeev Kumar Verma', 
      percentage: '90.20%', 
      studentClass: 'Class 10',
      academicYear: '2022',
      board: 'CBSE',
      achievementCaption: 'Subjects: Social Science, Science, Maths, Hindi, English',
      isFeatured: true,
      status: 'PUBLISHED'
    }
  ];

  // Filter published & featured toppers if available
  const listToFilter = (toppers && toppers.length > 0 && !toppers.some(t => t.name === 'Priya Mishra' || t.id === 'top1')) 
    ? toppers 
    : defaultToppers;
  const publishedToppers = listToFilter.filter(t => t.status !== 'DRAFT');
  const featuredToppers = publishedToppers.filter(t => t.isFeatured !== false);
  const itemsToDisplay = (featuredToppers.length > 0 ? featuredToppers : publishedToppers).slice(0, 3);

  return (
    <section id="results-preview" className="py-6 sm:py-16 bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Trophy size={14} />
            <span>Academic Merit Honor Roll</span>
          </span>
          <h2 className="font-display text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            High Academic Scorers & Board Achievers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Celebrating academic performance, mastery of concepts, and board exam percentage records achieved at Sunshine Classes.
          </p>
        </div>

        {/* Toppers Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 max-w-5xl mx-auto">
          {itemsToDisplay.map((top, idx) => (
            <TopperCard
              key={top.id || `home-topper-${idx}`}
              topper={top}
              idPrefix="home-featured-topper"
            />
          ))}
        </div>

        {/* View All Results CTA */}
        <div className="text-center pt-1 sm:pt-2">
          <button
            id="btn-homepage-view-full-merit-list"
            onClick={() => onNavigateResults ? onNavigateResults() : (window.location.href = '#results')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-5 sm:px-6 py-3 shadow-md transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <span>View Full Merit List & Historic Results</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
};

