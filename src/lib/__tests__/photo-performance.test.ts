import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { photoService } from "@/lib/services/photoService";

// Mock IndexedDB
vi.mock("idb", () => ({
  openDB: vi.fn().mockResolvedValue({
    add: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    transaction: vi.fn(),
    close: vi.fn(),
  }),
}));

// Mock URL.createObjectURL and revokeObjectURL
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

describe("PhotoService Performance Optimizations", () => {
  let mockDB: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");

    // Get the mocked openDB function
    const { openDB } = await import("idb");
    mockDB = {
      add: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
      transaction: vi.fn(),
      close: vi.fn(),
    };
    vi.mocked(openDB).mockResolvedValue(mockDB);
  });

  afterEach(async () => {
    await photoService.closeConnection();
  });

  describe("URL Caching", () => {
    it("should cache photo URLs to avoid recreating them", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      mockDB.get.mockResolvedValue({
        id: "photo1",
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId: "cv1",
      });

      // First call should create URL
      const url1 = await photoService.getPhotoUrl("photo1");
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect(url1).toBe("blob:mock-url");

      // Second call should use cached URL
      const url2 = await photoService.getPhotoUrl("photo1");
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1); // Still only called once
      expect(url2).toBe("blob:mock-url");
    });

    it("should clean up cache when it exceeds maximum size", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      mockDB.get.mockResolvedValue({
        id: "photo1",
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId: "cv1",
      });

      // Create many URLs to trigger cache cleanup
      const promises = [];
      for (let i = 0; i < 60; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });
        promises.push(photoService.getPhotoUrl(`photo${i}`));
      }

      await Promise.all(promises);

      // Should have called revokeObjectURL for cleanup
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it("should revoke URLs when photos are deleted", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      mockDB.get.mockResolvedValue({
        id: "photo1",
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId: "cv1",
      });

      // Create URL first
      await photoService.getPhotoUrl("photo1");
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

      // Delete photo should revoke URL
      await photoService.deletePhoto("photo1");
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("Connection Management", () => {
    it("should reuse existing database connection", async () => {
      const { openDB } = await import("idb");
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Make multiple calls
      await photoService.storePhoto(new File([mockBlob], "test.jpg"), "cv1");
      await photoService.storePhoto(new File([mockBlob], "test2.jpg"), "cv1");

      // Should only open DB once
      expect(openDB).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent initialization properly", async () => {
      const { openDB } = await import("idb");
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Make concurrent calls before DB is initialized
      const promises = [
        photoService.storePhoto(new File([mockBlob], "test1.jpg"), "cv1"),
        photoService.storePhoto(new File([mockBlob], "test2.jpg"), "cv1"),
        photoService.storePhoto(new File([mockBlob], "test3.jpg"), "cv1"),
      ];

      await Promise.all(promises);

      // Should only open DB once despite concurrent calls
      expect(openDB).toHaveBeenCalledTimes(1);
    });

    it("should properly close connection and clean up cache", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      mockDB.get.mockResolvedValue({
        id: "photo1",
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId: "cv1",
      });

      // Create some cached URLs
      await photoService.getPhotoUrl("photo1");

      // Close connection should clean up everything
      await photoService.closeConnection();

      expect(mockDB.close).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("Preloading", () => {
    it("should preload multiple photos efficiently", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Mock multiple photos
      for (let i = 1; i <= 5; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });
      }

      const photoIds = ["photo1", "photo2", "photo3", "photo4", "photo5"];
      await photoService.preloadPhotos(photoIds);

      // Should have created URLs for all photos
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(5);
    });

    it("should limit concurrent preloads", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Mock many photos
      for (let i = 1; i <= 15; i++) {
        mockDB.get.mockResolvedValueOnce({
          id: `photo${i}`,
          blob: mockBlob,
          type: "image/jpeg",
          size: 1000,
          uploadedAt: new Date(),
          cvId: `cv${i}`,
        });
      }

      const photoIds = Array.from({ length: 15 }, (_, i) => `photo${i + 1}`);
      await photoService.preloadPhotos(photoIds);

      // Should limit to 10 concurrent loads
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(10);
    });

    it("should skip already cached photos during preload", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      mockDB.get.mockResolvedValue({
        id: "photo1",
        blob: mockBlob,
        type: "image/jpeg",
        size: 1000,
        uploadedAt: new Date(),
        cvId: "cv1",
      });

      // Load photo first to cache it
      await photoService.getPhotoUrl("photo1");
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

      // Preload should skip cached photo
      await photoService.preloadPhotos(["photo1"]);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe("Cache Statistics", () => {
    it("should provide accurate cache statistics", async () => {
      const stats = photoService.getCacheStats();

      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("maxSize");
      expect(typeof stats.size).toBe("number");
      expect(typeof stats.maxSize).toBe("number");
    });

    it("should clear cache properly", () => {
      photoService.clearUrlCache();

      const stats = photoService.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe("Memory Management", () => {
    it("should handle large numbers of photos without memory leaks", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // Create many photos
      for (let i = 0; i < 100; i++) {
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

      // Cache should have been cleaned up during the process
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      const stats = photoService.getCacheStats();
      expect(stats.size).toBeLessThan(100); // Should be less due to cleanup
    });
  });

  describe("Error Handling", () => {
    it("should handle IndexedDB errors gracefully", async () => {
      mockDB.get.mockRejectedValue(new Error("IndexedDB error"));

      const url = await photoService.getPhotoUrl("photo1");
      expect(url).toBeNull();
    });

    it("should retry connection on initialization failure", async () => {
      const { openDB } = await import("idb");
      const mockOpenDB = vi.mocked(openDB);

      // First call fails
      mockOpenDB.mockRejectedValueOnce(new Error("DB init failed"));
      // Second call succeeds
      mockOpenDB.mockResolvedValueOnce(mockDB);

      const mockBlob = new Blob(["test"], { type: "image/jpeg" });

      // First attempt should fail and reset promise
      await expect(
        photoService.storePhoto(new File([mockBlob], "test.jpg"), "cv1"),
      ).rejects.toThrow("Failed to initialize IndexedDB");

      // Second attempt should succeed
      await expect(
        photoService.storePhoto(new File([mockBlob], "test.jpg"), "cv1"),
      ).resolves.toBeDefined();

      expect(mockOpenDB).toHaveBeenCalledTimes(2);
    });
  });
});
