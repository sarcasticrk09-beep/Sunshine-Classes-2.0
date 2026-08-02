import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  ChevronRight, 
  Mail, 
  Phone, 
  ArrowLeft,
  UserCheck,
  Star,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Teacher, FounderMember } from '../../types';
import { SEED_FOUNDERS, SEED_TEACHERS } from '../../data';
import { LeadershipSection } from './LeadershipSection';

interface FacultyPageProps {
  teachers?: Teacher[];
  founders?: FounderMember[];
  onNavigateSection?: (section: string) => void;
  onSelectClassForAdmission?: (className: string) => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({
  teachers = SEED_TEACHERS,
  founders = SEED_FOUNDERS,
  onNavigateSection,
  onSelectClassForAdmission
}) => {
  return (
    <div id="faculty-public-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-14 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <button
            id="btn-faculty-back-home"
            onClick={() => onNavigateSection ? onNavigateSection('home') : window.history.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Home</span>
            <ChevronRight size={13} />
            <span className="text-amber-600 dark:text-amber-400 font-bold">Faculty & Mentors</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20">
            <Users size={14} />
            <span>Academic Mentorship</span>
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Meet Our Experienced Faculty
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            The dedicated educators, subject specialists, and academic visionaries shaping board toppers and concept-driven learners at Sunshine Classes, Pihani.
          </p>
        </div>

        {/* Section 1: Leadership Team */}
        <LeadershipSection founders={founders} />

        {/* Section 2: Subject Teachers & Department Mentors */}
        <div className="space-y-8 pt-6">
          <div className="border-l-4 border-indigo-500 pl-4">
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Department Faculty & Mentors
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experienced teachers holding postgraduate degrees in Mathematics, Science, and Humanities.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => (
              <div 
                key={t.id}
                id={`faculty-teacher-card-${t.id}`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-xs group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-display font-black text-lg shadow-sm shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        {t.name}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {t.qualification || 'Senior Faculty'}
                      </p>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Subjects Handled:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(t.specialty) ? t.specialty : [t.specialty]).map((spec, i) => (
                        <span 
                          key={i}
                          className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 text-[10px] font-bold px-2.5 py-1"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Batches Assigned */}
                  {t.batches && t.batches.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Assigned Batches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {t.batches.map((batch, idx) => (
                          <span key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5">
                            {batch}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                    <UserCheck size={13} /> Active Faculty
                  </span>
                  <button
                    id={`btn-faculty-enroll-${t.id}`}
                    onClick={() => {
                      if (onSelectClassForAdmission) onSelectClassForAdmission('Class 10');
                      if (onNavigateSection) onNavigateSection('admissions');
                    }}
                    className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Join Batch →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Faculty Principles & Standards */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest block">
              Teaching Methodology
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black">
              Our 4 Pillars of Pedagogical Success
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              How our faculty consistently produces top board scorers in Pihani.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <BookOpen className="text-amber-400" size={24} />
              <h4 className="font-bold text-sm text-white">NCERT Step-Marking</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Teachers train students strictly according to CBSE step-wise marking schemes.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <Sparkles className="text-amber-400" size={24} />
              <h4 className="font-bold text-sm text-white">Daily Doubt Clinics</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Faculty remains available after every batch for 1-on-1 question resolution.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <ShieldCheck className="text-amber-400" size={24} />
              <h4 className="font-bold text-sm text-white">Weekly Answer Audits</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Tests are hand-checked with custom feedback written on every answer sheet.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <Users className="text-amber-400" size={24} />
              <h4 className="font-bold text-sm text-white">Parent Progress Dialogue</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Monthly parent meetings ensure complete alignment between home and classroom.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
