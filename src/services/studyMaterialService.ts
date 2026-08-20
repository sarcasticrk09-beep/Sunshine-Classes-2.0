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
 * Fetch all study materials
 */
export async function getStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const list = await SyncService.list<StudyMaterial>(COLLECTION_NAME);
    if (list && list.length > 0) {
      return list.map((data) => ({
        ...data,
        id: data.id,
        materialId: data.materialId || data.id,
        desc: data.description || data.desc || '',
        file: data.file || data.fileUrl || '',
        category: data.category || (data.materialType === 'NOTES' ? 'NOTES' : 'QUESTION_PAPER')
      }));
    }
  } catch (err) {
    console.warn('Study materials fetch error, using fallback seed data:', err);
  }
  return SEED_STUDY_MATERIALS;
}

/**
 * Fetch public published study materials for website visitors
 */
export async function getPublicStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const list = await SyncService.list<StudyMaterial>(COLLECTION_NAME);
    if (list && list.length > 0) {
      return list.filter((m) => (m.isPublic === undefined || m.isPublic) && (m.status === undefined || m.status === 'PUBLISHED'));
    }
  } catch (err) {
    console.warn('Error fetching public study materials:', err);
  }
  return SEED_STUDY_MATERIALS.filter((m) => m.isPublic && m.status === 'PUBLISHED');
}

/**
 * Create or save a new study material
 */
export async function createStudyMaterial(
  materialData: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'viewCount'> & {
    id?: string;
  }
): Promise<StudyMaterial> {
  const newId = materialData.id || `mat-${Date.now()}`;
  const now = new Date().toISOString();
  const slug = materialData.slug || generateSlug(materialData.title);

  const fullMaterial: StudyMaterial = {
    id: newId,
    materialId: newId,
    title: materialData.title,
    slug,
    description: materialData.description || materialData.desc || '',
    desc: materialData.description || materialData.desc || '',
    class: materialData.class,
    subject: materialData.subject,
    chapter: materialData.chapter || '',
    materialType: materialData.materialType || 'NOTES',
    category: materialData.category || 'NOTES',
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
  };

  try {
    await SyncService.set(COLLECTION_NAME, newId, fullMaterial);
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
  const payload = {
    ...updates,
    updatedAt: now
  };

  if (updates.title && !updates.slug) {
    payload.slug = generateSlug(updates.title);
  }

  try {
    await SyncService.update(COLLECTION_NAME, id, payload);
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
