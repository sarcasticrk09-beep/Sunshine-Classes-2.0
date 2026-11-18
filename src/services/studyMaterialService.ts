import { StudyMaterial, StudyMaterialStatus, StudyMaterialType } from '../types';
import { SEED_STUDY_MATERIALS } from '../data';
import { SyncService } from './SyncService';

const COLLECTION_NAME = 'study_materials';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Identify official NCERT textbook chapter PDFs that were previously misclassified as NOTES
 */
export function isNcertTextbookChapter(item: Partial<StudyMaterial>): boolean {
  const title = (item.title || '').trim();
  const desc = (item.description || item.desc || '').toLowerCase();
  const url = (item.fileUrl || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const isNcertChapterTitle = /^ncert\s+class\s+\d+/i.test(title);
  const isTextbookMeta =
    desc.includes('official ncert textbook chapter') ||
    tags.includes('textbook') ||
    url.includes('ncert.nic.in/textbook/pdf/');
  return isNcertChapterTitle && isTextbookMeta;
}

/**
 * Normalize legacy NCERT textbook chapter entries from NOTES -> PDF / BOOK
 */
export function normalizeStudyMaterial(item: StudyMaterial): StudyMaterial {
  if (isNcertTextbookChapter(item) && item.materialType === 'NOTES') {
    return {
      ...item,
      materialType: 'PDF',
      category: item.category === 'NOTES' || !item.category ? 'BOOK' : item.category
    };
  }
  return item;
}

/**
 * Fetch all study materials
 */
export async function getStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const list = await SyncService.list<StudyMaterial>(COLLECTION_NAME);
    if (Array.isArray(list) && list.length > 0) {
      const hasDummy = list.some(m => m.fileUrl?.includes('dummy.pdf'));
      if (hasDummy) {
        return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial);
      }
      return list.map((data) => normalizeStudyMaterial({
        ...data,
        id: data.id,
        materialId: data.materialId || data.id,
        desc: data.description || data.desc || '',
        file: data.file || data.fileUrl || '',
        category: data.category || (data.materialType === 'NOTES' ? 'NOTES' : data.materialType === 'PDF' ? 'BOOK' : 'QUESTION_PAPER')
      }));
    }
  } catch (err) {
    console.warn('Study materials fetch error:', err);
  }
  
  if (typeof window !== 'undefined' && localStorage.getItem('sunshine_study_materials_initialized') === 'true') {
    return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial);
  }
  return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial);
}

/**
 * Fetch public published study materials for website visitors
 */
export async function getPublicStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const list = await SyncService.list<StudyMaterial>(COLLECTION_NAME);
    if (Array.isArray(list) && list.length > 0) {
      const hasDummy = list.some(m => m.fileUrl?.includes('dummy.pdf'));
      if (hasDummy) {
        return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial).filter((m) => m.isPublic && m.status === 'PUBLISHED');
      }
      return list
        .map(normalizeStudyMaterial)
        .filter((m) => (m.isPublic === undefined || m.isPublic) && (m.status === undefined || m.status === 'PUBLISHED'));
    }
  } catch (err) {
    console.warn('Error fetching public study materials:', err);
  }
  if (typeof window !== 'undefined' && localStorage.getItem('sunshine_study_materials_initialized') === 'true') {
    return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial).filter((m) => m.isPublic && m.status === 'PUBLISHED');
  }
  return SEED_STUDY_MATERIALS.map(normalizeStudyMaterial).filter((m) => m.isPublic && m.status === 'PUBLISHED');
}

export function inferCategoryFromType(materialType?: StudyMaterialType): StudyMaterial['category'] {
  if (materialType === 'NOTES') return 'NOTES';
  if (materialType === 'PDF') return 'BOOK';
  return 'QUESTION_PAPER';
}

/**
 * Create or save a new study material
 */
export async function createStudyMaterial(
  materialData: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'viewCount'> & {
    id?: string;
  }
): Promise<StudyMaterial> {
  const newId = materialData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mat-${Date.now()}`);
  const now = new Date().toISOString();
  const slug = materialData.slug || generateSlug(materialData.title);
  const materialType = materialData.materialType || 'NOTES';

  const fullMaterial: StudyMaterial = normalizeStudyMaterial({
    id: newId,
    materialId: newId,
    title: materialData.title,
    slug,
    description: materialData.description || materialData.desc || '',
    desc: materialData.description || materialData.desc || '',
    class: materialData.class,
    subject: materialData.subject,
    chapter: materialData.chapter || '',
    materialType,
    category: materialData.category || inferCategoryFromType(materialType),
    file: materialData.file || '',
    size: materialData.size || '1.0 MB',
    fileUrl: materialData.fileUrl || '',
    thumbnailUrl: materialData.thumbnailUrl || '',
    youtubeUrl: materialData.youtubeUrl || '',
    externalUrl: materialData.externalUrl || '',
    fileData: materialData.fileData || '',
    isPublic: materialData.isPublic !== undefined ? materialData.isPublic : true,
    status: materialData.status || 'PUBLISHED',
    downloadCount: 0,
    viewCount: 0,
    tags: materialData.tags || [],
    seoTitle: materialData.seoTitle || `${materialData.title} PDF - Sunshine Classes`,
    metaDescription: materialData.metaDescription || materialData.description || materialData.title,
    keywords: materialData.keywords || materialData.tags || [],
    createdBy: materialData.createdBy || 'Admin',
    uploadedBy: materialData.uploadedBy || materialData.createdBy || 'Admin',
    createdAt: now,
    updatedAt: now,
    date: materialData.date || now.split('T')[0]
  });

  try {
    await SyncService.set(COLLECTION_NAME, newId, fullMaterial);
    await SyncService.processTransactionLog().catch(() => {});
  } catch (err) {
    console.error('Error saving study material:', err);
  }

  return fullMaterial;
}

/**
 * Update an existing study material
 */
export async function updateStudyMaterial(
  id: string,
  updates: Partial<StudyMaterial>
): Promise<void> {
  const now = new Date().toISOString();
  const payload: Partial<StudyMaterial> = {
    ...updates,
    updatedAt: now
  };

  if (updates.title && !updates.slug) {
    payload.slug = generateSlug(updates.title);
  }
  if (updates.materialType && !updates.category) {
    payload.category = inferCategoryFromType(updates.materialType);
  }

  try {
    await SyncService.update(COLLECTION_NAME, id, payload);
    await SyncService.processTransactionLog().catch(() => {});
  } catch (err) {
    console.error(`Error updating study material ${id}:`, err);
  }
}

/**
 * Delete a study material by ID
 */
export async function deleteStudyMaterial(id: string): Promise<void> {
  try {
    await SyncService.delete(COLLECTION_NAME, id);
  } catch (err) {
    console.error(`Error deleting study material ${id}:`, err);
  }
}

/**
 * Bulk delete study materials
 */
export async function bulkDeleteStudyMaterials(ids: string[]): Promise<void> {
  for (const id of ids) {
    await SyncService.delete(COLLECTION_NAME, id);
  }
}

/**
 * Bulk update status (Publish / Unpublish / Archive)
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: StudyMaterialStatus,
  isPublic?: boolean
): Promise<void> {
  const now = new Date().toISOString();
  for (const id of ids) {
    const updateData: any = { status, updatedAt: now };
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }
    await SyncService.update(COLLECTION_NAME, id, updateData);
  }
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const item = await SyncService.get<StudyMaterial>(COLLECTION_NAME, id);
    if (item) {
      await SyncService.update(COLLECTION_NAME, id, {
        viewCount: (item.viewCount || 0) + 1
      });
    }
  } catch (err) {
    console.warn(`Could not increment view count for ${id}:`, err);
  }
}

/**
 * Increment download count and set lastDownloaded
 */
export async function incrementDownloadCount(id: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const item = await SyncService.get<StudyMaterial>(COLLECTION_NAME, id);
    if (item) {
      await SyncService.update(COLLECTION_NAME, id, {
        downloadCount: (item.downloadCount || 0) + 1,
        lastDownloaded: now
      });
    }
  } catch (err) {
    console.warn(`Could not increment download count for ${id}:`, err);
  }
}
