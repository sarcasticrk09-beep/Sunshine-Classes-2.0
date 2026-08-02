export interface LeadershipMemberConfig {
  id: string;
  name: string;
  title: string;
  qualification: string;
  badge: string;
  about: string;
  tags: string[];
  photoUrl?: string;
  avatarInitials: string;
  isPrimary: boolean;
  accentColor: 'amber' | 'indigo';
  socials?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
}

export const LEADERSHIP_CONFIG: LeadershipMemberConfig[] = [
  {
    id: 'fm-priyanshu',
    name: 'Priyanshu Gupta',
    title: 'Founder & Academic Director',
    qualification: 'B.Sc. (Mathematics)',
    badge: 'Academic Leadership',
    tags: [
      'Mathematics & Science',
      'Curriculum Planning',
      'Board Preparation',
      'Student Mentorship',
    ],
    about: "Sunshine Classes was founded with a vision of making quality education accessible through conceptual learning, disciplined practice, and individual attention. Priyanshu Gupta leads the institute's academic direction, mentors students across all subjects, and personally oversees curriculum planning, revision programs, classroom standards, and board examination preparation. His strongest expertise lies in Mathematics and Science, and his focus is to help every student build confidence, analytical thinking, and long-term academic success.",
    photoUrl: '',
    avatarInitials: 'PG',
    isPrimary: true,
    accentColor: 'amber',
    socials: {
      instagram: 'https://www.instagram.com/sunshineclassespihani/',
    },
  },
  {
    id: 'fm-rajeev',
    name: 'Rajeev Kr. Verma',
    title: 'Co-Founder & Operations Lead',
    qualification: 'B.Tech CSE',
    badge: 'Technology • Operations • Digital Growth',
    tags: ['Technology', 'Operations', 'Digital Growth'],
    about: "Rajeev Kr. Verma manages the operational, technological, and digital growth initiatives of Sunshine Classes. He leads the development of the institute's website, ERP platform, admissions systems, and digital infrastructure while coordinating administrative processes, branding, strategic collaborations, and organizational development. His role is to build efficient systems that enhance the experience for students, parents, and staff while supporting the institute's long-term growth.",
    photoUrl: '',
    avatarInitials: 'RV',
    isPrimary: false,
    accentColor: 'indigo',
    socials: {
      linkedin: 'https://www.linkedin.com/in/rajeev-kumar-verma-2110a21b7/',
      instagram: 'https://www.instagram.com/sarcastic._.rk/',
    },
  },
];
