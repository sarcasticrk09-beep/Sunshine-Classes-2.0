/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  School, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Phone, 
  ArrowRight, 
  Award, 
  Clock, 
  Users,
  Filter
} from 'lucide-react';
import { UNIVERSAL_COURSES, UniversalCourse } from '../../data/coursesData';
import { CourseCard } from './CourseCard';

interface CourseDirectoryPageProps {
  onExploreCourse: (slug: string) => void;
  onSelectClassForAdmission: (className: string) => void;
  onNavigateSection: (section: string) => void;
}

export const CourseDirectoryPage: React.FC<CourseDirectoryPageProps> = ({
  onExploreCourse,
  onSelectClassForAdmission,
  onNavigateSection
}) => {
  const [wingFilter, setWingFilter] = useState<'all' | 'middle' | 'high'>('all');

  const filteredCourses = UNIVERSAL_COURSES.filter(c => {
    if (wingFilter === 'middle') return c.classNumber <= 8;
    if (wingFilter === 'high') return c.classNumber >= 9;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      
      {/* Hero Directory Header */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-24 pb-16 border-b border-indigo-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <School size={14} />
            <span>Academic Programs Directory 2026-27</span>
          </span>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
            Classroom Tuitions & Batch Directory
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore dedicated classroom programs for Class 6 to Class 10 with transparent monthly fees, subject roadmaps, and expert faculty in Pihani, Hardoi.
          </p>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              id="btn-filter-all"
              type="button"
              onClick={() => setWingFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                wingFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              All Programs ({UNIVERSAL_COURSES.length})
            </button>
            <button
              id="btn-filter-middle"
              type="button"
              onClick={() => setWingFilter('middle')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                wingFilter === 'middle'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Middle Wing (Class 6-8)
            </button>
            <button
              id="btn-filter-high"
              type="button"
              onClick={() => setWingFilter('high')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                wingFilter === 'high'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              High School & Boards (Class 9-10)
            </button>
          </div>
        </div>
      </section>

      {/* Courses Cards Grid */}
      <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onExploreCourse={onExploreCourse}
              onEnrollCourse={onSelectClassForAdmission}
            />
          ))}
        </div>

        {/* Side-by-side Fee & Program Comparison Matrix */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">At a Glance</span>
              <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
                Program Comparison Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500">100% Transparent monthly fees with no hidden costs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-bold">Class</th>
                  <th className="p-3 font-bold">Program Badge</th>
                  <th className="p-3 font-bold">Monthly Fee</th>
                  <th className="p-3 font-bold">Batch Timing</th>
                  <th className="p-3 font-bold">Capacity</th>
                  <th className="p-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {UNIVERSAL_COURSES.map((course) => (
                  <tr key={course.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors">
                    <td className="p-3 font-display font-black text-slate-900 dark:text-white text-sm">
                      {course.className}
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${course.badgeColor}`}>
                        {course.badge}
                      </span>
                    </td>
                    <td className="p-3 font-display font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {course.monthlyFeeFormatted} <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                    </td>
                    <td className="p-3 font-medium">{course.timing}</td>
                    <td className="p-3 font-medium">{course.batchSize}</td>
                    <td className="p-3 text-right">
                      <button
                        id={`btn-table-view-${course.slug}`}
                        type="button"
                        onClick={() => onExploreCourse(course.slug)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-[11px] hover:bg-indigo-900 transition-all cursor-pointer"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Directory FAQ Banner */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">Need Guidance?</span>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Not sure which batch suits your child?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Visit our campus opposite Subhash Park in Pihani or call our academic counselor for a free 1-on-1 batch assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-dir-enroll-now"
              type="button"
              onClick={() => onSelectClassForAdmission('Class 10')}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Enroll Online
            </button>
            <a
              href="tel:8707738284"
              className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-all flex items-center gap-2"
            >
              <Phone size={14} />
              <span>8707738284</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
