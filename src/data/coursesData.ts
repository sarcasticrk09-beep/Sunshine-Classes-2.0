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
  slug: string; // 'class-6' | 'class-7' | 'class-8' | 'class-9' | 'class-10'
  classNumber: number;
  className: string; // 'Class 6'
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
}

export const UNIVERSAL_COURSES: UniversalCourse[] = [
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
    quarterlyFee: 3400, // ₹200 off
    halfYearlyFee: 6600, // ₹600 off
    yearlyFee: 12800, // ₹1,600 off
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
        question: 'Are study materials included in the ₹1,200 monthly fee?',
        answer: 'Yes! Printed formula booklets, chapter-wise test papers, and daily DPP worksheets are included with no hidden extra charges.'
      },
      {
        question: 'How do you prepare UP Board vs CBSE students?',
        answer: 'We maintain dedicated batches and bilingual explanations so UP Board (Hindi/English medium) and CBSE students master their respective answer formats.'
      },
      {
        question: 'What if a student misses a lecture or mock test?',
        answer: 'Backup lectures are arranged during the daily doubt hour (5:00 PM - 6:00 PM), and re-tests are conducted for genuine medical leaves.'
      }
    ],
    metaTitle: 'CBSE & UP Board Class 10 Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Enroll in Class 10 Board Specialist tuition at Sunshine Classes Pihani. ₹1,200/mo fee, 100% NCERT mastery, weekly mock tests & top faculty. Call 8707738284.'
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
    quarterlyFee: 2850, // ₹150 off
    halfYearlyFee: 5500, // ₹500 off
    yearlyFee: 10600, // ₹1,400 off
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
      'Regular attendance & homework tracking with WhatsApp parent updates.'
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
        question: 'What are the batch timings for Class 9?',
        answer: 'Morning batch runs at 07:00 AM and Evening batch runs at 05:00 PM to fit both school shifts smoothly.'
      },
      {
        question: 'Can parents monitor attendance and test scores?',
        answer: 'Yes! Parents receive instant WhatsApp alerts for attendance and test result SMS directly on their registered phone numbers.'
      }
    ],
    metaTitle: 'Class 9 Tuition & Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Join Class 9 Board Foundation program at Sunshine Classes Pihani. ₹1,000/month fee, expert Math & Science coaching, regular tests. Call 8707738284.'
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
    monthlyFee: 800,
    monthlyFeeFormatted: '₹800',
    quarterlyFee: 2280, // ₹120 off
    halfYearlyFee: 4400, // ₹400 off
    yearlyFee: 8500, // ₹1,100 off
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
      'Affordable ₹800/month fee with quarterly and annual savings.'
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
        question: 'What is the batch timing for Class 8?',
        answer: 'Class 8 runs daily from 03:00 PM to 05:00 PM.'
      }
    ],
    metaTitle: 'Class 8 Coaching & Tuitions in Pihani | Sunshine Classes',
    metaDescription: 'Enroll in Class 8 Apex Learning tuition at Sunshine Classes Pihani. ₹800/month fee, expert teachers for Math, Science & English. Call 8707738284.'
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
    quarterlyFee: 2000, // ₹100 off
    halfYearlyFee: 3900, // ₹300 off
    yearlyFee: 7500, // ₹900 off
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
      }
    ],
    metaTitle: 'Class 7 Tuitions & Coaching in Pihani | Sunshine Classes',
    metaDescription: 'Class 7 coaching classes in Pihani at Sunshine Classes. ₹700/month fee, strong foundational learning in Maths, Science & Grammar. Call 8707738284.'
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
    monthlyFee: 600,
    monthlyFeeFormatted: '₹600',
    quarterlyFee: 1700, // ₹100 off
    halfYearlyFee: 3300, // ₹300 off
    yearlyFee: 6400, // ₹800 off
    feePeriod: 'per month',
    duration: 'Full Academic Year (April - March)',
    timing: '02:00 PM to 03:30 PM',
    batchSize: '20 Students / Batch',
    board: 'CBSE & UP Board (Bilingual)',
    subjects: ['Mathematics & Mental Math', 'Science & General Awareness', 'English Grammar & Reading'],
    shortDescription: 'Patience-driven foundational teaching to develop arithmetic confidence, reading habits, and curiosity.',
    fullDescription: 'The transition from primary to middle school can be challenging. Our Class 6 Junior Foundation program provides gentle, encouraging guidance that builds core reading habits, elementary math operations, and curiosity about natural science.',
    highlights: [
      { title: 'Gentle & Patient Faculty', desc: 'Specially trained teachers who encourage curiosity and eliminate fear.' },
      { title: 'Mental Math Fundamentals', desc: 'Tables, quick additions, and word problem decoding.' },
      { title: 'Reading & Writing Skills', desc: 'Daily oral reading practice and sentence forming.' },
      { title: 'Focused Batch Size', desc: 'Limited to 20 students for close personal mentoring.' }
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
      'Color-printed activity sheets & practice workbooks',
      'Safe, welcoming classroom environment with comfortable seating',
      'Monthly progress reports given directly to parents'
    ],
    whySunshine: [
      'Ensures your child establishes strong study habits from an early age.',
      'Most affordable premium coaching in Pihani at just ₹600/month.'
    ],
    faculty: [
      { name: 'P. Tiwari', role: 'Junior Wing Faculty', exp: '6+ Years Experience', edu: 'B.Sc, B.Ed' }
    ],
    faqs: [
      {
        question: 'How do you help young Class 6 students who feel nervous?',
        answer: 'We maintain a warm, friendly classroom environment with small batches of 20 students where every child is encouraged to ask questions without hesitation.'
      }
    ],
    metaTitle: 'Class 6 Coaching & Tuitions in Pihani | Sunshine Classes',
    metaDescription: 'Enroll your child in Class 6 Junior Foundation at Sunshine Classes Pihani. ₹600/month fee, patient teachers, small batch size. Call 8707738284.'
  }
];

/**
 * Helper to retrieve a course by slug (e.g. 'class-10') or id
 */
export function getCourseBySlug(slug: string): UniversalCourse | undefined {
  const normalized = slug.trim().toLowerCase();
  return UNIVERSAL_COURSES.find(c => c.slug === normalized || c.id === normalized || c.className.toLowerCase() === normalized.replace('-', ' '));
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
