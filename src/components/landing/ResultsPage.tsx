import React, { useState, useMemo } from 'react';
import { Trophy, Award, Sparkles, Search, GraduationCap, X, CheckCircle2, Share2, Medal, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Topper } from '../../types';
import { TopperCard, getTopperInitials } from '../merit/TopperCard';

interface ResultsPageProps {
  toppers?: Topper[];
  onEnrollClick?: (className?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const ResultsPage: React.FC<ResultsPageProps> = ({
  toppers = []
}) => {
  // Real Spreadsheet Toppers Fallback Data
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
      id: 'top-sheet-3', 
      name: 'Rajeev Kumar Verma', 
      percentage: '90.20%', 
      studentClass: 'Class 10',
      academicYear: '2022',
      board: 'CBSE',
      achievementCaption: 'Subjects: Social Science, Science, Maths, Hindi, English',
      isFeatured: true,
      status: 'PUBLISHED'
    },
    { 
      id: 'top-sheet-4', 
      name: 'Ayushi Raj', 
      percentage: '87.00%', 
      studentClass: 'Class 10',
      academicYear: '2025',
      board: 'CBSE',
      achievementCaption: 'Outstanding Performance in Board Examinations',
      isFeatured: true,
      status: 'PUBLISHED'
    },
    { 
      id: 'top-sheet-5', 
      name: 'Zaina Siddiqui', 
      percentage: '86.80%', 
      studentClass: 'Class 10',
      academicYear: '2025',
      board: 'CBSE',
      achievementCaption: 'Subjects: Hindi, English, Maths, Science, Social Science',
      isFeatured: true,
      status: 'PUBLISHED'
    },
    { 
      id: 'top-sheet-6', 
      name: 'Harshita Mishra', 
      percentage: '86.00%', 
      studentClass: 'Class 10',
      academicYear: '2026',
      board: 'CBSE',
      achievementCaption: 'Subjects: Information Technology, Science, Mathematics',
      isFeatured: true,
      status: 'PUBLISHED'
    },
    { 
      id: 'top-sheet-7', 
      name: 'Kaushlendra Raj', 
      percentage: '81.80%', 
      studentClass: 'Class 10',
      academicYear: '2025',
      board: 'CBSE',
      achievementCaption: 'Academic Merit Distinction Score',
      isFeatured: true,
      status: 'PUBLISHED'
    }
  ];

  // Selected topper for detail modal
  const [selectedTopper, setSelectedTopper] = useState<Topper | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const activeToppers = useMemo(() => {
    const list = (toppers && toppers.length > 0 && !toppers.some(t => t.name === 'Priya Mishra' || t.id === 'top1'))
      ? toppers.filter(t => t.status !== 'DRAFT')
      : defaultToppers;
    
    // Sort descending by percentage score
    return list.sort((a, b) => {
      const numA = parseFloat((a.percentage || a.score || '0').replace('%', ''));
      const numB = parseFloat((b.percentage || b.score || '0').replace('%', ''));
      return numB - numA;
    });
  }, [toppers]);

  // Extract available years & classes for filter chips
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    activeToppers.forEach(t => {
      const y = t.academicYear || t.year;
      if (y) years.add(y);
    });
    return Array.from(years).sort().reverse();
  }, [activeToppers]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    activeToppers.forEach(t => {
      const c = t.studentClass || t.class;
      if (c) classes.add(c);
    });
    return Array.from(classes).sort();
  }, [activeToppers]);

  // Featured Top Scorer (#1)
  const featuredTopScorer = useMemo(() => {
    return activeToppers.find(t => t.isFeatured !== false) || activeToppers[0];
  }, [activeToppers]);

  // Filtered toppers for the main grid
  const filteredToppers = useMemo(() => {
    return activeToppers.filter(top => {
      const yearMatch = selectedYear === 'ALL' || (top.academicYear || top.year) === selectedYear;
      const classMatch = selectedClass === 'ALL' || (top.studentClass || top.class) === selectedClass;
      const searchMatch = !searchQuery.trim() || top.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return yearMatch && classMatch && searchMatch;
    });
  }, [activeToppers, selectedYear, selectedClass, searchQuery]);

  const handleShare = () => {
    if (navigator.clipboard && selectedTopper) {
      navigator.clipboard.writeText(`${window.location.origin}/#results`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div id="results-canonical-container" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-fade-in">
      
      {/* 1. HERO HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-6"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-xs uppercase tracking-widest shadow-xs">
            <Trophy size={14} className="text-amber-400" />
            <span>Sunshine Hall of Excellence</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Celebrating High Academic Achievements & Board Toppers
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Honoring the dedication, perseverance, and outstanding examination scores achieved by Sunshine Classes students in CBSE Board Examinations.
          </p>

          {/* Key Honor Stats Pills */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-extrabold text-amber-200">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber-400" />
              <span>100% Board Pass Rate</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <Medal size={14} className="text-amber-400" />
              <span>90%+ Score Benchmark</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" />
              <span>Verified Sunshine Alumni</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. FEATURED TOP SCORER SPOTLIGHT */}
      {featuredTopScorer && (
        <section id="section-featured-top-scorer" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">
            <Sparkles size={16} />
            <span>Highest Board Scorer Spotlight</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedTopper(featuredTopScorer)}
            className="group relative rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-900/10 to-slate-900/10 dark:from-amber-500/20 dark:via-indigo-950 dark:to-slate-900 border-2 border-amber-400/50 dark:border-amber-500/40 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left Column: Student Details */}
              <div className="flex items-center gap-5 sm:gap-6">
                {/* Photo / Avatar */}
                <div className="relative shrink-0">
                  {featuredTopScorer.photoUrl || featuredTopScorer.img ? (
                    <img
                      src={featuredTopScorer.photoUrl || featuredTopScorer.img}
                      alt={featuredTopScorer.name}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover ring-4 ring-amber-400 shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-900 text-white font-black text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-amber-400 shadow-xl tracking-wider select-none group-hover:scale-105 transition-transform duration-300">
                      {getTopperInitials(featuredTopScorer.name)}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                    <Trophy size={16} className="fill-slate-950" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    <Award size={12} />
                    <span>Rank #1 Highest Board Score</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {featuredTopScorer.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <GraduationCap size={15} className="text-amber-500" />
                    <span>{featuredTopScorer.studentClass || featuredTopScorer.class} • {featuredTopScorer.board || 'CBSE'}</span>
                    <span>•</span>
                    <span>Passing Year: {featuredTopScorer.academicYear || featuredTopScorer.year}</span>
                  </p>
                </div>
              </div>

              {/* Right Column: Score Badge & Action */}
              <div className="shrink-0 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-200 dark:border-slate-800 pt-4 md:pt-0">
                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight block">
                    {featuredTopScorer.percentage || featuredTopScorer.score}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Overall Percentage
                  </span>
                </div>

                <button
                  id="btn-view-featured-profile"
                  type="button"
                  className="rounded-2xl bg-indigo-900 hover:bg-indigo-950 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs px-5 py-3 transition-colors shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <User size={14} />
                  <span>View Full Profile</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* 3. FILTER CHIPS & SEARCH BAR */}
      <section id="section-toppers-filters" className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
              Toppers Roll Call
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredToppers.length} high achievers
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-toppers"
              type="text"
              placeholder="Search topper by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                id="btn-clear-topper-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-black uppercase text-slate-400 mr-2">Filter Year:</span>
          
          <button
            id="chip-filter-year-all"
            type="button"
            onClick={() => setSelectedYear('ALL')}
            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
              selectedYear === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Years
          </button>

          {availableYears.map(yr => (
            <button
              key={`chip-year-${yr}`}
              id={`chip-filter-year-${yr.replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                selectedYear === yr
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Passing Year: {yr}
            </button>
          ))}

          {availableClasses.length > 1 && (
            <>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
              <span className="text-xs font-black uppercase text-slate-400 mr-2">Class:</span>
              <button
                id="chip-filter-class-all"
                type="button"
                onClick={() => setSelectedClass('ALL')}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedClass === 'ALL'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Classes
              </button>
              {availableClasses.map(cls => (
                <button
                  key={`chip-cls-${cls}`}
                  id={`chip-filter-class-${cls.replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </>
          )}
        </div>
      </section>

      {/* 4. RESPONSIVE TOPPER CARDS GRID */}
      {filteredToppers.length > 0 ? (
        <motion.div 
          key={`topper-grid-yr-${selectedYear}-cls-${selectedClass}-srch-${searchQuery}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredToppers.map((top, idx) => (
            <motion.div 
              key={top.id || `results-page-topper-${idx}`}
              variants={itemVariants}
            >
              <TopperCard
                topper={top}
                onSelect={(topper) => setSelectedTopper(topper)}
                idPrefix="results-page-topper"
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <GraduationCap size={40} className="mx-auto text-slate-400" />
          <h3 className="font-display font-black text-lg text-slate-700 dark:text-slate-300">
            No toppers found matching your filter criteria
          </h3>
          <p className="text-xs text-slate-500">
            Try resetting the year or class filter chips above to view all merit achievers.
          </p>
          <button
            id="btn-reset-topper-filters"
            onClick={() => { setSelectedYear('ALL'); setSelectedClass('ALL'); setSearchQuery(''); }}
            className="mt-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 5. TOPPER DETAIL MODAL */}
      <AnimatePresence>
        {selectedTopper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
            >
              {/* Top Close Button */}
              <button
                id="btn-close-topper-modal"
                onClick={() => setSelectedTopper(null)}
                className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Modal Student Header */}
              <div className="flex items-start gap-5 pt-2">
                <div className="relative shrink-0">
                  {selectedTopper.photoUrl || selectedTopper.img ? (
                    <img
                      src={selectedTopper.photoUrl || selectedTopper.img}
                      alt={selectedTopper.name}
                      className="h-20 w-20 rounded-2xl object-cover ring-4 ring-amber-400 shadow-lg"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-900 text-white font-black text-2xl flex items-center justify-center ring-4 ring-amber-400 shadow-lg select-none">
                      {getTopperInitials(selectedTopper.name)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                    <Trophy size={13} className="fill-slate-950" />
                  </div>
                </div>

                <div className="space-y-1 pr-6">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    <Award size={12} />
                    <span>Sunshine Merit Roll</span>
                  </span>
                  <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white leading-tight">
                    {selectedTopper.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedTopper.studentClass || selectedTopper.class} • {selectedTopper.board || 'CBSE'} Board
                  </p>
                </div>
              </div>

              {/* Score Showcase Ring / Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300/50 dark:border-amber-700/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Board Examination Result
                  </span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedTopper.percentage || selectedTopper.score}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Passing Year
                  </span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    {selectedTopper.academicYear || selectedTopper.year}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown & Achievements */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
                  <BookOpen size={14} className="text-amber-500" />
                  <span>Academic Remarks & Achievements</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                  {(selectedTopper.achievementCaption || selectedTopper.desc || '')
                    .replace(/St\.\s*Xavier'?s?\s*School[^|]*\|?/gi, '')
                    .replace(/^[\s|]+|[\s|]+$/g, '')
                    .trim() || 'Outstanding performance and high distinction standard in Board Examinations.'}
                </div>
              </div>

              {/* Official Sunshine Verification Seal */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <CheckCircle2 size={14} />
                  <span>Verified Sunshine Classes Record</span>
                </span>
                
                <button
                  id="btn-share-topper-profile"
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
