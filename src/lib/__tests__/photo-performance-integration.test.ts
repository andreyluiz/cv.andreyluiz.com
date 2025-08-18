import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { photoService } from "@/lib/services/photoService";

// Mock IndexedDB with realistic behavior
const mockDB = {
  add: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  transaction: vi.fn(() => ({
    store: {
      delete: vi.fn(),
      getAll: vi.fn(),
      index: vi.fn(() => ({
        getAll: vi.fn(),
      })),
    },
    done: Promise.resolve(),
  })),
  close: vi.fn(),
};

vi.mock("idb", () => ({
  openDB: vi.fn().mockResolvedValue(mockDB),
}));

// Mock URL methods
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(global.URL, "createObjectURL", {
  value: mockCreateObjectURL,
  writable: true,
});

Object.defineProperty(global.URL, "revokeObjectURL", {
  value: mockRevokeObjectURL,
  writable: true,
});

// Mock performance.now for timing tests
const mockPerformanceNow = vi.fn();
Object.defineProperty(global.performance, "now", {
  value: mockPerformanceNow,
  writable: true,
});

// Helper to create mock large image file
function createMockImageFile(sizeInMB: number, name: string): File {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = new ArrayBuffer(sizeInBytes);
  const blob = new Blob([buffer], { type: "image/jpeg" });
  return new File([blob], name, { type: "image/jpeg" });
}

describe("Photo Performance Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockImplementation(
      (blob) => `blob:mock-${Date.now()}-${Math.random()}`,
    );
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(async () => {
    await photoService.closeConnection();
  });

  describe("Large Photo Handling", () => {
    it("should handle multiple large photos efficiently", async () => {
      const largePhotos = [
        createMockImageFile(1.5, "photo1.jpg"),
        createMockImageFile(1.8, "photo2.jpg"),
        createMockImageFile(1.2, "photo3.jpg"),
      ];

      const startTime = Date.now();

      // Store multiple large photos
      const photoIds = await Promise.all(
        largePhotos.map((file, index) =>
          photoService.storePhoto(file, `cv${index + 1}`),
        ),
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (adjust based on your requirements)
      expect(totalTime).toBeLessThan(5000); // 5 seconds
      expect(photoIds).toHaveLength(3);
      expect(mockDB.add).toHaveBeenCalledTimes(3);
    });

    it("should handle storage quota exceeded gracefully", async () => {
      const largePhoto = createMockImageFile(2, "large.jpg");

      // Mock quota exceeded error
      mockDB.add.mockRejectedValue(
        Object.assign(new Error("QuotaExceededError"), {
          name: "QuotaExceededError",
        }),
      );

      await expect(photoService.storePhoto(largePhoto, "cv1")).rejects.toThrow(
        "Storage quota exceeded",
      );
    });
  });

  describe("Memory Management Under Load", () => {
    it("should manage memory efficiently with many photos", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Simulate loading many photos
      const photoCount = 100;
      const photoIds: string[] = [];

      for (let i = 0; i < photoCount; i++) {
        const photoId = `photo${i}`;
        photoIds.push(photoId);

        mockDB.get.mockResolvedValueOnce({
          id: photoId,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });
      }

      // Load all photos
      const urls = await Promise.all(
        photoIds.map((id) => photoService.getPhotoUrl(id)),
      );

      expect(urls).toHaveLength(photoCount);

      // Cache should have been cleaned up during the process
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      // Final cache size should be within limits
      const stats = photoService.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });

    it("should clean up URLs when deleting CVs with many photos", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      const cvId = "cv1";
      const photoCount = 20;

      // Mock photos for a CV
      const mockPhotos = Array.from({ length: photoCount }, (_, i) => ({
        id: `photo${i}`,
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId,
      }));

      mockDB.transaction().store.index().getAll.mockResolvedValue(mockPhotos);

      // Load some photos to cache them
      for (let i = 0; i < 5; i++) {
        mockDB.get.mockResolvedValueOnce(mockPhotos[i]);
        await photoService.getPhotoUrl(`photo${i}`);
      }

      // Delete all photos for the CV
      await photoService.deletePhotosByCvId(cvId);

      // Should have revoked cached URLs
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(5);

      // Should have deleted all photos from DB
      expect(mockDB.transaction().store.delete).toHaveBeenCalledTimes(
        photoCount,
      );
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent photo loads efficiently", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      const photoCount = 10;

      // Mock multiple photos
      for (let i = 0; i < photoCount; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });
      }

      const startTime = Date.now();

      // Load photos concurrently
      const promises = Array.from({ length: photoCount }, (_, i) =>
        photoService.getPhotoUrl(`photo${i}`),
      );

      const urls = await Promise.all(promises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(urls).toHaveLength(photoCount);
      expect(urls.every((url) => url !== null)).toBe(true);

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000); // 2 seconds

      // Should only initialize DB once despite concurrent calls
      expect(openDB).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent store and retrieve operations", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      const file = new File([mockBlob], "test.jpg", { type: "image/jpeg" });

      // Mock successful storage
      mockDB.add.mockResolvedValue(undefined);
      mockDB.get.mockResolvedValue({
        id: "photo1",
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId: "cv1",
      });

      // Perform concurrent operations
      const [photoId, photoUrl] = await Promise.all([
        photoService.storePhoto(file, "cv1"),
        photoService.getPhotoUrl("photo1"),
      ]);

      expect(photoId).toBeDefined();
      expect(photoUrl).toBeDefined();
      expect(openDB).toHaveBeenCalledTimes(1);
    });
  });

  describe("Performance Monitoring", () => {
    it("should provide accurate performance statistics", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Load some photos to generate stats
      for (let i = 0; i < 5; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });

        await photoService.getPhotoUrl(`photo${i}`);
      }

      const stats = photoService.getCacheStats();

      expect(stats.size).toBe(5);
      expect(stats.maxSize).toBeGreaterThan(0);
      expect(typeof stats.size).toBe("number");
      expect(typeof stats.maxSize).toBe("number");
    });

    it("should handle storage info retrieval", async () => {
      // Mock navigator.storage.estimate
      const mockEstimate = vi.fn().mockResolvedValue({
        usage: 1024 * 1024 * 10, // 10MB
        quota: 1024 * 1024 * 100, // 100MB
      });

      Object.defineProperty(global.navigator, "storage", {
        value: { estimate: mockEstimate },
        writable: true,
      });

      const storageInfo = await photoService.getStorageInfo();

      expect(storageInfo).toEqual({
        used: 1024 * 1024 * 10,
        available: 1024 * 1024 * 100,
      });
    });
  });

  describe("Cleanup Operations", () => {
    it("should efficiently clean up orphaned photos", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Mock orphaned photos (CVs that no longer exist)
      const allPhotos = [
        {
          id: "photo1",
          cvId: "cv1",
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
        },
        {
          id: "photo2",
          cvId: "cv2",
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
        },
        {
          id: "photo3",
          cvId: "cv3",
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
        },
      ];

      mockDB.transaction().store.getAll.mockResolvedValue(allPhotos);

      // Only cv1 still exists
      const existingCvIds = ["cv1"];

      const result = await photoService.cleanupOrphanedPhotos(existingCvIds);

      expect(result.cleaned).toBe(2); // photo2 and photo3 should be cleaned
      expect(result.errors).toHaveLength(0);
      expect(mockDB.transaction().store.delete).toHaveBeenCalledTimes(2);
    });

    it("should handle cleanup errors gracefully", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      const allPhotos = [
        {
          id: "photo1",
          cvId: "cv1",
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
        },
        {
          id: "photo2",
          cvId: "cv2",
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
        },
      ];

      mockDB.transaction().store.getAll.mockResolvedValue(allPhotos);
      mockDB
        .transaction()
        .store.delete.mockRejectedValue(new Error("Delete failed"));

      const result = await photoService.cleanupOrphanedPhotos([]);

      expect(result.cleaned).toBe(0);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain("Failed to delete orphaned photo");
    });
  });

  describe("Preloading Performance", () => {
    it("should preload photos efficiently without blocking", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Mock photos for preloading
      for (let i = 0; i < 15; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });
      }

      const photoIds = Array.from({ length: 15 }, (_, i) => `photo${i}`);

      const startTime = Date.now();
      await photoService.preloadPhotos(photoIds);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(3000); // 3 seconds

      // Should limit concurrent loads to 10
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(10);
    });

    it("should skip already cached photos during preload", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Load and cache some photos first
      for (let i = 0; i < 3; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });

        await photoService.getPhotoUrl(`photo${i}`);
      }

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(3);

      // Preload should skip cached photos
      await photoService.preloadPhotos(["photo0", "photo1", "photo2"]);

      // Should not create additional URLs for cached photos
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(3);
    });
  });
});
