import React, { useState, useEffect, useMemo } from 'react';
import { StudyMaterial, User } from '../types';
import { getPublicStudyMaterials, getStudyMaterials, normalizeStudyMaterial } from '../services/studyMaterialService';
import { SEED_STUDY_MATERIALS } from '../data';
import { SyncService } from '../services/SyncService';
import { useNavigate, useLocation } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { StudyResourcesWorkspace } from '../components/StudyResourcesWorkspace';

const getRouteMeta = (pathname: string) => {
  const p = pathname.toLowerCase();
  if (p.includes('/chapter-notes') || p.includes('/notes')) {
    return {
      title: 'Chapter Revision Notes & Summaries',
      subtitle: 'Chapter-by-chapter revision guides and key concept breakdowns for Math, Science & Grammar.',
      categoryPreset: 'NOTES',
      seoTitle: 'Chapter Revision Notes & Summaries | Sunshine Classes Pihani',
      seoDesc: 'Download chapter revision notes and concise summaries prepared by expert faculty at Sunshine Classes.'
    };
  }
  if (p.includes('/pyqs') || p.includes('/board-papers') || p.includes('/previous-year')) {
    return {
      title: 'Previous Year Papers (PYQs)',
      subtitle: '10-year solved CBSE & UP Board question papers with marking schemes and solutions.',
      categoryPreset: 'PYQ',
      seoTitle: 'Board Exam PYQs & Solved Question Papers | Sunshine Classes Pihani',
      seoDesc: '10-year solved CBSE & UP Board examination papers for Class 9 and 10 students.'
    };
  }
  if (p.includes('/formula-sheets') || p.includes('/formula')) {
    return {
      title: 'Formula Cheat-Sheets & Quick Tricks',
      subtitle: 'Instant revision formula sheets for Mathematics, Physics equations, and Chemistry reactions.',
      categoryPreset: 'FORMULA_SHEET',
      seoTitle: 'Math & Physics Formula Sheets | Sunshine Classes Pihani',
      seoDesc: 'Download printable Math and Physics formula cheat sheets for Class 9 and 10 revision.'
    };
  }
  if (p.includes('/worksheets') || p.includes('/homework')) {
    return {
      title: 'Practice Worksheets & Problem Sets',
      subtitle: 'Topic-wise practice problem sets and classroom worksheets mapped to NCERT exercises.',
      categoryPreset: 'WORKSHEET',
      seoTitle: 'Classroom & Homework Practice Worksheets | Sunshine Classes Pihani',
      seoDesc: 'Structured Math and Science practice worksheets and problem sets for Class 6 to 10.'
    };
  }
  if (p.includes('/practice-papers') || p.includes('/sample-papers') || p.includes('/mock-tests')) {
    return {
      title: 'Mock Practice Papers & Sample Kits',
      subtitle: 'Full-length model question papers formatted as per the latest board exam pattern.',
      categoryPreset: 'SAMPLE_PAPER',
      seoTitle: 'Board Mock Practice Papers & Sample Exams | Sunshine Classes Pihani',
      seoDesc: 'Practice full-length mock exams and sample question papers for Class 10 board preparation.'
    };
  }
  if (p.includes('/study-material')) {
    return {
      title: 'Study Material Library',
      subtitle: 'Complete PDF notes, formula sheets, and exam kits across all Sunshine tuition batches.',
      categoryPreset: 'ALL',
      seoTitle: 'Comprehensive Study Material Library | Sunshine Classes Pihani',
      seoDesc: 'Access complete PDF study materials and course packages for Sunshine Classes students.'
    };
  }
  if (p.includes('/syllabus') || p.includes('/blueprint')) {
    return {
      title: 'Board Syllabus & Blueprints',
      subtitle: 'Complete syllabus breakdown, chapter weightage, and marking patterns for Classes 6 to 10.',
      categoryPreset: 'SYLLABUS',
      seoTitle: 'Board Exam Syllabus & Marking Scheme Blueprints | Sunshine Classes Pihani',
      seoDesc: 'Download syllabus, chapter weightage, and exam blueprints for Sunshine Classes students.'
    };
  }
  if (p.includes('/question-bank') || p.includes('/question-papers')) {
    return {
      title: 'Chapter-Wise Question Banks',
      subtitle: 'Question banks, 1-mark MCQs, case study sets, and long answer practice guides.',
      categoryPreset: 'QUESTION_BANK',
      seoTitle: 'Class 9 & 10 Question Banks | Sunshine Classes Pihani',
      seoDesc: 'Chapter-wise question banks with solved problems for Class 9 and 10 board prep.'
    };
  }
  if (p.includes('/assignments') || p.includes('/assignment')) {
    return {
      title: 'Assignments & Practice Tasks',
      subtitle: 'Your complete digital learning library',
      categoryPreset: 'ASSIGNMENT',
      seoTitle: 'Student Assignments | Sunshine Classes Pihani',
      seoDesc: 'Download take-home assignments and graded problem sets for Sunshine Classes batches.'
    };
  }
  if (p.includes('/lab-manuals') || p.includes('/practical')) {
    return {
      title: 'Practical & Lab Manuals',
      subtitle: 'Your complete digital learning library',
      categoryPreset: 'LAB_MANUAL',
      seoTitle: 'Science Practical & Lab Manuals | Sunshine Classes Pihani',
      seoDesc: 'Access science practical guides, experiment logs, and viva preparation manuals.'
    };
  }
  return {
    title: 'Study Resources',
    subtitle: 'Your complete digital learning library',
    categoryPreset: 'ALL',
    seoTitle: 'Study Resources & Digital Learning Library | Sunshine Classes Pihani',
    seoDesc: 'Download chapter notes, NCERT books PDF, PYQs, formula sheets, and worksheets from Sunshine Classes.'
  };
};

interface PublicStudyMaterialPageProps {
  currentUser?: User | null;
  onNavigateSection?: (section: string) => void;
  cmsMaterials?: StudyMaterial[];
  onOpenLoginModal?: () => void;
  embeddedInLayout?: boolean;
}

export const PublicStudyMaterialPage: React.FC<PublicStudyMaterialPageProps> = ({
  currentUser,
  onNavigateSection,
  cmsMaterials,
  onOpenLoginModal,
  embeddedInLayout = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const routeMeta = useMemo(() => getRouteMeta(location.pathname), [location.pathname]);

  const queryClass = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('class') || 'ALL';
  }, [location.search]);

  const [materials, setMaterials] = useState<StudyMaterial[]>(cmsMaterials || []);
  const [loading, setLoading] = useState(!cmsMaterials);
  const [hasError, setHasError] = useState(false);

  const loadMaterials = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const data = currentUser ? await getStudyMaterials() : await getPublicStudyMaterials();
      const hasDummy = Array.isArray(data) && data.some((m) => m.fileUrl?.includes('dummy.pdf'));
      const existingIds = new Set((data || []).map((m) => m.id || m.materialId));
      const combined = hasDummy ? [...SEED_STUDY_MATERIALS] : [...(data || [])];
      if (!hasDummy) {
        SEED_STUDY_MATERIALS.forEach((seedItem) => {
          if (!existingIds.has(seedItem.id) && !existingIds.has(seedItem.materialId)) {
            combined.push(seedItem);
          }
        });
      }
      const activeData = (combined.length > 0 ? combined : SEED_STUDY_MATERIALS).map(normalizeStudyMaterial);
      setMaterials(
        activeData.filter(
          (m) => (m.status === 'PUBLISHED' || !m.status) && (currentUser ? true : m.isPublic !== false)
        )
      );
    } catch (err) {
      console.warn('Study materials fetch notice:', err);
      if (!materials || materials.length === 0) {
        setHasError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cmsMaterials && Array.isArray(cmsMaterials)) {
      setMaterials(
        cmsMaterials
          .map(normalizeStudyMaterial)
          .filter(
            (m) => (m.status === 'PUBLISHED' || !m.status) && (currentUser ? true : m.isPublic !== false)
          )
      );
      setLoading(false);
    } else {
      loadMaterials();
    }

    const unsubscribe = SyncService.subscribe('study_materials', () => {
      loadMaterials();
    });

    return () => {
      unsubscribe();
    };
  }, [cmsMaterials, currentUser]);

  return (
    <>
      <SEOHead title={routeMeta.seoTitle} description={routeMeta.seoDesc} />
      <StudyResourcesWorkspace
        materials={materials}
        loading={loading}
        hasError={hasError}
        onRetry={loadMaterials}
        currentUser={currentUser}
        variant={embeddedInLayout ? 'embedded-public' : 'public'}
        defaultClass={queryClass}
        initialCategory={routeMeta.categoryPreset}
        headerTitle={routeMeta.title}
        headerSubtitle={routeMeta.subtitle}
        storageKeyPrefix={currentUser ? `user-${currentUser.id}` : 'public'}
        onNavigateHome={() => {
          if (onNavigateSection) onNavigateSection('home');
          else navigate('/');
        }}
        onOpenLoginModal={() => {
          if (onOpenLoginModal) onOpenLoginModal();
          else navigate('/login/student');
        }}
      />
    </>
  );
};

export default PublicStudyMaterialPage;
