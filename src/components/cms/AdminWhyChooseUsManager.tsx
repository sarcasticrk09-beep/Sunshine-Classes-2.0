import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Sparkles, Award, RotateCcw, Check } from 'lucide-react';
import { InstituteStrength } from '../../types';
import { SEED_INSTITUTE_STRENGTHS } from '../../data';

interface AdminWhyChooseUsManagerProps {
  strengths: InstituteStrength[];
  onUpdateStrengths: (strengths: InstituteStrength[]) => void;
}

const AVAILABLE_ICONS = [
  'GraduationCap',
  'BookOpen',
  'ClipboardCheck',
  'HelpCircle',
  'TrendingUp',
  'UserCheck',
  'Wallet',
  'Award',
  'ShieldCheck',
  'Sparkles'
];

export const AdminWhyChooseUsManager: React.FC<AdminWhyChooseUsManagerProps> = ({
  strengths,
  onUpdateStrengths
}) => {
  const [items, setItems] = useState<InstituteStrength[]>(
    strengths && strengths.length > 0 ? strengths : SEED_INSTITUTE_STRENGTHS
  );
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InstituteStrength | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updatedList: InstituteStrength[];
    if (editingItem.id && items.some(i => i.id === editingItem.id)) {
      updatedList = items.map(i => i.id === editingItem.id ? editingItem : i);
    } else {
      const newId = editingItem.id || `str-${Date.now()}`;
      updatedList = [...items, { ...editingItem, id: newId, displayOrder: items.length + 1 }];
    }

    setItems(updatedList);
    onUpdateStrengths(updatedList);
    setShowForm(false);
    setEditingItem(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this strength feature from the homepage?')) {
      const updatedList = items.filter(i => i.id !== id);
      setItems(updatedList);
      onUpdateStrengths(updatedList);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset Why Choose Us section to default Sunshine Classes features?')) {
      setItems(SEED_INSTITUTE_STRENGTHS);
      onUpdateStrengths(SEED_INSTITUTE_STRENGTHS);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display font-black text-base text-slate-800 flex items-center gap-2">
            <Award className="text-amber-500" size={18} />
            <span>"Why Choose Sunshine Classes" Homepage Feature CMS</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage key institute highlights, cards, icons, and badges shown on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="admin-btn-reset-strengths"
            onClick={handleResetDefaults}
            className="rounded-xl border border-slate-200 text-slate-600 text-xs font-bold px-3 py-2 flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset to initial seed features"
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>
          <button
            type="button"
            id="admin-btn-add-strength-trigger"
            onClick={() => {
              setEditingItem({
                id: '',
                title: '',
                description: '',
                iconName: 'GraduationCap',
                badge: 'Sunshine Feature',
                displayOrder: items.length + 1
              });
              setShowForm(true);
            }}
            className="rounded-xl bg-indigo-900 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 hover:bg-indigo-950 transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={14} /> Add Strength Card
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 font-bold flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span>Why Choose Sunshine Classes features successfully saved and published live!</span>
        </div>
      )}

      {/* Form modal or inline edit panel */}
      {showForm && editingItem && (
        <form onSubmit={handleSaveItem} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-amber-200/60 pb-3">
            <h4 className="text-xs font-extrabold text-slate-800">
              {editingItem.id ? 'Edit Strength Highlight Card' : 'Add New Homepage Strength Card'}
            </h4>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Feature Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Experienced Teachers"
                value={editingItem.title}
                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Badge Tag</label>
              <input
                type="text"
                placeholder="e.g. 100% Board Aligned"
                value={editingItem.badge || ''}
                onChange={e => setEditingItem({ ...editingItem, badge: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Select Icon</label>
              <select
                value={editingItem.iconName}
                onChange={e => setEditingItem({ ...editingItem, iconName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-900 outline-none"
              >
                {AVAILABLE_ICONS.map(ic => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Brief Description</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Subject specialists with 10+ years of teaching experience dedicated to student success."
              value={editingItem.description}
              onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-900 outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-900 text-white px-4 py-1.5 text-xs font-bold hover:bg-indigo-950 cursor-pointer shadow-sm"
            >
              Save Strength Card
            </button>
          </div>
        </form>
      )}

      {/* Cards Display Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            id={`cms-strength-card-${item.id || idx}`}
            className="rounded-xl border border-slate-100 p-4 bg-slate-50/60 flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800">{item.title}</span>
                {item.badge && (
                  <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 rounded px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{item.description}</p>
              <span className="text-[9px] font-mono text-slate-400 block pt-1">Icon: {item.iconName}</span>
            </div>

            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                id={`btn-edit-strength-${item.id}`}
                onClick={() => {
                  setEditingItem(item);
                  setShowForm(true);
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-200 cursor-pointer"
                title="Edit feature"
              >
                <Edit size={13} />
              </button>
              <button
                type="button"
                id={`btn-delete-strength-${item.id}`}
                onClick={() => handleDeleteItem(item.id)}
                className="rounded p-1 text-red-500 hover:bg-red-50 cursor-pointer"
                title="Delete feature"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
