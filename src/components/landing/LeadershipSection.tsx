import React from 'react';
import { Shield, GraduationCap, Sparkles, Cpu, Linkedin, Instagram } from 'lucide-react';
import { LEADERSHIP_CONFIG } from '../../data/leadershipData';

interface LeadershipSectionProps {
  founders?: any[];
  className?: string;
  showExploreButton?: boolean;
  onExploreFaculty?: () => void;
}

export const LeadershipSection: React.FC<LeadershipSectionProps> = ({
  className = '',
}) => {
  return (
    <section id="section-leadership-team" className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
          <Shield size={14} />
          <span>Leadership Team</span>
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Institutional Leadership
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Meet the core leadership driving academic excellence, student mentorship, and operational innovation at Sunshine Classes.
        </p>
      </div>

      {/* Leadership Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {LEADERSHIP_CONFIG.map((fm) => {
          const isPrimary = fm.isPrimary;

          return (
            <div
              key={fm.id}
              id={`card-leadership-${fm.id}`}
              className={`group rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ease-out ${
                isPrimary
                  ? 'bg-gradient-to-br from-white via-amber-50/40 to-amber-100/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-400 dark:border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/20 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/15 hover:border-amber-500 dark:hover:border-amber-400 hover:ring-amber-400/40'
                  : 'bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/80 shadow-md hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/15 hover:border-indigo-400 dark:hover:border-indigo-500 hover:ring-1 hover:ring-indigo-400/30'
              }`}
            >
              {/* Top Badge */}
              <div className="absolute top-4 right-4">
                {isPrimary ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{fm.badge}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                    <Cpu size={12} className="text-indigo-500" />
                    <span>{fm.badge}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start gap-4 pr-12">
                  <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-md shrink-0 border overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
                    isPrimary 
                      ? 'bg-amber-500 text-white border-amber-400' 
                      : 'bg-indigo-600 text-white border-indigo-500 dark:bg-indigo-900 dark:text-indigo-200'
                  }`}>
                    {fm.photoUrl ? (
                      <img 
                        src={fm.photoUrl} 
                        alt={fm.name} 
                        className="h-full w-full object-cover rounded-2xl" 
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span>{fm.avatarInitials}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 id={`name-leadership-${fm.id}`} className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                      {fm.name}
                    </h3>
                    
                    <div 
                      id={`title-leadership-${fm.id}`}
                      className={`text-xs sm:text-sm font-extrabold ${
                        isPrimary ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {fm.title}
                    </div>

                    {/* Qualification Pill */}
                    {fm.qualification && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold pt-0.5">
                        <GraduationCap size={13} className={isPrimary ? "text-amber-500 shrink-0" : "text-indigo-500 shrink-0"} />
                        <span>{fm.qualification}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tag Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fm.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className={`rounded-lg text-[11px] font-bold px-2.5 py-1 border ${
                        isPrimary
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* About Section */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    About:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {fm.about}
                  </p>
                </div>
              </div>

              {/* Social Links Footer */}
              {fm.socials && (
                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-end gap-2">
                  {fm.socials.linkedin && (
                    <a
                      id={`link-linkedin-${fm.id}`}
                      href={fm.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${fm.name}'s LinkedIn profile`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-xs"
                    >
                      <Linkedin size={14} className="text-blue-600 dark:text-blue-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {fm.socials.instagram && (
                    <a
                      id={`link-instagram-${fm.id}`}
                      href={fm.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${fm.name}'s Instagram profile`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-xs"
                    >
                      <Instagram size={14} className="text-pink-600 dark:text-pink-400" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LeadershipSection;

