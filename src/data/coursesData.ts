/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FacultyMember {
  name: string;
  role: string;
  exp: string;
  edu: string;
}

export interface DetailedSubject {
  name: string;
  topics: string[];
  hoursPerWeek: string;
}

export interface CourseHighlight {
  title: string;
  desc: string;
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface UniversalCourse {
  id: string;
  slug: string; // 'class-1' ... 'class-10'
  classNumber: number;
  className: string; // 'Class 1' ... 'Class 10'
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  monthlyFee: number;
  monthlyFeeFormatted: string;
  quarterlyFee: number; // 3 months with discount
  halfYearlyFee: number; // 6 months with discount
  yearlyFee: number; // 12 months with discount
  feePeriod: string;
  duration: string;
  timing: string;
  batchSize: string;
  board: string;
  subjects: string[];
  shortDescription: string;
  fullDescription: string;
  highlights: CourseHighlight[];
  subjectsDetailed: DetailedSubject[];
  features: string[];
  whySunshine: string[];
  faculty: FacultyMember[];
  faqs: CourseFAQ[];
  metaTitle: string;
  metaDescription: string;
  // CMS Fields
  isFeatured?: boolean;
  academicLevel?: 'primary' | 'middle' | 'board';
  displayOrder?: number;
  status?: 'PUBLISHED' | 'DRAFT';
}

export const OFFICIAL_FEE_STRUCTURE = {
  PRIMARY: { range: 'Class 1-4', monthlyFee: 500, label: '₹500/month' },
  MIDDLE: { range: 'Class 5-8', monthlyFee: 700, label: '₹700/month' },
  CLASS_9: { range: 'Class 9', monthlyFee: 1000, label: '₹1,000/month' },
  CLASS_10: { range: 'Class 10', monthlyFee: 1200, label: '₹1,200/month' }
};

export const UNIVERSAL_COURSES: UniversalCourse[] = [
  {
    id: 'class-1',
    slug: 'class-1',
    classNumber: 1,
    className: 'Class 1',
    title: 'Class 1 Early Learning & Foundational Skills Program',
    subtitle: 'Nurture reading fluency, number sense, and active curiosity with patient, activity-based primary education.',
    badge: 'Junior Primary',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    monthlyFee: 500,
    monthlyFeeFormatted: '₹500',
    quarterlyFee: 1400,
    halfYearlyFee: 2700,
    yearlyFee: 5200,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '02:00 PM to 03:30 PM',
    batchSize: '20 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Basic Mathematics & Counting', 'English Phonics & Handwriting', 'Environmental Studies (EVS)', 'Hindi Alphabet & Word Building'],
    shortDescription: 'Gentle, activity-driven teaching for Class 1 children focused on phonics, handwriting, elementary math, and interactive storytelling.',
    fullDescription: 'Our Class 1 Early Learning program provides young learners in Pihani with a joyful, structured academic start. We emphasize correct pencil grip, phonics-based English reading, number identification, simple addition/subtraction, and basic Hindi vocabulary in a supportive environment.',
    highlights: [
      { title: 'Phonics & Reading Drills', desc: 'Step-by-step sound decoding for confident early reading.' },
      { title: 'Visual Math & Number Sense', desc: 'Counting blocks and visual charts for solid arithmetic intuition.' },
      { title: 'Neat Handwriting Guidance', desc: 'Pattern tracing and daily handwriting refinement.' },
      { title: 'Warm & Caring Mentors', desc: 'Patient teachers trained in early childhood education.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics & Counting',
        topics: ['Numbers 1 to 100 & Place Values', 'Single Digit Addition & Subtraction', 'Shapes, Patterns & Comparisons', 'Basic Money & Time Concepts'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'English & Phonics',
        topics: ['Alphabet Sounds & CVC Word Blending', 'Basic Sight Words & Sentence Reading', 'Capital & Small Letter Cursive Writing', 'Short Story Recitation'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'EVS & Hindi',
        topics: ['My Self, Family & Body Parts', 'Plants, Animals & Environment', 'Hindi Swar & Vyanjan', 'Two & Three Letter Hindi Words'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Color-illustrated practice workbooks and trace sheets',
      'Child-safe, clean, air-conditioned classroom environment',
      'Regular oral quizzes and visual learning aids',
      'Direct WhatsApp parent updates on attendance and daily work'
    ],
    whySunshine: [
      'Gentle transition into formal schooling without study stress.',
      'Affordable official fee of ₹500/month with no hidden registration costs.',
      'Small batch limits ensure individual care for every young child.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Primary Wing Coordinator', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' }
    ],
    faqs: [
      {
        question: 'What is the monthly fee for Class 1 tuition at Sunshine Classes?',
        answer: 'The official fee for Class 1 is ₹500 per month. All study activity sheets and practice tests are included.'
      },
      {
        question: 'What are the batch timings for Class 1?',
        answer: 'Class 1 batch runs daily from 02:00 PM to 03:30 PM to align with primary school closing hours.'
      }
    ],
    metaTitle: 'Class 1 Tuition & Primary Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Enroll your child in Class 1 tuition at Sunshine Classes Pihani. Official ₹500/month fee, phonics, math counting & handwriting. Call 8707738284.'
  },
  {
    id: 'class-2',
    slug: 'class-2',
    classNumber: 2,
    className: 'Class 2',
    title: 'Class 2 Foundational Numeracy & Literacy Program',
    subtitle: 'Strengthen reading comprehension, multi-digit addition, basic tables, and environmental awareness.',
    badge: 'Junior Primary',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    monthlyFee: 500,
    monthlyFeeFormatted: '₹500',
    quarterlyFee: 1400,
    halfYearlyFee: 2700,
    yearlyFee: 5200,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '02:00 PM to 03:30 PM',
    batchSize: '20 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics & Multiplication Tables', 'English Grammar & Reading', 'EVS & Natural Science', 'Hindi Matra & Sentence Writing'],
    shortDescription: 'Interactive primary tuition for Class 2 students covering tables, word addition/subtraction, English grammar, and environmental science.',
    fullDescription: 'Our Class 2 program expands early literacy into confident independent reading and multi-digit arithmetic. We help students master tables 2 to 10, form correct English sentences, understand nature around them, and build daily study habits.',
    highlights: [
      { title: 'Multiplication & Mental Math', desc: 'Rhythmic table memorization and mental addition drills.' },
      { title: 'Sentence Framing & Grammar', desc: 'Nouns, verbs, plurals, and clean sentence construction.' },
      { title: 'Nature & EVS Exploration', desc: 'Understanding weather, seasons, community helpers, and health.' },
      { title: 'Interactive Worksheets', desc: 'Engaging visual homework assignments that build confidence.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Numbers up to 1000 & Expanded Form', '2-Digit Addition & Subtraction with Borrowing', 'Tables 2 to 10 & Basic Multiplication', 'Measurement of Length, Weight & Capacity'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'English Grammar & Prose',
        topics: ['Nouns, Pronouns & Verbs', 'Articles (A, An, The) & Prepositions', 'Reading Short Paragraphs & Comprehension', 'Spelling Building & Dictation'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'EVS & Hindi',
        topics: ['Our Food, Clothes & Shelter', 'Air, Water, Weather & Seasons', 'Hindi Matra Practice & Anuchhed Lekhan', 'Story Comprehension'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Comprehensive workbook materials provided every month',
      'Weekly oral recitation and mental math rounds',
      'Regular parent feedback on reading speed and handwriting'
    ],
    whySunshine: [
      'Helps children overcome math hesitation early.',
      'Strictly official ₹500/month fee with complete transparency.',
      'Dedicated primary teachers with years of classroom experience.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Primary Wing Coordinator', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' }
    ],
    faqs: [
      {
        question: 'What is the tuition fee for Class 2 at Sunshine Classes?',
        answer: 'The official fee for Class 2 is ₹500/month across all subjects.'
      }
    ],
    metaTitle: 'Class 2 Tuition & Primary Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Class 2 tuition classes in Pihani at Sunshine Classes. Official ₹500/month fee, strong foundation in Maths, English & EVS. Call 8707738284.'
  },
  {
    id: 'class-3',
    slug: 'class-3',
    classNumber: 3,
    className: 'Class 3',
    title: 'Class 3 Primary Core Skills & Concept Building Program',
    subtitle: 'Transition into structured multi-subject learning with 3-digit arithmetic, basic division, and scientific reasoning.',
    badge: 'Primary Wing',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    monthlyFee: 500,
    monthlyFeeFormatted: '₹500',
    quarterlyFee: 1400,
    halfYearlyFee: 2700,
    yearlyFee: 5200,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '02:00 PM to 03:30 PM',
    batchSize: '20 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics & Basic Division', 'General Science & Living World', 'English Grammar & Composition', 'Social Science & Geography Basics'],
    shortDescription: 'Comprehensive Class 3 tuition covering 3-digit math operations, division, living vs non-living science, and English composition.',
    fullDescription: 'In Class 3, academic expectations expand into formal subject boundaries. At Sunshine Classes, we ensure students transition smoothly into multiplication, division, basic geometry, science concepts, and structured paragraph writing with clear, step-by-step explanations.',
    highlights: [
      { title: 'Division & Multiplication Mastery', desc: 'Understanding equal grouping, division steps, and tables up to 15.' },
      { title: 'Scientific Observation Skills', desc: 'Parts of plants, animal habitats, human body systems, and matter.' },
      { title: 'Grammar & Essay Basics', desc: 'Tenses, adjectives, conjunctions, and short composition writing.' },
      { title: 'Weekly Assessment Quizzes', desc: 'Bi-weekly tests to build exam habit without fear.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['4-Digit Numbers & Place Value', 'Addition & Subtraction Word Problems', 'Multiplication & Equal Division', 'Fractions Intro, Time, Calendar & Geometry'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'General Science',
        topics: ['Living & Non-Living Things', 'Parts of a Plant & Bird Habits', 'Our Body Systems & Food We Eat', 'Safety, First Aid & Weather'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'English & Social Science',
        topics: ['Nouns, Verbs, Adjectives & Tenses', 'Paragraph & Letter Writing', 'Our Earth, Continents & Solar System', 'Community Helpers & Transportation'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Chapter-wise practice sheets and mental arithmetic tests',
      'Friendly classroom atmosphere encouraging student questions',
      'Monthly progress card shared with parents'
    ],
    whySunshine: [
      'Builds logical thinking and multi-subject curiosity.',
      'Affordable official fee of ₹500/month for all subjects.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Primary Faculty', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' }
    ],
    faqs: [
      {
        question: 'How much is the Class 3 monthly fee at Sunshine Classes?',
        answer: 'The official fee for Class 3 is ₹500 per month with complete study material included.'
      }
    ],
    metaTitle: 'Class 3 Tuition & Primary Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Enroll in Class 3 primary tuition at Sunshine Classes Pihani. Official ₹500/month fee, expert Math, Science & English guidance. Call 8707738284.'
  },
  {
    id: 'class-4',
    slug: 'class-4',
    classNumber: 4,
    className: 'Class 4',
    title: 'Class 4 Upper Primary Mastery & Aptitude Program',
    subtitle: 'Prepare for middle school rigor with multi-digit operations, fractions, metric units, and advanced grammar.',
    badge: 'Primary Wing',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    monthlyFee: 500,
    monthlyFeeFormatted: '₹500',
    quarterlyFee: 1400,
    halfYearlyFee: 2700,
    yearlyFee: 5200,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '02:00 PM to 03:30 PM',
    batchSize: '20 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics (Fractions & Decimals)', 'Science (Energy, Matter & Ecosystems)', 'English Grammar & Reading', 'Social Studies (India & Physical Features)'],
    shortDescription: 'Class 4 tuition program sharpening multi-step math problems, fractions, physical science, and formal English grammar.',
    fullDescription: 'Class 4 is the capstone year of primary education. Our curriculum strengthens problem-solving speed, multi-digit division, equivalent fractions, environmental science, and structured English grammar, preparing students for smooth middle school entry.',
    highlights: [
      { title: 'Fractions & Metric System', desc: 'Understanding numerator/denominator, unit conversions, and perimeter.' },
      { title: 'Science & Matter Concepts', desc: 'States of matter, force, work, energy, soil, and solar system.' },
      { title: 'Grammar & Writing Skills', desc: 'Direct speech basics, tenses, formal paragraph and story writing.' },
      { title: 'Regular Unit Quizzes', desc: 'Comprehensive practice tests matching school evaluation patterns.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Large Numbers up to 6 Digits', 'Multi-Digit Division & Factors/Multiples', 'Fractions & Decimal Introduction', 'Geometry, Perimeter, Area & Metric Units'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'Science',
        topics: ['Food, Digestion & Teeth', 'Adaptations in Plants & Animals', 'Solids, Liquids & Gases', 'Force, Work, Energy & Simple Machines'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'English & Social Studies',
        topics: ['Advanced Tenses & Adverbs', 'Prepositions & Conjunctions', 'Physical Divisions of India', 'Our Rights, Duties & Heritage'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Comprehensive study notes printed in easy-to-understand language',
      'Weekly unit tests with detailed paper review and correction',
      'Disciplined classroom setting with 100% safety and monitoring'
    ],
    whySunshine: [
      'Prepares students for top rank performance in school exams.',
      'Affordable official fee of ₹500/month with zero extra costs.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Primary Wing Incharge', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' }
    ],
    faqs: [
      {
        question: 'What is the Class 4 tuition fee at Sunshine Classes?',
        answer: 'The official fee for Class 4 is ₹500 per month covering Math, Science, English, and Social Studies.'
      }
    ],
    metaTitle: 'Class 4 Tuition & Primary Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Enroll in Class 4 primary tuition at Sunshine Classes Pihani. Official ₹500/month fee, expert Math & Science coaching. Call 8707738284.'
  },
  {
    id: 'class-5',
    slug: 'class-5',
    classNumber: 5,
    className: 'Class 5',
    title: 'Class 5 Middle Prep & Conceptual Foundation Program',
    subtitle: 'Bridge primary education with middle school science and math through analytical reasoning and structured problem solving.',
    badge: 'Middle Prep',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    monthlyFee: 700,
    monthlyFeeFormatted: '₹700',
    quarterlyFee: 2000,
    halfYearlyFee: 3900,
    yearlyFee: 7500,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '03:00 PM to 04:30 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics (HCF, LCM & Decimals)', 'General Science (Physics & Biology Intro)', 'English Grammar & Vocabulary', 'Social Science & World Geography'],
    shortDescription: 'Class 5 middle prep program sharpening factors, HCF/LCM, decimals, elementary physics, and English vocabulary.',
    fullDescription: 'Class 5 marks the official gateway into middle school academia. Our program focuses on HCF and LCM, fraction operations, decimal conversions, percentage basics, plant/animal physiology, and clear grammatical sentence composition.',
    highlights: [
      { title: 'HCF, LCM & Fraction Mastery', desc: 'Deep numerical drill in factors, prime factorization, and fraction algebra.' },
      { title: 'Science & Human Physiology', desc: 'Circulatory and nervous system basics, rocks, minerals, and atmosphere.' },
      { title: 'Grammar & Active Vocabulary', desc: 'Parts of speech, sentence transformation, and comprehension passages.' },
      { title: 'Small Group Attention', desc: 'Maximum 25 students per batch for dedicated teacher guidance.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Factors, Multiples, HCF & LCM', 'Fractions & Decimal Operations', 'Percentages, Profit & Loss Intro', 'Geometry, Angles, Triangles & Volume'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'General Science',
        topics: ['Human Body Systems & Health', 'Plants & Animal Reproduction', 'Matter, Force, Work & Energy', 'Earthy Atmosphere, Rocks & Minerals'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'English & Social Science',
        topics: ['Tenses, Active-Passive Intro', 'Formal Notice & Letter Writing', 'Globe, Maps & Climatic Zones', 'Freedom Struggle History Basics'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Comprehensive study materials and formula sheets provided',
      'Bi-weekly unit tests with detailed report cards',
      'Air-conditioned smart classroom equipped with digital tools'
    ],
    whySunshine: [
      'Builds top-ranking performance in school term examinations.',
      'Affordable official fee of ₹700/month with quarterly/annual discounts.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Middle Wing Faculty', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' },
      { name: 'S. Singh', role: 'Science Faculty', exp: '7+ Years Experience', edu: 'M.Sc' }
    ],
    faqs: [
      {
        question: 'What is the monthly fee for Class 5 at Sunshine Classes?',
        answer: 'The official fee for Class 5 is ₹700 per month across all subjects.'
      }
    ],
    metaTitle: 'Class 5 Tuitions & Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Class 5 coaching classes in Pihani at Sunshine Classes. Official ₹700/month fee, strong foundational learning in Maths & Science. Call 8707738284.'
  },
  {
    id: 'class-6',
    slug: 'class-6',
    classNumber: 6,
    className: 'Class 6',
    title: 'Class 6 Junior Foundation & Skill Building Program',
    subtitle: 'Gentle, patience-driven guidance to instill arithmetic confidence, reading habits, and academic discipline.',
    badge: 'Junior Foundation',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    monthlyFee: 700,
    monthlyFeeFormatted: '₹700',
    quarterlyFee: 2000,
    halfYearlyFee: 3900,
    yearlyFee: 7500,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '02:00 PM to 03:30 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics & Mental Math', 'Science & General Awareness', 'English Grammar & Reading'],
    shortDescription: 'Patience-driven foundational teaching to develop arithmetic confidence, reading habits, and scientific curiosity.',
    fullDescription: 'The transition from primary to middle school can be challenging. Our Class 6 Junior Foundation program provides encouraging guidance that builds core reading habits, elementary algebra, fractions, integers, and curiosity about natural science.',
    highlights: [
      { title: 'Gentle & Patient Faculty', desc: 'Specially trained teachers who encourage curiosity and eliminate fear.' },
      { title: 'Mental Math Fundamentals', desc: 'Integers, quick arithmetic, and word problem decoding.' },
      { title: 'Reading & Writing Skills', desc: 'Daily oral reading practice and sentence forming.' },
      { title: 'Focused Batch Size', desc: 'Limited to 25 students for close personal mentoring.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Knowing Our Numbers & Whole Numbers', 'Playing with Numbers & Basic Geometry', 'Integers, Decimals & Fractions', 'Data Handling, Mensuration & Algebra'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'Science',
        topics: ['Components of Food', 'Sorting Materials & Separation', 'Getting to Know Plants & Body Movements', 'Motion, Light, Electricity & Magnets'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'English Grammar',
        topics: ['Nouns, Verbs, Articles, Punctuation', 'Spelling Drills & Vocabulary', 'Basic Paragraph & Letter Writing'],
        hoursPerWeek: '2 Hours / Week'
      }
    ],
    features: [
      'Printed activity sheets & practice workbooks',
      'Safe, welcoming classroom environment with comfortable seating',
      'Monthly progress reports given directly to parents'
    ],
    whySunshine: [
      'Ensures your child establishes strong study habits from an early age.',
      'Official ₹700/month fee with complete fee transparency.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Junior Wing Faculty', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' }
    ],
    faqs: [
      {
        question: 'What is the Class 6 monthly fee at Sunshine Classes?',
        answer: 'The official fee for Class 6 is ₹700 per month.'
      },
      {
        question: 'How do you help young Class 6 students who feel nervous?',
        answer: 'We maintain a warm, friendly classroom environment where every child is encouraged to ask questions without hesitation.'
      }
    ],
    metaTitle: 'Class 6 Coaching & Tuitions in Pihani | Sunshine Classes',
    metaDescription: 'Enroll your child in Class 6 Junior Foundation at Sunshine Classes Pihani. Official ₹700/month fee, patient teachers, small batch size. Call 8707738284.'
  },
  {
    id: 'class-7',
    slug: 'class-7',
    classNumber: 7,
    className: 'Class 7',
    title: 'Class 7 Middle School Concept Building Program',
    subtitle: 'Nurture curiosity, strong calculation habits, and sentence precision during middle school development.',
    badge: 'Middle School',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    monthlyFee: 700,
    monthlyFeeFormatted: '₹700',
    quarterlyFee: 2000,
    halfYearlyFee: 3900,
    yearlyFee: 7500,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '03:00 PM to 04:30 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics & Arithmetic', 'Science & EVS', 'English & Hindi Grammar'],
    shortDescription: 'Interactive concept clarification in science, geometry, fractions, and grammatical sentence structure.',
    fullDescription: 'Class 7 is the golden stage to build strong studying discipline. Our supportive teaching methodology at Sunshine Classes helps young minds master fractions, decimals, basic equations, plant and animal science, and language fluency without stress.',
    highlights: [
      { title: 'Interactive Concept Learning', desc: 'Visual aids and relatable examples for easy understanding.' },
      { title: 'Regular Handwriting & Grammar Drills', desc: 'Emphasis on clean presentation and vocabulary growth.' },
      { title: 'Friendly Classroom Atmosphere', desc: 'Encouraging atmosphere where students freely ask questions.' },
      { title: 'Small Group Focus', desc: 'Maximum 25 students to ensure individual monitoring.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Integers, Fractions & Decimals', 'Simple Equations & Lines and Angles', 'The Triangle & Its Properties', 'Comparing Quantities & Rational Numbers', 'Perimeter, Area & Algebraic Expressions'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'Science & EVS',
        topics: ['Nutrition in Plants & Animals', 'Heat & Acids, Bases, Salts', 'Physical & Chemical Changes', 'Respiration & Transportation in Organisms', 'Motion, Time, Light & Electric Current'],
        hoursPerWeek: '4 Hours / Week'
      },
      {
        name: 'Languages (English & Hindi)',
        topics: ['Nouns, Pronouns, Verbs, Adjectives', 'Tenses & Sentence Correction', 'Paragraph Writing & Comprehension'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Step-by-step NCERT textbook explanations',
      'Weekly oral and written quizzes to test retention',
      'Regular feedback given to parents on homework submission'
    ],
    whySunshine: [
      'Transforms middle school hesitation into academic enthusiasm.',
      'Safe, structured environment located in central Pihani near Subhash Park.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Middle Wing Incharge', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' },
      { name: 'S. Singh', role: 'Science Faculty', exp: '7+ Years Experience', edu: 'M.Sc' }
    ],
    faqs: [
      {
        question: 'Is Class 7 tuition suitable for both English & Hindi medium students?',
        answer: 'Yes! Our bilingual faculty explains concepts clearly in both English and Hindi as required by school boards.'
      },
      {
        question: 'What is the fee for Class 7 at Sunshine Classes?',
        answer: 'The official fee for Class 7 is ₹700/month.'
      }
    ],
    metaTitle: 'Class 7 Tuitions & Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Class 7 coaching classes in Pihani at Sunshine Classes. Official ₹700/month fee, strong foundational learning in Maths, Science & Grammar. Call 8707738284.'
  },
  {
    id: 'class-8',
    slug: 'class-8',
    classNumber: 8,
    className: 'Class 8',
    title: 'Class 8 Apex Learning & High School Foundation Program',
    subtitle: 'Transition smoothly into secondary school with interactive science experiments, logical math, and fluent English.',
    badge: 'Apex Learning',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    monthlyFee: 700,
    monthlyFeeFormatted: '₹700',
    quarterlyFee: 2000,
    halfYearlyFee: 3900,
    yearlyFee: 7500,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '03:00 PM to 05:00 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics (Arithmetic & Geometry)', 'General Science (Physics & Biology)', 'English Language & Grammar'],
    shortDescription: 'Transition into high school science and math with practical problem solving, mental agility, and step-by-step guidance.',
    fullDescription: 'Our Class 8 Apex Learning program turns fundamental concepts into lifelong analytical skills. Designed for middle school students in Pihani, this program cultivates scientific curiosity, mathematical confidence, and strong written English.',
    highlights: [
      { title: 'Middle School Mastery', desc: 'Comprehensive coverage of Class 8 syllabus with practical real-life examples.' },
      { title: 'Mental Math & Reasoning', desc: 'Puzzles and speed arithmetic drills to enhance problem-solving agility.' },
      { title: 'Interactive Science Lessons', desc: 'Visual aids and practical demonstrations for physics and environmental science.' },
      { title: 'Grammar & Vocabulary Builder', desc: 'Daily word power and sentence structuring exercises.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Rational Numbers & Linear Equations', 'Understanding Quadrilaterals & Geometry', 'Data Handling & Square Roots', 'Algebraic Expressions & Factorisation', 'Mensuration & Direct-Inverse Proportions'],
        hoursPerWeek: '5 Hours / Week'
      },
      {
        name: 'General Science',
        topics: ['Crop Production & Microorganisms', 'Synthetic Fibres & Metals', 'Cell Structure & Reproduction', 'Force, Pressure & Friction', 'Sound, Chemical Effects of Current & Light'],
        hoursPerWeek: '5 Hours / Week'
      },
      {
        name: 'English & Grammar',
        topics: ['Parts of Speech & Tenses', 'Active & Passive Voice', 'Notice & Paragraph Writing', 'Reading Comprehension & Vocabulary'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Comprehensive study notes printed in easy-to-understand language',
      'Weekly unit tests with detailed paper review and correction',
      'Friendly, supportive faculty dedicated to patient explanation',
      'Disciplined classroom setting with 100% safety and monitoring'
    ],
    whySunshine: [
      'Builds top-ranking performance in school term examinations.',
      'Helps students overcome fear of mathematics and science numericals.',
      'Official ₹700/month fee with quarterly and annual savings.'
    ],
    faculty: [
      { name: 'S. Singh', role: 'Science Lead', exp: '7+ Years Experience', edu: 'M.Sc' },
      { name: 'Er. R. K. Verma', role: 'Maths Consultant', exp: '12+ Years Experience', edu: 'B.Tech' },
      { name: 'P. Tiwari', role: 'Language Faculty', exp: '6+ Years Experience', edu: 'B.A., B.Ed' }
    ],
    faqs: [
      {
        question: 'What subjects are taught in the Class 8 batch?',
        answer: 'We cover Mathematics, General Science (Physics, Chemistry, Biology), and English Language & Grammar.'
      },
      {
        question: 'What is the fee for Class 8 at Sunshine Classes?',
        answer: 'The official fee for Class 8 is ₹700 per month.'
      }
    ],
    metaTitle: 'Class 8 Coaching & Tuitions in Pihani | Sunshine Classes',
    metaDescription: 'Enroll in Class 8 Apex Learning tuition at Sunshine Classes Pihani. Official ₹700/month fee, expert teachers for Math, Science & English. Call 8707738284.'
  },
  {
    id: 'class-9',
    slug: 'class-9',
    classNumber: 9,
    className: 'Class 9',
    title: 'Class 9 Board Foundation & Science/Maths Mastery Program',
    subtitle: 'Build strong numerical, algebraic, and scientific foundations essential for High School and future competitive exams.',
    badge: 'Board Foundation',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    monthlyFee: 1000,
    monthlyFeeFormatted: '₹1,000',
    quarterlyFee: 2850,
    halfYearlyFee: 5500,
    yearlyFee: 10600,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '07:00 AM & 05:00 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics (Algebra & Geometry)', 'Science (Physics, Chem, Bio)', 'English Grammar & Vocabulary'],
    shortDescription: 'Build rock-solid numerical and conceptual foundations for physics, chemistry, and high school algebra with step-by-step guidance.',
    fullDescription: 'Class 9 is the pivotal foundation year for senior secondary education. At Sunshine Classes, our Class 9 program bridges middle school concepts with high school rigour. We place special emphasis on mathematical proofs, physics numericals, chemical equations, and structured grammar skills.',
    highlights: [
      { title: 'Algebra & Physics Foundation', desc: 'Focus on equation solving, graph work, and kinematics numericals.' },
      { title: 'Step-by-Step Problem Solving', desc: 'Individual attention to build speed and accuracy in school exams.' },
      { title: 'Bi-Weekly Assessment Drills', desc: 'Regular evaluation to eliminate exam fear and track learning progress.' },
      { title: 'Concept Visualization', desc: 'Interactive visual models for cell biology and chemical structure.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Number Systems & Polynomials', 'Coordinate Geometry & Linear Equations', 'Euclid’s Geometry & Lines and Angles', 'Triangles & Quadrilaterals', 'Circles & Heron’s Formula', 'Surface Areas & Statistics'],
        hoursPerWeek: '6 Hours / Week'
      },
      {
        name: 'Science (Physics, Chem, Bio)',
        topics: ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms & Molecules', 'Cell - Fundamental Unit of Life', 'Tissues & Motion', 'Force, Laws of Motion & Gravitation', 'Work, Energy & Sound'],
        hoursPerWeek: '6 Hours / Week'
      },
      {
        name: 'English Grammar & Writing',
        topics: ['Tenses, Subject-Verb Agreement', 'Determiners & Prepositions', 'Descriptive Paragraphs & Story Writing', 'Unseen Passages & Literature'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Comprehensive NCERT Exercise Worksheets & Practice Question Bank',
      'Dedicated Doubt Desk available before and after class hours',
      'Personalized progress tracker shared quarterly with parents',
      'Bilingual instruction (Hindi & English) for complete clarity',
      'Clean, air-conditioned classroom environment in Pihani'
    ],
    whySunshine: [
      'Proven track record of transforming average Class 9 students into Class 10 toppers.',
      'Focus on deep understanding rather than rote learning.',
      'Official ₹1,000/month fee with complete transparency.'
    ],
    faculty: [
      { name: 'Er. R. K. Verma', role: 'Mathematics Lead', exp: '12+ Years Experience', edu: 'B.Tech' },
      { name: 'S. Singh', role: 'Science Faculty', exp: '7+ Years Experience', edu: 'M.Sc Chemistry' },
      { name: 'Anjali Sharma', role: 'English Faculty', exp: '8+ Years Experience', edu: 'M.A. English, B.Ed' }
    ],
    faqs: [
      {
        question: 'Why is Class 9 tuition so important at Sunshine Classes?',
        answer: 'Class 9 introduces complex topics like Kinematics, Polynomials, and Atomic Structure that form 60% of Class 10 prerequisites. Strong Class 9 concepts ensure stress-free Class 10 board results.'
      },
      {
        question: 'What is the Class 9 monthly fee at Sunshine Classes?',
        answer: 'The official fee for Class 9 is ₹1,000 per month.'
      }
    ],
    metaTitle: 'Class 9 Tuition & Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Join Class 9 Board Foundation program at Sunshine Classes Pihani. Official ₹1,000/month fee, expert Math & Science coaching, regular tests. Call 8707738284.'
  },
  {
    id: 'class-10',
    slug: 'class-10',
    classNumber: 10,
    className: 'Class 10',
    title: 'Class 10 Board Specialist & Exam Mastery Program',
    subtitle: 'High-impact preparation for CBSE & UP Board Examinations with rigorous mock drills & NCERT mastery.',
    badge: 'Board Specialist',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    monthlyFee: 1200,
    monthlyFeeFormatted: '₹1,200',
    quarterlyFee: 3400,
    halfYearlyFee: 6600,
    yearlyFee: 12800,
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '06:00 AM & 04:00 PM',
    batchSize: '25 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics (NCERT + RD Sharma)', 'Science (Physics, Chem, Bio)', 'English Grammar & Writing'],
    shortDescription: 'Comprehensive Class 10 board preparation with solved PYQs, mock exams, formula drills & board strategy sessions.',
    fullDescription: 'Our Class 10 Board Specialist program is meticulously crafted to deliver top-tier board scores in Pihani, Hardoi. We focus on 100% NCERT textbook mastery, rigorous solving of past 10 years Question Papers (PYQs), step-by-step presentation drills for board copy evaluation, and weekly mock test series with individual performance feedback.',
    highlights: [
      { title: 'NCERT & PYQ Mastery', desc: 'Complete coverage of NCERT exercises plus 10+ years of previous board papers.' },
      { title: 'Weekly Mock Test Series', desc: 'Simulated board exam pattern tests conducted every Sunday with rank lists.' },
      { title: 'Doubt Counter & Formula Sheets', desc: 'Daily post-class doubt resolution and formula cheat sheets for instant revision.' },
      { title: 'Board Copy Writing Skills', desc: 'Guidance on step-marking, diagram neatness, and word limit discipline.' }
    ],
    subjectsDetailed: [
      {
        name: 'Mathematics',
        topics: ['Real Numbers & Polynomials', 'Pair of Linear Equations', 'Quadratic Equations & AP', 'Triangles, Coordinate & Circles', 'Trigonometry & Applications', 'Surface Areas & Statistics'],
        hoursPerWeek: '6 Hours / Week'
      },
      {
        name: 'Science (Phy, Chem, Bio)',
        topics: ['Chemical Reactions & Acids-Bases', 'Metals, Non-metals & Carbon', 'Life Processes & Control', 'Light Reflection & Refraction', 'Human Eye & Electricity', 'Magnetic Effects & Environment'],
        hoursPerWeek: '6 Hours / Week'
      },
      {
        name: 'English Language & Grammar',
        topics: ['Advanced Tenses & Modals', 'Reported Speech & Active-Passive', 'Formal Letter & Essay Writing', 'Comprehension Passages & Literature'],
        hoursPerWeek: '3 Hours / Week'
      }
    ],
    features: [
      'Comprehensive Study Material & Handwritten Revision Notes',
      'Daily Practice Problem (DPP) Worksheets after every lecture',
      'Parent-Teacher Meetings (PTM) with biometric attendance cards',
      'SMS & WhatsApp Instant Test Result Notifications to parents',
      'Air-conditioned smart classroom equipped with digital projector'
    ],
    whySunshine: [
      'Over 92% of our Class 10 students scored distinction (85%+) in past board exams.',
      'Specialized focus on UP Board and CBSE marking scheme nuances.',
      'Small batch limits of 25 ensure every student receives personal teacher attention.'
    ],
    faculty: [
      { name: 'Er. R. K. Verma', role: 'Head of Mathematics', exp: '12+ Years Experience', edu: 'B.Tech (Gold Medalist)' },
      { name: 'Dr. S. K. Pandey', role: 'Senior Physics & Chemistry Faculty', exp: '10+ Years Experience', edu: 'M.Sc, Ph.D in Physics' },
      { name: 'Anjali Sharma', role: 'English & Grammar Specialist', exp: '8+ Years Experience', edu: 'M.A. English Literature, B.Ed' }
    ],
    faqs: [
      {
        question: 'When does the Class 10 Board Batch start at Sunshine Classes?',
        answer: 'Fresh batches start in April for the new academic session. Mid-session revision and super-10 batches commence in July and October.'
      },
      {
        question: 'Are study materials included in the official ₹1,200 monthly fee?',
        answer: 'Yes! Printed formula booklets, chapter-wise test papers, and daily DPP worksheets are included with no hidden extra charges.'
      }
    ],
    metaTitle: 'CBSE & UP Board Class 10 Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Enroll in Class 10 Board Specialist tuition at Sunshine Classes Pihani. Official ₹1,200/mo fee, 100% NCERT mastery, weekly mock tests & top faculty. Call 8707738284.'
  }
];

/**
 * Helper to retrieve a course by slug (e.g. 'class-1', 'class-10') or id or class name
 */
export function getCourseBySlug(slug: string): UniversalCourse | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return UNIVERSAL_COURSES.find(c => 
    c.slug === normalized || 
    c.id === normalized || 
    c.className.toLowerCase() === normalized.replace('-', ' ') ||
    `class-${c.classNumber}` === normalized
  );
}

/**
 * Helper to retrieve official fee amount by class number (1 to 10)
 */
export function getOfficialFeeByClassNumber(classNum: number): number {
  if (classNum >= 1 && classNum <= 4) return 500;
  if (classNum >= 5 && classNum <= 8) return 700;
  if (classNum === 9) return 1000;
  if (classNum === 10) return 1200;
  return 1200;
}

/**
 * Helper to convert UniversalCourse array to standard Course array for backward compatibility
 */
export function getStandardCoursesList() {
  return UNIVERSAL_COURSES.map(c => ({
    id: c.id,
    name: `${c.className} ${c.badge}`,
    subjects: c.subjects,
    duration: c.duration,
    features: c.features,
    fees: c.monthlyFee
  }));
}
