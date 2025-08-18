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

  private constructor() {}

  // Singleton pattern to ensure single instance
  public static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  // Initialize IndexedDB connection
  private async initDB(): Promise<IDBPDatabase<PhotoDB>> {
    if (this.db) {
      return this.db;
    }

    try {
      this.db = await openDB<PhotoDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create photos object store
          const photoStore = db.createObjectStore("photos", {
            keyPath: "id",
          });

          // Create index for querying photos by CV ID
          photoStore.createIndex("by-cv", "cvId", { unique: false });
        },
      });

      return this.db;
    } catch (error) {
      throw new Error(
        `Failed to initialize IndexedDB: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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

  // Get photo as object URL for display
  public async getPhotoUrl(photoId: string): Promise<string | null> {
    try {
      const blob = await this.getPhoto(photoId);
      if (!blob) {
        return null;
      }

      return URL.createObjectURL(blob);
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

      // Delete each photo
      for (const record of photoRecords) {
        await tx.store.delete(record.id);
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
}

// Export singleton instance
export const photoService = PhotoService.getInstance();
