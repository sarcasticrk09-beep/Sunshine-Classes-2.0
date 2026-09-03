/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Sparkles 
} from 'lucide-react';
import { UniversalCourse } from '../../data/coursesData';

interface CourseCardProps {
  course: UniversalCourse;
  onExploreCourse?: (slug: string) => void;
  onEnrollCourse?: (className: string) => void;
  variant?: 'homepage' | 'directory' | 'compact';
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onExploreCourse,
  onEnrollCourse,
  variant = 'directory'
}) => {
  const handleCardClick = () => {
    if (onExploreCourse) {
      onExploreCourse(course.slug);
    }
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnrollCourse) {
      onEnrollCourse(course.className);
    }
  };

  return (
    <div
      id={`course-card-${course.slug}`}
      onClick={handleCardClick}
      className="group relative rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 sm:p-6 shadow-xs hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/80 transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-2.5 sm:space-y-4"
    >
      {/* Card Header & Badge */}
      <div className="space-y-1.5 sm:space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${course.badgeColor}`}>
            {course.badge}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Award size={11} className="text-amber-500 shrink-0" />
            <span>{course.board.split(' ')[0]}</span>
          </span>
        </div>

        {/* Title & Price */}
        <div>
          <h3 className="font-display text-base sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {course.className}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
            {course.subtitle}
          </p>
          
          <div className="mt-1.5 sm:mt-3 flex items-baseline gap-1 bg-amber-500/5 dark:bg-amber-500/10 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border border-amber-500/10 w-max">
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-semibold">Tuition:</span>
            <span className="font-display text-sm sm:text-xl font-black text-amber-600 dark:text-amber-400">
              {course.monthlyFeeFormatted}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              /{course.feePeriod}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {course.shortDescription}
        </p>

        {/* Key Logistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Clock size={11} className="text-amber-500 shrink-0" />
            <span className="truncate">{course.timing}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Users size={11} className="text-blue-500 shrink-0" />
            <span className="truncate">{course.batchSize}</span>
          </div>
        </div>

        {/* Subjects Tags */}
        <div className="hidden sm:block pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
            Core Subjects Covered:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {course.subjects.map((sub, i) => (
              <span
                key={i}
                className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <CheckCircle2 size={10} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{sub}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1 sm:gap-2">
        <button
          id={`btn-explore-${course.slug}`}
          type="button"
          onClick={handleCardClick}
          className="hidden sm:flex text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 items-center gap-1.5 transition-all duration-200 group-hover:translate-x-1 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded-lg px-2 py-1"
        >
          <span>Explore Class</span>
          <ArrowRight size={14} />
        </button>

        <button
          id={`btn-enroll-card-${course.slug}`}
          type="button"
          onClick={handleEnrollClick}
          className="w-full sm:w-auto px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] sm:text-xs shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-center"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};
