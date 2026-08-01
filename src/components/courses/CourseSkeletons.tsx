/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
);

export const CourseCardSkeleton: React.FC = () => (
  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-6">
    <div className="space-y-4">
      {/* Badge & Rating Row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      {/* Title & Tagline */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Subjects */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-20 rounded-md" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>
      </div>

      {/* Features checklist */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </div>
    </div>

    {/* Fee & Action Footer */}
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

export const CourseDirectorySkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
    {/* Hero Directory Skeleton */}
    <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-24 pb-16 border-b border-indigo-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 text-center flex flex-col items-center">
        <Skeleton className="h-6 w-48 rounded-full bg-slate-800" />
        <Skeleton className="h-10 sm:h-12 w-3/4 max-w-2xl rounded-xl bg-slate-800" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md bg-slate-800" />
        <Skeleton className="h-4 w-2/3 max-w-md rounded-md bg-slate-800" />

        {/* Filter Pills Skeleton */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Skeleton className="h-10 w-24 rounded-xl bg-slate-800" />
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-800" />
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-800" />
        </div>
      </div>
    </section>

    {/* Main Directory Cards Grid Skeleton */}
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((idx) => (
          <CourseCardSkeleton key={idx} />
        ))}
      </div>

      {/* Comparison Table Skeleton */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        <Skeleton className="h-6 w-64 rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <Skeleton key={row} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  </div>
);

export const CourseDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
    {/* Hero Section Skeleton */}
    <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-24 pb-16 border-b border-indigo-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-4 w-48 rounded-md bg-slate-800" />

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-6 w-32 rounded-full bg-slate-800" />
            <Skeleton className="h-12 w-5/6 rounded-2xl bg-slate-800" />
            <Skeleton className="h-4 w-full rounded-md bg-slate-800" />
            <Skeleton className="h-4 w-4/5 rounded-md bg-slate-800" />

            {/* Highlights list */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-5 w-full rounded-md bg-slate-800" />
              <Skeleton className="h-5 w-full rounded-md bg-slate-800" />
              <Skeleton className="h-5 w-full rounded-md bg-slate-800" />
              <Skeleton className="h-5 w-full rounded-md bg-slate-800" />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Skeleton className="h-12 w-44 rounded-xl bg-slate-800" />
              <Skeleton className="h-12 w-44 rounded-xl bg-slate-800" />
            </div>
          </div>

          {/* Right Highlight Box Skeleton */}
          <div className="lg:col-span-4">
            <Skeleton className="h-80 w-full rounded-3xl bg-slate-800" />
          </div>
        </div>
      </div>
    </section>

    {/* Body Content Skeleton */}
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Quick stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      {/* Subject tabs and syllabus */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>

      {/* Fee structure plans */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((p) => (
            <Skeleton key={p} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
