/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, ArrowRight } from 'lucide-react';
import { UNIVERSAL_COURSES } from '../../data/coursesData';
import { CourseCard } from '../courses/CourseCard';

interface CoursesSectionProps {
  onSelectClassForAdmission: (className: string) => void;
  onNavigateSection?: (section: string) => void;
  onExploreCourse?: (slug: string) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ 
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

  return (
    <section id="courses-preview" className="py-10 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <School size={14} />
            <span>Classroom Programs</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Classroom Tuitions & Batch Schedules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Explore active tuition batches from Class 1 to Class 10 with transparent monthly fees and core subject coverage.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {UNIVERSAL_COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="homepage"
              onExploreCourse={handleExplore}
              onEnrollCourse={onSelectClassForAdmission}
            />
          ))}
        </div>

        {/* View All Courses CTA */}
        <div className="text-center pt-2">
          <button
            id="btn-homepage-view-all-courses"
            type="button"
            onClick={() => onNavigateSection ? onNavigateSection('courses') : onSelectClassForAdmission('Class 10')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-6 py-3 shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <span>View All Courses & Full Fee Directory</span>
            <ArrowRight size={15} className="text-amber-500" />
          </button>
        </div>

      </div>
    </section>
  );
};
