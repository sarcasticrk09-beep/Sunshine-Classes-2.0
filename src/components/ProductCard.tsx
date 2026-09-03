import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreProduct } from '../types';
import { 
  BookOpen, 
  Package, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Tag
} from 'lucide-react';

interface ProductCardProps {
  product: StoreProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    const route = `/product/${product.slug || product.id}`;
    navigate(route);
  };

  const isBook = product.type === 'Book';
  const brandOrPublisher = product.publisher || product.brandName || 'Sunshine Recommended';

  const formatStockStatus = (status?: string) => {
    if (!status) return null;
    if (status === 'IN_STOCK') return <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold">In Stock</span>;
    if (status === 'LIMITED' || status === 'LIMITED_STOCK') return <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[10px] font-bold">Limited Stock</span>;
    if (status === 'OUT_OF_STOCK') return <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded text-[10px] font-bold">Out of Stock</span>;
    return <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Featured Badge if flagged by CMS */}
      {product.isFeatured && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
            <Sparkles size={11} />
            <span>Faculty Choice</span>
          </span>
        </div>
      )}

      {/* Product Image Stage */}
      <div 
        onClick={handleViewDetails}
        className="w-full h-28 sm:h-52 bg-slate-100 dark:bg-slate-850 overflow-hidden relative cursor-pointer flex items-center justify-center p-2 sm:p-4 group-hover:opacity-95 transition-opacity"
      >
        <img 
          src={product.featuredImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'} 
          alt={product.title} 
          className="max-h-full max-w-full object-contain object-center group-hover:scale-105 transition-transform duration-500 rounded-lg shadow-xs"
          loading="lazy"
        />

        {/* Class Badge */}
        {product.class && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded uppercase tracking-wider">
            {product.class}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-1.5 sm:space-y-2">
          
          {/* Category & Publisher Header */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              {isBook ? <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" /> : <Package size={12} className="sm:w-3.5 sm:h-3.5" />}
              <span className="truncate max-w-[80px] sm:max-w-none">{product.categoryName}</span>
            </span>
            <span className="truncate max-w-[70px] sm:max-w-[120px] text-right font-medium text-slate-400">
              {brandOrPublisher}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={handleViewDetails}
            className="font-bold text-slate-900 dark:text-white text-xs sm:text-base leading-snug line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            {product.title}
          </h3>

          {/* Subject & Class Metadata if available */}
          {(product.subject || product.class) && (
            <div className="hidden sm:flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {product.subject && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                  {product.subject}
                </span>
              )}
            </div>
          )}

          {/* Pricing & Stock Status */}
          <div className="flex items-center justify-between pt-0.5 sm:pt-1">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-sm sm:text-lg font-black font-display text-amber-600 dark:text-amber-400">
                ₹{product.price ?? 299}
              </span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="scale-90 sm:scale-100 origin-right">
              {formatStockStatus(product.stockStatus)}
            </div>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Faculty Recommendation note if present */}
          {product.whySunshineRecommends && (
            <div className="hidden sm:flex bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 text-[11px] text-amber-900 dark:text-amber-200 items-start gap-1.5 leading-snug">
              <ShieldCheck size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2 font-medium">
                <strong className="font-bold">Faculty Note:</strong> {product.whySunshineRecommends}
              </span>
            </div>
          )}

        </div>

        {/* Footer Action Button */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            id={`btn-view-product-${product.id}`}
            onClick={handleViewDetails}
            className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-amber-500 dark:bg-slate-800 dark:hover:bg-amber-500 text-white font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
