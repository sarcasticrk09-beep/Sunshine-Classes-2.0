import React, { useState } from 'react';
import { Award, GraduationCap, Trophy, ChevronRight, User } from 'lucide-react';
import { Topper } from '../../types';

export const getTopperInitials = (name: string): string => {
  if (!name) return 'SC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarGradient = (name: string): string => {
  const gradients = [
    'from-amber-500 via-amber-600 to-indigo-900',
    'from-indigo-600 via-indigo-700 to-slate-900',
    'from-blue-600 via-indigo-800 to-slate-950',
    'from-emerald-600 via-teal-700 to-slate-900',
    'from-purple-600 via-indigo-700 to-slate-900',
    'from-violet-600 via-purple-800 to-slate-950'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

interface TopperCardProps {
  topper: Topper;
  variant?: 'standard' | 'featured';
  className?: string;
  idPrefix?: string;
  onSelect?: (topper: Topper) => void;
}

export const TopperCard: React.FC<TopperCardProps> = ({
  topper,
  variant = 'standard',
  className = '',
  idPrefix = 'topper-card',
  onSelect
}) => {
  const [imgError, setImgError] = useState(false);
  const name = topper.name || 'Student Name';
  const percentage = topper.percentage || topper.score || '0%';
  const studentClass = topper.studentClass || topper.class || 'Class 10';
  const academicYear = topper.academicYear || topper.year || '2025-2026';
  const board = topper.board || 'CBSE';
  const photo = topper.photoUrl || topper.img;
  const initials = getTopperInitials(name);
  const avatarGradient = getAvatarGradient(name);

  const cardId = `${idPrefix}-${topper.id || 'item'}`;

  // Extract a single badge title from percentage/caption
  const parsePercentNum = parseFloat(percentage.replace('%', '')) || 0;
  const badgeTitle = parsePercentNum >= 90 
    ? 'District Board Topper' 
    : parsePercentNum >= 85 
      ? 'High Distinction' 
      : 'Academic Merit';

  return (
    <div
      id={cardId}
      onClick={() => onSelect?.(topper)}
      className={`group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-amber-400/80 dark:hover:border-amber-500/80 transition-all duration-300 cursor-pointer overflow-hidden ${
        variant === 'featured' ? 'ring-2 ring-amber-400/40 dark:ring-amber-500/30' : ''
      } ${className}`}
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>

      {/* Main Card Content */}
      <div className="space-y-5 pt-1">
        
        {/* Top Header Row: Avatar/Photo + Percentage Badge */}
        <div className="flex items-start justify-between gap-3">
          {/* Photo or Initials Avatar */}
          <div className="relative shrink-0">
            {photo && !imgError ? (
              <img
                src={photo}
                alt={name}
                onError={() => setImgError(true)}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-400/60 dark:ring-amber-500/60 shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${avatarGradient} text-white font-black text-lg flex items-center justify-center ring-2 ring-amber-400/60 dark:ring-amber-500/60 shadow-md tracking-wider select-none group-hover:scale-105 transition-transform duration-300`}>
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900">
              <Trophy size={12} className="fill-slate-950" />
            </div>
          </div>

          {/* Primary Percentage Box */}
          <div className="text-right">
            <div className="inline-block rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-indigo-500/10 dark:from-amber-500/20 dark:to-indigo-500/20 border border-amber-300/60 dark:border-amber-600/40 px-3.5 py-1.5 shadow-2xs group-hover:border-amber-400 transition-colors">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
                {percentage}
              </span>
              <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest block -mt-0.5">
                Score
              </span>
            </div>
          </div>
        </div>

        {/* Student Name & Class Info */}
        <div className="space-y-1.5">
          <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <GraduationCap size={14} className="text-amber-500" />
              <span>{studentClass} ({board})</span>
            </span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-300">Passing Year: {academicYear}</span>
          </div>
        </div>

        {/* Single Achievement Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 px-3 py-1 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            <Award size={13} className="text-amber-500" />
            <span>{badgeTitle}</span>
          </span>
        </div>

      </div>

      {/* Card Footer: View Profile Trigger */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        <span className="flex items-center gap-1">
          <User size={13} />
          <span>View Profile Details</span>
        </span>
        <ChevronRight size={15} className="transform group-hover:translate-x-1 transition-transform" />
      </div>

    </div>
  );
};
