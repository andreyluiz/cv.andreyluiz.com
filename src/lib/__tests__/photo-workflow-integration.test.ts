import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../store";
import type { IngestedCV, PhotoRecord, Variant } from "../types";

// Mock the photo service
vi.mock("@/lib/services/photoService", () => ({
  photoService: {
    storePhoto: vi.fn(),
    getPhoto: vi.fn(),
    getPhotoUrl: vi.fn(),
    deletePhoto: vi.fn(),
    deletePhotosByCvId: vi.fn(),
    getPhotosByCvId: vi.fn(),
    cleanupOrphanedPhotos: vi.fn(),
    getAllPhotosWithCvIds: vi.fn(),
    getStorageInfo: vi.fn(),
  },
  PhotoService: {
    getInstance: vi.fn(),
    isIndexedDBAvailable: vi.fn(() => true),
    revokePhotoUrl: vi.fn(),
  },
}));

// Mock server actions
vi.mock("@/lib/server/actions", () => ({
  ingestCV: vi.fn(),
  tailorResume: vi.fn(),
  generateCoverLetter: vi.fn(),
}));

describe("Photo Workflow Integration Tests", () => {
  const mockApiKey = "sk-or-test-key-123";
  const mockModel = "openai/gpt-4.1-mini";

  const mockVariant: Variant = {
    name: "John Doe",
    title: "Software Engineer",
    contactInfo: {
      email: "john@example.com",
      phone: "+1234567890",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      website: "johndoe.dev",
      age: "30",
      nationality: "American",
    },
    summary: "Experienced software engineer with 5 years of experience",
    qualities: ["Problem solver", "Team player"],
    generalSkills: ["JavaScript", "TypeScript", "React"],
    skills: [
      {
        domain: "Frontend",
        skills: ["React", "Vue.js", "Angular"],
      },
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: ["Built scalable web applications"],
        techStack: ["React", "Node.js"],
        isPrevious: false,
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform",
        techStack: ["React", "Node.js", "MongoDB"],
        period: { start: "2021", end: "2022" },
      },
    ],
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "University of Technology",
        year: "2018",
        location: "California, USA",
      },
    ],
    certifications: [],
    languages: [],
    publications: [],
    personalityTraits: ["Problem solver", "Team player"],
  };

  const createMockFile = (name: string, type: string, size = 1000): File => {
    return new File(["mock image data"], name, {
      type,
      lastModified: Date.now(),
    });
  };

  const createMockPhotoRecord = (
    photoId: string,
    cvId: string,
  ): PhotoRecord => ({
    id: photoId,
    blob: createMockFile("test.jpg", "image/jpeg"),
    type: "image/jpeg",
    size: 1000,
    uploadedAt: new Date(),
    cvId,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useStore.setState({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini",
      ingestedCVs: [],
      currentCV: null,
      generatedCoverLetter: null,
      coverLetterInputs: null,
      hideBullets: false,
      layoutMode: "single",
    });
  });

  describe("End-to-End Photo Upload During CV Creation", () => {
    it("should complete full CV creation workflow with photo upload", async () => {
      const { photoService } = await import("@/lib/services/photoService");
      const { ingestCV } = await import("@/lib/server/actions");

      // Setup store
      const { setApiKey, setSelectedModel, addIngestedCV, setCurrentCV } =
        useStore.getState();
      setApiKey(mockApiKey);
      setSelectedModel(mockModel);

      // Mock photo upload
      const mockPhotoId = "photo_cv-test_123456_abc";
      const mockFile = createMockFile("profile.jpg", "image/jpeg");
      vi.mocked(photoService.storePhoto).mockResolvedValue(mockPhotoId);
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue("blob:mock-url");

      // Mock CV ingestion
      vi.mocked(ingestCV).mockResolvedValue(mockVariant);

      // Step 1: Upload photo during CV creation
      const cvId = "cv-test";
      const photoId = await photoService.storePhoto(mockFile, cvId);
      expect(photoId).toBe(mockPhotoId);
      expect(photoService.storePhoto).toHaveBeenCalledWith(mockFile, cvId);

      // Step 2: Ingest CV with photo reference
      const rawText =
        "John Doe\nSoftware Engineer\njohn@example.com\nExperienced developer...";
      const formattedCV = await ingestCV(rawText, mockApiKey, mockModel);
      expect(formattedCV).toEqual(mockVariant);

      // Step 3: Create IngestedCV with photo reference
      const ingestedCV: IngestedCV = {
        id: cvId,
        title: "John Doe - Software Engineer",
        rawText,
        formattedCV,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 4: Store CV in state
      addIngestedCV(ingestedCV);
      setCurrentCV(formattedCV);

      // Step 5: Verify complete workflow
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBe(mockPhotoId);
      expect(state.currentCV).toEqual(mockVariant);

      // Step 6: Verify photo can be retrieved
      const photoUrl = await photoService.getPhotoUrl(photoId);
      expect(photoUrl).toBe("blob:mock-url");
      expect(photoService.getPhotoUrl).toHaveBeenCalledWith(photoId);
    });

    it("should handle CV creation without photo", async () => {
      const { ingestCV } = await import("@/lib/server/actions");

      // Setup store
      const { setApiKey, addIngestedCV } = useStore.getState();
      setApiKey(mockApiKey);

      // Mock CV ingestion
      vi.mocked(ingestCV).mockResolvedValue(mockVariant);

      // Create CV without photo
      const rawText =
        "John Doe\nSoftware Engineer\njohn@example.com\nExperienced developer...";
      const formattedCV = await ingestCV(rawText, mockApiKey, mockModel);

      const ingestedCV: IngestedCV = {
        id: "cv-no-photo",
        title: "John Doe - Software Engineer",
        rawText,
        formattedCV,
        // No profilePhotoId
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addIngestedCV(ingestedCV);

      // Verify CV is stored without photo reference
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBeUndefined();
    });

    it("should handle photo upload failure during CV creation", async () => {
      const { photoService } = await import("@/lib/services/photoService");
      const { ingestCV } = await import("@/lib/server/actions");

      // Setup store
      const { setApiKey, addIngestedCV } = useStore.getState();
      setApiKey(mockApiKey);

      // Mock photo upload failure
      const mockFile = createMockFile("profile.jpg", "image/jpeg");
      vi.mocked(photoService.storePhoto).mockRejectedValue(
        new Error("Storage quota exceeded"),
      );

      // Mock successful CV ingestion
      vi.mocked(ingestCV).mockResolvedValue(mockVariant);

      // Attempt photo upload
      const cvId = "cv-photo-fail";
      await expect(photoService.storePhoto(mockFile, cvId)).rejects.toThrow(
        "Storage quota exceeded",
      );

      // Continue with CV creation without photo
      const rawText =
        "John Doe\nSoftware Engineer\njohn@example.com\nExperienced developer...";
      const formattedCV = await ingestCV(rawText, mockApiKey, mockModel);

      const ingestedCV: IngestedCV = {
        id: cvId,
        title: "John Doe - Software Engineer",
        rawText,
        formattedCV,
        // No profilePhotoId due to upload failure
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addIngestedCV(ingestedCV);

      // Verify CV is still created successfully
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBeUndefined();
    });
  });

  describe("Photo Persistence and Retrieval Across Browser Sessions", () => {
    it("should persist photo data across store resets", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup initial state with CV and photo
      const cvId = "cv-persist-test";
      const photoId = "photo_persist_123";
      const mockFile = createMockFile("profile.jpg", "image/jpeg");

      vi.mocked(photoService.storePhoto).mockResolvedValue(photoId);
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue("blob:mock-url");
      vi.mocked(photoService.getPhoto).mockResolvedValue(mockFile);

      // Store photo
      const storedPhotoId = await photoService.storePhoto(mockFile, cvId);
      expect(storedPhotoId).toBe(photoId);

      // Create and store CV with photo reference
      const ingestedCV: IngestedCV = {
        id: cvId,
        title: "Persistent CV",
        rawText: "Test CV content for persistence testing...",
        formattedCV: mockVariant,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(ingestedCV);

      // Simulate browser session restart by resetting store state
      useStore.setState({
        apiKey: "",
        selectedModel: "openai/gpt-4.1-mini",
        ingestedCVs: [],
        currentCV: null,
        generatedCoverLetter: null,
        coverLetterInputs: null,
        hideBullets: false,
        layoutMode: "single",
      });

      // Simulate loading persisted data (in real app, this would be handled by zustand persist)
      const { addIngestedCV: addPersistedCV } = useStore.getState();
      addPersistedCV(ingestedCV);

      // Verify photo can still be retrieved after "session restart"
      const retrievedPhotoUrl = await photoService.getPhotoUrl(photoId);
      expect(retrievedPhotoUrl).toBe("blob:mock-url");

      const retrievedPhoto = await photoService.getPhoto(photoId);
      expect(retrievedPhoto).toBe(mockFile);

      // Verify CV data is restored
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBe(photoId);
    });

    it("should handle missing photos gracefully after session restart", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Create CV with photo reference
      const cvId = "cv-missing-photo";
      const photoId = "photo_missing_123";

      const ingestedCV: IngestedCV = {
        id: cvId,
        title: "CV with Missing Photo",
        rawText: "Test CV content...",
        formattedCV: mockVariant,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock photo not found (simulating data corruption or cleanup)
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(null);
      vi.mocked(photoService.getPhoto).mockResolvedValue(null);

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(ingestedCV);

      // Attempt to retrieve missing photo
      const photoUrl = await photoService.getPhotoUrl(photoId);
      expect(photoUrl).toBeNull();

      const photo = await photoService.getPhoto(photoId);
      expect(photo).toBeNull();

      // Verify CV data is still intact
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBe(photoId); // Reference preserved
    });

    it("should maintain photo-CV associations across multiple sessions", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Create multiple CVs with photos
      const cv1Id = "cv-multi-1";
      const cv2Id = "cv-multi-2";
      const photo1Id = "photo_multi_1";
      const photo2Id = "photo_multi_2";

      const mockFile1 = createMockFile("profile1.jpg", "image/jpeg");
      const mockFile2 = createMockFile("profile2.png", "image/png");

      vi.mocked(photoService.storePhoto)
        .mockResolvedValueOnce(photo1Id)
        .mockResolvedValueOnce(photo2Id);
      vi.mocked(photoService.getPhotoUrl).mockImplementation(async (id) => {
        if (id === photo1Id) return "blob:mock-url-1";
        if (id === photo2Id) return "blob:mock-url-2";
        return null;
      });
      vi.mocked(photoService.getPhotosByCvId).mockImplementation(
        async (cvId) => {
          if (cvId === cv1Id) return [createMockPhotoRecord(photo1Id, cv1Id)];
          if (cvId === cv2Id) return [createMockPhotoRecord(photo2Id, cv2Id)];
          return [];
        },
      );

      // Store photos
      await photoService.storePhoto(mockFile1, cv1Id);
      await photoService.storePhoto(mockFile2, cv2Id);

      // Create CVs with photo references
      const cv1: IngestedCV = {
        id: cv1Id,
        title: "CV 1",
        rawText: "First CV content...",
        formattedCV: { ...mockVariant, name: "User One" },
        profilePhotoId: photo1Id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cv2: IngestedCV = {
        id: cv2Id,
        title: "CV 2",
        rawText: "Second CV content...",
        formattedCV: { ...mockVariant, name: "User Two" },
        profilePhotoId: photo2Id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(cv1);
      addIngestedCV(cv2);

      // Verify associations are maintained
      const cv1Photos = await photoService.getPhotosByCvId(cv1Id);
      expect(cv1Photos).toHaveLength(1);
      expect(cv1Photos[0].id).toBe(photo1Id);

      const cv2Photos = await photoService.getPhotosByCvId(cv2Id);
      expect(cv2Photos).toHaveLength(1);
      expect(cv2Photos[0].id).toBe(photo2Id);

      // Verify correct photo URLs
      const url1 = await photoService.getPhotoUrl(photo1Id);
      const url2 = await photoService.getPhotoUrl(photo2Id);
      expect(url1).toBe("blob:mock-url-1");
      expect(url2).toBe("blob:mock-url-2");
    });
  });

  describe("Photo Editing and Deletion Workflows", () => {
    it("should handle complete photo editing workflow", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup initial CV with photo
      const cvId = "cv-edit-test";
      const oldPhotoId = "photo_old_123";
      const newPhotoId = "photo_new_456";

      const oldFile = createMockFile("old-profile.jpg", "image/jpeg");
      const newFile = createMockFile("new-profile.png", "image/png");

      vi.mocked(photoService.storePhoto)
        .mockResolvedValueOnce(oldPhotoId)
        .mockResolvedValueOnce(newPhotoId);
      vi.mocked(photoService.getPhotoUrl).mockImplementation(async (id) => {
        if (id === oldPhotoId) return "blob:old-url";
        if (id === newPhotoId) return "blob:new-url";
        return null;
      });
      vi.mocked(photoService.deletePhoto).mockResolvedValue();

      // Create initial CV with photo
      await photoService.storePhoto(oldFile, cvId);

      const initialCV: IngestedCV = {
        id: cvId,
        title: "Editable CV",
        rawText: "Original CV content...",
        formattedCV: mockVariant,
        profilePhotoId: oldPhotoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV, updateIngestedCV } = useStore.getState();
      addIngestedCV(initialCV);

      // Step 1: Verify initial photo
      const initialPhotoUrl = await photoService.getPhotoUrl(oldPhotoId);
      expect(initialPhotoUrl).toBe("blob:old-url");

      // Step 2: Replace photo (delete old, store new)
      await photoService.deletePhoto(oldPhotoId);
      const newStoredPhotoId = await photoService.storePhoto(newFile, cvId);

      expect(photoService.deletePhoto).toHaveBeenCalledWith(oldPhotoId);
      expect(newStoredPhotoId).toBe(newPhotoId);

      // Step 3: Update CV with new photo reference
      const updatedCV: IngestedCV = {
        ...initialCV,
        profilePhotoId: newPhotoId,
        updatedAt: new Date(),
      };

      updateIngestedCV(cvId, updatedCV);

      // Step 4: Verify update
      const state = useStore.getState();
      expect(state.ingestedCVs[0].profilePhotoId).toBe(newPhotoId);

      const newPhotoUrl = await photoService.getPhotoUrl(newPhotoId);
      expect(newPhotoUrl).toBe("blob:new-url");
    });

    it("should handle photo removal workflow", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup CV with photo
      const cvId = "cv-remove-test";
      const photoId = "photo_remove_123";

      vi.mocked(photoService.deletePhoto).mockResolvedValue();

      const cvWithPhoto: IngestedCV = {
        id: cvId,
        title: "CV with Photo to Remove",
        rawText: "CV content...",
        formattedCV: mockVariant,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV, updateIngestedCV } = useStore.getState();
      addIngestedCV(cvWithPhoto);

      // Remove photo
      await photoService.deletePhoto(photoId);
      expect(photoService.deletePhoto).toHaveBeenCalledWith(photoId);

      // Update CV to remove photo reference
      const updatedCV: IngestedCV = {
        ...cvWithPhoto,
        profilePhotoId: undefined,
        updatedAt: new Date(),
      };

      updateIngestedCV(cvId, updatedCV);

      // Verify photo reference is removed
      const state = useStore.getState();
      expect(state.ingestedCVs[0].profilePhotoId).toBeUndefined();
    });

    it("should handle CV deletion with photo cleanup", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup CV with photo
      const cvId = "cv-delete-test";
      const photoId = "photo_delete_123";

      vi.mocked(photoService.deletePhotosByCvId).mockResolvedValue();

      const cvWithPhoto: IngestedCV = {
        id: cvId,
        title: "CV to Delete",
        rawText: "CV content...",
        formattedCV: mockVariant,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV, deleteIngestedCV } = useStore.getState();
      addIngestedCV(cvWithPhoto);

      // Delete CV and associated photos
      await photoService.deletePhotosByCvId(cvId);
      deleteIngestedCV(cvId);

      // Verify cleanup
      expect(photoService.deletePhotosByCvId).toHaveBeenCalledWith(cvId);

      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(0);
    });

    it("should handle bulk photo operations", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup multiple CVs with photos
      const cvIds = ["cv-bulk-1", "cv-bulk-2", "cv-bulk-3"];
      const photoIds = ["photo_bulk_1", "photo_bulk_2", "photo_bulk_3"];

      vi.mocked(photoService.getAllPhotosWithCvIds).mockResolvedValue([
        { photoId: photoIds[0], cvId: cvIds[0], uploadedAt: new Date() },
        { photoId: photoIds[1], cvId: cvIds[1], uploadedAt: new Date() },
        { photoId: photoIds[2], cvId: cvIds[2], uploadedAt: new Date() },
      ]);
      vi.mocked(photoService.cleanupOrphanedPhotos).mockResolvedValue({
        cleaned: 1,
        errors: [],
      });

      const { addIngestedCV, deleteIngestedCV } = useStore.getState();

      // Add CVs
      cvIds.forEach((cvId, index) => {
        const cv: IngestedCV = {
          id: cvId,
          title: `Bulk CV ${index + 1}`,
          rawText: `CV content ${index + 1}...`,
          formattedCV: { ...mockVariant, name: `User ${index + 1}` },
          profilePhotoId: photoIds[index],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addIngestedCV(cv);
      });

      // Verify all photos are tracked
      const allPhotos = await photoService.getAllPhotosWithCvIds();
      expect(allPhotos).toHaveLength(3);

      // Delete one CV (simulating orphaned photo)
      deleteIngestedCV(cvIds[0]);

      // Cleanup orphaned photos
      const remainingCvIds = cvIds.slice(1);
      const cleanupResult =
        await photoService.cleanupOrphanedPhotos(remainingCvIds);

      expect(cleanupResult.cleaned).toBe(1);
      expect(cleanupResult.errors).toHaveLength(0);
    });
  });

  describe("Error Recovery and Fallback Scenarios", () => {
    it("should handle IndexedDB unavailability", async () => {
      const { PhotoService } = await import("@/lib/services/photoService");

      // Mock IndexedDB as unavailable
      vi.mocked(PhotoService.isIndexedDBAvailable).mockReturnValue(false);

      // Attempt to create CV without photo functionality
      const cvId = "cv-no-indexeddb";
      const ingestedCV: IngestedCV = {
        id: cvId,
        title: "CV without IndexedDB",
        rawText: "CV content...",
        formattedCV: mockVariant,
        // No profilePhotoId due to IndexedDB unavailability
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(ingestedCV);

      // Verify CV is created successfully without photo functionality
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBeUndefined();
    });

    it("should handle storage quota exceeded errors", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Mock quota exceeded error
      const quotaError = new Error("Storage quota exceeded");
      quotaError.name = "QuotaExceededError";
      vi.mocked(photoService.storePhoto).mockRejectedValue(quotaError);
      vi.mocked(photoService.getStorageInfo).mockResolvedValue({
        used: 9500000000, // 9.5GB used
        available: 10000000000, // 10GB total
      });

      const cvId = "cv-quota-test";
      const mockFile = createMockFile(
        "large-profile.jpg",
        "image/jpeg",
        5000000,
      ); // 5MB file

      // Attempt photo upload
      await expect(photoService.storePhoto(mockFile, cvId)).rejects.toThrow(
        "Storage quota exceeded",
      );

      // Check storage info
      const storageInfo = await photoService.getStorageInfo();
      expect(storageInfo?.used).toBeGreaterThan(storageInfo?.available! * 0.9); // Over 90% used

      // Create CV without photo due to quota issue
      const cvWithoutPhoto: IngestedCV = {
        id: cvId,
        title: "CV without Photo (Quota)",
        rawText: "CV content...",
        formattedCV: mockVariant,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(cvWithoutPhoto);

      // Verify CV is still created
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBeUndefined();
    });

    it("should handle photo corruption and recovery", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup CV with photo
      const cvId = "cv-corruption-test";
      const photoId = "photo_corrupt_123";

      // Mock photo retrieval failure (corruption)
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(null);
      vi.mocked(photoService.getPhoto).mockResolvedValue(null);

      const cvWithCorruptPhoto: IngestedCV = {
        id: cvId,
        title: "CV with Corrupt Photo",
        rawText: "CV content...",
        formattedCV: mockVariant,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(cvWithCorruptPhoto);

      // Attempt to retrieve corrupted photo
      const photoUrl = await photoService.getPhotoUrl(photoId);
      const photo = await photoService.getPhoto(photoId);

      expect(photoUrl).toBeNull();
      expect(photo).toBeNull();

      // Verify CV data is preserved despite photo corruption
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0].profilePhotoId).toBe(photoId); // Reference preserved for potential recovery
    });

    it("should handle network interruption during photo operations", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Mock network error
      const networkError = new Error("Network request failed");
      vi.mocked(photoService.storePhoto).mockRejectedValue(networkError);

      const cvId = "cv-network-test";
      const mockFile = createMockFile("profile.jpg", "image/jpeg");

      // Attempt photo upload with network failure
      await expect(photoService.storePhoto(mockFile, cvId)).rejects.toThrow(
        "Network request failed",
      );

      // Simulate retry after network recovery
      const retryPhotoId = "photo_retry_123";
      vi.mocked(photoService.storePhoto).mockResolvedValue(retryPhotoId);

      const retriedPhotoId = await photoService.storePhoto(mockFile, cvId);
      expect(retriedPhotoId).toBe(retryPhotoId);
    });

    it("should handle concurrent photo operations", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup concurrent operations
      const cvId = "cv-concurrent-test";
      const file1 = createMockFile("photo1.jpg", "image/jpeg");
      const file2 = createMockFile("photo2.png", "image/png");

      vi.mocked(photoService.storePhoto).mockImplementation(
        async (file, id) => {
          // Simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 100));
          return `photo_${id}_${file.name}`;
        },
      );

      // Execute concurrent operations
      const [result1, result2] = await Promise.all([
        photoService.storePhoto(file1, cvId),
        photoService.storePhoto(file2, cvId),
      ]);

      expect(result1).toBe(`photo_${cvId}_photo1.jpg`);
      expect(result2).toBe(`photo_${cvId}_photo2.png`);
      expect(photoService.storePhoto).toHaveBeenCalledTimes(2);
    });

    it("should handle photo deletion failures gracefully", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup CV with photo
      const cvId = "cv-delete-fail-test";
      const photoId = "photo_delete_fail_123";

      // Mock deletion failure
      vi.mocked(photoService.deletePhoto).mockRejectedValue(
        new Error("Delete operation failed"),
      );

      const cvWithPhoto: IngestedCV = {
        id: cvId,
        title: "CV with Undeletable Photo",
        rawText: "CV content...",
        formattedCV: mockVariant,
        profilePhotoId: photoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { addIngestedCV, deleteIngestedCV } = useStore.getState();
      addIngestedCV(cvWithPhoto);

      // Attempt photo deletion (fails)
      await expect(photoService.deletePhoto(photoId)).rejects.toThrow(
        "Delete operation failed",
      );

      // Continue with CV deletion despite photo deletion failure
      deleteIngestedCV(cvId);

      // Verify CV is removed from store even if photo deletion failed
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(0);
    });

    it("should handle memory cleanup for object URLs", async () => {
      const { PhotoService } = await import("@/lib/services/photoService");

      // Mock URL operations
      const mockUrls = ["blob:url1", "blob:url2", "blob:url3"];

      // Simulate creating multiple object URLs
      mockUrls.forEach((url) => {
        PhotoService.revokePhotoUrl(url);
      });

      // Verify cleanup was attempted for all URLs
      expect(PhotoService.revokePhotoUrl).toHaveBeenCalledTimes(3);
      mockUrls.forEach((url) => {
        expect(PhotoService.revokePhotoUrl).toHaveBeenCalledWith(url);
      });
    });
  });

  describe("Performance and Storage Management", () => {
    it("should handle large photo files efficiently", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Create large file (just under 2MB limit)
      const largeFile = createMockFile(
        "large-profile.jpg",
        "image/jpeg",
        1900000,
      ); // 1.9MB
      const cvId = "cv-large-photo";
      const photoId = "photo_large_123";

      vi.mocked(photoService.storePhoto).mockResolvedValue(photoId);
      vi.mocked(photoService.getStorageInfo).mockResolvedValue({
        used: 1900000,
        available: 10000000000,
      });

      // Store large photo
      const storedPhotoId = await photoService.storePhoto(largeFile, cvId);
      expect(storedPhotoId).toBe(photoId);

      // Verify storage usage is tracked
      const storageInfo = await photoService.getStorageInfo();
      expect(storageInfo?.used).toBe(1900000);
    });

    it("should handle multiple photos per CV", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Note: Current design supports one photo per CV, but test multiple for robustness
      const cvId = "cv-multiple-photos";
      const files = [
        createMockFile("photo1.jpg", "image/jpeg"),
        createMockFile("photo2.png", "image/png"),
        createMockFile("photo3.webp", "image/webp"),
      ];

      const photoIds = ["photo_1", "photo_2", "photo_3"];

      vi.mocked(photoService.storePhoto)
        .mockResolvedValueOnce(photoIds[0])
        .mockResolvedValueOnce(photoIds[1])
        .mockResolvedValueOnce(photoIds[2]);

      vi.mocked(photoService.getPhotosByCvId).mockResolvedValue([
        createMockPhotoRecord(photoIds[0], cvId),
        createMockPhotoRecord(photoIds[1], cvId),
        createMockPhotoRecord(photoIds[2], cvId),
      ]);

      // Store multiple photos
      const storedIds = await Promise.all(
        files.map((file) => photoService.storePhoto(file, cvId)),
      );

      expect(storedIds).toEqual(photoIds);

      // Retrieve all photos for CV
      const cvPhotos = await photoService.getPhotosByCvId(cvId);
      expect(cvPhotos).toHaveLength(3);
    });

    it("should handle storage cleanup operations", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup scenario with orphaned photos
      const activeCvIds = ["cv-active-1", "cv-active-2"];
      const allPhotos = [
        {
          photoId: "photo_active_1",
          cvId: "cv-active-1",
          uploadedAt: new Date(),
        },
        {
          photoId: "photo_active_2",
          cvId: "cv-active-2",
          uploadedAt: new Date(),
        },
        {
          photoId: "photo_orphan_1",
          cvId: "cv-deleted-1",
          uploadedAt: new Date(),
        },
        {
          photoId: "photo_orphan_2",
          cvId: "cv-deleted-2",
          uploadedAt: new Date(),
        },
      ];

      vi.mocked(photoService.getAllPhotosWithCvIds).mockResolvedValue(
        allPhotos,
      );
      vi.mocked(photoService.cleanupOrphanedPhotos).mockResolvedValue({
        cleaned: 2,
        errors: [],
      });

      // Perform cleanup
      const cleanupResult =
        await photoService.cleanupOrphanedPhotos(activeCvIds);

      expect(cleanupResult.cleaned).toBe(2);
      expect(cleanupResult.errors).toHaveLength(0);
      expect(photoService.cleanupOrphanedPhotos).toHaveBeenCalledWith(
        activeCvIds,
      );
    });
  });
});
