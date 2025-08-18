import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { photoService } from "@/lib/services/photoService";
import ProfileImage from "../ProfileImage";

// Mock the photoService
vi.mock("@/lib/services/photoService", () => ({
  photoService: {
    getPhotoUrl: vi.fn(),
  },
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, onError, ...props }: any) => {
    // biome-ignore lint/performance/noImgElement: Tests
    return <img src={src} alt={alt} onError={onError} {...props} />;
  },
}));

// Mock URL.revokeObjectURL
const mockRevokeObjectURL = vi.fn();
const originalURL = global.URL;
global.URL = class extends originalURL {
  static revokeObjectURL = mockRevokeObjectURL;
} as any;

describe("ProfileImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render default profile image when no photoId provided", () => {
    render(<ProfileImage />);

    const image = screen.getByRole("img", { name: /profile picture/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("alt", "Profile Picture");
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("profile.webp"),
    );
  });

  it("should apply custom className", () => {
    render(<ProfileImage className="custom-class" />);

    const image = screen.getByRole("img", { name: /profile picture/i });
    expect(image).toHaveClass("rounded-full", "custom-class");
  });

  it("should have rounded-full class by default", () => {
    render(<ProfileImage />);

    const image = screen.getByRole("img", { name: /profile picture/i });
    expect(image).toHaveClass("rounded-full");
  });

  it("should show loading state when loading custom photo", async () => {
    // Mock a delayed response
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve("blob:test-url"), 100),
        ),
    );

    render(<ProfileImage photoId="test-photo-id" />);

    // Should show loading state initially
    const loadingElement = screen.getByRole("img", {
      name: /loading profile picture/i,
    });
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass("animate-pulse");

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.queryByRole("img", { name: /loading profile picture/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("should display custom photo when photoId is provided and photo loads successfully", async () => {
    const mockPhotoUrl = "blob:test-photo-url";
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockResolvedValue(mockPhotoUrl);

    render(<ProfileImage photoId="test-photo-id" />);

    await waitFor(() => {
      const image = screen.getByRole("img", {
        name: /custom profile picture/i,
      });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("alt", "Custom profile picture");
      expect(image).toHaveAttribute("src", mockPhotoUrl);
    });

    expect(mockGetPhotoUrl).toHaveBeenCalledWith("test-photo-id");
  });

  it("should fallback to default image when custom photo fails to load", async () => {
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockResolvedValue(null);

    render(<ProfileImage photoId="test-photo-id" />);

    await waitFor(() => {
      const image = screen.getByRole("img", { name: /profile picture/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("alt", "Profile Picture");
      expect(image).toHaveAttribute(
        "src",
        expect.stringContaining("profile.webp"),
      );
    });
  });

  it("should fallback to default image when photoService throws error", async () => {
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockRejectedValue(new Error("Failed to load photo"));

    render(<ProfileImage photoId="test-photo-id" />);

    await waitFor(() => {
      const image = screen.getByRole("img", { name: /profile picture/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("alt", "Profile Picture");
      expect(image).toHaveAttribute(
        "src",
        expect.stringContaining("profile.webp"),
      );
    });
  });

  it("should handle image onError by falling back to default", async () => {
    const mockPhotoUrl = "blob:test-photo-url";
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockResolvedValue(mockPhotoUrl);

    render(<ProfileImage photoId="test-photo-id" />);

    // Wait for custom photo to load
    await waitFor(() => {
      const image = screen.getByRole("img", {
        name: /custom profile picture/i,
      });
      expect(image).toBeInTheDocument();
    });

    // Simulate image load error
    const image = screen.getByRole("img", { name: /custom profile picture/i });
    act(() => {
      image.dispatchEvent(new Event("error"));
    });

    // Should fallback to default image
    await waitFor(() => {
      const fallbackImage = screen.getByRole("img", {
        name: /profile picture/i,
      });
      expect(fallbackImage).toHaveAttribute(
        "src",
        expect.stringContaining("profile.webp"),
      );
    });
  });

  it("should clean up object URL on unmount", async () => {
    const mockPhotoUrl = "blob:test-photo-url";
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockResolvedValue(mockPhotoUrl);

    const { unmount } = render(<ProfileImage photoId="test-photo-id" />);

    // Wait for photo to load
    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: /custom profile picture/i }),
      ).toBeInTheDocument();
    });

    // Unmount component
    unmount();

    // Should have called revokeObjectURL
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockPhotoUrl);
  });

  it("should update photo when photoId changes", async () => {
    const mockPhotoUrl1 = "blob:test-photo-url-1";
    const mockPhotoUrl2 = "blob:test-photo-url-2";
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);

    mockGetPhotoUrl.mockResolvedValueOnce(mockPhotoUrl1);

    const { rerender } = render(<ProfileImage photoId="photo-1" />);

    // Wait for first photo to load
    await waitFor(() => {
      const image = screen.getByRole("img", {
        name: /custom profile picture/i,
      });
      expect(image).toHaveAttribute("src", mockPhotoUrl1);
    });

    // Change photoId
    mockGetPhotoUrl.mockResolvedValueOnce(mockPhotoUrl2);
    rerender(<ProfileImage photoId="photo-2" />);

    // Wait for second photo to load
    await waitFor(() => {
      const image = screen.getByRole("img", {
        name: /custom profile picture/i,
      });
      expect(image).toHaveAttribute("src", mockPhotoUrl2);
    });

    expect(mockGetPhotoUrl).toHaveBeenCalledWith("photo-1");
    expect(mockGetPhotoUrl).toHaveBeenCalledWith("photo-2");
  });

  it("should clear photo when photoId is removed", async () => {
    const mockPhotoUrl = "blob:test-photo-url";
    const mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
    mockGetPhotoUrl.mockResolvedValue(mockPhotoUrl);

    const { rerender } = render(<ProfileImage photoId="test-photo-id" />);

    // Wait for custom photo to load
    await waitFor(() => {
      const image = screen.getByRole("img", {
        name: /custom profile picture/i,
      });
      expect(image).toHaveAttribute("src", mockPhotoUrl);
    });

    // Remove photoId
    rerender(<ProfileImage />);

    // Should show default image
    await waitFor(() => {
      const image = screen.getByRole("img", { name: /profile picture/i });
      expect(image).toHaveAttribute(
        "src",
        expect.stringContaining("profile.webp"),
      );
    });
  });
});
