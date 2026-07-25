import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export const FacultySection: React.FC = () => {
  const facultyMembers = [
    {
      name: 'Priyanshu Sir',
      role: 'Founder & Head of Academics',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      experience: '10+ Years Teaching Experience',
      subjects: ['Mathematics (Class 9 & 10)', 'Physics & Chemistry'],
      highlight: 'Specialist in NCERT step-marking and Board exam strategy.'
    },
    {
      name: 'Neha Sharma',
      role: 'Senior Faculty & Desk Registrar',
      qualification: 'M.A. English Literature',
      experience: '6+ Years Teaching Experience',
      subjects: ['English Grammar & Literature', 'Junior Science'],
      highlight: 'Expert in grammar rules, letter writing formats, and student guidance.'
    }
  ];

  return (
    <section id="faculty-preview" className="py-10 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Users size={14} />
            <span>Academic Leadership</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Meet Our Dedicated Faculty
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Experienced mentors passionate about building conceptual clarity and exam confidence in every student.
          </p>
        </div>

        {/* Faculty Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {facultyMembers.map((fac, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-6 space-y-4 hover:border-amber-400 transition-all shadow-xs group flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Header info */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                    {fac.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                      {fac.name}
                    </h3>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                      {fac.role}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <GraduationCap size={13} className="text-slate-400 shrink-0" />
                      <span>{fac.qualification} • {fac.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Highlight */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pt-1">
                  "{fac.highlight}"
                </p>

                {/* Subjects */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Teaching Focus:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.subjects.map((sub, i) => (
                      <span 
                        key={i}
                        className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
