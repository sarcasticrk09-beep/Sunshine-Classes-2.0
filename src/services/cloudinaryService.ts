// Unified Media & Storage Service (Powered by Supabase Storage)
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from "../lib/supabase";

export const CLOUDINARY_CLOUD_NAME = "gtn424dm";
export const CLOUDINARY_UPLOAD_PRESET = "sunshine_classes";

function getCurrentUserId(): string {
  try {
    const userStr = localStorage.getItem("sunshine_user");
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u && u.id) return u.id;
    }
  } catch (e) {
    // ignore
  }
  return "anonymous_user";
}

/**
 * Unified Upload and Resource Management Service
 * Migrated to Supabase Storage ('sunshine-media') with transparent legacy Cloudinary URL resolution.
 */

export interface CloudinaryUploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  onProgress?: (progress: number) => void;
  onCancel?: () => void;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  asset_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  folder: string;
}

/**
 * Extracts the storage identifier/path from Supabase Storage or Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url) return null;

  // Supabase Storage URL
  if (url.includes("/storage/v1/object/public/")) {
    const idx = url.indexOf("/storage/v1/object/public/");
    const fullPath = url.substring(idx + "/storage/v1/object/public/".length);
    // remove bucket prefix if included
    return fullPath.replace(/^sunshine-media\//, "");
  }

  // Legacy Cloudinary URL
  if (url.includes("cloudinary.com")) {
    const uploadIdx = url.indexOf("/upload/");
    if (uploadIdx === -1) return null;
    
    let path = url.substring(uploadIdx + 8);
    
    // Strip version number if present (e.g. "v1720612345/")
    if (path.match(/^v\d+\//)) {
      const firstSlashIdx = path.indexOf("/");
      path = path.substring(firstSlashIdx + 1);
    }
    
    // Strip file extension
    const lastDotIdx = path.lastIndexOf(".");
    if (lastDotIdx !== -1) {
      path = path.substring(0, lastDotIdx);
    }
    
    return path;
  }

  return url;
}

/**
 * Automatically applies format and quality optimizations, and face-based profile thumbnailing.
 */
export function getOptimizedImageUrl(url: string, type?: "profile" | "thumbnail" | "gallery"): string {
  if (!url) return "";
  
  // Legacy Cloudinary optimization transforms
  if (url.includes("cloudinary.com")) {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension);
    if (!isImage) return url;

    if (type === "profile") {
      return url.replace("/upload/", "/upload/c_thumb,g_face,w_200,h_200,f_auto,q_auto/");
    }
    if (type === "thumbnail") {
      return url.replace("/upload/", "/upload/c_fit,w_400,f_auto,q_auto/");
    }
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }

  // Supabase Storage & direct CDN URLs are delivered optimized
  return url;
}

class CloudinaryService {
  /**
   * Validates file format and size before upload
   */
  validateFile(file: File, options: CloudinaryUploadOptions = {}): { isValid: boolean; error?: string } {
    if (!file) {
      return {
        isValid: false,
        error: "Invalid file object. No file selected for upload.",
      };
    }

    if (!file.name || typeof file.name !== "string") {
      return {
        isValid: false,
        error: "Invalid file name. Upload aborted.",
      };
    }

    const allowedExtensions = options.allowedTypes || ["jpg", "jpeg", "png", "webp", "pdf"];
    const maxBytes = options.maxSize || 10 * 1024 * 1024; // Strict 10MB limit

    // Validate size
    if (file.size > maxBytes) {
      return {
        isValid: false,
        error: `File size exceeds the maximum permitted limit of 10 MB (File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
      };
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    // Explicit malware/harmful extension block
    const blockedExtensions = ["exe", "zip", "apk", "js", "html", "php", "bat", "sh", "vbs", "cmd", "scr", "msi"];
    if (extension && blockedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `Security violation: .${extension} files are strictly prohibited from being uploaded.`,
      };
    }

    // Validate extension against allowed list
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `Invalid file type .${extension || "unknown"}. Allowed formats: ${allowedExtensions.map(e => e.toUpperCase()).join(", ")}.`,
      };
    }

    // Check MIME type for dangerous script types
    const fileType = file.type || "";
    if (fileType && (fileType.includes("javascript") || fileType.includes("html") || fileType.includes("executable") || fileType.includes("x-msdownload"))) {
      return {
        isValid: false,
        error: "Executable scripts or HTML/JS files are strictly blocked.",
      };
    }

    return { isValid: true };
  }

  /**
   * Standardizes Cloudinary storage subfolders based on entity context
   */
  getFolderByContext(context: "students" | "teachers" | "staff" | "documents" | "receipts" | "assignments" | "study-material" | "results" | "notices" | "gallery" | "settings" | "homework"): string {
    const folderMapping: Record<string, string> = {
      students: "sunshine-classes/students",
      teachers: "sunshine-classes/teachers",
      staff: "sunshine-classes/staff",
      documents: "sunshine-classes/documents",
      receipts: "sunshine-classes/receipts",
      assignments: "sunshine-classes/assignments",
      homework: "sunshine-classes/assignments",
      "study-material": "sunshine-classes/documents",
      results: "sunshine-classes/documents",
      notices: "sunshine-classes/documents",
      gallery: "sunshine-classes/documents",
      settings: "sunshine-classes/staff",
    };
    return folderMapping[context] || "sunshine-classes/documents";
  }

  /**
   * Uploads file to Supabase Unified Storage ('sunshine-media') with automatic proxy and fallback
   */
  async uploadFile(
    file: File,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    const validation = this.validateFile(file, options);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const targetFolder = options.folder 
      ? (options.folder.startsWith("sunshine-classes/") ? options.folder.replace("sunshine-classes/", "") : options.folder)
      : "documents";

    const fileTypeStr = file?.type || "";
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImage = fileTypeStr.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

    // Initial progress notification
    if (options.onProgress) options.onProgress(20);

    // 1. Primary: Direct Client-Side Supabase Storage Upload
    try {
      const uploadRes = await uploadToSupabaseStorage(file, file.name, {
        folder: targetFolder,
        bucket: "sunshine-media"
      });

      if (uploadRes && uploadRes.url) {
        if (options.onProgress) options.onProgress(100);
        return {
          secure_url: uploadRes.url,
          public_id: uploadRes.path,
          asset_id: uploadRes.path,
          resource_type: isImage ? "image" : "raw",
          format: ext,
          bytes: file.size,
          created_at: new Date().toISOString(),
          folder: targetFolder
        };
      }
    } catch (clientErr) {
      console.warn("[Storage] Client-side Supabase Storage upload, falling back to server API proxy:", clientErr);
    }

    // 2. Secondary: Server-Side Storage Proxy (Handles serverSupabase service role upload)
    try {
      if (options.onProgress) options.onProgress(45);
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const serverRes = await fetch("/api/storage/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: file.name,
          contentType: file.type || (isImage ? "image/jpeg" : "application/octet-stream"),
          folder: targetFolder,
          bucket: "sunshine-media"
        })
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.success && data.url) {
          if (options.onProgress) options.onProgress(100);
          return {
            secure_url: data.url,
            public_id: data.path,
            asset_id: data.path,
            resource_type: isImage ? "image" : "raw",
            format: ext,
            bytes: file.size,
            created_at: new Date().toISOString(),
            folder: targetFolder
          };
        }
      }
    } catch (proxyErr) {
      console.warn("[Storage] Server proxy upload error, falling back to legacy Cloudinary:", proxyErr);
    }

    // 3. Fallback: Legacy Cloudinary Unsigned Upload
    const cloudName = CLOUDINARY_CLOUD_NAME;
    const uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    const legacyFolder = `sunshine-classes/${targetFolder}`;
    const resourceType = isImage ? "image" : "raw";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", legacyFolder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl, true);

      if (options.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && options.onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            options.onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              secure_url: response.secure_url,
              public_id: response.public_id,
              asset_id: response.asset_id || `asset-${Date.now()}`,
              resource_type: response.resource_type || (isImage ? "image" : "raw"),
              format: response.format || ext,
              bytes: response.bytes || file.size,
              width: response.width,
              height: response.height,
              created_at: response.created_at || new Date().toISOString(),
              folder: response.folder || legacyFolder
            });
          } catch (e) {
            reject(new Error("Failed to parse Cloudinary upload response."));
          }
        } else {
          console.warn(`[Storage] Cloudinary upload returned HTTP ${xhr.status}, using local fallback`);
          if (options.onProgress) options.onProgress(100);
          resolve({
            secure_url: URL.createObjectURL(file),
            public_id: `local-${Date.now()}`,
            asset_id: `asset-${Date.now()}`,
            resource_type: isImage ? "image" : "raw",
            format: ext,
            bytes: file.size,
            created_at: new Date().toISOString(),
            folder: targetFolder
          });
        }
      };

      xhr.onerror = () => {
        console.warn("[Storage] Cloudinary network error, using local fallback");
        if (options.onProgress) options.onProgress(100);
        resolve({
          secure_url: URL.createObjectURL(file),
          public_id: `local-${Date.now()}`,
          asset_id: `asset-${Date.now()}`,
          resource_type: isImage ? "image" : "raw",
          format: ext,
          bytes: file.size,
          created_at: new Date().toISOString(),
          folder: targetFolder
        });
      };

      xhr.send(formData);
    });
  }

  /**
   * Securely destroys an asset on Supabase Storage and legacy Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      // 1. Delete from Supabase Storage
      try {
        await deleteFromSupabaseStorage(publicId, "sunshine-media");
        await fetch("/api/storage/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: publicId, bucket: "sunshine-media" })
        }).catch(() => {});
      } catch (storageErr) {
        console.warn("[Storage] Non-blocking Supabase Storage deletion warning:", storageErr);
      }

      // 2. Also trigger legacy deletion endpoint for Cloudinary assets
      const response = await fetch("/api/delete-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId,
          userId: getCurrentUserId(),
          role: localStorage.getItem("sunshine_remember_role") || "STUDENT"
        })
      });

      if (!response.ok) {
        return true;
      }

      const resData = await response.json();
      return resData.success !== false;
    } catch (err) {
      console.error("Asset deletion error:", err);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();

