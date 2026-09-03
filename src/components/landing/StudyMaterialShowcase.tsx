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
      id: 'sm1',
      title: 'Class 10 Physics: Electricity & Light Reflection Formula Sheet',
      slug: 'class-10-physics-electricity-formulas',
      description: 'Complete quick-reference handbook covering Ohm’s law, circuit diagrams, lens formulas, and ray diagram rules.',
      desc: 'Complete quick-reference handbook covering Ohm’s law, circuit diagrams, lens formulas, and ray diagram rules.',
      subject: 'Science',
      class: 'Class 10',
      category: 'NOTES',
      materialType: 'FORMULA_SHEET',
      file: 'class10_physics_formulas.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 142,
      viewCount: 380,
      tags: ['Physics', 'Class 10', 'Formulas'],
      createdBy: 'Priyanshu Sir',
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
      date: '2026-06-15'
    },
    {
      id: 'sm2',
      title: 'Class 10 Mathematics: Real Numbers & Trigonometry NCERT Exemplar',
      slug: 'class-10-math-trigonometry-ncert',
      description: 'Step-by-step proofs for irrationality, Euclid’s division lemma, and trigonometric identities with solved examples.',
      desc: 'Step-by-step proofs for irrationality, Euclid’s division lemma, and trigonometric identities with solved examples.',
      subject: 'Mathematics',
      class: 'Class 10',
      category: 'NOTES',
      materialType: 'NCERT_SOLUTION',
      file: 'class10_math_trig_notes.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 210,
      viewCount: 520,
      tags: ['Maths', 'Trigonometry', 'NCERT'],
      createdBy: 'Priyanshu Sir',
      createdAt: '2026-06-20T10:00:00Z',
      updatedAt: '2026-06-20T10:00:00Z',
      date: '2026-06-20'
    },
    {
      id: 'sm3',
      title: 'Class 9 Science: Atoms, Molecules & Motion Solved Worksheets',
      slug: 'class-9-science-atoms-motion-worksheet',
      description: 'Molecular mass calculations, mole concept practice problems, and graphical motion velocity-time equations.',
      desc: 'Molecular mass calculations, mole concept practice problems, and graphical motion velocity-time equations.',
      subject: 'Science',
      class: 'Class 9',
      category: 'QUESTION_PAPER',
      materialType: 'WORKSHEET',
      file: 'class9_science_worksheet.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 98,
      viewCount: 240,
      tags: ['Science', 'Class 9', 'Worksheet'],
      createdBy: 'Priyanshu Sir',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: '2026-07-01T10:00:00Z',
      date: '2026-07-01'
    },
    {
      id: 'sm4',
      title: 'Class 10 English: Grammar Rules & Letter Writing Formats',
      slug: 'class-10-english-grammar-formats',
      description: 'Official UP Board & CBSE letter formats, error correction exercises, report writing guidelines, and tenses rules.',
      desc: 'Official UP Board & CBSE letter formats, error correction exercises, report writing guidelines, and tenses rules.',
      subject: 'English',
      class: 'Class 10',
      category: 'NOTES',
      materialType: 'NOTES',
      file: 'class10_english_grammar.pdf',
      isPublic: true,
      status: 'PUBLISHED',
      downloadCount: 175,
      viewCount: 410,
      tags: ['English', 'Class 10', 'Grammar'],
      createdBy: 'Faculty Desk',
      createdAt: '2026-07-05T10:00:00Z',
      updatedAt: '2026-07-05T10:00:00Z',
      date: '2026-07-05'
    }
  ];

  const itemsToDisplay = (studyMaterials && studyMaterials.length > 0 ? studyMaterials : defaultMaterials)
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

        {/* View All Button */}
        <div className="text-center pt-2">
          <button
            id="btn-homepage-browse-all-study-material"
            onClick={onNavigateResources}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-6 py-3 shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <span>Browse All Study Material (100+ Free PDFs)</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
};
