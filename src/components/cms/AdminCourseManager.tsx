/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Award, 
  School 
} from 'lucide-react';
import { UniversalCourse, UNIVERSAL_COURSES } from '../../data/coursesData';

interface AdminCourseManagerProps {
  courses?: UniversalCourse[];
  onUpdateCourses?: (updatedCourses: UniversalCourse[]) => void;
}

export const AdminCourseManager: React.FC<AdminCourseManagerProps> = ({
  courses = UNIVERSAL_COURSES,
  onUpdateCourses
}) => {
  const [courseList, setCourseList] = useState<UniversalCourse[]>(courses);
  const [editingCourse, setEditingCourse] = useState<UniversalCourse | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Partial<UniversalCourse>>({
    className: 'Class 10',
    title: '',
    subtitle: '',
    monthlyFee: 1200,
    monthlyFeeFormatted: '₹1,200',
    badge: 'Board Specialist',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    timing: '06:00 AM & 04:00 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board',
    shortDescription: '',
    isFeatured: true,
    academicLevel: 'board',
    displayOrder: 1,
    status: 'PUBLISHED'
  });

  const handleToggleFeatured = (id: string) => {
    const updated = courseList.map(c => {
      if (c.id === id) {
        return { ...c, isFeatured: !c.isFeatured };
      }
      return c;
    });
    setCourseList(updated);
    if (onUpdateCourses) onUpdateCourses(updated);
    showTempSuccess();
  };

  const handleToggleStatus = (id: string) => {
    const updated = courseList.map(c => {
      if (c.id === id) {
        return { ...c, status: (c.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT') as 'PUBLISHED' | 'DRAFT' };
      }
      return c;
    });
    setCourseList(updated);
    if (onUpdateCourses) onUpdateCourses(updated);
    showTempSuccess();
  };

  const showTempSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleEditClick = (course: UniversalCourse) => {
    setEditingCourse(course);
    setFormData({ ...course });
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className || !formData.monthlyFee) return;

    let updated: UniversalCourse[];
    if (editingCourse) {
      updated = courseList.map(c => c.id === editingCourse.id ? { ...c, ...formData } as UniversalCourse : c);
    } else {
      const newCourse: UniversalCourse = {
        id: `course-${Date.now()}`,
        slug: formData.className.toLowerCase().replace(/\s+/g, '-'),
        classNumber: parseInt(formData.className.replace(/\D/g, '')) || 10,
        className: formData.className || 'Class 10',
        title: formData.title || `${formData.className} Tuition Program`,
        subtitle: formData.subtitle || 'Comprehensive coaching for board and school exams',
        badge: formData.badge || 'Tuition Batch',
        badgeColor: formData.badgeColor || 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        monthlyFee: Number(formData.monthlyFee) || 1000,
        monthlyFeeFormatted: `₹${Number(formData.monthlyFee).toLocaleString('en-IN')}`,
        quarterlyFee: (Number(formData.monthlyFee) || 1000) * 3 - 100,
        halfYearlyFee: (Number(formData.monthlyFee) || 1000) * 6 - 300,
        yearlyFee: (Number(formData.monthlyFee) || 1000) * 12 - 800,
        feePeriod: 'per month',
        duration: 'Full Academic Year',
        timing: formData.timing || '04:00 PM to 06:00 PM',
        batchSize: formData.batchSize || '25 Students',
        board: formData.board || 'CBSE & UP Board',
        subjects: ['Mathematics', 'Science', 'English'],
        shortDescription: formData.shortDescription || 'Quality conceptual coaching.',
        fullDescription: formData.subtitle || '',
        highlights: [
          { title: 'NCERT Focus', desc: 'Step-by-step textbook exercises.' }
        ],
        subjectsDetailed: [],
        features: ['Weekly Tests', 'Doubt Resolution'],
        whySunshine: ['Proven Results'],
        faculty: [],
        faqs: [],
        metaTitle: `${formData.className} Tuition in Pihani`,
        metaDescription: `Enroll in ${formData.className} tuition at Sunshine Classes.`,
        isFeatured: formData.isFeatured ?? false,
        academicLevel: formData.academicLevel || 'board',
        displayOrder: formData.displayOrder || courseList.length + 1,
        status: formData.status || 'PUBLISHED'
      };
      updated = [...courseList, newCourse];
    }

    setCourseList(updated);
    if (onUpdateCourses) onUpdateCourses(updated);
    setShowForm(false);
    setEditingCourse(null);
    showTempSuccess();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-base text-slate-800">Course & Program Discovery CMS</h3>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-fade-in">
                <Check size={12} /> Saved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure featured homepage programs, academic wings, monthly fee structures, and publication status.
          </p>
        </div>

        <button
          id="admin-btn-add-course-trigger"
          type="button"
          onClick={() => {
            setEditingCourse(null);
            setFormData({
              className: 'Class 10',
              title: '',
              subtitle: '',
              monthlyFee: 1200,
              monthlyFeeFormatted: '₹1,200',
              badge: 'Board Specialist',
              badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
              timing: '06:00 AM & 04:00 PM',
              batchSize: '25 Students / Batch',
              board: 'CBSE & UP Board',
              shortDescription: '',
              isFeatured: true,
              academicLevel: 'board',
              displayOrder: courseList.length + 1,
              status: 'PUBLISHED'
            });
            setShowForm(true);
          }}
          className="rounded-xl bg-indigo-950 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 hover:bg-indigo-900 transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={14} /> Add New Program
        </button>
      </div>

      {/* Edit Form Modal/Drawer */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-amber-200/60 pb-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={15} className="text-amber-600" />
              <span>{editingCourse ? `Edit Program: ${editingCourse.className}` : 'Create New Program'}</span>
            </h4>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingCourse(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Class Name</label>
              <input
                type="text"
                required
                value={formData.className || ''}
                onChange={e => setFormData({ ...formData, className: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
                placeholder="e.g. Class 10"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Badge Text</label>
              <input
                type="text"
                required
                value={formData.badge || ''}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
                placeholder="e.g. Board Specialist"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Monthly Fee (₹)</label>
              <input
                type="number"
                required
                value={formData.monthlyFee || 0}
                onChange={e => {
                  const val = Number(e.target.value);
                  setFormData({ 
                    ...formData, 
                    monthlyFee: val,
                    monthlyFeeFormatted: `₹${val.toLocaleString('en-IN')}`
                  });
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
                placeholder="1200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Academic Level Wing</label>
              <select
                value={formData.academicLevel || 'board'}
                onChange={e => setFormData({ ...formData, academicLevel: e.target.value as any })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
              >
                <option value="primary">Primary Wing (Classes 1-4)</option>
                <option value="middle">Middle Wing (Classes 5-8)</option>
                <option value="board">Board Preparation (Classes 9-10)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Batch Timings</label>
              <input
                type="text"
                value={formData.timing || ''}
                onChange={e => setFormData({ ...formData, timing: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
                placeholder="e.g. 06:00 AM & 04:00 PM"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder || 1}
                onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Subtitle / Key Highlight</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-xs focus:ring-1 focus:ring-indigo-900 outline-hidden"
                placeholder="e.g. High-impact preparation for CBSE & UP Board Examinations"
              />
            </div>

            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={!!formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <span className="flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Feature on Homepage</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.status === 'PUBLISHED'}
                  onChange={e => setFormData({ ...formData, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })}
                  className="rounded text-emerald-500 focus:ring-emerald-400 h-4 w-4"
                />
                <span>Published Status</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingCourse(null); }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Program</span>
            </button>
          </div>
        </form>
      )}

      {/* Program Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3">Class</th>
              <th className="p-3">Badge & Level</th>
              <th className="p-3">Monthly Fee</th>
              <th className="p-3 text-center">Homepage Featured</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {courseList.map((course) => {
              const isFeatured = course.isFeatured ?? (course.classNumber === 10 || course.classNumber === 9 || course.classNumber === 8 || course.classNumber === 5);
              const isPublished = course.status !== 'DRAFT';

              return (
                <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-display font-black text-slate-900 text-sm">
                    {course.className}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border w-max ${course.badgeColor}`}>
                        {course.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {course.academicLevel || (course.classNumber <= 4 ? 'primary' : course.classNumber <= 8 ? 'middle' : 'board')} Wing
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-display font-black text-amber-600 text-sm">
                    {course.monthlyFeeFormatted}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(course.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 border ${
                        isFeatured
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles size={11} className={isFeatured ? 'text-amber-500' : 'text-slate-400'} />
                      <span>{isFeatured ? 'Featured' : 'Catalogue Only'}</span>
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(course.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 border ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {isPublished ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEditClick(course)}
                      className="p-1.5 rounded-lg text-indigo-900 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit3 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
