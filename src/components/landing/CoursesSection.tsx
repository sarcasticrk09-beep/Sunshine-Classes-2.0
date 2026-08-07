/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { UNIVERSAL_COURSES, UniversalCourse } from '../../data/coursesData';
import { CourseCard } from '../courses/CourseCard';

interface CoursesSectionProps {
  courses?: UniversalCourse[];
  onSelectClassForAdmission: (className: string) => void;
  onNavigateSection?: (section: string) => void;
  onExploreCourse?: (slug: string) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ 
  courses = UNIVERSAL_COURSES,
  onSelectClassForAdmission,
  onNavigateSection,
  onExploreCourse 
}) => {
  const handleExplore = (slug: string) => {
    if (onExploreCourse) {
      onExploreCourse(slug);
    } else if (onNavigateSection) {
      onNavigateSection(`courses/${slug}`);
    }
  };

  // Select 3-4 administrator-featured programs for homepage conversion
  const featuredPrograms = courses
    .filter(c => c.status !== 'DRAFT')
    .filter(c => {
      if (c.isFeatured !== undefined) return c.isFeatured;
      // Default fallback: Class 10, Class 9, Class 8, Class 5
      return c.classNumber === 10 || c.classNumber === 9 || c.classNumber === 8 || c.classNumber === 5;
    })
    .sort((a, b) => (b.classNumber - a.classNumber))
    .slice(0, 4);

  return (
    <section id="courses-preview" className="py-8 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2.5">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles size={13} className="text-amber-500" />
            <span>Featured Programs</span>
          </span>
          <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Flagship Classroom Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Discover our most popular tuition batches designed for conceptual clarity, board exam mastery, and individual student care.
          </p>
        </div>

        {/* Concise Featured 3-4 Cards Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPrograms.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="homepage"
              onExploreCourse={handleExplore}
              onEnrollCourse={onSelectClassForAdmission}
            />
          ))}
        </div>

        {/* High-Conversion CTA Banner Linking to Full Directory */}
        <div className="rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-950/5 p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xs">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
            <div className="inline-flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
              <span>Complete Class 1 to 10 Academic Coverage</span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-2xl text-slate-900 dark:text-white">
              Looking for Primary Wing (Class 1-4) or Middle School Batches?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl font-medium">
              We offer dedicated tuition batches for all classes with transparent monthly fees starting from ₹500/month.
            </p>
          </div>

          <button
            id="btn-homepage-view-all-courses"
            type="button"
            onClick={() => onNavigateSection ? onNavigateSection('courses') : handleExplore('class-10')}
            className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm px-5 sm:px-7 py-3 sm:py-3.5 shadow-md transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] shrink-0 border border-amber-400 w-full md:w-auto"
          >
            <span>View All Courses & Fee Directory</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};
