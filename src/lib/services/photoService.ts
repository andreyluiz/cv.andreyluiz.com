import { type DBSchema, type IDBPDatabase, openDB } from "idb";

// Photo record interface for IndexedDB storage
export interface PhotoRecord {
  id: string; // Unique photo identifier
  blob: Blob; // Binary image data
  type: string; // MIME type (image/jpeg, image/png, etc.)
  size: number; // File size in bytes
  uploadedAt: Date; // Upload timestamp
  cvId: string; // Associated CV identifier
}

// IndexedDB schema definition
interface PhotoDB extends DBSchema {
  photos: {
    key: string;
    value: PhotoRecord;
    indexes: { "by-cv": string };
  };
}

// PhotoService class for managing photo operations
export class PhotoService {
  private static instance: PhotoService;
  private db: IDBPDatabase<PhotoDB> | null = null;
  private readonly DB_NAME = "CVPhotoStorage";
  private readonly DB_VERSION = 1;
  private dbPromise: Promise<IDBPDatabase<PhotoDB>> | null = null;
  private urlCache = new Map<string, string>();
  private readonly MAX_CACHE_SIZE = 50; // Limit URL cache size

  private constructor() {}

  // Singleton pattern to ensure single instance
  public static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  // Associate an existing photo with a (new) CV id
  public async updatePhotoCvId(photoId: string, newCvId: string): Promise<void> {
    try {
      const db = await this.initDB();
      const existing = await db.get("photos", photoId);
      if (!existing) return; // Nothing to update

      const updated: PhotoRecord = { ...existing, cvId: newCvId };
      await db.put("photos", updated);
    } catch (error) {
      console.warn(
        `Failed to update photo association for ${photoId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // Initialize IndexedDB connection with connection pooling
  private async initDB(): Promise<IDBPDatabase<PhotoDB>> {
    // Return existing connection if available
    if (this.db) {
      return this.db;
    }

    // Return existing promise if initialization is in progress
    if (this.dbPromise) {
      return this.dbPromise;
    }

    // Create new initialization promise
    this.dbPromise = openDB<PhotoDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create photos object store
        const photoStore = db.createObjectStore("photos", {
          keyPath: "id",
        });

        // Create index for querying photos by CV ID
        photoStore.createIndex("by-cv", "cvId", { unique: false });
      },
    });

    try {
      this.db = await this.dbPromise;
      return this.db;
    } catch (error) {
      // Reset promise on error to allow retry
      this.dbPromise = null;
      throw new Error(
        `Failed to initialize IndexedDB: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Clean up URL cache when it gets too large
  private cleanupUrlCache(): void {
    if (this.urlCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries (first half of cache)
      const entries = Array.from(this.urlCache.entries());
      const toRemove = entries.slice(0, Math.floor(entries.length / 2));

      for (const [photoId, url] of toRemove) {
        URL.revokeObjectURL(url);
        this.urlCache.delete(photoId);
      }
    }
  }

  // Store a photo in IndexedDB
  public async storePhoto(file: File, cvId: string): Promise<string> {
    try {
      const db = await this.initDB();

      // Generate unique photo ID
      const photoId = `photo_${cvId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create photo record
      const photoRecord: PhotoRecord = {
        id: photoId,
        blob: file,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        cvId: cvId,
      };

      // Store in IndexedDB
      await db.add("photos", photoRecord);

      return photoId;
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new Error(
          "Storage quota exceeded. Please remove some photos to free up space.",
        );
      }
      throw new Error(
        `Failed to store photo: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Retrieve a photo by ID
  public async getPhoto(photoId: string): Promise<Blob | null> {
    try {
      const db = await this.initDB();
      const photoRecord = await db.get("photos", photoId);

      return photoRecord ? photoRecord.blob : null;
    } catch (error) {
      console.error("Failed to retrieve photo:", error);
      return null;
    }
  }

  // Get photo as object URL for display with caching
  public async getPhotoUrl(photoId: string): Promise<string | null> {
    try {
      // Check cache first
      if (this.urlCache.has(photoId)) {
        return this.urlCache.get(photoId)!;
      }

      const blob = await this.getPhoto(photoId);
      if (!blob) {
        return null;
      }

      // Clean up cache if needed before adding new entry
      this.cleanupUrlCache();

      const url = URL.createObjectURL(blob);
      this.urlCache.set(photoId, url);

      return url;
    } catch (error) {
      console.error("Failed to create photo URL:", error);
      return null;
    }
  }

  // Delete a specific photo
  public async deletePhoto(photoId: string): Promise<void> {
    try {
      const db = await this.initDB();
      await db.delete("photos", photoId);

      // Clean up cached URL
      if (this.urlCache.has(photoId)) {
        const url = this.urlCache.get(photoId)!;
        URL.revokeObjectURL(url);
        this.urlCache.delete(photoId);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete photo: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Delete all photos associated with a CV
  public async deletePhotosByCvId(cvId: string): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction("photos", "readwrite");
      const index = tx.store.index("by-cv");

      // Get all photos for this CV
      const photoRecords = await index.getAll(cvId);

      // Delete each photo and clean up cached URLs
      for (const record of photoRecords) {
        await tx.store.delete(record.id);

        // Clean up cached URL
        if (this.urlCache.has(record.id)) {
          const url = this.urlCache.get(record.id)!;
          URL.revokeObjectURL(url);
          this.urlCache.delete(record.id);
        }
      }

      await tx.done;
    } catch (error) {
      throw new Error(
        `Failed to delete photos for CV: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Get all photos for a specific CV
  public async getPhotosByCvId(cvId: string): Promise<PhotoRecord[]> {
    try {
      const db = await this.initDB();
      const index = db.transaction("photos", "readonly").store.index("by-cv");

      return await index.getAll(cvId);
    } catch (error) {
      console.error("Failed to retrieve photos for CV:", error);
      return [];
    }
  }

  // Check if IndexedDB is available
  public static isIndexedDBAvailable(): boolean {
    try {
      return (
        typeof window !== "undefined" &&
        "indexedDB" in window &&
        window.indexedDB !== null
      );
    } catch {
      return false;
    }
  }

  // Clean up object URLs to prevent memory leaks
  public static revokePhotoUrl(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Failed to revoke object URL:", error);
    }
  }

  // Get storage usage information
  public async getStorageInfo(): Promise<{
    used: number;
    available: number;
  } | null> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return null;
    }
  }

  // Clean up orphaned photos (photos not associated with any existing CV)
  public async cleanupOrphanedPhotos(existingCvIds: string[]): Promise<{
    cleaned: number;
    errors: string[];
  }> {
    const result = {
      cleaned: 0,
      errors: [] as string[],
    };

    try {
      const db = await this.initDB();
      const tx = db.transaction("photos", "readwrite");
      const store = tx.store;

      // Get all photos
      const allPhotos = await store.getAll();

      // Find orphaned photos
      const orphanedPhotos = allPhotos.filter((photo) => {
        const isProvisional =
          photo.cvId === "temp" || photo.cvId.startsWith("cv-");
        return !existingCvIds.includes(photo.cvId) && !isProvisional;
      });

      // Delete orphaned photos
      for (const photo of orphanedPhotos) {
        try {
          await store.delete(photo.id);
          result.cleaned++;
        } catch (error) {
          const errorMsg = `Failed to delete orphaned photo ${photo.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      await tx.done;
    } catch (error) {
      const errorMsg = `Failed to cleanup orphaned photos: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }

    return result;
  }

  // Get all photos with their CV associations for debugging
  public async getAllPhotosWithCvIds(): Promise<
    Array<{ photoId: string; cvId: string; uploadedAt: Date }>
  > {
    try {
      const db = await this.initDB();
      const allPhotos = await db.getAll("photos");

      return allPhotos.map((photo) => ({
        photoId: photo.id,
        cvId: photo.cvId,
        uploadedAt: photo.uploadedAt,
      }));
    } catch (error) {
      console.error("Failed to get photos with CV IDs:", error);
      return [];
    }
  }

  // Clean up all cached URLs (useful for memory management)
  public clearUrlCache(): void {
    for (const url of this.urlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
  }

  // Get cache statistics for performance monitoring
  public getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.urlCache.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }

  // Preload photos for better performance (useful for CV lists)
  public async preloadPhotos(photoIds: string[]): Promise<void> {
    const loadPromises = photoIds
      .filter((id) => !this.urlCache.has(id)) // Only load uncached photos
      .slice(0, 10) // Limit concurrent loads
      .map(async (photoId) => {
        try {
          await this.getPhotoUrl(photoId);
        } catch (error) {
          console.warn(`Failed to preload photo ${photoId}:`, error);
        }
      });

    await Promise.allSettled(loadPromises);
  }

  // Close database connection (useful for cleanup)
  public async closeConnection(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
    this.clearUrlCache();
  }
}

// Export singleton instance
export const photoService = PhotoService.getInstance();
