import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  FileText, 
  ArrowRight,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { StudyMaterial } from '../../types';

interface StudyMaterialShowcaseProps {
  studyMaterials?: StudyMaterial[];
  onNavigateResources?: () => void;
}

export const StudyMaterialShowcase: React.FC<StudyMaterialShowcaseProps> = ({
  studyMaterials = [],
  onNavigateResources
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  const defaultMaterials: StudyMaterial[] = [
    {
      id: 'mat1',
      title: 'CBSE Class 10 Mathematics Standard Official Sample Paper 2024-25',
      slug: 'cbse-class-10-maths-standard-official-sample-paper',
      description: 'Official CBSE board sample question paper for Class 10 Mathematics (Standard) released by CBSE Academic with Section A to E questions.',
      desc: 'Official CBSE board sample question paper for Class 10 Mathematics Standard.',
      subject: 'Mathematics',
      class: 'Class 10',
      category: 'QUESTION_PAPER',
      materialType: 'SAMPLE_PAPER',
      file: 'cbse_class10_maths_sqp.pdf',
      fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/Maths-SQP.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 1420,
      viewCount: 4890,
      tags: ['CBSE Official', 'Class 10', 'Mathematics', 'Sample Paper'],
      createdBy: 'CBSE Academic',
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      date: '2026-06-01'
    },
    {
      id: 'mat3',
      title: 'CBSE Class 10 Science Official Board Sample Question Paper',
      slug: 'cbse-class-10-science-official-sample-paper',
      description: 'Official 80-mark CBSE Class 10 Science board sample paper covering Physics numericals, Chemistry reactions, and Biology diagrams.',
      desc: 'Official CBSE Class 10 Science sample question paper with section-wise questions.',
      subject: 'Science',
      class: 'Class 10',
      category: 'QUESTION_PAPER',
      materialType: 'SAMPLE_PAPER',
      file: 'cbse_class10_science_sqp.pdf',
      fileUrl: 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2024_25/Science-SQP.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 1530,
      viewCount: 5210,
      tags: ['CBSE Official', 'Class 10', 'Science', 'Sample Paper'],
      createdBy: 'CBSE Academic',
      createdAt: '2026-06-03T10:00:00Z',
      updatedAt: '2026-06-17T10:00:00Z',
      date: '2026-06-03'
    },
    {
      id: 'mat5',
      title: 'CBSE Class 10 Mathematics Official Chapter-Wise Question Bank',
      slug: 'cbse-class-10-mathematics-official-question-bank',
      description: 'Official comprehensive question bank compiled by CBSE Academic containing hundreds of practice problems and case studies.',
      desc: 'Official comprehensive CBSE Mathematics practice question bank.',
      subject: 'Mathematics',
      class: 'Class 10',
      category: 'QUESTION_PAPER',
      materialType: 'QUESTION_BANK',
      file: 'cbse_class10_maths_question_bank.pdf',
      fileUrl: 'https://cbseacademic.nic.in/web_material/QuestionBank/ClassX/MathsX.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 2150,
      viewCount: 6840,
      tags: ['CBSE Official', 'Class 10', 'Mathematics', 'Question Bank'],
      createdBy: 'CBSE Academic',
      createdAt: '2026-06-05T10:00:00Z',
      updatedAt: '2026-06-19T10:00:00Z',
      date: '2026-06-05'
    },
    {
      id: 'mat16',
      title: 'NCERT Class 9 Science Chapter 7: Motion (Official Textbook)',
      slug: 'ncert-class-9-science-chapter-7-motion',
      description: 'Official NCERT textbook chapter on describing motion, uniform and non-uniform motion, and equations of motion.',
      desc: 'Official NCERT textbook chapter on Motion and velocity graphs.',
      subject: 'Science',
      class: 'Class 9',
      category: 'NOTES',
      materialType: 'WORKSHEET',
      file: 'ncert_class9_science_motion.pdf',
      fileUrl: 'https://ncert.nic.in/textbook/pdf/iesc107.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 1180,
      viewCount: 3750,
      tags: ['NCERT Official', 'Class 9', 'Science', 'Physics'],
      createdBy: 'NCERT',
      createdAt: '2026-06-16T10:00:00Z',
      updatedAt: '2026-06-30T10:00:00Z',
      date: '2026-06-16'
    }
  ];

  const isCustomProvided = Array.isArray(studyMaterials);
  const sourceMaterials = isCustomProvided ? studyMaterials : defaultMaterials;

  const itemsToDisplay = sourceMaterials
    .filter((m) => {
      if (selectedClass !== 'ALL' && m.class !== selectedClass) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || (m.desc || '').toLowerCase().includes(q);
      }
      return true;
    })
    .slice(0, 4);

  return (
    <section id="study-material-preview" className="py-10 sm:py-16 bg-slate-50/80 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <BookOpen size={14} />
            <span>Free Study Material & Notes</span>
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            NCERT Notes & Board Question Papers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Download free chapter revision notes, formula sheets, NCERT solutions, and 10-year board paper archives.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search notes, formulas, PYQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Class 10', 'Class 9', 'Class 8'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cls === 'ALL' ? 'All Classes' : cls}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Preview Cards */}
        {itemsToDisplay.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 text-xs">
            No study materials or sample papers currently uploaded for this selection. New resources will appear here once published by faculty.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {itemsToDisplay.map((item) => (
              <div
                key={item.id}
                className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-5 flex flex-col justify-between space-y-2.5 sm:space-y-4 hover:border-amber-400 transition-all shadow-xs hover:shadow-md group"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                      <FileText size={15} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.class}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      {item.subject}
                    </span>
                    <h3 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-3 font-medium">
                    {item.desc || item.description}
                  </p>
                </div>

                {/* Download / Open Button */}
                <button
                  id={`btn-download-preview-${item.id}`}
                  onClick={onNavigateResources}
                  className="w-full flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-amber-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] sm:text-xs py-1.5 sm:py-2 transition-all cursor-pointer group-hover:border-amber-500"
                >
                  <Download size={11} className="sm:w-3.5 sm:h-3.5" />
                  <span>Free PDF</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center pt-2">
          <button
            id="btn-homepage-browse-all-study-material"
            onClick={onNavigateResources}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-6 py-3 shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <span>Browse All Study Material & Notes</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
};
