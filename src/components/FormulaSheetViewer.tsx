import React, { useState } from 'react';
import { FormulaSheetsData, FormulaSheetContent } from '../data/formulaSheetsData';
import { StudyMaterial } from '../types';
import { Printer, Copy, Check, Search, BookOpen, Layers, Sparkles } from 'lucide-react';

interface FormulaSheetViewerProps {
  material?: StudyMaterial | null;
  slugOrId?: string;
  onClose?: () => void;
}

export const FormulaSheetViewer: React.FC<FormulaSheetViewerProps> = ({
  material,
  slugOrId,
  onClose
}) => {
  const targetKey = material?.slug || material?.id || slugOrId || 'mat177';
  const formulaSheet: FormulaSheetContent | null = FormulaSheetsData.getFormulaSheet(targetKey);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!formulaSheet) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm text-slate-500">Formula sheet content unavailable.</p>
      </div>
    );
  }

  const handleCopyFormula = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter formulas
  const filteredSections = formulaSheet.sections.map(sec => {
    if (!searchQuery.trim()) return sec;
    const q = searchQuery.toLowerCase().trim();
    const matchingFormulas = sec.formulas.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.formula.toLowerCase().includes(q) || 
      (f.notes && f.notes.toLowerCase().includes(q)) ||
      (f.variables && f.variables.toLowerCase().includes(q))
    );
    return { ...sec, formulas: matchingFormulas };
  }).filter(sec => sec.formulas.length > 0);

  return (
    <div id="formula-sheet-viewer-container" className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Top Action Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/50">
              {formulaSheet.subject}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formulaSheet.class}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {formulaSheet.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-formula-search-filter"
              type="text"
              placeholder="Filter formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            id="btn-print-formula-sheet"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
            title="Print or Save as PDF"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Formula Display */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:p-0 print:overflow-visible">
        {/* Printable Header Info */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/30 dark:to-slate-900 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Sparkles size={16} />
              <span>SUNSHINE CLASSES OFFICIAL REVISION CHEAT SHEET</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Updated: {formulaSheet.lastUpdated}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {formulaSheet.description}
          </p>
        </div>

        {filteredSections.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <BookOpen size={32} className="mx-auto text-slate-400" />
            <p className="text-xs font-medium">No formulas matched "{searchQuery}".</p>
          </div>
        ) : (
          filteredSections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs print:border-slate-300 print:shadow-none"
            >
              {/* Section Header */}
              <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={15} className="text-amber-500" />
                  {section.title}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {section.category}
                </span>
              </div>

              {/* Formula Cards Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.formulas.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 relative group hover:border-amber-300 dark:hover:border-amber-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </h4>
                      <button
                        id={`btn-copy-formula-${item.id}`}
                        onClick={() => handleCopyFormula(item.id, `${item.name}: ${item.formula}`)}
                        className="p-1 rounded text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 print:hidden cursor-pointer"
                        title="Copy formula text"
                      >
                        {copiedId === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {/* Styled LaTeX-style Formula Box */}
                    <div className="bg-amber-500/10 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200/50 dark:border-amber-900/40 font-mono text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed tracking-wide">
                      {item.formula}
                    </div>

                    {item.variables && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        <span className="font-semibold text-slate-500">Variables:</span> {item.variables}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5 border-t border-slate-200/50 dark:border-slate-800">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormulaSheetViewer;
