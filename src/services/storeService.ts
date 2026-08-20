import { 
  StoreProduct, 
  StoreCategory, 
  StoreBrand, 
  StoreSetting, 
  StoreAnalyticsLog,
  StoreProductType,
  StoreReview,
  StoreOrder,
  StoreOrderItem
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Initial Pre-seeded Categories
export const DEFAULT_STORE_CATEGORIES: StoreCategory[] = [
  { id: 'cat-books', name: 'Books', slug: 'books', productType: 'Book', description: 'Comprehensive NCERT, RD Sharma & reference textbooks.', icon: '📚', displayOrder: 1, isActive: true },
  { id: 'cat-study-material', name: 'Study Material', slug: 'study-material', productType: 'Book', description: 'Faculty revision sheets, formula booklets & chapter mindmaps.', icon: '📝', displayOrder: 2, isActive: true },
  { id: 'cat-practice-papers', name: 'Practice Papers', slug: 'practice-papers', productType: 'Book', description: 'Board specimen sample papers & past 10-year question banks.', icon: '📄', displayOrder: 3, isActive: true },
  { id: 'cat-notebooks', name: 'Notebooks', slug: 'notebooks', productType: 'Resource', description: 'Sunshine official long registers, grid notebooks & formula diaries.', icon: '📒', displayOrder: 4, isActive: true },
  { id: 'cat-stationery', name: 'Stationery', slug: 'stationery', productType: 'Resource', description: 'Exam dark 2B pencils, highlighters, pens & non-dust erasers.', icon: '✏️', displayOrder: 5, isActive: true },
  { id: 'cat-geometry', name: 'Geometry Instruments', slug: 'geometry-instruments', productType: 'Resource', description: 'Precision metal compasses, protractors & exam geometry sets.', icon: '📐', displayOrder: 6, isActive: true },
  { id: 'cat-student-essentials', name: 'Student Essentials', slug: 'student-essentials', productType: 'Resource', description: 'Desks, eye-care study lamps, timers & ergonomic seating.', icon: '🎒', displayOrder: 7, isActive: true },
  { id: 'cat-digital-resources', name: 'Digital Resources', slug: 'digital-resources', productType: 'Resource', description: 'Scientific calculators, tablets & digital revision tools.', icon: '💻', displayOrder: 8, isActive: true }
];

// Initial Pre-seeded Brands & Publishers
export const DEFAULT_STORE_BRANDS: StoreBrand[] = [
  { id: 'brand-dhanpat-rai', name: 'Dhanpat Rai Publications', slug: 'dhanpat-rai', type: 'PUBLISHER', website: 'https://dhanpatrai.com', description: 'Publisher of standard RD Sharma Mathematics textbooks.', isActive: true },
  { id: 'brand-arihant', name: 'Arihant Publications', slug: 'arihant-publications', type: 'PUBLISHER', website: 'https://arihantbooks.com', description: 'Popular study guides, All In One series & sample papers.', isActive: true },
  { id: 'brand-s-chand', name: 'S. Chand & Company', slug: 's-chand', type: 'PUBLISHER', website: 'https://schandpublishing.com', description: 'Leading publisher of Lakhmir Singh Physics & Chemistry books.', isActive: true },
  { id: 'brand-oswaal', name: 'Oswaal Books', slug: 'oswaal-books', type: 'PUBLISHER', website: 'https://oswaalbooks.com', description: 'CBSE and State Board past paper question banks.', isActive: true },
  { id: 'brand-educart', name: 'Educart Books', slug: 'educart-books', type: 'PUBLISHER', website: 'https://educart.co', description: 'Specialist board exam specimen papers & revision notes.', isActive: true },
  { id: 'brand-philips', name: 'Philips / Wipro Lighting', slug: 'philips-wipro', type: 'BRAND', website: 'https://philips.co.in', description: 'Premium eye-care LED desk lamps.', isActive: true },
  { id: 'brand-casio', name: 'Casio', slug: 'casio', type: 'BRAND', website: 'https://casio.com/in', description: 'Scientific calculators and digital timers.', isActive: true },
  { id: 'brand-green-soul', name: 'Green Soul', slug: 'green-soul', type: 'BRAND', website: 'https://greensoul.online', description: 'Ergonomic study chairs with lumbar support.', isActive: true },
  { id: 'brand-apsara', name: 'Apsara Stationery', slug: 'apsara-stationery', type: 'BRAND', website: 'https://apsarapencils.com', description: 'Exam pencils, geometry tools & non-dust erasers.', isActive: true }
];

// Initial Pre-seeded Store Products
export const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-book-rd-sharma-10',
    type: 'Book',
    title: 'Class 10 RD Sharma Mathematics (Latest Edition 2026–27)',
    slug: 'class-10-rd-sharma-maths',
    shortDescription: 'The definitive conceptual reference guidebook for Class 10 CBSE & UP Board mathematics preparation.',
    fullDescription: 'Dr. R.D. Sharma’s Mathematics for Class 10 is the ultimate benchmark textbook for board exam aspirants. It covers exhaustive theory, step-by-step solved examples, multiple-choice questions (MCQs), assertion-reasoning problems, and high-order thinking skill (HOTS) questions to guarantee 95%+ marks in mathematics.',
    featuredImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'
    ],
    categoryId: 'cat-books',
    categoryName: 'Books',
    brandId: 'brand-dhanpat-rai',
    brandName: 'Dhanpat Rai Publications',
    publisher: 'Dhanpat Rai Publications',
    author: 'Dr. R.D. Sharma',
    class: 'Class 10',
    subject: 'Mathematics',
    price: 499,
    originalPrice: 650,
    discountPercent: 23,
    rating: 4.9,
    ratingCount: 142,
    stockStatus: 'IN_STOCK',
    tags: ['Board Exam 2026', 'Mathematics', 'Class 10', 'RD Sharma', 'HOTS Questions'],
    whySunshineRecommends: 'Recommended directly by Priyanshu Sir for all Class 10 students at Sunshine Classes. Mastering RD Sharma chapters eliminates fear of unseen board numerical problems and ensures 100% conceptual mastery.',
    keyFeatures: [
      'Updated as per latest CBSE Board Rationalized Syllabus',
      'Exhaustive chapter-wise solved exemplar problems',
      'Includes Case-Study based and Assertion-Reasoning questions',
      'Step-by-step trigonometric and coordinate geometry derivations'
    ],
    specifications: {
      'Edition': '2026–2027 Revised',
      'Language': 'English',
      'Paperback Pages': '920',
      'Binding': 'Paperback',
      'Publisher': 'Dhanpat Rai Publications'
    },
    reviews: [
      {
        id: 'rev-rd-1',
        reviewerName: 'Priyanshu Sharma',
        reviewerRole: 'Faculty - Mathematics',
        rating: 5,
        comment: 'An indispensable book for every Class 10 board aspirant. The HOTS questions build top-tier problem solving confidence.',
        date: '2026-06-15',
        isVerifiedBuyer: true
      },
      {
        id: 'rev-rd-2',
        reviewerName: 'Aarav Gupta',
        reviewerRole: 'Class 10 Student (98.2% Scorer)',
        rating: 5,
        comment: 'Solving RD Sharma chapters along with Sunshine Classes daily practice sheets helped me score 100 in Class 10 Pre-Boards!',
        date: '2026-07-02',
        isVerifiedBuyer: true
      }
    ],
    isFeatured: true,
    isTrending: true,
    isStaffPick: true,
    isNewArrival: true,
    isMostRecommended: true,
    isBestseller: true,
    purchaseLinks: [
      { id: 'link-rd-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B08X123456', displayOrder: 1, active: true, clickCount: 142 },
      { id: 'link-rd-fk', platform: 'Flipkart', url: 'https://flipkart.com/rd-sharma-class-10-maths/p/itm123456', displayOrder: 2, active: true, clickCount: 89 },
      { id: 'link-rd-pub', platform: 'Official Website', url: 'https://dhanpatrai.com/books/class-10-rd-sharma', displayOrder: 3, active: true, clickCount: 34 }
    ],
    seoTitle: 'Class 10 RD Sharma Maths Book 2026 Edition - Buy Online | Sunshine Store',
    metaDescription: 'Buy Class 10 RD Sharma Mathematics book online with best discount links on Amazon & Flipkart. Recommended by Sunshine Classes faculty.',
    keywords: ['RD Sharma Class 10', 'Class 10 Maths Book', 'Sunshine Classes Book Recommendation', 'CBSE Class 10 Maths'],
    canonicalUrl: 'https://sunshineclasses.in/books/class-10-rd-sharma-maths',
    openGraphImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    status: 'PUBLISHED',
    viewsCount: 1250,
    totalClicks: 265,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-07-20T14:30:00Z'
  },
  {
    id: 'prod-book-arihant-all-in-one-10',
    type: 'Book',
    title: 'Class 10 Arihant All In One Science CBSE (2026 Exam)',
    slug: 'class-10-arihant-all-in-one-science',
    shortDescription: 'Comprehensive all-in-one study guide covering Physics, Chemistry & Biology with NCERT explanations.',
    fullDescription: 'Arihant’s All In One Science for Class 10 offers succinct chapter notes, quick revision flowcharts, NCERT textbook and exemplar solutions, and self-assessment mock tests tailored for 2026 board exam candidates.',
    featuredImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'
    ],
    categoryId: 'cat-books',
    categoryName: 'Books',
    brandId: 'brand-arihant',
    brandName: 'Arihant Publications',
    publisher: 'Arihant Publications',
    author: 'Sanjeev Kumar & Editorial Board',
    class: 'Class 10',
    subject: 'Science',
    price: 380,
    originalPrice: 495,
    discountPercent: 23,
    rating: 4.8,
    ratingCount: 110,
    stockStatus: 'IN_STOCK',
    tags: ['Class 10', 'Science', 'Arihant', 'All In One', 'Board Notes'],
    whySunshineRecommends: 'Perfect for quick weekly revision. The concise diagrams and ray-diagram explanations make physics optics and chemistry equations effortless to recall during tests.',
    keyFeatures: [
      'Complete coverage of Physics, Chemistry & Biology chapters',
      'Mind maps and chapter flowcharts at the end of every topic',
      '5 full-length CBSE Board Specimen Mock Papers with solutions'
    ],
    specifications: {
      'Edition': '2026',
      'Pages': '540',
      'Language': 'English'
    },
    isFeatured: true,
    isTrending: true,
    isStaffPick: false,
    isNewArrival: false,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-ari-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B09Y987654', displayOrder: 1, active: true, clickCount: 110 },
      { id: 'link-ari-fk', platform: 'Flipkart', url: 'https://flipkart.com/arihant-class-10-science/p/itm987654', displayOrder: 2, active: true, clickCount: 62 }
    ],
    seoTitle: 'Class 10 Arihant All In One Science Guide - Sunshine Store',
    metaDescription: 'Get best discount links for Arihant Class 10 Science All In One book. Recommended study material for CBSE Board exam prep.',
    keywords: ['Arihant Science Class 10', 'Class 10 Science Guide', 'All In One Science'],
    canonicalUrl: 'https://sunshineclasses.in/books/class-10-arihant-all-in-one-science',
    status: 'PUBLISHED',
    viewsCount: 980,
    totalClicks: 172,
    createdAt: '2026-06-05T11:20:00Z',
    updatedAt: '2026-07-21T09:15:00Z'
  },
  {
    id: 'prod-book-s-chand-physics-9',
    type: 'Book',
    title: 'Class 9 Physics Foundation for Olympiad & NTSE by S. Chand',
    slug: 'class-9-s-chand-physics',
    shortDescription: 'In-depth conceptual physics textbook by Lakhmir Singh & Manjit Kaur for Class 9 students.',
    fullDescription: 'S. Chand Physics for Class 9 builds a rock-solid foundation in Motion, Force, Gravitation, Work & Energy, and Sound through rich illustrations and real-world examples.',
    featuredImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'],
    categoryId: 'cat-books',
    categoryName: 'Books',
    brandId: 'brand-s-chand',
    brandName: 'S. Chand & Company',
    publisher: 'S. Chand & Company',
    author: 'Lakhmir Singh & Manjit Kaur',
    class: 'Class 9',
    subject: 'Science',
    price: 299,
    originalPrice: 390,
    discountPercent: 23,
    rating: 4.7,
    ratingCount: 84,
    stockStatus: 'IN_STOCK',
    tags: ['Class 9', 'Physics', 'S Chand', 'Lakhmir Singh', 'Foundation'],
    whySunshineRecommends: 'Essential reading for Class 9 students targeting high marks in coaching term tests and preparing for Class 11 Science physics stream.',
    keyFeatures: [
      'Simple, lucid language with step-by-step solved numerical problems',
      'Value-Based Questions (VBQs) and Olympiad level challenge problems',
      'Colorful ray diagrams and force vector illustrations'
    ],
    specifications: {
      'Pages': '380',
      'Language': 'English',
      'Edition': '2026'
    },
    isFeatured: false,
    isTrending: true,
    isStaffPick: true,
    isNewArrival: true,
    isMostRecommended: false,
    purchaseLinks: [
      { id: 'link-sch-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B07Z112233', displayOrder: 1, active: true, clickCount: 84 },
      { id: 'link-sch-fk', platform: 'Flipkart', url: 'https://flipkart.com/schand-class-9-physics/p/itm112233', displayOrder: 2, active: true, clickCount: 45 }
    ],
    seoTitle: 'Class 9 S. Chand Physics Book by Lakhmir Singh - Sunshine Store',
    metaDescription: 'Buy Lakhmir Singh Class 9 Physics book online. Recommended foundation book for Olympiad and high school science.',
    keywords: ['Class 9 Physics S Chand', 'Lakhmir Singh Physics', 'Class 9 Science Book'],
    canonicalUrl: 'https://sunshineclasses.in/books/class-9-s-chand-physics',
    status: 'PUBLISHED',
    viewsCount: 670,
    totalClicks: 129,
    createdAt: '2026-06-10T14:00:00Z',
    updatedAt: '2026-07-22T10:00:00Z'
  },
  {
    id: 'prod-book-oswaal-sample-papers-10',
    type: 'Book',
    title: 'Class 10 CBSE 10 Sample Question Papers Set (Maths, Science, English, SST)',
    slug: 'class-10-oswaal-sample-question-papers',
    shortDescription: 'Latest 2026 Board sample papers with step-by-step marking schemes & optical answer sheets.',
    fullDescription: 'Master board exam time management with Oswaal 10 Sample Question Papers. Includes topper handwritten answer sheets, mind maps, and detailed step-marking keys.',
    featuredImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800'],
    categoryId: 'cat-practice-papers',
    categoryName: 'Practice Papers',
    brandId: 'brand-oswaal',
    brandName: 'Oswaal Books',
    publisher: 'Oswaal Books',
    author: 'Oswaal Editorial Board',
    class: 'Class 10',
    subject: 'All Subjects',
    price: 349,
    originalPrice: 450,
    discountPercent: 22,
    rating: 4.9,
    ratingCount: 96,
    stockStatus: 'IN_STOCK',
    tags: ['Class 10', 'Sample Papers', 'Oswaal', 'Board Exam 2026', 'Practice Sets'],
    whySunshineRecommends: 'Solving 5+ sample papers under timed conditions is mandatory for all Sunshine board candidates to secure 95%+ scores.',
    keyFeatures: [
      '100% updated with 2026 CBSE Specimen Blueprints',
      'Includes Topper handwritten tips and answer keys',
      'OMR Answer sheets included for realistic exam practice'
    ],
    specifications: { 'Pages': '420', 'Language': 'English' },
    isFeatured: true,
    isTrending: true,
    isStaffPick: true,
    isNewArrival: true,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-osw-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B08M334455', displayOrder: 1, active: true, clickCount: 92 }
    ],
    seoTitle: 'Class 10 Sample Papers 2026 Edition - Sunshine Store',
    metaDescription: 'Buy Class 10 CBSE Sample Papers set online. Recommended by Sunshine Classes faculty.',
    keywords: ['Sample Papers Class 10', 'CBSE Practice Papers 2026'],
    canonicalUrl: 'https://sunshineclasses.in/books/class-10-oswaal-sample-question-papers',
    status: 'PUBLISHED',
    viewsCount: 890,
    totalClicks: 92,
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-07-23T11:00:00Z'
  },
  {
    id: 'prod-notebook-sunshine-registers-pack',
    type: 'Resource',
    title: 'Sunshine Official Academic Register Notebooks Pack of 6 (A4 240 Pages)',
    slug: 'sunshine-official-notebooks-pack',
    shortDescription: 'Heavyweight 70 GSM smooth white paper registers with formula margins and page indexing.',
    fullDescription: 'Custom designed for Sunshine Classes students. Includes high GSM leak-proof paper suitable for fountain pens and gel pens, margin guides for math equations, and built-in formula cheat-sheet endpapers.',
    featuredImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800'],
    categoryId: 'cat-notebooks',
    categoryName: 'Notebooks',
    brandId: 'brand-apsara',
    brandName: 'Sunshine Academic Stationery',
    publisher: 'Sunshine Classes',
    class: 'Class 10',
    subject: 'All Subjects',
    price: 320,
    originalPrice: 420,
    discountPercent: 24,
    rating: 4.8,
    ratingCount: 65,
    stockStatus: 'IN_STOCK',
    tags: ['Notebooks', 'Registers', 'Sunshine Official', 'Stationery', 'A4 Notebooks'],
    whySunshineRecommends: 'Durable binding prevents loose pages during intensive daily coaching practice sessions and board revision.',
    keyFeatures: [
      '70 GSM smooth white bleed-resistant paper',
      'Indexed page layout with pre-printed date & topic fields',
      'Hardcover lamination with Sunshine periodic table & formula cheat-sheets'
    ],
    specifications: { 'Pages': '240 per register', 'Size': 'A4 Long Register', 'Pack': 'Set of 6' },
    isFeatured: true,
    isTrending: true,
    isStaffPick: true,
    isNewArrival: true,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-reg-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B08K112200', displayOrder: 1, active: true, clickCount: 112 }
    ],
    seoTitle: 'Sunshine Official Academic Registers Pack - Sunshine Store',
    metaDescription: 'High quality A4 long registers with formula margins for high school coaching students.',
    keywords: ['Class 10 Registers', 'A4 Long Notebooks', 'Sunshine Official Notebooks'],
    canonicalUrl: 'https://sunshineclasses.in/resources/sunshine-official-notebooks-pack',
    status: 'PUBLISHED',
    viewsCount: 610,
    totalClicks: 112,
    createdAt: '2026-06-18T08:30:00Z',
    updatedAt: '2026-07-21T15:00:00Z'
  },
  {
    id: 'prod-res-wipro-desk-lamp',
    type: 'Resource',
    title: 'Ergonomic LED Eye-Care Study Desk Lamp with Touch Dimmer & USB Charging',
    slug: 'ergonomic-led-study-lamp',
    shortDescription: 'Flicker-free flexible neck LED desk lamp with 3 color temperatures for long revision hours.',
    fullDescription: 'Designed specifically for students spending hours studying for board exams, this LED desk lamp emits warm, non-glare, flicker-free light to minimize eye fatigue during night study sessions.',
    featuredImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'
    ],
    categoryId: 'cat-student-essentials',
    categoryName: 'Student Essentials',
    brandId: 'brand-philips',
    brandName: 'Philips / Wipro Lighting',
    publisher: 'Wipro / Philips',
    class: 'Class 10',
    subject: 'All Subjects',
    price: 899,
    originalPrice: 1299,
    discountPercent: 30,
    rating: 4.9,
    ratingCount: 198,
    stockStatus: 'IN_STOCK',
    tags: ['Study Setup', 'LED Lamp', 'Eye Care', 'Electronics', 'Exam Prep'],
    whySunshineRecommends: 'Eye comfort is critical during late-night revision weeks. The 3 adjustable lighting modes (Cool White, Warm White, Natural Day) protect young eyes from harsh blue light.',
    keyFeatures: [
      '3 Color Temperatures (Warm, Cool, Natural) + Soft Stepless Dimming',
      '360-Degree Flexible Gooseneck design for precise light positioning',
      'Built-in USB Charging Port for phone/tablet charging',
      'Low power consumption (10W Energy Efficient LED)'
    ],
    specifications: {
      'Wattage': '10 Watts',
      'Power Source': 'AC Adapter / USB Cable',
      'Warranty': '1 Year Manufacturer Warranty'
    },
    isFeatured: true,
    isTrending: true,
    isStaffPick: true,
    isNewArrival: true,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-lamp-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B07K667788', displayOrder: 1, active: true, clickCount: 198 },
      { id: 'link-lamp-fk', platform: 'Flipkart', url: 'https://flipkart.com/led-study-desk-lamp/p/itm667788', displayOrder: 2, active: true, clickCount: 114 }
    ],
    seoTitle: 'Ergonomic LED Study Desk Lamp for Students - Sunshine Store',
    metaDescription: 'Buy eye-care flexible LED study desk lamps for late-night board exam study sessions. Curated by Sunshine Classes.',
    keywords: ['Study Lamp for Students', 'LED Desk Lamp', 'Eye Care Lamp for Board Exams'],
    canonicalUrl: 'https://sunshineclasses.in/resources/ergonomic-led-study-lamp',
    status: 'PUBLISHED',
    viewsCount: 1450,
    totalClicks: 312,
    createdAt: '2026-06-02T12:00:00Z',
    updatedAt: '2026-07-23T16:00:00Z'
  },
  {
    id: 'prod-res-casio-scientific-calc',
    type: 'Resource',
    title: 'Casio FX-82MS 2nd Edition Non-Programmable Scientific Calculator',
    slug: 'casio-scientific-calculator-fx82ms',
    shortDescription: 'Standard 240-function scientific calculator for high school physics, chemistry & statistics.',
    fullDescription: 'Casio FX-82MS is the universally recommended scientific calculator for high school and entrance exam students. Features a 2-line display, trigonometric functions, logarithm, permutation, and statistical calculations.',
    featuredImage: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48a?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48a?auto=format&fit=crop&q=80&w=800'],
    categoryId: 'cat-digital-resources',
    categoryName: 'Digital Resources',
    brandId: 'brand-casio',
    brandName: 'Casio',
    publisher: 'Casio India',
    class: 'Class 10',
    subject: 'Science',
    price: 595,
    originalPrice: 695,
    discountPercent: 14,
    rating: 4.8,
    ratingCount: 165,
    stockStatus: 'IN_STOCK',
    tags: ['Electronics', 'Casio', 'Calculator', 'Physics', 'Olympiad'],
    whySunshineRecommends: 'Must-have tool for senior science practice, physics numerical verifications, and competitive math foundation classes.',
    keyFeatures: [
      '240 Built-in Functions including Trigonometry, Log, Permutation & Combination',
      '2-Line Display for viewing formula and calculated result simultaneously',
      'Drop-resistant build quality with 3-year Casio India warranty'
    ],
    specifications: { 'Model': 'FX-82MS 2nd Gen', 'Battery': 'AAA x 1', 'Warranty': '3 Years' },
    isFeatured: true,
    isTrending: false,
    isStaffPick: true,
    isNewArrival: false,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-casio-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B07N889900', displayOrder: 1, active: true, clickCount: 165 }
    ],
    seoTitle: 'Casio FX-82MS Scientific Calculator - Sunshine Store',
    metaDescription: 'Buy original Casio FX-82MS scientific calculator online with official warranty. Recommended by Sunshine Classes.',
    keywords: ['Casio Scientific Calculator', 'FX-82MS Calculator', 'High School Scientific Calculator'],
    canonicalUrl: 'https://sunshineclasses.in/resources/casio-scientific-calculator-fx82ms',
    status: 'PUBLISHED',
    viewsCount: 890,
    totalClicks: 165,
    createdAt: '2026-06-12T10:00:00Z',
    updatedAt: '2026-07-20T12:00:00Z'
  },
  {
    id: 'prod-res-apsara-exam-kit',
    type: 'Resource',
    title: 'Apsara Precision Exam Geometry Box & Drawing Instruments Set',
    slug: 'apsara-board-exam-stationery-kit',
    shortDescription: 'Board-approved transparent zipper pouch with 2B dark pencils, non-dust erasers & metallic compass.',
    fullDescription: 'Complete board exam stationery kit bundled with dark 2B writing pencils, non-marking erasers, ruler, protractor, and a sturdy metallic compass set inside a transparent regulation zipper pouch.',
    featuredImage: 'https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&q=80&w=800'],
    categoryId: 'cat-geometry',
    categoryName: 'Geometry Instruments',
    brandId: 'brand-apsara',
    brandName: 'Apsara Stationery',
    publisher: 'Hindustan Pencils',
    class: 'Class 10',
    subject: 'Mathematics',
    price: 149,
    originalPrice: 199,
    discountPercent: 25,
    rating: 4.8,
    ratingCount: 82,
    stockStatus: 'IN_STOCK',
    tags: ['Stationery', 'Apsara', 'Geometry Box', 'Board Exam', 'Exam Kit'],
    whySunshineRecommends: 'Board examination halls require clear transparent pouches and extra dark pencils for OMR answer sheets. This complete kit avoids last-minute panic.',
    keyFeatures: [
      '10 Apsara Absolute Extra Dark Pencils for clear optical reading',
      'Transparent zipper pouch compliant with admit card regulations',
      'Heavy-duty metallic compass for precise circle and arc constructions'
    ],
    specifications: { 'Contents': '10 Pencils, 2 Erasers, 1 Sharpener, Geometry Box, Transparent Pouch' },
    isFeatured: false,
    isTrending: true,
    isStaffPick: false,
    isNewArrival: true,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-aps-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B08K112244', displayOrder: 1, active: true, clickCount: 82 }
    ],
    seoTitle: 'Apsara Board Exam Kit & Geometry Box - Sunshine Store',
    metaDescription: 'Get board-compliant stationery kit with dark pencils and geometry set for Class 10 exams.',
    keywords: ['Apsara Stationery Kit', 'Board Exam Pencils', 'Geometry Box Class 10'],
    canonicalUrl: 'https://sunshineclasses.in/resources/apsara-board-exam-stationery-kit',
    status: 'PUBLISHED',
    viewsCount: 520,
    totalClicks: 82,
    createdAt: '2026-06-18T08:30:00Z',
    updatedAt: '2026-07-21T15:00:00Z'
  },
  {
    id: 'prod-res-pomodoro-timer',
    type: 'Resource',
    title: 'Digital Countdown Study Timer & Pomodoro Stopwatch for Exam Practice',
    slug: 'digital-pomodoro-study-timer',
    shortDescription: 'Loud alarm magnetic countdown timer to train 3-hour speed solving & 25-minute study sprints.',
    fullDescription: 'Train yourself to finish 3-hour board exam question papers on time! This digital desktop timer features large LCD numbers, silent visual flash alerts, magnetic back, and dual countdown/stopwatch modes.',
    featuredImage: 'https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?auto=format&fit=crop&q=80&w=800',
    gallery: ['https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?auto=format&fit=crop&q=80&w=800'],
    categoryId: 'cat-student-essentials',
    categoryName: 'Student Essentials',
    brandId: 'brand-casio',
    brandName: 'Casio',
    class: 'Class 10',
    subject: 'All Subjects',
    price: 249,
    originalPrice: 349,
    discountPercent: 28,
    rating: 4.9,
    ratingCount: 135,
    stockStatus: 'IN_STOCK',
    tags: ['Exam Essentials', 'Study Timer', 'Pomodoro', 'Mock Test', 'Time Management'],
    whySunshineRecommends: 'Many high-scoring students lose marks simply because of poor time distribution during the last section. Practicing sample papers with a desktop countdown timer builds automatic pacing.',
    keyFeatures: [
      'Large readable LCD screen display',
      'Dual modes: Count-up stopwatch & Count-down timer (up to 99 hrs)',
      'Silent Mute option with flashing LED light for quiet library study'
    ],
    specifications: { 'Display': 'Digital LCD', 'Mount': 'Magnetic / Table Stand', 'Battery': 'AAA Battery' },
    isFeatured: true,
    isTrending: true,
    isStaffPick: true,
    isNewArrival: true,
    isMostRecommended: true,
    purchaseLinks: [
      { id: 'link-pomo-amz', platform: 'Amazon', url: 'https://amazon.in/dp/B09Z887766', displayOrder: 1, active: true, clickCount: 135 }
    ],
    seoTitle: 'Digital Pomodoro Study Timer for Exam Pacing - Sunshine Store',
    metaDescription: 'Train speed and time management for board exams with digital countdown study timer.',
    keywords: ['Study Timer for Students', 'Pomodoro Timer', 'Board Exam Time Management'],
    canonicalUrl: 'https://sunshineclasses.in/resources/digital-pomodoro-study-timer',
    status: 'PUBLISHED',
    viewsCount: 790,
    totalClicks: 135,
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-07-22T17:00:00Z'
  }
];

export const DEFAULT_STORE_SETTINGS: StoreSetting = {
  storeName: 'Sunshine Store • Books & Resources',
  storeDescription: 'Curated educational textbook recommendations, board exam question banks, and ergonomic study setup resources handpicked by Sunshine Classes faculty.',
  defaultCtaText: 'View Purchase Deals',
  affiliateDisclosure: 'Disclosure: Sunshine Classes may earn a small affiliate commission when you purchase books or resources through external store links at no extra cost to you. We only recommend items our faculty and board toppers trust.',
  defaultSeoTitle: 'Sunshine Store - Recommended Books & Study Resources | Sunshine Classes Pihani',
  defaultMetaDescription: 'Browse curated Class 10 & 9 RD Sharma books, Arihant guidebooks, NCERT exemplars, LED study lamps, and stationery kits.',
  socialSharingDefaults: {
    ogTitle: 'Sunshine Store • Best Books & Resources for High School Excellence',
    ogImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
  }
};

// Local Storage Fallback Keys
const LOCAL_STORE_PRODUCTS_KEY = 'sunshine_store_products_v1';
const LOCAL_STORE_CATEGORIES_KEY = 'sunshine_store_categories_v1';
const LOCAL_STORE_BRANDS_KEY = 'sunshine_store_brands_v1';
const LOCAL_STORE_SETTINGS_KEY = 'sunshine_store_settings_v1';
const LOCAL_STORE_ANALYTICS_KEY = 'sunshine_store_analytics_v1';

// Helper: Read Local Cache or Seed
export function getLocalStoreProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LOCAL_STORE_PRODUCTS_KEY, JSON.stringify(DEFAULT_STORE_PRODUCTS));
    return DEFAULT_STORE_PRODUCTS;
  } catch (e) {
    return DEFAULT_STORE_PRODUCTS;
  }
}

export function saveLocalStoreProducts(products: StoreProduct[]) {
  try {
    localStorage.setItem(LOCAL_STORE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving local store products', e);
  }
}

export function getLocalStoreCategories(): StoreCategory[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LOCAL_STORE_CATEGORIES_KEY, JSON.stringify(DEFAULT_STORE_CATEGORIES));
    return DEFAULT_STORE_CATEGORIES;
  } catch (e) {
    return DEFAULT_STORE_CATEGORIES;
  }
}

export function saveLocalStoreCategories(categories: StoreCategory[]) {
  try {
    localStorage.setItem(LOCAL_STORE_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving store categories', e);
  }
}

export function getLocalStoreBrands(): StoreBrand[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_BRANDS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LOCAL_STORE_BRANDS_KEY, JSON.stringify(DEFAULT_STORE_BRANDS));
    return DEFAULT_STORE_BRANDS;
  } catch (e) {
    return DEFAULT_STORE_BRANDS;
  }
}

export function saveLocalStoreBrands(brands: StoreBrand[]) {
  try {
    localStorage.setItem(LOCAL_STORE_BRANDS_KEY, JSON.stringify(brands));
  } catch (e) {
    console.error('Error saving store brands', e);
  }
}

export function getLocalStoreSettings(): StoreSetting {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LOCAL_STORE_SETTINGS_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
    return DEFAULT_STORE_SETTINGS;
  } catch (e) {
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveLocalStoreSettings(settings: StoreSetting) {
  try {
    localStorage.setItem(LOCAL_STORE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving store settings', e);
  }
}

export function getLocalStoreAnalytics(): StoreAnalyticsLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_ANALYTICS_KEY);
    if (raw) return JSON.parse(raw);
    return [];
  } catch (e) {
    return [];
  }
}

export function recordStoreEvent(log: Omit<StoreAnalyticsLog, 'id' | 'timestamp' | 'date'>) {
  try {
    const id = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const fullLog: StoreAnalyticsLog = { ...log, id, timestamp, date };

    const logs = getLocalStoreAnalytics();
    logs.unshift(fullLog);
    // Keep max 500 logs locally
    localStorage.setItem(LOCAL_STORE_ANALYTICS_KEY, JSON.stringify(logs.slice(0, 500)));

    // Sync to Supabase asynchronously if configured
    if (isSupabaseConfigured) {
      supabase.from('store_analytics').insert(fullLog).then().catch(() => {});
    }
  } catch (e) {
    // Silent catch
  }
}

// Increment Product View Count
export async function trackProductView(productId: string, productTitle?: string, type?: StoreProductType) {
  try {
    const products = getLocalStoreProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx].viewsCount = (products[idx].viewsCount || 0) + 1;
      saveLocalStoreProducts(products);
    }
    // Record log
    recordStoreEvent({
      productId,
      productTitle,
      productType: type,
      eventType: 'VIEW'
    });

    if (isSupabaseConfigured && idx !== -1) {
      supabase.from('store_products').update({ views_count: products[idx].viewsCount }).eq('id', productId).then().catch(() => {});
    }
  } catch (e) {
    // Ignore
  }
}

// Track Purchase Link Click
export async function trackExternalClick(productId: string, linkId: string, platform: string, productTitle?: string, type?: StoreProductType) {
  try {
    const products = getLocalStoreProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx].totalClicks = (products[idx].totalClicks || 0) + 1;
      const lIdx = products[idx].purchaseLinks.findIndex(l => l.id === linkId);
      if (lIdx !== -1) {
        products[idx].purchaseLinks[lIdx].clickCount = (products[idx].purchaseLinks[lIdx].clickCount || 0) + 1;
      }
      saveLocalStoreProducts(products);
    }

    recordStoreEvent({
      productId,
      productTitle,
      productType: type,
      eventType: 'CLICK',
      platform
    });

    if (isSupabaseConfigured && idx !== -1) {
      supabase.from('store_products').update({ total_clicks: products[idx].totalClicks }).eq('id', productId).then().catch(() => {});
    }
  } catch (e) {
    // Ignore
  }
}

// Add Review to Product
export async function addStoreReview(productId: string, review: Omit<StoreReview, 'id'>): Promise<StoreProduct[]> {
  const products = getLocalStoreProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    const newReview: StoreReview = {
      ...review,
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5)
    };
    const currentReviews = products[idx].reviews || [];
    products[idx].reviews = [newReview, ...currentReviews];
    products[idx].updatedAt = new Date().toISOString();
    saveLocalStoreProducts(products);

    if (isSupabaseConfigured) {
      supabase.from('store_products').update({ reviews: products[idx].reviews, updated_at: products[idx].updatedAt }).eq('id', productId).then().catch(() => {});
    }
  }
  return products;
}

// Update Review for Product
export async function updateStoreReview(productId: string, reviewId: string, updated: Partial<StoreReview>): Promise<StoreProduct[]> {
  const products = getLocalStoreProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1 && products[idx].reviews) {
    products[idx].reviews = products[idx].reviews!.map(r => r.id === reviewId ? { ...r, ...updated } : r);
    products[idx].updatedAt = new Date().toISOString();
    saveLocalStoreProducts(products);

    if (isSupabaseConfigured) {
      supabase.from('store_products').update({ reviews: products[idx].reviews, updated_at: products[idx].updatedAt }).eq('id', productId).then().catch(() => {});
    }
  }
  return products;
}

// Delete Review from Product
export async function deleteStoreReview(productId: string, reviewId: string): Promise<StoreProduct[]> {
  const products = getLocalStoreProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1 && products[idx].reviews) {
    products[idx].reviews = products[idx].reviews!.filter(r => r.id !== reviewId);
    products[idx].updatedAt = new Date().toISOString();
    saveLocalStoreProducts(products);

    if (isSupabaseConfigured) {
      supabase.from('store_products').update({ reviews: products[idx].reviews, updated_at: products[idx].updatedAt }).eq('id', productId).then().catch(() => {});
    }
  }
  return products;
}

// Bulk update products
export async function bulkUpdateProducts(productIds: string[], updates: Partial<StoreProduct>): Promise<StoreProduct[]> {
  const products = getLocalStoreProducts();
  const updatedProducts = products.map(p => {
    if (productIds.includes(p.id)) {
      return {
        ...p,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });
  saveLocalStoreProducts(updatedProducts);

  if (isSupabaseConfigured) {
    for (const pid of productIds) {
      supabase.from('store_products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pid).then().catch(() => {});
    }
  }
  return updatedProducts;
}

// Bulk delete products
export async function bulkDeleteProducts(productIds: string[]): Promise<StoreProduct[]> {
  const products = getLocalStoreProducts();
  const remaining = products.filter(p => !productIds.includes(p.id));
  saveLocalStoreProducts(remaining);

  if (isSupabaseConfigured) {
    for (const pid of productIds) {
      supabase.from('store_products').delete().eq('id', pid).then().catch(() => {});
    }
  }
  return remaining;
}

// Export Products to CSV
export function exportProductsToCSV(products: StoreProduct[]): string {
  const headers = ['ID', 'Title', 'Slug', 'Type', 'CategoryName', 'BrandName', 'Publisher', 'Author', 'Class', 'Subject', 'Status', 'Views', 'Clicks', 'FeaturedImage', 'PurchaseLinksCount'];
  const rows = products.map(p => [
    p.id,
    `"${(p.title || '').replace(/"/g, '""')}"`,
    `"${(p.slug || '').replace(/"/g, '""')}"`,
    p.type,
    `"${(p.categoryName || '').replace(/"/g, '""')}"`,
    `"${(p.brandName || '').replace(/"/g, '""')}"`,
    `"${(p.publisher || '').replace(/"/g, '""')}"`,
    `"${(p.author || '').replace(/"/g, '""')}"`,
    `"${(p.class || '').replace(/"/g, '""')}"`,
    `"${(p.subject || '').replace(/"/g, '""')}"`,
    p.status,
    p.viewsCount || 0,
    p.totalClicks || 0,
    `"${(p.featuredImage || '').replace(/"/g, '""')}"`,
    p.purchaseLinks?.length || 0
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Subscribe to Products with Realtime Supabase + Local fallback
export function subscribeStoreProducts(onUpdate: (products: StoreProduct[]) => void) {
  const local = getLocalStoreProducts();
  onUpdate(local);

  if (isSupabaseConfigured) {
    supabase.from('store_products').select('*').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        saveLocalStoreProducts(data as StoreProduct[]);
        onUpdate(data as StoreProduct[]);
      }
    }).catch(() => {});
  }

  return () => {};
}

// Seed Store to Supabase
export async function seedStoreToFirestore() {
  if (!isSupabaseConfigured) return;
  try {
    for (const prod of DEFAULT_STORE_PRODUCTS) {
      await supabase.from('store_products').upsert(prod);
    }
    for (const cat of DEFAULT_STORE_CATEGORIES) {
      await supabase.from('store_categories').upsert(cat);
    }
    for (const brand of DEFAULT_STORE_BRANDS) {
      await supabase.from('store_brands').upsert(brand);
    }
  } catch (e) {
    console.warn('Store seeding notice:', e);
  }
}

// Sample Initial Orders
export const DEFAULT_STORE_ORDERS: StoreOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-2026-1001',
    customerName: 'Amit Kumar',
    customerEmail: 'amit.kumar@gmail.com',
    customerPhone: '9876543210',
    studentRollNo: '1002',
    items: [
      {
        productId: 'prod-book-rd-sharma-10',
        productTitle: 'Class 10 RD Sharma Mathematics (Latest Edition 2026–27)',
        quantity: 1,
        unitPrice: 499,
        totalPrice: 499,
        featuredImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
      }
    ],
    totalAmount: 499,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    deliveryAddress: 'House #42, Civil Lines, Kanpur, UP',
    notes: 'Please handover directly to student during evening batch.',
    createdAt: '2026-07-28T14:20:00Z',
    updatedAt: '2026-07-28T14:20:00Z'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-2026-1002',
    customerName: 'Sunita Verma',
    customerEmail: 'sunita.v@gmail.com',
    customerPhone: '9812345678',
    studentRollNo: '1015',
    items: [
      {
        productId: 'prod-book-arihant-all-in-one-10',
        productTitle: 'Class 10 Arihant All In One Science CBSE (2026 Exam)',
        quantity: 1,
        unitPrice: 380,
        totalPrice: 380,
        featuredImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'
      }
    ],
    totalAmount: 380,
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    deliveryAddress: 'Flat 302, Green Valley Apartments, Kanpur, UP',
    notes: 'Express delivery required for upcoming weekly test.',
    createdAt: '2026-07-29T10:15:00Z',
    updatedAt: '2026-07-30T11:00:00Z'
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-2026-1003',
    customerName: 'Rajesh Patel',
    customerEmail: 'rajesh.patel@yahoo.com',
    customerPhone: '9988776655',
    studentRollNo: '1008',
    items: [
      {
        productId: 'prod-book-s-chand-physics-9',
        productTitle: 'Class 9 Physics Foundation for Olympiad & NTSE by S. Chand',
        quantity: 1,
        unitPrice: 320,
        totalPrice: 320,
        featuredImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
      }
    ],
    totalAmount: 320,
    paymentStatus: 'PENDING',
    orderStatus: 'NEW',
    deliveryAddress: 'Shop No 12, Main Market, Kanpur, UP',
    notes: 'Cash payment pending at institute reception.',
    createdAt: '2026-07-31T16:45:00Z',
    updatedAt: '2026-07-31T16:45:00Z'
  }
];

const STORE_ORDERS_KEY = 'sunshine_store_orders_v1';

export function getLocalStoreOrders(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(STORE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORE_ORDERS_KEY, JSON.stringify(DEFAULT_STORE_ORDERS));
      return DEFAULT_STORE_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_STORE_ORDERS;
  }
}

export function saveLocalStoreOrders(orders: StoreOrder[]): void {
  try {
    localStorage.setItem(STORE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Failed saving local store orders:', e);
  }
}

export function subscribeStoreOrders(onUpdate: (orders: StoreOrder[]) => void) {
  const local = getLocalStoreOrders();
  onUpdate(local);

  if (isSupabaseConfigured) {
    supabase.from('store_orders').select('*').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        saveLocalStoreOrders(data as StoreOrder[]);
        onUpdate(data as StoreOrder[]);
      }
    }).catch(() => {});
  }

  return () => {};
}

export async function createStoreOrder(orderData: Omit<StoreOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoreOrder> {
  const orders = getLocalStoreOrders();
  const id = `ord-${Date.now()}`;
  const now = new Date().toISOString();
  const newOrder: StoreOrder = {
    ...orderData,
    id,
    createdAt: now,
    updatedAt: now
  };
  const updatedOrders = [newOrder, ...orders];
  saveLocalStoreOrders(updatedOrders);

  if (isSupabaseConfigured) {
    supabase.from('store_orders').insert(newOrder).then().catch(() => {});
  }

  return newOrder;
}

export async function updateStoreOrderStatus(
  orderId: string, 
  orderStatus?: StoreOrder['orderStatus'], 
  paymentStatus?: StoreOrder['paymentStatus']
): Promise<StoreOrder[]> {
  const orders = getLocalStoreOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      return {
        ...ord,
        ...(orderStatus ? { orderStatus } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        updatedAt: new Date().toISOString()
      };
    }
    return ord;
  });
  saveLocalStoreOrders(updated);

  if (isSupabaseConfigured) {
    const updates: Partial<StoreOrder> = { updatedAt: new Date().toISOString() };
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    supabase.from('store_orders').update(updates).eq('id', orderId).then().catch(() => {});
  }

  return updated;
}
