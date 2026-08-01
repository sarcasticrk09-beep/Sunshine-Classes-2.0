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
      className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/80 transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4"
    >
      {/* Card Header & Badge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${course.badgeColor}`}>
            {course.badge}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Award size={12} className="text-amber-500" />
            <span>{course.board.split(' ')[0]} Board</span>
          </span>
        </div>

        {/* Title & Price */}
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {course.className}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
            {course.subtitle}
          </p>
          
          <div className="mt-3 flex items-baseline gap-1.5 bg-amber-500/5 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/10 w-max">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Tuition Fee:</span>
            <span className="font-display text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
              {course.monthlyFeeFormatted}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              /{course.feePeriod}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {course.shortDescription}
        </p>

        {/* Key Logistics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500 shrink-0" />
            <span className="truncate">{course.timing}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-blue-500 shrink-0" />
            <span className="truncate">{course.batchSize}</span>
          </div>
        </div>

        {/* Subjects Tags */}
        <div className="pt-2">
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
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          id={`btn-explore-${course.slug}`}
          type="button"
          onClick={handleCardClick}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1.5 transition-all duration-200 group-hover:translate-x-1 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded-lg px-2 py-1"
        >
          <span>Explore Class</span>
          <ArrowRight size={14} />
        </button>

        <button
          id={`btn-enroll-card-${course.slug}`}
          type="button"
          onClick={handleEnrollClick}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 shrink-0"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};
