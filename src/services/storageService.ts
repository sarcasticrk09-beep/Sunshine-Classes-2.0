/**
 * Unified Storage Service for Sunshine Classes ERP
 * Powered by Supabase Storage for secure cloud storage of student photos,
 * study material PDFs, receipts, and institute media.
 */

import { 
  uploadToSupabaseStorage, 
  getSupabaseStoragePublicUrl, 
  deleteFromSupabaseStorage, 
  listSupabaseStorageFiles,
  SupabaseStorageUploadOptions,
  SupabaseStorageUploadResult 
} from '../lib/supabase';

export interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

export class StorageService {
  /**
   * Upload an image to Supabase Storage (e.g. Student photo, teacher avatar, gallery item)
   */
  static async uploadImage(
    file: File | Blob, 
    fileName?: string, 
    folder: string = 'photos'
  ): Promise<SupabaseStorageUploadResult> {
    const finalName = fileName || (file instanceof File ? file.name : `photo_${Date.now()}.jpg`);
    return uploadToSupabaseStorage(file, finalName, {
      bucket: 'sunshine-media',
      folder,
      contentType: file.type || 'image/jpeg'
    });
  }

  /**
   * Upload a PDF or document to Supabase Storage (e.g. Study materials, receipts, admission forms)
   */
  static async uploadDocument(
    file: File | Blob, 
    fileName?: string, 
    folder: string = 'documents'
  ): Promise<SupabaseStorageUploadResult> {
    const finalName = fileName || (file instanceof File ? file.name : `doc_${Date.now()}.pdf`);
    return uploadToSupabaseStorage(file, finalName, {
      bucket: 'sunshine-media',
      folder,
      contentType: file.type || 'application/pdf'
    });
  }

  /**
   * Get direct public download / viewing URL
   */
  static getPublicUrl(path: string, bucket = 'sunshine-media'): string {
    return getSupabaseStoragePublicUrl(path, bucket);
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(path: string, bucket = 'sunshine-media'): Promise<boolean> {
    return deleteFromSupabaseStorage(path, bucket);
  }

  /**
   * List files in a folder
   */
  static async listFiles(folder: string = '', bucket = 'sunshine-media'): Promise<StorageFile[]> {
    return listSupabaseStorageFiles(folder, bucket);
  }
}

export const storageService = StorageService;
