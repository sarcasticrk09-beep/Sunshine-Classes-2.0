import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  FileText,
  FileSpreadsheet,
  BookMarked,
  PenTool,
  Compass,
  Briefcase,
  Monitor
} from 'lucide-react';
import { subscribeStoreProducts, getLocalStoreCategories } from '../../services/storeService';
import { StoreProduct, StoreCategory } from '../../types';
import { ProductCard } from '../ProductCard';

interface SunshineStoreShowcaseProps {
  onNavigateStore?: () => void;
}

export const SunshineStoreShowcase: React.FC<SunshineStoreShowcaseProps> = ({ 
  onNavigateStore 
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  useEffect(() => {
    const unsub = subscribeStoreProducts((data) => {
      setProducts(data.filter(p => p.status === 'PUBLISHED'));
    });
    setCategories(getLocalStoreCategories().filter(c => c.isActive));
    return () => unsub();
  }, []);

  const handleGoToStore = (categoryId?: string) => {
    if (onNavigateStore) {
      onNavigateStore();
    } else {
      navigate('/store');
    }
  };

  const getCategoryIcon = (catId: string) => {
    if (catId.includes('book')) return BookOpen;
    if (catId.includes('study')) return FileText;
    if (catId.includes('paper') || catId.includes('practice')) return FileSpreadsheet;
    if (catId.includes('notebook')) return BookMarked;
    if (catId.includes('stationery')) return PenTool;
    if (catId.includes('geometry')) return Compass;
    if (catId.includes('essential')) return Briefcase;
    if (catId.includes('digital')) return Monitor;
    return PackageIcon;
  };

  const PackageIcon = ShoppingBag;

  const featuredItems = products.filter(p => p.isFeatured || p.isMostRecommended).slice(0, 4);

  return (
    <section id="sunshine-store-preview" className="py-4 sm:py-6 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        
        {/* Section Header - Compact */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider mb-0.5">
              <ShoppingBag size={11} />
              <span>Student Store</span>
            </div>
            <h2 className="font-display text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🛒 Sunshine Store</span>
            </h2>
          </div>

          <button
            id="btn-store-header-visit"
            onClick={() => handleGoToStore()}
            className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 cursor-pointer py-1 shrink-0"
          >
            <span>Visit Store ({products.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Categories Strip - Sleek single-row scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-1.5 pb-0.5 sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible sm:pb-0">
          {categories.map((cat) => {
            const IconComp = getCategoryIcon(cat.id);
            return (
              <button
                key={cat.id}
                id={`btn-store-category-${cat.id}`}
                onClick={() => handleGoToStore(cat.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left transition-all group cursor-pointer shrink-0 sm:flex-col sm:text-center sm:py-2 sm:px-1 shadow-xs"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <IconComp size={12} className="sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap sm:whitespace-normal line-clamp-1">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured Products Showcase - Rail on Mobile, 4-Col Grid on Desktop */}
        {featuredItems.length > 0 && (
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-xs font-extrabold font-display text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                <span>Recommended Books & Kits</span>
              </h3>
            </div>

            <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2.5 pb-1 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
              {featuredItems.map((p) => (
                <div key={p.id} className="w-[170px] sm:w-auto shrink-0 snap-start flex flex-col">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
