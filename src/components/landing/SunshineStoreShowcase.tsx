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
    <section id="sunshine-store-preview" className="py-8 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] sm:text-xs font-black uppercase tracking-wider">
            <ShoppingBag size={13} />
            <span>Educational Marketplace</span>
          </div>
          <h2 className="font-display text-xl sm:text-4xl font-black text-slate-900 dark:text-white">
            🛒 Sunshine Store
          </h2>
          <p className="text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-base font-display">
            "Everything a Student Needs, All in One Place."
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Browse NCERT solution books, Arihant question banks, pocket formula booklets, geometry kits, and ergonomic study tools recommended by Sunshine faculty.
          </p>
        </div>

        {/* Categories Grid Bar */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 text-center">
            Shop By Educational Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {categories.map((cat) => {
              const IconComp = getCategoryIcon(cat.id);
              return (
                <button
                  key={cat.id}
                  id={`btn-store-category-${cat.id}`}
                  onClick={() => handleGoToStore(cat.id)}
                  className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-center transition-all group cursor-pointer flex flex-col items-center justify-center space-y-1 sm:space-y-2 shadow-xs"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium line-clamp-1">
                      {cat.description || 'Explore'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Products Showcase */}
        {featuredItems.length > 0 && (
          <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Faculty Recommended Student Essentials</span>
              </h3>
              <button
                onClick={() => handleGoToStore()}
                className="text-[11px] sm:text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {featuredItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* View All Store CTA */}
        <div className="text-center pt-2">
          <button
            id="btn-homepage-visit-sunshine-store"
            onClick={() => handleGoToStore()}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs px-8 py-3.5 shadow-lg transition-all cursor-pointer min-h-[44px]"
          >
            <ShoppingBag size={16} />
            <span>Explore Full 🛒 Sunshine Store Catalog</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
};
