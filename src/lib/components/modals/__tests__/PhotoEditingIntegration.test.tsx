import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CVIngestionForm from "../CVIngestionForm";

// Mock the photo service
vi.mock("@/lib/services/photoService", () => ({
  photoService: {
    storePhoto: vi.fn(),
    getPhotoUrl: vi.fn(),
    deletePhoto: vi.fn(),
  },
  PhotoService: {
    revokePhotoUrl: vi.fn(),
  },
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
    form: {
      title: "CV Title",
      titlePlaceholder: "Enter a name for this CV",
      rawText: "Raw CV Text",
      rawTextPlaceholder: "Paste your CV text here...",
      submit: "Process CV",
      cancel: "Cancel",
      processing: "Processing CV...",
    },
    actions: {
      cancelDelete: "Cancel",
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

describe("Photo Editing Integration", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle photo editing workflow when editing existing CV", async () => {
    const user = userEvent.setup();
    const oldPhotoId = "old_photo_123";
    const newPhotoId = "new_photo_456";
    const mockPhotoUrl = "blob:mock-url";
    const { photoService } = await import("@/lib/services/photoService");

    vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);
    vi.mocked(photoService.storePhoto).mockResolvedValue(newPhotoId);
    vi.mocked(photoService.deletePhoto).mockResolvedValue();

    const initialData = {
      title: "Existing CV",
      rawText:
        "This is an existing CV with enough content to pass validation requirements for the minimum character count.",
      photoId: oldPhotoId,
      cvId: "existing-cv-id",
    };

    const { container } = renderWithIntl(
      <CVIngestionForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    // Wait for the existing photo to load and display
    await waitFor(() => {
      expect(screen.getByText("Click to replace photo")).toBeInTheDocument();
    });

    // Verify the existing photo is displayed
    expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
    expect(screen.getByText("Photo Preview")).toBeInTheDocument();

    // Replace the photo with a new one
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const newFile = new File(["new image data"], "new-photo.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, newFile);

    // Verify photo replacement workflow
    await waitFor(() => {
      // Should delete the old photo first
      expect(photoService.deletePhoto).toHaveBeenCalledWith(oldPhotoId);
      // Then store the new photo
      expect(photoService.storePhoto).toHaveBeenCalledWith(
        newFile,
        "existing-cv-id",
      );
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Existing CV",
        rawText: initialData.rawText,
        photoId: newPhotoId, // Should have the new photo ID
      });
    });
  });

  it("should handle photo removal when editing existing CV", async () => {
    const user = userEvent.setup();
    const existingPhotoId = "existing_photo_123";
    const mockPhotoUrl = "blob:mock-url";
    const { photoService } = await import("@/lib/services/photoService");

    vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);
    vi.mocked(photoService.deletePhoto).mockResolvedValue();

    const initialData = {
      title: "CV with Photo",
      rawText:
        "This is a CV with a photo that has enough content to pass validation requirements.",
      photoId: existingPhotoId,
      cvId: "cv-with-photo-id",
    };

    renderWithIntl(
      <CVIngestionForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    // Wait for the existing photo to load
    await waitFor(() => {
      expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
    });

    // Click the remove button to show confirmation dialog
    const removeButton = screen.getByRole("button", {
      name: "Remove uploaded photo",
    });
    await user.click(removeButton);

    // Verify confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveTextContent("Remove Photo");
      expect(
        screen.getByText(
          "Are you sure you want to remove this photo? This action cannot be undone.",
        ),
      ).toBeInTheDocument();
    });

    // Confirm removal by clicking the confirm button
    const confirmButton = screen
      .getAllByRole("button")
      .find(
        (button) =>
          button.textContent === "Remove Photo" &&
          button.className.includes("bg-red-600"),
      );
    expect(confirmButton).toBeDefined();
    if (confirmButton) {
      await user.click(confirmButton);
    }

    // Verify photo removal
    await waitFor(() => {
      expect(photoService.deletePhoto).toHaveBeenCalledWith(existingPhotoId);
      // Should show upload area again
      expect(
        screen.getByText("Drag and drop an image here, or click to browse"),
      ).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "CV with Photo",
        rawText: initialData.rawText,
        photoId: null, // Should be null after removal
      });
    });
  });

  it("should use correct CV ID for photo operations when editing", async () => {
    const user = userEvent.setup();
    const newPhotoId = "new_photo_789";
    const { photoService } = await import("@/lib/services/photoService");

    vi.mocked(photoService.storePhoto).mockResolvedValue(newPhotoId);

    const initialData = {
      title: "Test CV",
      rawText:
        "This is a test CV with enough content to pass validation requirements for the minimum character count.",
      cvId: "specific-cv-id-123", // Specific CV ID for editing
    };

    const { container } = renderWithIntl(
      <CVIngestionForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    // Upload a new photo
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const newFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, newFile);

    // Verify the correct CV ID is used for photo storage
    await waitFor(() => {
      expect(photoService.storePhoto).toHaveBeenCalledWith(
        newFile,
        "specific-cv-id-123",
      );
    });
  });

  it("should fallback to generated CV ID when editing CV without explicit ID", async () => {
    const user = userEvent.setup();
    const newPhotoId = "new_photo_fallback";
    const { photoService } = await import("@/lib/services/photoService");

    vi.mocked(photoService.storePhoto).mockResolvedValue(newPhotoId);

    const initialData = {
      title: "Fallback CV",
      rawText:
        "This is a CV without explicit ID that has enough content to pass validation requirements.",
      // No cvId provided - should fallback to generated ID based on title
    };

    const { container } = renderWithIntl(
      <CVIngestionForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    // Upload a new photo
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const newFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, newFile);

    // Verify fallback CV ID generation (based on title)
    await waitFor(() => {
      expect(photoService.storePhoto).toHaveBeenCalledWith(
        newFile,
        "cv-fallback-cv",
      );
    });
  });
});
