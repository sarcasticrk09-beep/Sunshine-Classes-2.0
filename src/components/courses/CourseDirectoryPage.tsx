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
  BookOpen,
  GraduationCap,
  Layers,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UNIVERSAL_COURSES, UniversalCourse } from '../../data/coursesData';
import { CourseCard } from './CourseCard';
import { CourseDirectorySkeleton } from './CourseSkeletons';

interface CourseDirectoryPageProps {
  courses?: UniversalCourse[];
  isLoading?: boolean;
  onExploreCourse: (slug: string) => void;
  onSelectClassForAdmission: (className: string) => void;
  onNavigateSection: (section: string) => void;
}

type AcademicLevel = 'all' | 'primary' | 'middle' | 'board';

export const CourseDirectoryPage: React.FC<CourseDirectoryPageProps> = ({
  courses = UNIVERSAL_COURSES,
  isLoading = false,
  onExploreCourse,
  onSelectClassForAdmission,
  onNavigateSection
}) => {
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel>('board');

  if (isLoading) {
    return <CourseDirectorySkeleton />;
  }

  // Filter courses based on selected academic level
  const filteredCourses = courses
    .filter(c => c.status !== 'DRAFT')
    .filter(c => {
      if (selectedLevel === 'primary') return c.classNumber >= 1 && c.classNumber <= 4;
      if (selectedLevel === 'middle') return c.classNumber >= 5 && c.classNumber <= 8;
      if (selectedLevel === 'board') return c.classNumber >= 9 && c.classNumber <= 10;
      return true;
    })
    .sort((a, b) => a.classNumber - b.classNumber);

  // Define guided level metadata
  const levelMetadata = [
    {
      id: 'board' as AcademicLevel,
      title: 'Board Preparation',
      subtitle: 'Classes 9 & 10',
      description: 'CBSE & UP Board exam coaching with 100% NCERT mastery, solved PYQs & weekly mock series.',
      badge: '₹1,000 - ₹1,200 / mo',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: GraduationCap,
      count: courses.filter(c => c.classNumber >= 9).length
    },
    {
      id: 'middle' as AcademicLevel,
      title: 'Middle Wing',
      subtitle: 'Classes 5 to 8',
      description: 'Core science, algebra, and language fundamentals to prepare students for high school rigour.',
      badge: '₹700 / mo',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      icon: BookOpen,
      count: courses.filter(c => c.classNumber >= 5 && c.classNumber <= 8).length
    },
    {
      id: 'primary' as AcademicLevel,
      title: 'Primary Wing',
      subtitle: 'Classes 1 to 4',
      description: 'Activity-based learning focusing on phonics, handwriting, reading fluency & basic arithmetic.',
      badge: '₹500 / mo',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: School,
      count: courses.filter(c => c.classNumber >= 1 && c.classNumber <= 4).length
    },
    {
      id: 'all' as AcademicLevel,
      title: 'All Programs',
      subtitle: 'Classes 1 to 10',
      description: 'Explore our complete, transparent academic directory across all primary and board batches.',
      badge: 'Complete Catalog',
      badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      icon: Layers,
      count: courses.length
    }
  ];

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
            Guided Course Discovery
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Select an academic level below to explore specialized tuition programs, subject roadmaps, and batch timings tailored for your child's class.
          </p>

          {/* Academic Level Selector - Interactive Guided Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6 max-w-5xl mx-auto text-left">
            {levelMetadata.map((lvl) => {
              const Icon = lvl.icon;
              const isSelected = selectedLevel === lvl.id;

              return (
                <button
                  key={lvl.id}
                  id={`btn-select-level-${lvl.id}`}
                  type="button"
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left space-y-3 relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-amber-400 ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-amber-400">
                      <CheckCircle2 size={18} />
                    </div>
                  )}

                  <div className="space-y-1.5 pr-6">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-amber-400'}`}>
                        <Icon size={16} />
                      </div>
                      <span className="font-display font-black text-sm text-white">{lvl.title}</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 block">{lvl.subtitle}</span>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {lvl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-extrabold">
                    <span className={`px-2 py-0.5 rounded-md border ${lvl.badgeColor}`}>
                      {lvl.badge}
                    </span>
                    <span className="text-slate-400">
                      {lvl.count} {lvl.count === 1 ? 'Program' : 'Programs'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Courses Display Section */}
      <section className="py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Active Filter Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-display font-black text-sm text-slate-900 dark:text-white">
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'Batch' : 'Batches'} for{' '}
              <span className="text-amber-600 dark:text-amber-400">
                {levelMetadata.find(l => l.id === selectedLevel)?.title} ({levelMetadata.find(l => l.id === selectedLevel)?.subtitle})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Official Fee Guarantee: No Registration or Hidden Extra Fees</span>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              variant="directory"
              onExploreCourse={onExploreCourse}
              onEnrollCourse={onSelectClassForAdmission}
            />
          ))}
        </div>

        {/* Side-by-side Program & Fee Matrix */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
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
                  <th className="p-3 font-bold">Wing Badge</th>
                  <th className="p-3 font-bold">Monthly Fee</th>
                  <th className="p-3 font-bold">Batch Timing</th>
                  <th className="p-3 font-bold">Batch Size</th>
                  <th className="p-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {courses.map((course) => (
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

        {/* Parent Batch Guidance & Enrollment Banner */}
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">Personalized Guidance</span>
            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Not sure which batch suits your child best?
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
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              Enroll Online
            </button>
            <a
              href="tel:8707738284"
              className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-all flex items-center gap-2 min-h-[44px]"
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
