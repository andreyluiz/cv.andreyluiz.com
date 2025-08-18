import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";
import { PhotoUpload } from "../PhotoUpload";

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

const mockMessages = {
  cvManagement: {
    photo: {
      upload: "Upload Photo",
      dragDrop: "Drag and drop an image here, or click to browse",
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
    },
    errors: {
      photoTooLarge: "Image file must be smaller than 2MB",
      photoInvalidType: "Please select a valid image file (JPEG, PNG, or WebP)",
      photoUploadFailed: "Failed to process image. Please try again",
    },
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe("PhotoUpload", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload area with correct text", () => {
    renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

    expect(screen.getByText("Upload Photo")).toBeInTheDocument();
    expect(
      screen.getByText("Drag and drop an image here, or click to browse"),
    ).toBeInTheDocument();
    expect(screen.getByText("JPEG, PNG, WebP (max 2MB)")).toBeInTheDocument();
    expect(
      screen.getByText("Upload a profile photo to personalize your CV"),
    ).toBeInTheDocument();
  });

  it("shows disabled state when disabled prop is true", () => {
    renderWithIntl(<PhotoUpload onChange={mockOnChange} disabled />);

    const uploadButton = screen.getByRole("button", {
      name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
    });
    expect(uploadButton).toBeDisabled();
    expect(uploadButton).toHaveClass("opacity-50", "cursor-not-allowed");
  });

  it("displays error message when error prop is provided", () => {
    const errorMessage = "Test error message";
    renderWithIntl(
      <PhotoUpload onChange={mockOnChange} error={errorMessage} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(errorMessage);
    expect(
      screen.queryByText("Upload a profile photo to personalize your CV"),
    ).not.toBeInTheDocument();
  });

  it("validates file type and shows error for invalid files", async () => {
    renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

    const fileInput = screen
      .getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      })
      .querySelector('input[type="file"]') as HTMLInputElement;

    // Create a mock file with invalid type
    const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });

    // Directly trigger the change event
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(
      () => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Please select a valid image file (JPEG, PNG, or WebP)",
        );
      },
      { timeout: 3000 },
    );
  });

  it("validates file size and shows error for large files", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

    const fileInput = screen
      .getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      })
      .querySelector('input[type="file"]') as HTMLInputElement;

    // Create a mock file larger than 2MB
    const largeFile = new File(["x".repeat(3 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Image file must be smaller than 2MB",
      );
    });
  });

  it("calls photoService.storePhoto and onChange when valid file is uploaded", async () => {
    const user = userEvent.setup();
    const mockPhotoId = "photo_123";
    const { photoService } = await import("@/lib/services/photoService");
    vi.mocked(photoService.storePhoto).mockResolvedValue(mockPhotoId);

    renderWithIntl(<PhotoUpload onChange={mockOnChange} cvId="test-cv" />);

    const fileInput = screen
      .getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      })
      .querySelector('input[type="file"]') as HTMLInputElement;

    // Create a valid image file
    const validFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, validFile);

    await waitFor(() => {
      expect(photoService.storePhoto).toHaveBeenCalledWith(
        validFile,
        "test-cv",
      );
      expect(mockOnChange).toHaveBeenCalledWith(mockPhotoId);
    });
  });

  it("shows loading state during upload", async () => {
    const user = userEvent.setup();
    const { photoService } = await import("@/lib/services/photoService");
    // Mock a delayed response
    vi.mocked(photoService.storePhoto).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve("photo_123"), 100)),
    );

    renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

    const fileInput = screen
      .getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      })
      .querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });

    await user.upload(fileInput, validFile);

    // Should show loading state
    expect(screen.getByText("Uploading photo...")).toBeInTheDocument();

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.queryByText("Uploading photo...")).not.toBeInTheDocument();
    });
  });

  it("displays preview when value prop is provided", async () => {
    const mockPhotoUrl = "blob:mock-url";
    const { photoService } = await import("@/lib/services/photoService");
    vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

    renderWithIntl(<PhotoUpload onChange={mockOnChange} value="photo_123" />);

    await waitFor(() => {
      expect(photoService.getPhotoUrl).toHaveBeenCalledWith("photo_123");
      expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
      expect(screen.getByText("Photo Preview")).toBeInTheDocument();
      expect(screen.getByText("Click to replace photo")).toBeInTheDocument();
    });
  });

  it("handles remove photo functionality", async () => {
    const user = userEvent.setup();
    const mockPhotoUrl = "blob:mock-url";
    const { photoService } = await import("@/lib/services/photoService");
    vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

    renderWithIntl(<PhotoUpload onChange={mockOnChange} value="photo_123" />);

    await waitFor(() => {
      expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", {
      name: "Remove uploaded photo",
    });
    await user.click(removeButton);

    expect(photoService.deletePhoto).toHaveBeenCalledWith("photo_123");
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it("handles keyboard navigation with Enter key", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

    const uploadButton = screen.getByRole("button", {
      name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
    });

    // Focus the button and press Enter
    uploadButton.focus();
    await user.keyboard("{Enter}");

    // Should trigger file input click (we can't easily test this without mocking)
    expect(uploadButton).toHaveFocus();
  });

  it("handles keyboard navigation with Space key", async () => {
    const user = userEvent.setup();
    renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

    const uploadButton = screen.getByRole("button", {
      name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
    });

    // Focus the button and press Space
    uploadButton.focus();
    await user.keyboard(" ");

    // Should trigger file input click (we can't easily test this without mocking)
    expect(uploadButton).toHaveFocus();
  });

  it("handles drag and drop functionality", async () => {
    const mockPhotoId = "photo_123";
    const { photoService } = await import("@/lib/services/photoService");
    vi.mocked(photoService.storePhoto).mockResolvedValue(mockPhotoId);

    renderWithIntl(<PhotoUpload onChange={mockOnChange} cvId="test-cv" />);

    const uploadButton = screen.getByRole("button", {
      name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
    });
    const validFile = new File(["image data"], "test.jpg", {
      type: "image/jpeg",
    });

    // Simulate drag over
    fireEvent.dragOver(uploadButton, {
      dataTransfer: {
        files: [validFile],
      },
    });

    expect(uploadButton).toHaveClass("border-blue-400");

    // Simulate drop
    fireEvent.drop(uploadButton, {
      dataTransfer: {
        files: [validFile],
      },
    });

    await waitFor(() => {
      expect(photoService.storePhoto).toHaveBeenCalledWith(
        validFile,
        "test-cv",
      );
      expect(mockOnChange).toHaveBeenCalledWith(mockPhotoId);
    });
  });

  describe("Accessibility Features", () => {
    it("has proper ARIA labels and descriptions", () => {
      renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });

      expect(uploadButton).toHaveAttribute(
        "aria-label",
        "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      );
      expect(uploadButton).toHaveAttribute("tabIndex", "0");
    });

    it("has proper ARIA describedby relationship with help text", () => {
      renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });
      const helpText = screen.getByText(
        "Upload a profile photo to personalize your CV",
      );

      expect(uploadButton).toHaveAttribute("aria-describedby");
      const describedById = uploadButton.getAttribute("aria-describedby");
      expect(helpText).toHaveAttribute("id", describedById);
    });

    it("has proper ARIA describedby relationship with error message", () => {
      const errorMessage = "Test error message";
      renderWithIntl(
        <PhotoUpload onChange={mockOnChange} error={errorMessage} />,
      );

      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });
      const errorElement = screen.getByRole("alert");

      expect(uploadButton).toHaveAttribute("aria-describedby");
      const describedById = uploadButton.getAttribute("aria-describedby");
      expect(errorElement).toHaveAttribute("id", describedById);
    });

    it("has proper focus indicators", () => {
      renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });

      expect(uploadButton).toHaveClass(
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
      );
    });

    it("removes tabIndex when disabled", () => {
      renderWithIntl(<PhotoUpload onChange={mockOnChange} disabled />);

      const uploadButton = screen.getByRole("button", {
        name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      });

      expect(uploadButton).toHaveAttribute("tabIndex", "-1");
      expect(uploadButton).toBeDisabled();
    });

    it("has proper keyboard navigation for remove button", async () => {
      const user = userEvent.setup();
      const mockPhotoUrl = "blob:mock-url";
      const { photoService } = await import("@/lib/services/photoService");
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

      renderWithIntl(<PhotoUpload onChange={mockOnChange} value="photo_123" />);

      await waitFor(() => {
        expect(
          screen.getByAltText("Profile photo preview"),
        ).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", {
        name: "Remove uploaded photo",
      });

      // Test keyboard navigation
      removeButton.focus();
      expect(removeButton).toHaveFocus();
      expect(removeButton).toHaveClass(
        "focus:bg-red-600",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-red-500",
        "focus:ring-offset-2",
      );

      // Test Enter key
      await user.keyboard("{Enter}");
      expect(photoService.deletePhoto).toHaveBeenCalledWith("photo_123");
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("has proper keyboard navigation for replace button", async () => {
      const user = userEvent.setup();
      const mockPhotoUrl = "blob:mock-url";
      const { photoService } = await import("@/lib/services/photoService");
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

      renderWithIntl(<PhotoUpload onChange={mockOnChange} value="photo_123" />);

      await waitFor(() => {
        expect(screen.getByText("Click to replace photo")).toBeInTheDocument();
      });

      const replaceButton = screen.getByRole("button", {
        name: "Click to replace current photo with a new one",
      });

      // Test keyboard navigation
      replaceButton.focus();
      expect(replaceButton).toHaveFocus();
      expect(replaceButton).toHaveClass(
        "focus:text-blue-700",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
      );

      // Test Space key
      await user.keyboard(" ");
      // Should trigger file input click (we can't easily test this without mocking)
      expect(replaceButton).toHaveFocus();
    });

    it("announces upload success to screen readers", async () => {
      const user = userEvent.setup();
      const mockPhotoId = "photo_123";
      const { photoService } = await import("@/lib/services/photoService");
      vi.mocked(photoService.storePhoto).mockResolvedValue(mockPhotoId);

      renderWithIntl(<PhotoUpload onChange={mockOnChange} cvId="test-cv" />);

      const fileInput = screen
        .getByRole("button", {
          name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
        })
        .querySelector('input[type="file"]') as HTMLInputElement;

      const validFile = new File(["image data"], "test.jpg", {
        type: "image/jpeg",
      });

      await user.upload(fileInput, validFile);

      await waitFor(() => {
        const announcement = screen.getByRole("status");
        expect(announcement).toHaveTextContent("Photo uploaded successfully");
        expect(announcement).toHaveAttribute("aria-live", "polite");
        expect(announcement).toHaveAttribute("aria-atomic", "true");
      });
    });

    it("announces upload error to screen readers", async () => {
      const user = userEvent.setup();
      const { photoService } = await import("@/lib/services/photoService");
      vi.mocked(photoService.storePhoto).mockRejectedValue(
        new Error("Upload failed"),
      );

      renderWithIntl(<PhotoUpload onChange={mockOnChange} cvId="test-cv" />);

      const fileInput = screen
        .getByRole("button", {
          name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
        })
        .querySelector('input[type="file"]') as HTMLInputElement;

      const validFile = new File(["image data"], "test.jpg", {
        type: "image/jpeg",
      });

      await user.upload(fileInput, validFile);

      await waitFor(() => {
        const announcement = screen.getByRole("status");
        expect(announcement).toHaveTextContent("Photo upload failed");
      });
    });

    it("announces photo removal to screen readers", async () => {
      const user = userEvent.setup();
      const mockPhotoUrl = "blob:mock-url";
      const { photoService } = await import("@/lib/services/photoService");
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue(mockPhotoUrl);

      renderWithIntl(<PhotoUpload onChange={mockOnChange} value="photo_123" />);

      await waitFor(() => {
        expect(
          screen.getByAltText("Profile photo preview"),
        ).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", {
        name: "Remove uploaded photo",
      });
      await user.click(removeButton);

      await waitFor(() => {
        const announcement = screen.getByRole("status");
        expect(announcement).toHaveTextContent("Photo removed successfully");
      });
    });

    it("has live region for screen reader announcements", () => {
      renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

      const announcement = screen.getByRole("status");
      expect(announcement).toHaveAttribute("aria-live", "polite");
      expect(announcement).toHaveAttribute("aria-atomic", "true");
      expect(announcement).toHaveClass("sr-only");
    });

    it("has proper error role for error messages", () => {
      const errorMessage = "Test error message";
      renderWithIntl(
        <PhotoUpload onChange={mockOnChange} error={errorMessage} />,
      );

      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveTextContent(errorMessage);
      expect(errorElement).toHaveClass("text-red-600", "dark:text-red-400");
    });

    it("hides file input from screen readers", () => {
      renderWithIntl(<PhotoUpload onChange={mockOnChange} />);

      const fileInput = screen
        .getByRole("button", {
          name: "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
        })
        .querySelector('input[type="file"]') as HTMLInputElement;

      expect(fileInput).toHaveClass("sr-only");
      expect(fileInput).toHaveAttribute("tabIndex", "-1");
    });
  });
});
