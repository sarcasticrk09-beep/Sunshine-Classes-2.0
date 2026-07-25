import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight,
  School,
  Sparkles
} from 'lucide-react';

interface CoursesSectionProps {
  onSelectClassForAdmission: (className: string) => void;
  onNavigateSection?: (section: string) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ 
  onSelectClassForAdmission,
  onNavigateSection 
}) => {
  const classesList = [
    {
      id: 'class-10',
      className: 'Class 10',
      badge: 'Board Specialist',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      fee: '₹1,200',
      feePeriod: 'per month',
      desc: 'Comprehensive Class 10 CBSE board preparation with solved PYQs, mock exams & NCERT formula drill.',
      timing: '06:00 AM & 04:00 PM',
      capacity: '25 Students / Batch',
      subjects: ['Maths (NCERT + RD)', 'Science (Phy/Chem/Bio)', 'English Grammar']
    },
    {
      id: 'class-9',
      className: 'Class 9',
      badge: 'Board Foundation',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      fee: '₹1,000',
      feePeriod: 'per month',
      desc: 'Build rock-solid numerical and conceptual foundations for physics, chemistry, and high school algebra.',
      timing: '07:00 AM & 05:00 PM',
      capacity: '25 Students / Batch',
      subjects: ['Mathematics', 'Science (Physics & Chem)', 'English Grammar']
    },
    {
      id: 'class-8',
      className: 'Class 8',
      badge: 'Apex Learning',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      fee: '₹800',
      feePeriod: 'per month',
      desc: 'Transition into high school science and math with practical problem solving and step-by-step guidance.',
      timing: '03:00 PM to 05:00 PM',
      capacity: '25 Students / Batch',
      subjects: ['Mathematics', 'General Science', 'English Language']
    },
    {
      id: 'class-7',
      className: 'Class 7',
      badge: 'Middle School',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      fee: '₹700',
      feePeriod: 'per month',
      desc: 'Interactive concept clarification in science, geometry, fractions, and grammatical sentence structure.',
      timing: '03:00 PM to 04:30 PM',
      capacity: '25 Students / Batch',
      subjects: ['Mathematics', 'Science & EVS', 'English & Hindi']
    },
    {
      id: 'class-6',
      className: 'Class 6',
      badge: 'Junior Foundation',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      fee: '₹600',
      feePeriod: 'per month',
      desc: 'Patience-driven foundational teaching to develop arithmetic confidence, reading habits, and curiosity.',
      timing: '02:00 PM to 03:30 PM',
      capacity: '20 Students / Batch',
      subjects: ['Mathematics & Mental Math', 'Science & EVS', 'English Grammar']
    }
  ];

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
            Explore active tuition batches from Class 6 to Class 10 with transparent monthly fees and core subject coverage.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {classesList.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="space-y-3">
                
                {/* Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                </div>

                {/* Class Title & Fee */}
                <div>
                  <h3 className="font-display text-xl font-black text-slate-900 dark:text-white">
                    {c.className}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-lg font-black text-amber-500">
                      {c.fee}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {c.feePeriod}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-3">
                  {c.desc}
                </p>

                {/* Timings */}
                <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-amber-500 shrink-0" />
                    <span>{c.timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-blue-500 shrink-0" />
                    <span>{c.capacity}</span>
                  </div>
                </div>

                {/* Subjects */}
                <div className="pt-1">
                  <div className="space-y-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {c.subjects.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Explore/Apply Button */}
              <button
                id={`btn-apply-${c.id}`}
                onClick={() => onSelectClassForAdmission(c.className)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
              >
                <span>Apply for {c.className}</span>
                <ArrowRight size={13} />
              </button>

            </div>
          ))}
        </div>

        {/* View All Courses CTA */}
        <div className="text-center pt-2">
          <button
            id="btn-homepage-view-all-courses"
            onClick={() => onNavigateSection ? onNavigateSection('courses') : onSelectClassForAdmission('Class 10')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-6 py-3 shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <span>View All Courses & Full Fee Details</span>
            <ArrowRight size={15} className="text-amber-500" />
          </button>
        </div>

      </div>
    </section>
  );
};

