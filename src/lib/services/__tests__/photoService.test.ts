import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";
import { type PhotoRecord, PhotoService } from "../photoService";

// Mock IndexedDB
const mockDB = {
  add: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
  createObjectStore: vi.fn(),
};

const mockTransaction = {
  store: {
    index: vi.fn(),
    delete: vi.fn(),
  },
  done: Promise.resolve(),
};

const mockIndex = {
  getAll: vi.fn(),
};

// Mock idb module
vi.mock("idb", () => ({
  openDB: vi.fn(() => Promise.resolve(mockDB)),
}));

// Mock File and Blob
global.File = class MockFile {
  name: string;
  lastModified: number;
  size: number;
  type: string;

  constructor(
    chunks: BlobPart[],
    filename: string,
    options: FilePropertyBag = {},
  ) {
    this.name = filename;
    this.lastModified = options.lastModified || Date.now();
    this.size = chunks.reduce((size, chunk) => {
      if (typeof chunk === "string") return size + chunk.length;
      if (chunk instanceof ArrayBuffer) return size + chunk.byteLength;
      if (chunk instanceof Blob) return size + chunk.size;
      return size;
    }, 0);
    this.type = options.type || "";
  }

  // Mock Blob methods
  slice() {
    return new MockFile([], this.name, { type: this.type });
  }

  stream() {
    return new ReadableStream();
  }

  text() {
    return Promise.resolve("mock text");
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size));
  }
} as any;

// Mock URL.createObjectURL and revokeObjectURL
global.URL = {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
} as any;

describe("PhotoService", () => {
  let photoService: PhotoService;
  let mockFile: File;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Get fresh instance
    photoService = PhotoService.getInstance();
    
    // Clear URL cache to ensure clean state between tests
    photoService.clearUrlCache();

    // Create mock file
    mockFile = new File(["test image data"], "test.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    // Setup default mock behaviors
    mockDB.transaction.mockReturnValue(mockTransaction);
    mockTransaction.store.index.mockReturnValue(mockIndex);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = PhotoService.getInstance();
      const instance2 = PhotoService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("isIndexedDBAvailable", () => {
    it("should return true when IndexedDB is available", () => {
      // Mock window and indexedDB
      Object.defineProperty(global, "window", {
        value: { indexedDB: {} },
        writable: true,
      });

      expect(PhotoService.isIndexedDBAvailable()).toBe(true);
    });

    it("should return false when IndexedDB is not available", () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      expect(PhotoService.isIndexedDBAvailable()).toBe(false);
    });

    it("should return false when window is not available", () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });

      expect(PhotoService.isIndexedDBAvailable()).toBe(false);
    });
  });

  describe("storePhoto", () => {
    it("should store photo successfully and return photo ID", async () => {
      const cvId = "test-cv-id";
      mockDB.add.mockResolvedValue(undefined);

      const photoId = await photoService.storePhoto(mockFile, cvId);

      expect(photoId).toMatch(/^photo_test-cv-id_\d+_[a-z0-9]+$/);
      expect(mockDB.add).toHaveBeenCalledWith(
        "photos",
        expect.objectContaining({
          id: photoId,
          blob: mockFile,
          type: "image/jpeg",
          size: mockFile.size,
          cvId: cvId,
          uploadedAt: expect.any(Date),
        }),
      );
    });

    it("should throw quota exceeded error when storage is full", async () => {
      const cvId = "test-cv-id";
      const quotaError = new Error("Quota exceeded");
      quotaError.name = "QuotaExceededError";
      mockDB.add.mockRejectedValue(quotaError);

      await expect(photoService.storePhoto(mockFile, cvId)).rejects.toThrow(
        "Storage quota exceeded. Please remove some photos to free up space.",
      );
    });

    it("should throw generic error for other failures", async () => {
      const cvId = "test-cv-id";
      mockDB.add.mockRejectedValue(new Error("Database error"));

      await expect(photoService.storePhoto(mockFile, cvId)).rejects.toThrow(
        "Failed to store photo: Database error",
      );
    });
  });

  describe("getPhoto", () => {
    it("should retrieve photo successfully", async () => {
      const photoId = "test-photo-id";
      const mockPhotoRecord: PhotoRecord = {
        id: photoId,
        blob: mockFile,
        type: "image/jpeg",
        size: mockFile.size,
        uploadedAt: new Date(),
        cvId: "test-cv-id",
      };

      mockDB.get.mockResolvedValue(mockPhotoRecord);

      const result = await photoService.getPhoto(photoId);

      expect(result).toBe(mockFile);
      expect(mockDB.get).toHaveBeenCalledWith("photos", photoId);
    });

    it("should return null when photo not found", async () => {
      const photoId = "non-existent-photo";
      mockDB.get.mockResolvedValue(undefined);

      const result = await photoService.getPhoto(photoId);

      expect(result).toBeNull();
    });

    it("should return null when database error occurs", async () => {
      const photoId = "test-photo-id";
      mockDB.get.mockRejectedValue(new Error("Database error"));

      const result = await photoService.getPhoto(photoId);

      expect(result).toBeNull();
    });
  });

  describe("getPhotoUrl", () => {
    it("should create object URL for photo", async () => {
      const photoId = "test-photo-id";
      const mockPhotoRecord: PhotoRecord = {
        id: photoId,
        blob: mockFile,
        type: "image/jpeg",
        size: mockFile.size,
        uploadedAt: new Date(),
        cvId: "test-cv-id",
      };

      mockDB.get.mockResolvedValue(mockPhotoRecord);

      const result = await photoService.getPhotoUrl(photoId);

      expect(result).toBe("blob:mock-url");
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it("should return null when photo not found", async () => {
      const photoId = "non-existent-photo";
      mockDB.get.mockResolvedValue(undefined);

      const result = await photoService.getPhotoUrl(photoId);

      expect(result).toBeNull();
    });

    it("should return null when error occurs", async () => {
      const photoId = "test-photo-id";
      mockDB.get.mockRejectedValue(new Error("Database error"));

      const result = await photoService.getPhotoUrl(photoId);

      expect(result).toBeNull();
    });
  });

  describe("deletePhoto", () => {
    it("should delete photo successfully", async () => {
      const photoId = "test-photo-id";
      mockDB.delete.mockResolvedValue(undefined);

      await photoService.deletePhoto(photoId);

      expect(mockDB.delete).toHaveBeenCalledWith("photos", photoId);
    });

    it("should throw error when deletion fails", async () => {
      const photoId = "test-photo-id";
      mockDB.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(photoService.deletePhoto(photoId)).rejects.toThrow(
        "Failed to delete photo: Delete failed",
      );
    });
  });

  describe("deletePhotosByCvId", () => {
    it("should delete all photos for a CV", async () => {
      const cvId = "test-cv-id";
      const mockPhotos: PhotoRecord[] = [
        {
          id: "photo1",
          blob: mockFile,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: cvId,
        },
        {
          id: "photo2",
          blob: mockFile,
          type: "image/png",
          size: 2000,
          uploadedAt: new Date(),
          cvId: cvId,
        },
      ];

      mockIndex.getAll.mockResolvedValue(mockPhotos);
      mockTransaction.store.delete.mockResolvedValue(undefined);

      await photoService.deletePhotosByCvId(cvId);

      expect(mockIndex.getAll).toHaveBeenCalledWith(cvId);
      expect(mockTransaction.store.delete).toHaveBeenCalledWith("photo1");
      expect(mockTransaction.store.delete).toHaveBeenCalledWith("photo2");
    });

    it("should throw error when deletion fails", async () => {
      const cvId = "test-cv-id";
      mockIndex.getAll.mockRejectedValue(new Error("Query failed"));

      await expect(photoService.deletePhotosByCvId(cvId)).rejects.toThrow(
        "Failed to delete photos for CV: Query failed",
      );
    });
  });

  describe("getPhotosByCvId", () => {
    it("should retrieve all photos for a CV", async () => {
      const cvId = "test-cv-id";
      const mockPhotos: PhotoRecord[] = [
        {
          id: "photo1",
          blob: mockFile,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: cvId,
        },
      ];

      mockIndex.getAll.mockResolvedValue(mockPhotos);

      const result = await photoService.getPhotosByCvId(cvId);

      expect(result).toEqual(mockPhotos);
      expect(mockIndex.getAll).toHaveBeenCalledWith(cvId);
    });

    it("should return empty array when error occurs", async () => {
      const cvId = "test-cv-id";
      mockIndex.getAll.mockRejectedValue(new Error("Query failed"));

      const result = await photoService.getPhotosByCvId(cvId);

      expect(result).toEqual([]);
    });
  });

  describe("revokePhotoUrl", () => {
    it("should revoke object URL successfully", () => {
      const url = "blob:mock-url";

      PhotoService.revokePhotoUrl(url);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });

    it("should handle revoke errors gracefully", () => {
      const url = "blob:mock-url";
      (global.URL.revokeObjectURL as MockedFunction<any>).mockImplementation(
        () => {
          throw new Error("Revoke failed");
        },
      );

      // Should not throw
      expect(() => PhotoService.revokePhotoUrl(url)).not.toThrow();
    });
  });

  describe("getStorageInfo", () => {
    it("should return storage information when available", async () => {
      const mockEstimate = {
        usage: 1000000,
        quota: 10000000,
      };

      Object.defineProperty(global, "navigator", {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue(mockEstimate),
          },
        },
        writable: true,
      });

      const result = await photoService.getStorageInfo();

      expect(result).toEqual({
        used: 1000000,
        available: 10000000,
      });
    });

    it("should return null when storage API not available", async () => {
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true,
      });

      const result = await photoService.getStorageInfo();

      expect(result).toBeNull();
    });

    it("should return null when estimate fails", async () => {
      Object.defineProperty(global, "navigator", {
        value: {
          storage: {
            estimate: vi.fn().mockRejectedValue(new Error("Estimate failed")),
          },
        },
        writable: true,
      });

      const result = await photoService.getStorageInfo();

      expect(result).toBeNull();
    });
  });

  describe("cleanupOrphanedPhotos", () => {
    it("should clean up orphaned photos successfully", async () => {
      const existingCvIds = ["cv1", "cv2"];
      const mockPhotos: PhotoRecord[] = [
        {
          id: "photo1",
          blob: mockFile,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: "cv1", // Valid CV
        },
        {
          id: "photo2",
          blob: mockFile,
          type: "image/png",
          size: 2000,
          uploadedAt: new Date(),
          cvId: "cv3", // Orphaned - CV doesn't exist
        },
        {
          id: "photo3",
          blob: mockFile,
          type: "image/webp",
          size: 1500,
          uploadedAt: new Date(),
          cvId: "cv4", // Orphaned - CV doesn't exist
        },
      ];

      // Mock transaction and store
      const mockStore = {
        getAll: vi.fn().mockResolvedValue(mockPhotos),
        delete: vi.fn().mockResolvedValue(undefined),
      };
      const mockTx = {
        store: mockStore,
        done: Promise.resolve(),
      };
      mockDB.transaction.mockReturnValue(mockTx);

      const result = await photoService.cleanupOrphanedPhotos(existingCvIds);

      expect(result.cleaned).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockStore.delete).toHaveBeenCalledWith("photo2");
      expect(mockStore.delete).toHaveBeenCalledWith("photo3");
      expect(mockStore.delete).not.toHaveBeenCalledWith("photo1");
    });

    it("should handle deletion errors gracefully", async () => {
      const existingCvIds = ["cv1"];
      const mockPhotos: PhotoRecord[] = [
        {
          id: "photo1",
          blob: mockFile,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: "cv2", // Orphaned
        },
      ];

      const mockStore = {
        getAll: vi.fn().mockResolvedValue(mockPhotos),
        delete: vi.fn().mockRejectedValue(new Error("Delete failed")),
      };
      const mockTx = {
        store: mockStore,
        done: Promise.resolve(),
      };
      mockDB.transaction.mockReturnValue(mockTx);

      const result = await photoService.cleanupOrphanedPhotos(existingCvIds);

      expect(result.cleaned).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain(
        "Failed to delete orphaned photo photo1",
      );
    });

    it("should handle database errors", async () => {
      const existingCvIds = ["cv1"];
      mockDB.transaction.mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await photoService.cleanupOrphanedPhotos(existingCvIds);

      expect(result.cleaned).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Failed to cleanup orphaned photos");
    });

    it("should handle empty photo list", async () => {
      const existingCvIds = ["cv1", "cv2"];
      const mockStore = {
        getAll: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      };
      const mockTx = {
        store: mockStore,
        done: Promise.resolve(),
      };
      mockDB.transaction.mockReturnValue(mockTx);

      const result = await photoService.cleanupOrphanedPhotos(existingCvIds);

      expect(result.cleaned).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockStore.delete).not.toHaveBeenCalled();
    });
  });

  describe("getAllPhotosWithCvIds", () => {
    it("should return all photos with CV associations", async () => {
      const mockPhotos: PhotoRecord[] = [
        {
          id: "photo1",
          blob: mockFile,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date("2023-01-01"),
          cvId: "cv1",
        },
        {
          id: "photo2",
          blob: mockFile,
          type: "image/png",
          size: 2000,
          uploadedAt: new Date("2023-01-02"),
          cvId: "cv2",
        },
      ];

      mockDB.getAll.mockResolvedValue(mockPhotos);

      const result = await photoService.getAllPhotosWithCvIds();

      expect(result).toEqual([
        {
          photoId: "photo1",
          cvId: "cv1",
          uploadedAt: new Date("2023-01-01"),
        },
        {
          photoId: "photo2",
          cvId: "cv2",
          uploadedAt: new Date("2023-01-02"),
        },
      ]);
    });

    it("should return empty array when database error occurs", async () => {
      mockDB.getAll.mockRejectedValue(new Error("Database error"));

      const result = await photoService.getAllPhotosWithCvIds();

      expect(result).toEqual([]);
    });
  });
});
