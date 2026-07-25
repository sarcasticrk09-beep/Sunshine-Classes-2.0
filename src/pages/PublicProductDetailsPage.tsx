import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StoreProduct, StoreProductType } from '../types';
import { ProductCard } from '../components/ProductCard';
import { 
  subscribeStoreProducts, 
  trackProductView, 
  trackExternalClick,
  getLocalStoreSettings 
} from '../services/storeService';
import { 
  BookOpen, 
  Package, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Share2,
  Tag,
  ShoppingBag,
  Info
} from 'lucide-react';

interface PublicProductDetailsPageProps {
  expectedType?: StoreProductType;
}

export const PublicProductDetailsPage: React.FC<PublicProductDetailsPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const storeSettings = useMemo(() => getLocalStoreSettings(), []);

  useEffect(() => {
    const unsub = subscribeStoreProducts((data) => {
      setProducts(data.filter(p => p.status === 'PUBLISHED'));
    });
    return () => unsub();
  }, []);

  const product = useMemo(() => {
    return products.find(p => p.slug === slug || p.id === slug);
  }, [products, slug]);

  // Set default selected gallery image & track view
  useEffect(() => {
    if (product) {
      setSelectedImage(product.featuredImage);
      trackProductView(product.id, product.title, product.type);
    }
  }, [product]);

  // Dynamic Related Products from same category/class/publisher
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => 
      p.id !== product.id && 
      (p.categoryId === product.categoryId || p.class === product.class || p.publisher === product.publisher || p.brandName === product.brandName)
    ).slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-w-md space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Available</h2>
          <p className="text-xs text-slate-500">The requested item could not be found or may have been archived.</p>
          <button
            onClick={() => navigate('/store')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Back to Sunshine Store
          </button>
        </div>
      </div>
    );
  }

  const isBook = product.type === 'Book';
  const allImages = [product.featuredImage, ...(product.gallery || [])].filter((img, idx, arr) => Boolean(img) && arr.indexOf(img) === idx);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.seoTitle || product.title,
        text: product.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePurchaseClick = (link: any) => {
    trackExternalClick(product.id, link.id, link.platform, product.title, product.type);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const primaryPurchaseLink = product.purchaseLinks?.find(l => l.active) || product.purchaseLinks?.[0];

  const getButtonLabel = (platform?: string) => {
    if (!platform) return 'Buy from Trusted Vendor ↗';
    if (platform.toLowerCase().includes('amazon')) return 'Buy on Amazon ↗';
    if (platform.toLowerCase().includes('flipkart')) return 'Buy on Flipkart ↗';
    return `Buy from ${platform} ↗`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/store" className="hover:text-amber-600 transition-colors flex items-center gap-1">
              <ShoppingBag size={13} className="text-amber-500" />
              <span>Sunshine Store</span>
            </Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">{product.title}</span>
          </nav>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 size={14} />
            <span>{copiedLink ? 'Copied Link!' : 'Share Product'}</span>
          </button>
        </div>

        {/* Main Product Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* Stage 1: Product Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-full h-80 sm:h-96 bg-slate-100 dark:bg-slate-850 rounded-2xl p-6 flex items-center justify-center border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <img 
                src={selectedImage || product.featuredImage} 
                alt={product.title} 
                className="max-h-full max-w-full object-contain drop-shadow-md rounded-lg"
              />
              
              {product.isFeatured && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                  Faculty Choice
                </span>
              )}

              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                  Save {Math.round(((product.originalPrice - (product.price || 0)) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Thumbnail Gallery switcher */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 dark:bg-slate-800 overflow-hidden cursor-pointer transition-all ${
                      selectedImage === img ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stage 2: Product Information & Purchase Links */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category & Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                {isBook ? <BookOpen size={13} /> : <Package size={13} />}
                <span>{product.categoryName}</span>
              </span>

              {product.class && (
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  {product.class}
                </span>
              )}

              {product.subject && (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  {product.subject}
                </span>
              )}

              {product.stockStatus === 'IN_STOCK' && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  In Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            {/* Publisher / Author / Brand Details */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              {product.author && (
                <div>
                  <span className="text-slate-400">Author:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{product.author}</strong>
                </div>
              )}
              {product.publisher && (
                <div>
                  <span className="text-slate-400">Publisher:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{product.publisher}</strong>
                </div>
              )}
              {product.brandName && (
                <div>
                  <span className="text-slate-400">Brand:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{product.brandName}</strong>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-display text-amber-600 dark:text-amber-400">
                ₹{product.price ?? 299}
              </span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="text-sm text-slate-400 line-through">
                  MRP ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Affiliate External Purchase Box */}
            <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-amber-500" />
                  <span>Available Purchase Links</span>
                </span>
                <span className="text-[11px] text-slate-400">External Merchant</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.purchaseLinks?.filter(l => l.active).map(link => (
                  <button
                    key={link.id}
                    id={`btn-purchase-link-${link.id}`}
                    onClick={() => handlePurchaseClick(link)}
                    className="w-full p-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all flex items-center justify-between gap-2 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <span>{getButtonLabel(link.platform)}</span>
                    <ExternalLink size={15} />
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                Notice: Clicking these links will open the partner store (e.g., Amazon or Flipkart) where you can complete your order securely.
              </p>
            </div>

            {/* Stage 3: Recommended For / Faculty Note */}
            {product.whySunshineRecommends && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} />
                  <span>Recommended For (Faculty Note)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  "{product.whySunshineRecommends}"
                </p>
              </div>
            )}

            {/* Stage 4: Description / Overview */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.fullDescription || product.shortDescription}
              </p>
            </div>

            {/* Stage 5: Key Features & Specifications */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Key Features</h3>
                <ul className="space-y-2">
                  {product.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Specifications</h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                      <span className="font-bold text-slate-500">{key}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Tag size={13} className="text-slate-400" />
                {product.tags.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Stage 6: Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Related Educational Recommendations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Mobile Purchase Action Bar */}
      {primaryPurchaseLink && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Price</span>
            <span className="text-lg font-black font-display text-amber-600 dark:text-amber-400">
              ₹{product.price ?? 299}
            </span>
          </div>
          <button
            id="btn-sticky-mobile-buy"
            onClick={() => handlePurchaseClick(primaryPurchaseLink)}
            className="flex-1 max-w-[220px] py-3 px-4 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>{getButtonLabel(primaryPurchaseLink.platform)}</span>
            <ExternalLink size={14} />
          </button>
        </div>
      )}

    </div>
  );
};
