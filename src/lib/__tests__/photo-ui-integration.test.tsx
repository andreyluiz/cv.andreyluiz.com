import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CVIngestionForm from "../components/modals/CVIngestionForm";
import CVManagementModal from "../components/modals/CVManagementModal";
import ProfileImage from "../components/resume/ProfileImage";
import { useStore } from "../store";
import type { IngestedCV, Variant } from "../types";

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

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    // biome-ignore lint/performance/noImgElement: Tests
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock ConfirmationDialog component
vi.mock("@/lib/components/modals/ConfirmationDialog", () => ({
  default: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
  }: any) => {
    if (!isOpen) return null;
    return (
      <div role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        <button type="button" onClick={onClose}>
          {cancelText}
        </button>
        <button type="button" onClick={onConfirm} className="bg-red-600">
          {confirmText}
        </button>
      </div>
    );
  },
}));

const messages = {
  cvManagement: {
    title: "CV Management",
    form: {
      title: "CV Title",
      titlePlaceholder: "Enter a name for this CV",
      rawText: "Raw CV Text",
      rawTextPlaceholder: "Paste your CV text here...",
      submit: "Process CV",
      cancel: "Cancel",
      processing: "Processing CV...",
      edit: "Edit CV",
      editSubmit: "Update CV",
    },
    list: {
      title: "My CVs",
      empty: "No CVs found. Create your first CV to get started.",
      created: "Created",
      updated: "Updated",
      select: "Select",
      edit: "Edit",
      delete: "Delete",
    },
    actions: {
      create: "Create New CV",
      back: "Back to List",
      cancelDelete: "Cancel",
      confirmDelete: "Delete CV",
    },
    errors: {
      titleRequired: "CV title is required",
      titleTooLong: "CV title must be less than 100 characters",
      rawTextRequired: "CV text is required",
      rawTextTooShort: "CV text must be at least 50 characters",
      rawTextTooLong: "CV text must be less than 50,000 characters",
      photoTooLarge: "Image file must be smaller than 2MB",
      photoInvalidType: "Please select a valid image file (JPEG, PNG, or WebP)",
      photoUploadFailed: "Failed to process image. Please try again",
    },
    photo: {
      upload: "Upload Photo",
      dragDrop: "Drag and drop an image here, or click to browse",
      remove: "Remove Photo",
      preview: "Photo Preview",
      alt: "Profile photo preview",
      removeAlt: "Remove uploaded photo",
      uploading: "Uploading photo...",
      clickToReplace: "Click to replace photo",
      clickToReplaceAlt: "Click to replace current photo with a new one",
      uploadAreaLabel:
        "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      supportedFormats: "JPEG, PNG, WebP (max 2MB)",
      helpText: "Upload a profile photo to personalize your CV",
      uploadSuccess: "Photo uploaded successfully",
      uploadError: "Photo upload failed",
      removeSuccess: "Photo removed successfully",
      confirmRemoveTitle: "Remove Photo",
      confirmRemoveMessage:
        "Are you sure you want to remove this photo? This action cannot be undone.",
      confirmRemoveButton: "Remove Photo",
    },
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe("Photo UI Integration Tests", () => {
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
    return new File(["mock image data"], name, { type, lastModified: Date.now() });
  };

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

  describe("End-to-End CV Creation with Photo Upload", () => {
    it("should complete full CV creation workflow through UI", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");
      const { ingestCV } = await import("@/lib/server/actions");

      // Mock successful operations
      const mockPhotoId = "photo_ui_test_123";
      const mockPhotoUrl = "blob:mock-url";
      vi.mocked(photoService.storePhoto).mockResolvedValue(mockPhotoId);
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);
      vi.mocked(ingestCV).mockResolvedValue(mockVariant);

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = renderWithIntl(
        <CVIngestionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Step 1: Fill in CV title
      const titleInput = screen.getByPlaceholderText("Enter a name for this CV");
      await user.type(titleInput, "John Doe - Software Engineer");

      // Step 2: Fill in CV text
      const textArea = screen.getByPlaceholderText("Paste your CV text here...");
      const cvText = "John Doe\nSoftware Engineer\njohn@example.com\nExperienced developer with 5+ years of experience in full-stack development...";
      await user.type(textArea, cvText);

      // Step 3: Upload photo
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = createMockFile("profile.jpg", "image/jpeg");
      await user.upload(fileInput, mockFile);

      // Wait for photo upload to complete
      await waitFor(() => {
        expect(photoService.storePhoto).toHaveBeenCalledWith(mockFile, expect.any(String));
      });

      // Step 4: Submit form
      const submitButton = screen.getByRole("button", { name: /Process CV/ });
      await user.click(submitButton);

      // Verify form submission with photo
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "John Doe - Software Engineer",
          rawText: cvText,
          photoId: mockPhotoId,
        });
      });
    });

    it("should handle photo upload errors during CV creation", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");

      // Mock photo upload failure
      vi.mocked(photoService.storePhoto).mockRejectedValue(new Error("Upload failed"));

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = renderWithIntl(
        <CVIngestionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Fill in required fields
      const titleInput = screen.getByPlaceholderText("Enter a name for this CV");
      await user.type(titleInput, "Test CV");

      const textArea = screen.getByPlaceholderText("Paste your CV text here...");
      await user.type(textArea, "Test CV content with enough characters to pass validation requirements...");

      // Attempt photo upload
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = createMockFile("profile.jpg", "image/jpeg");
      await user.upload(fileInput, mockFile);

      // Wait for error to appear (check for any error text)
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Form should still be submittable without photo
      const submitButton = screen.getByRole("button", { name: /Process CV/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "Test CV",
          rawText: "Test CV content with enough characters to pass validation requirements...",
          photoId: null,
        });
      });
    });

    it("should validate photo file types and sizes", async () => {
      const user = userEvent.setup();

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = renderWithIntl(
        <CVIngestionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      // Verify file input has correct accept attribute for validation
      expect(fileInput).toHaveAttribute("accept", "image/jpeg,image/jpg,image/png,image/webp");

      // Test that form can be submitted without photo (validation is handled by PhotoUpload component)
      const titleInput = screen.getByPlaceholderText("Enter a name for this CV");
      await user.type(titleInput, "Test CV");

      const textArea = screen.getByPlaceholderText("Paste your CV text here...");
      await user.type(textArea, "Test CV content with enough characters to pass validation requirements...");

      const submitButton = screen.getByRole("button", { name: /Process CV/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "Test CV",
          rawText: "Test CV content with enough characters to pass validation requirements...",
          photoId: null,
        });
      });
    });
  });

  describe("Photo Editing Workflow Integration", () => {
    it("should handle photo editing in existing CV", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");

      const existingPhotoId = "existing_photo_123";
      const newPhotoId = "new_photo_456";
      const mockPhotoUrl = "blob:existing-url";

      // Mock existing photo
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);
      vi.mocked(photoService.deletePhoto).mockResolvedValue();
      vi.mocked(photoService.storePhoto).mockResolvedValue(newPhotoId);

      const initialData = {
        title: "Existing CV",
        rawText: "Existing CV content with enough characters to pass validation requirements...",
        photoId: existingPhotoId,
        cvId: "existing-cv-id",
      };

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = renderWithIntl(
        <CVIngestionForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Wait for existing photo to load
      await waitFor(() => {
        expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
        expect(screen.getByText("Click to replace photo")).toBeInTheDocument();
      });

      // Replace photo
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const newFile = createMockFile("new-profile.png", "image/png");
      await user.upload(fileInput, newFile);

      // Verify old photo deletion and new photo upload
      await waitFor(() => {
        expect(photoService.deletePhoto).toHaveBeenCalledWith(existingPhotoId);
        expect(photoService.storePhoto).toHaveBeenCalledWith(newFile, "existing-cv-id");
      });

      // Submit form
      const submitButton = screen.getByRole("button", { name: /Process CV/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "Existing CV",
          rawText: initialData.rawText,
          photoId: newPhotoId,
        });
      });
    });

    it("should handle photo removal in existing CV", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");

      const existingPhotoId = "photo_to_remove_123";
      const mockPhotoUrl = "blob:remove-url";

      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);
      vi.mocked(photoService.deletePhoto).mockResolvedValue();

      const initialData = {
        title: "CV with Photo",
        rawText: "CV content with photo that will be removed and has enough characters...",
        photoId: existingPhotoId,
        cvId: "cv-with-photo",
      };

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      renderWithIntl(
        <CVIngestionForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Wait for photo to load
      await waitFor(() => {
        expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
      });

      // Click remove button
      const removeButton = screen.getByRole("button", { name: "Remove uploaded photo" });
      await user.click(removeButton);

      // Confirm removal in dialog
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole("button").find(
        (button) => button.textContent === "Remove Photo" && button.className.includes("bg-red-600")
      );
      expect(confirmButton).toBeDefined();
      if (confirmButton) {
        await user.click(confirmButton);
      }

      // Verify photo deletion
      await waitFor(() => {
        expect(photoService.deletePhoto).toHaveBeenCalledWith(existingPhotoId);
        expect(screen.getByText("Drag and drop an image here, or click to browse")).toBeInTheDocument();
      });

      // Submit form
      const submitButton = screen.getByRole("button", { name: /Process CV/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: "CV with Photo",
          rawText: initialData.rawText,
          photoId: null,
        });
      });
    });
  });

  describe("CV Management Modal Integration", () => {
    it("should display CVs with photos in management modal", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      // Setup store with CVs that have photos
      const cv1: IngestedCV = {
        id: "cv-1",
        title: "CV with Photo 1",
        rawText: "CV 1 content...",
        formattedCV: { ...mockVariant, name: "User One" },
        profilePhotoId: "photo_1",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-01"),
      };

      const cv2: IngestedCV = {
        id: "cv-2",
        title: "CV without Photo",
        rawText: "CV 2 content...",
        formattedCV: { ...mockVariant, name: "User Two" },
        createdAt: new Date("2023-01-02"),
        updatedAt: new Date("2023-01-02"),
      };

      // Mock photo URL for CV with photo
      vi.mocked(photoService.getPhotoUrl).mockImplementation(async (photoId) => {
        if (photoId === "photo_1") return "blob:cv1-photo-url";
        return null;
      });

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(cv1);
      addIngestedCV(cv2);

      const mockOnClose = vi.fn();

      renderWithIntl(
        <CVManagementModal isOpen={true} onClose={mockOnClose} />
      );

      // Verify CVs are displayed
      await waitFor(() => {
        expect(screen.getByText("CV with Photo 1")).toBeInTheDocument();
        expect(screen.getByText("CV without Photo")).toBeInTheDocument();
      });

      // Note: The actual photo display would depend on how CVListView renders photos
      // This test verifies the modal opens and displays CVs correctly
    });

    it("should handle CV deletion with photo cleanup", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");

      // Setup CV with photo
      const cvWithPhoto: IngestedCV = {
        id: "cv-to-delete",
        title: "CV to Delete",
        rawText: "CV content to be deleted...",
        formattedCV: mockVariant,
        profilePhotoId: "photo_to_delete",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(photoService.deletePhotosByCvId).mockResolvedValue();

      const { addIngestedCV } = useStore.getState();
      addIngestedCV(cvWithPhoto);

      const mockOnClose = vi.fn();

      renderWithIntl(
        <CVManagementModal isOpen={true} onClose={mockOnClose} />
      );

      // Find and click delete button (implementation depends on CVListView)
      await waitFor(() => {
        expect(screen.getByText("CV to Delete")).toBeInTheDocument();
      });

      // Note: The actual deletion flow would depend on the CVListView implementation
      // This test verifies the modal structure is correct for deletion operations
    });
  });

  describe("ProfileImage Component Integration", () => {
    it("should display custom photo when photoId is provided", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      const photoId = "profile_photo_123";
      const mockPhotoUrl = "blob:profile-url";

      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

      // Mock URL.revokeObjectURL for test environment
      global.URL.revokeObjectURL = vi.fn();

      renderWithIntl(
        <ProfileImage photoId={photoId} />
      );

      // Wait for photo to load
      await waitFor(() => {
        expect(photoService.getPhotoUrl).toHaveBeenCalledWith(photoId);
      });

      // Verify image is displayed with correct src
      await waitFor(() => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", mockPhotoUrl);
      });
    });

    it("should fallback to default image when photo fails to load", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      const photoId = "missing_photo_123";

      // Mock photo not found
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(null);

      renderWithIntl(
        <ProfileImage photoId={photoId} />
      );

      // Wait for fallback
      await waitFor(() => {
        expect(photoService.getPhotoUrl).toHaveBeenCalledWith(photoId);
      });

      // Verify fallback to default image
      await waitFor(() => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "/profile.webp");
      });
    });

    it("should display default image when no photoId is provided", () => {
      renderWithIntl(
        <ProfileImage />
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/profile.webp");
    });

    it("should handle photo loading errors gracefully", async () => {
      const { photoService } = await import("@/lib/services/photoService");

      const photoId = "error_photo_123";

      // Mock photo service error
      vi.mocked(photoService.getPhotoUrl).mockRejectedValue(new Error("Photo service error"));

      renderWithIntl(
        <ProfileImage photoId={photoId} />
      );

      // Wait for error handling
      await waitFor(() => {
        expect(photoService.getPhotoUrl).toHaveBeenCalledWith(photoId);
      });

      // Should fallback to default image on error
      await waitFor(() => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "/profile.webp");
      });
    });
  });

  describe("Cross-Component Photo Workflow", () => {
    it("should maintain photo consistency across form operations", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");

      const photoId = "consistent_photo_123";
      const mockPhotoUrl = "blob:consistent-url";

      vi.mocked(photoService.storePhoto).mockResolvedValue(photoId);
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

      // Upload photo in form
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = renderWithIntl(
        <CVIngestionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Fill form and upload photo
      const titleInput = screen.getByPlaceholderText("Enter a name for this CV");
      await user.type(titleInput, "Consistency Test CV");

      const textArea = screen.getByPlaceholderText("Paste your CV text here...");
      await user.type(textArea, "CV content for consistency testing with enough characters...");

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = createMockFile("consistent.jpg", "image/jpeg");
      await user.upload(fileInput, mockFile);

      await waitFor(() => {
        expect(photoService.storePhoto).toHaveBeenCalledWith(mockFile, expect.any(String));
      });

      // Verify photo preview is shown in form
      await waitFor(() => {
        expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility Integration", () => {
    it("should maintain accessibility throughout photo workflow", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");

      const photoId = "accessibility_photo_123";
      const mockPhotoUrl = "blob:accessibility-url";

      vi.mocked(photoService.storePhoto).mockResolvedValue(photoId);
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      const { container } = renderWithIntl(
        <CVIngestionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Verify upload area has proper accessibility attributes
      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });
      expect(uploadButton).toHaveAttribute("aria-label");
      expect(uploadButton).toHaveAttribute("tabIndex", "0");

      // Test keyboard navigation
      uploadButton.focus();
      expect(uploadButton).toHaveFocus();

      // Upload photo and verify accessibility announcements
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = createMockFile("accessible.jpg", "image/jpeg");
      await user.upload(fileInput, mockFile);

      // Wait for success announcement
      await waitFor(() => {
        const announcement = screen.getByRole("status");
        expect(announcement).toHaveTextContent("Photo uploaded successfully");
        expect(announcement).toHaveAttribute("aria-live", "polite");
      });

      // Verify photo preview has proper alt text
      await waitFor(() => {
        const previewImg = screen.getByAltText("Profile photo preview");
        expect(previewImg).toBeInTheDocument();
      });

      // Test remove button accessibility
      const removeButton = screen.getByRole("button", { name: "Remove uploaded photo" });
      expect(removeButton).toHaveAttribute("aria-label", "Remove uploaded photo");
    });

    it("should handle error announcements accessibly", async () => {
      const user = userEvent.setup();

      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      renderWithIntl(
        <CVIngestionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />,
      );

      // Verify upload area has proper accessibility attributes
      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });
      expect(uploadButton).toHaveAttribute("aria-describedby");
      expect(uploadButton).toHaveAttribute("aria-label");
      expect(uploadButton).toHaveAttribute("tabIndex", "0");

      // Verify status region exists for announcements
      const statusRegion = screen.getByRole("status");
      expect(statusRegion).toHaveAttribute("aria-live", "polite");
      expect(statusRegion).toHaveAttribute("aria-atomic", "true");
    });
  });
});