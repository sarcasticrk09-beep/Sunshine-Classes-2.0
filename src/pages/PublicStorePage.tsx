import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreProduct, StoreCategory, StoreProductType } from '../types';
import { ProductCard } from '../components/ProductCard';
import { 
  subscribeStoreProducts, 
  getLocalStoreCategories, 
  getLocalStoreSettings 
} from '../services/storeService';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBag,
  CheckCircle2,
  BookOpen,
  Package,
  FileText,
  FileSpreadsheet,
  BookMarked,
  PenTool,
  Compass,
  Briefcase,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicStorePageProps {
  initialType?: StoreProductType; // Optional 'Book' | 'Resource'
}

export const PublicStorePage: React.FC<PublicStorePageProps> = ({ initialType }) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const storeSettings = useMemo(() => getLocalStoreSettings(), []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);

  // Selected Filters
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPublisherOrBrand, setSelectedPublisherOrBrand] = useState<string>('ALL');
  const [selectedStock, setSelectedStock] = useState<string>('ALL');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'PRICE_LOW' | 'PRICE_HIGH' | 'LATEST' | 'AZ' | 'ZA'>('RECOMMENDED');

  // Load products & categories from dynamic store service
  useEffect(() => {
    const unsub = subscribeStoreProducts((data) => {
      setProducts(data.filter(p => p.status === 'PUBLISHED'));
    });
    setCategories(getLocalStoreCategories().filter(c => c.isActive));

    return () => unsub();
  }, []);

  // Derived filter options for dropdowns
  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    products.forEach(p => {
      if (p.class) classes.add(p.class);
    });
    return Array.from(classes).sort();
  }, [products]);

  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    products.forEach(p => {
      if (p.subject) subjects.add(p.subject);
    });
    return Array.from(subjects).sort();
  }, [products]);

  const publisherOrBrandOptions = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach(p => {
      if (p.publisher) brandsSet.add(p.publisher);
      if (p.brandName) brandsSet.add(p.brandName);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Dynamic Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Type filter if explicitly passed (e.g. /books vs /resources view)
      if (initialType && p.type !== initialType) return false;

      // Search Query Match (Title, Subject, Publisher, Brand, Class, Keywords/Tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesAuthor = p.author?.toLowerCase().includes(q) || false;
        const matchesPublisher = p.publisher?.toLowerCase().includes(q) || false;
        const matchesBrand = p.brandName?.toLowerCase().includes(q) || false;
        const matchesSubject = p.subject?.toLowerCase().includes(q) || false;
        const matchesClass = p.class?.toLowerCase().includes(q) || false;
        const matchesCategory = p.categoryName?.toLowerCase().includes(q) || false;
        const matchesTags = p.tags?.some(t => t.toLowerCase().includes(q)) || false;

        if (!matchesTitle && !matchesAuthor && !matchesPublisher && !matchesBrand && !matchesSubject && !matchesClass && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Class Filter
      if (selectedClass !== 'ALL' && p.class !== selectedClass) return false;

      // Subject Filter
      if (selectedSubject !== 'ALL' && p.subject !== selectedSubject) return false;

      // Category Filter
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;

      // Publisher / Brand Filter
      if (selectedPublisherOrBrand !== 'ALL') {
        if (p.publisher !== selectedPublisherOrBrand && p.brandName !== selectedPublisherOrBrand) {
          return false;
        }
      }

      // Stock Status Filter
      if (selectedStock !== 'ALL') {
        if (p.stockStatus !== selectedStock) return false;
      }

      // Featured Only Filter
      if (featuredOnly && !p.isFeatured && !p.isMostRecommended) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'PRICE_HIGH') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'LATEST') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'AZ') return a.title.localeCompare(b.title);
      if (sortBy === 'ZA') return b.title.localeCompare(a.title);
      // Recommended: Featured ones first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    products, 
    initialType, 
    searchQuery, 
    selectedClass, 
    selectedSubject, 
    selectedCategory, 
    selectedPublisherOrBrand, 
    selectedStock,
    featuredOnly, 
    sortBy
  ]);

  // Instant Search Suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => (
      p.title.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q) ||
      p.publisher?.toLowerCase().includes(q) ||
      p.brandName?.toLowerCase().includes(q) ||
      p.subject?.toLowerCase().includes(q)
    )).slice(0, 5);
  }, [products, searchQuery]);

  // Faculty choices
  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured || p.isMostRecommended), [products]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClass('ALL');
    setSelectedSubject('ALL');
    setSelectedCategory('ALL');
    setSelectedPublisherOrBrand('ALL');
    setSelectedStock('ALL');
    setFeaturedOnly(false);
    setSortBy('RECOMMENDED');
  };

  // Helper for category icons
  const getCategoryIcon = (catId: string) => {
    if (catId.includes('book')) return BookOpen;
    if (catId.includes('study')) return FileText;
    if (catId.includes('paper') || catId.includes('practice')) return FileSpreadsheet;
    if (catId.includes('notebook')) return BookMarked;
    if (catId.includes('stationery')) return PenTool;
    if (catId.includes('geometry')) return Compass;
    if (catId.includes('essential')) return Briefcase;
    if (catId.includes('digital')) return Monitor;
    return Package;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button onClick={() => navigate('/')} className="hover:text-amber-600 transition-colors cursor-pointer">Home</button>
          <ChevronRight size={14} />
          <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-amber-500" />
            <span>Sunshine Store</span>
          </span>
        </nav>

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-6 sm:p-10 md:p-12 shadow-2xl border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={14} />
              <span>Official Educational Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
              🛒 Sunshine Store
            </h1>
            <p className="text-amber-400 font-bold text-base sm:text-lg font-display">
              "Everything a Student Needs, All in One Place."
            </p>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Curated NCERT textbooks, board exam question banks, pocket formula booklets, geometry kits, and study desk essentials recommended by Sunshine Classes faculty.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <CheckCircle2 size={15} className="text-amber-400" />
                <span>Faculty Tested & Recommended</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <CheckCircle2 size={15} className="text-amber-400" />
                <span>Direct Partner Purchase Links</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <CheckCircle2 size={15} className="text-amber-400" />
                <span>Transparent Educational Guidance</span>
              </span>
            </div>
          </div>
        </div>

        {/* Global Search & Instant Suggestion Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 focus-within:border-amber-500 transition-all">
            <Search className="ml-4 text-slate-400 shrink-0" size={20} />
            <input 
              id="store-global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              placeholder="Search by product name, subject (Maths), author (RD Sharma), brand (Casio), class..."
              className="w-full py-4 px-3 text-sm bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Instant Search Suggestions Popup */}
          <AnimatePresence>
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
              >
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                  <span>Suggested Matches ({searchSuggestions.length})</span>
                  <button onClick={() => setShowSearchSuggestions(false)} className="text-amber-600 hover:underline cursor-pointer">Close</button>
                </div>
                {searchSuggestions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setShowSearchSuggestions(false);
                      navigate(`/product/${s.slug || s.id}`);
                    }}
                    className="p-3.5 flex items-center gap-3 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <img src={s.featuredImage} alt={s.title} className="w-10 h-10 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{s.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ₹{s.price || 299} • {s.class ? `${s.class} • ` : ''}{s.publisher || s.brandName}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Shop By Category ({categories.length})</span>
            {selectedCategory !== 'ALL' && (
              <button onClick={() => setSelectedCategory('ALL')} className="text-amber-600 hover:underline cursor-pointer">Show All Categories</button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <button
              id="cat-card-all"
              onClick={() => setSelectedCategory('ALL')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                <ShoppingBag size={18} />
              </div>
              <div>
                <span className="block text-xs font-bold line-clamp-1">All Items</span>
                <span className={`block text-[10px] ${selectedCategory === 'ALL' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Full Catalog
                </span>
              </div>
            </button>

            {categories.map(cat => {
              const IconComponent = getCategoryIcon(cat.id);
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/80 text-amber-600'
                  }`}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold line-clamp-1">{cat.name}</span>
                    <span className={`block text-[10px] line-clamp-1 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {cat.description || 'Curated'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Showcase Section */}
        {!searchQuery && selectedCategory === 'ALL' && selectedClass === 'ALL' && featuredProducts.length > 0 && (
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                <span>Faculty Recommended Top Picks</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked resources proven to boost board exam efficiency</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Filters & Controls Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <SlidersHorizontal size={18} className="text-amber-500" />
              <span>Catalog ({filteredProducts.length} items)</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Faculty Picks filter toggle */}
              <button
                id="btn-toggle-featured-filter"
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  featuredOnly
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ★ Faculty Choices
              </button>

              {/* Mobile Filter Drawer Trigger */}
              <button
                id="btn-open-mobile-filter-drawer"
                onClick={() => setShowMobileFilterDrawer(true)}
                className="md:hidden px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Filter size={14} />
                <span>Filter Options</span>
              </button>

              {/* Sorting dropdown */}
              <div className="hidden sm:flex items-center gap-1 text-xs">
                <ArrowUpDown size={14} className="text-slate-400" />
                <select
                  id="select-store-sort"
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value="RECOMMENDED">Faculty Recommended</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="LATEST">Latest Added</option>
                  <option value="AZ">Alphabetical (A–Z)</option>
                  <option value="ZA">Alphabetical (Z–A)</option>
                </select>
              </div>

              {(searchQuery || selectedClass !== 'ALL' || selectedSubject !== 'ALL' || selectedCategory !== 'ALL' || selectedPublisherOrBrand !== 'ALL' || selectedStock !== 'ALL' || featuredOnly) && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>

          {/* Desktop Filter Dropdowns Grid */}
          <div className="hidden md:grid grid-cols-4 gap-3 text-xs">
            {/* Class Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class</label>
              <select
                id="filter-select-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
              <select
                id="filter-select-subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="ALL">All Subjects</option>
                {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Publisher / Brand Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Publisher / Brand</label>
              <select
                id="filter-select-publisher-brand"
                value={selectedPublisherOrBrand}
                onChange={(e) => setSelectedPublisherOrBrand(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="ALL">All Publishers & Brands</option>
                {publisherOrBrandOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Stock Availability Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Availability</label>
              <select
                id="filter-select-stock"
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="ALL">All Items</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LIMITED_STOCK">Limited Stock</option>
                <option value="PRE_ORDER">Pre-Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Product Catalog Grid / Empty State */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products available yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No products match your search or filter selection. Please check back soon or try resetting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* Affiliate Transparency Disclosure Box */}
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-amber-500" />
            <span>Educational Guidance & External Purchase Notice</span>
          </p>
          <p className="leading-relaxed">
            {storeSettings.affiliateDisclosure || "Sunshine Store curates genuine textbooks, formula books, stationery, and student essentials. Clicking purchase links will redirect you to trusted partner vendors (e.g. Amazon, Flipkart) to fulfill your order safely."}
          </p>
        </div>

      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilterDrawer && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm md:hidden">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter size={18} className="text-amber-500" />
                  <span>Filter Store Products</span>
                </h3>
                <button
                  onClick={() => setShowMobileFilterDrawer(false)}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Sort dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold"
                  >
                    <option value="RECOMMENDED">Faculty Recommended</option>
                    <option value="PRICE_LOW">Price: Low to High</option>
                    <option value="PRICE_HIGH">Price: High to Low</option>
                    <option value="LATEST">Latest Added</option>
                    <option value="AZ">Alphabetical (A–Z)</option>
                    <option value="ZA">Alphabetical (Z–A)</option>
                  </select>
                </div>

                {/* Class filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium"
                  >
                    <option value="ALL">All Classes</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Subject filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium"
                  >
                    <option value="ALL">All Subjects</option>
                    {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Publisher / Brand */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Publisher / Brand</label>
                  <select
                    value={selectedPublisherOrBrand}
                    onChange={(e) => setSelectedPublisherOrBrand(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-medium"
                  >
                    <option value="ALL">All Publishers & Brands</option>
                    {publisherOrBrandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 text-xs"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilterDrawer(false)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 font-bold text-white text-xs shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
