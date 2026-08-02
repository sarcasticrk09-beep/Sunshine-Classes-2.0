/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  IndianRupee, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  FileText, 
  HelpCircle, 
  UserCheck, 
  Phone, 
  MessageSquare,
  School,
  Star
} from 'lucide-react';
import { UniversalCourse, UNIVERSAL_COURSES } from '../../data/coursesData';
import { CourseCard } from './CourseCard';
import { CourseDetailSkeleton } from './CourseSkeletons';

interface CourseDetailPageProps {
  isLoading?: boolean;
  course: UniversalCourse;
  onNavigateSection: (section: string) => void;
  onSelectClassForAdmission: (className: string) => void;
  onExploreCourse: (slug: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  isLoading = false,
  course,
  onNavigateSection,
  onSelectClassForAdmission,
  onExploreCourse
}) => {
  const [activeTab, setActiveTab] = useState<string>(course.subjectsDetailed[0]?.name || '');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  const relatedCourses = UNIVERSAL_COURSES.filter(c => c.slug !== course.slug);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-24 pb-16 border-b border-indigo-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button 
              id="btn-breadcrumb-home"
              type="button"
              onClick={() => onNavigateSection('home')} 
              className="hover:text-amber-400 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded-sm"
            >
              Home
            </button>
            <ChevronRight size={12} />
            <button 
              id="btn-breadcrumb-courses"
              type="button"
              onClick={() => onNavigateSection('courses')} 
              className="hover:text-amber-400 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400 rounded-sm"
            >
              Courses
            </button>
            <ChevronRight size={12} />
            <span className="text-amber-400 font-bold">{course.className}</span>
          </nav>

          {/* Main Hero Header */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${course.badgeColor}`}>
                  {course.badge}
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Award size={14} />
                  <span>{course.board}</span>
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {course.subtitle}
              </p>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly Fee</span>
                  <span className="font-display text-lg font-black text-amber-400">{course.monthlyFeeFormatted}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Daily Timing</span>
                  <span className="text-xs font-bold text-white truncate block mt-1">{course.timing}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Batch Capacity</span>
                  <span className="text-xs font-bold text-white block mt-1">{course.batchSize}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Academic Tenure</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">1 Year Full Session</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  id={`btn-hero-enroll-${course.slug}`}
                  onClick={() => onSelectClassForAdmission(course.className)}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  <span>Enroll in {course.className} Batch</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-medium">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={14} /> 100% NCERT Coverage
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={14} /> Biometric Attendance
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={14} /> Weekly WhatsApp Test Reports
                </span>
              </div>

            </div>

            {/* Quick Hero Admission Card Right */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Admission Open 2026-27</span>
                    <h3 className="font-display font-bold text-lg text-white">{course.className} Tuition Registration</h3>
                  </div>
                  <Sparkles className="text-amber-400" size={20} />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Monthly Tuition Fee</span>
                    <span className="font-bold text-amber-400">{course.monthlyFeeFormatted} / mo</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Subjects Included</span>
                    <span className="font-bold text-white text-right">{course.subjects.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Class Timings</span>
                    <span className="font-bold text-white">{course.timing}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Campus Location</span>
                    <span className="font-bold text-white">Pihani, Hardoi (Opp. Subhash Park)</span>
                  </div>
                </div>

                <button
                  id={`btn-card-right-enroll-${course.slug}`}
                  onClick={() => onSelectClassForAdmission(course.className)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Register Online Now</span>
                  <ArrowRight size={16} />
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Or call desk: <a href="tel:8707738284" className="text-amber-400 font-bold hover:underline">8707738284</a> • <a href="https://wa.me/919161586254" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">WhatsApp Support</a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. QUICK HIGHLIGHTS GRID */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Program Advantages</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Key Highlights of {course.className} Program
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {course.highlights.map((item, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-amber-400 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
                  0{idx + 1}
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT COURSE & DETAILED DESCRIPTION */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Curriculum Strategy</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Pedagogical Approach for {course.className}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.fullDescription}
            </p>

            <div className="pt-2 space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Core Program Features Included:
              </h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {course.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold">
                <School size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Why Sunshine Classes?</h3>
                <p className="text-xs text-slate-500">Pihani's Premier Coaching Institute</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {course.whySunshine.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Star size={14} className="text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                id={`btn-about-enroll-${course.slug}`}
                onClick={() => onSelectClassForAdmission(course.className)}
                className="w-full py-2.5 rounded-xl bg-indigo-950 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:bg-indigo-900 transition-colors cursor-pointer"
              >
                Apply for {course.className} Seat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUBJECTS COVERED & SYLLABUS BREAKDOWN */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Syllabus Architecture</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Subject-wise Modules & Topic Index
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Structured week-by-week teaching roadmap aligned with NCERT guidelines.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {course.subjectsDetailed.map((sub, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen size={18} className="text-amber-500" />
                      <span>{sub.name}</span>
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-950 dark:text-amber-400 bg-indigo-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-amber-500/20">
                      {sub.hoursPerWeek}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {sub.topics.map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Full NCERT + DPP Papers</span>
                  <span className="text-emerald-600 font-bold">100% Covered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BATCH TIMING & FEE STRUCTURE PLAN */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Transparent Pricing</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {course.className} Fee Structure & Payment Plans
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No registration overheads, no hidden fees. Choose a plan that suits your family budget.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Plan 1: Monthly */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Standard Plan</span>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Monthly Tuition</h3>
                <div className="my-3">
                  <span className="font-display text-3xl font-black text-slate-900 dark:text-white">{course.monthlyFeeFormatted}</span>
                  <span className="text-xs text-slate-500 font-medium"> / month</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Pay month-to-month within first 5 days of every month.</p>
              </div>
              <button
                id={`btn-plan-monthly-${course.slug}`}
                type="button"
                onClick={() => onSelectClassForAdmission(course.className)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Select Monthly Plan
              </button>
            </div>

            {/* Plan 2: Quarterly */}
            <div className="rounded-2xl border border-amber-400 dark:border-amber-500/80 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-md relative space-y-4">
              <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Popular Savings
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">3 Months Advance</span>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Quarterly Plan</h3>
                <div className="my-3">
                  <span className="font-display text-3xl font-black text-amber-600 dark:text-amber-400">₹{course.quarterlyFee}</span>
                  <span className="text-xs text-slate-500 font-medium"> / 3 months</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Save money with advance quarterly billing.</p>
              </div>
              <button
                id={`btn-plan-quarterly-${course.slug}`}
                type="button"
                onClick={() => onSelectClassForAdmission(course.className)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Select Quarterly Plan
              </button>
            </div>

            {/* Plan 3: Half-Yearly */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">6 Months Advance</span>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Half-Yearly Plan</h3>
                <div className="my-3">
                  <span className="font-display text-3xl font-black text-slate-900 dark:text-white">₹{course.halfYearlyFee}</span>
                  <span className="text-xs text-slate-500 font-medium"> / 6 months</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Significant discount for 6 months advance deposit.</p>
              </div>
              <button
                id={`btn-plan-halfyearly-${course.slug}`}
                type="button"
                onClick={() => onSelectClassForAdmission(course.className)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Select 6-Month Plan
              </button>
            </div>

            {/* Plan 4: Yearly */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-950 text-white p-6 flex flex-col justify-between shadow-lg space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Maximum Discount</span>
                <h3 className="font-display font-bold text-lg text-white">Annual Full Session</h3>
                <div className="my-3">
                  <span className="font-display text-3xl font-black text-amber-400">₹{course.yearlyFee}</span>
                  <span className="text-xs text-slate-300 font-medium"> / 12 months</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">Includes free test series & complete printed workbook set.</p>
              </div>
              <button
                id={`btn-plan-yearly-${course.slug}`}
                type="button"
                onClick={() => onSelectClassForAdmission(course.className)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                Select Yearly Plan
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FACULTY & TEACHERS */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Expert Mentors</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Faculty Assigned to {course.className}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experienced, dedicated educators holding degrees from top institutions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {course.faculty.map((fac, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-lg flex items-center justify-center">
                  {fac.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{fac.name}</h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{fac.role}</p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <p>• {fac.exp}</p>
                  <p>• Qualification: {fac.edu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQS SECTION */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Got Questions?</span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions for {course.className}
            </h2>
          </div>

          <div className="space-y-3">
            {course.faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  id={`btn-faq-toggle-${idx}-${course.slug}`}
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 font-display font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  <span>{faq.question}</span>
                  <ChevronRight size={18} className={`transition-transform ${activeFaq === idx ? "rotate-90 text-amber-500" : "text-slate-400"}`} />
                </button>

                {activeFaq === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ADMISSION CALL TO ACTION */}
      <section className="py-12 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-black uppercase tracking-widest bg-slate-950 text-amber-400 px-3 py-1 rounded-full inline-block">
            Limited Batch Seats Remaining
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black leading-tight">
            Ready to Excel in {course.className}? Secure Your Batch Seat Today!
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-2xl mx-auto">
            Join Sunshine Classes in Pihani, Hardoi and experience top-ranked teaching, regular tests, and personal attention.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id={`btn-cta-bottom-enroll-${course.slug}`}
              onClick={() => onSelectClassForAdmission(course.className)}
              className="px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Apply Online for {course.className}</span>
              <ArrowRight size={18} />
            </button>
            <a
              href="tel:8707738284"
              className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-slate-950 font-bold text-xs border border-slate-950/20 transition-all flex items-center gap-2"
            >
              <Phone size={16} />
              <span>Call 8707738284</span>
            </a>
          </div>
        </div>
      </section>

      {/* 9. RELATED COURSES */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Explore Programs</span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Other Classroom Batches
              </h2>
            </div>
            <button
              id={`btn-view-all-related-${course.slug}`}
              type="button"
              onClick={() => onNavigateSection('courses')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All 5 Classes →
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCourses.map((rel) => (
              <CourseCard
                key={rel.id}
                course={rel}
                onExploreCourse={onExploreCourse}
                onEnrollCourse={onSelectClassForAdmission}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
