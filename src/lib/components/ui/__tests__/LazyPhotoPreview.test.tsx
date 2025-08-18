import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LazyPhotoPreview } from "../LazyPhotoPreview";

// Mock photoService
vi.mock("@/lib/services/photoService", () => ({
  photoService: {
    getPhotoUrl: vi.fn(),
  },
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, className, onError, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={onError}
      {...props}
    />
  ),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  }));

  Object.defineProperty(global, "IntersectionObserver", {
    value: mockIntersectionObserver,
    writable: true,
  });

  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("LazyPhotoPreview", () => {
  let mockGetPhotoUrl: any;

  beforeEach(async () => {
    const { photoService } = await import("@/lib/services/photoService");
    mockGetPhotoUrl = vi.mocked(photoService.getPhotoUrl);
  });

  it("should render fallback image when no photoId is provided", () => {
    render(<LazyPhotoPreview alt="Test photo" fallbackSrc="/default.jpg" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/default.jpg");
    expect(img).toHaveAttribute("alt", "Test photo");
  });

  it("should set up intersection observer when photoId is provided", () => {
    render(<LazyPhotoPreview photoId="photo1" alt="Test photo" />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: "50px",
        threshold: 0.1,
      },
    );
    expect(mockObserve).toHaveBeenCalled();
  });

  it("should load photo when element comes into view", async () => {
    mockGetPhotoUrl.mockResolvedValue("blob:mock-url");

    render(<LazyPhotoPreview photoId="photo1" alt="Test photo" />);

    // Simulate intersection observer callback
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(mockGetPhotoUrl).toHaveBeenCalledWith("photo1");
    });

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "blob:mock-url");
    });
  });

  it("should show loading spinner while photo is loading", async () => {
    // Make getPhotoUrl hang to simulate loading
    mockGetPhotoUrl.mockImplementation(() => new Promise(() => {}));

    render(<LazyPhotoPreview photoId="photo1" alt="Test photo" size={40} />);

    // Trigger intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  it("should fallback to default image on photo load error", async () => {
    mockGetPhotoUrl.mockRejectedValue(new Error("Load failed"));

    render(
      <LazyPhotoPreview
        photoId="photo1"
        alt="Test photo"
        fallbackSrc="/default.jpg"
      />,
    );

    // Trigger intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/default.jpg");
    });
  });

  it("should call onError callback when photo fails to load", async () => {
    const onError = vi.fn();
    mockGetPhotoUrl.mockResolvedValue(null);

    render(
      <LazyPhotoPreview photoId="photo1" alt="Test photo" onError={onError} />,
    );

    // Trigger intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("should apply custom className and size", () => {
    render(
      <LazyPhotoPreview alt="Test photo" className="custom-class" size={60} />,
    );

    const container = document.querySelector(".custom-class");
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle({ width: "60px", height: "60px" });
  });

  it("should disconnect observer on unmount", () => {
    const { unmount } = render(
      <LazyPhotoPreview photoId="photo1" alt="Test photo" />,
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("should not load photo if not in view", async () => {
    render(<LazyPhotoPreview photoId="photo1" alt="Test photo" />);

    // Simulate intersection observer callback with not intersecting
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: false }]);

    // Wait a bit to ensure no loading happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockGetPhotoUrl).not.toHaveBeenCalled();
  });

  it("should handle image onError event", async () => {
    const onError = vi.fn();
    mockGetPhotoUrl.mockResolvedValue("blob:mock-url");

    render(
      <LazyPhotoPreview
        photoId="photo1"
        alt="Test photo"
        onError={onError}
        fallbackSrc="/default.jpg"
      />,
    );

    // Trigger intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "blob:mock-url");
    });

    // Simulate image load error
    const img = screen.getByRole("img");
    img.dispatchEvent(new Event("error"));

    await waitFor(() => {
      expect(img).toHaveAttribute("src", "/default.jpg");
      expect(onError).toHaveBeenCalled();
    });
  });

  it("should use unoptimized prop for blob URLs", async () => {
    mockGetPhotoUrl.mockResolvedValue("blob:mock-url");

    render(<LazyPhotoPreview photoId="photo1" alt="Test photo" />);

    // Trigger intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "blob:mock-url");
      expect(img).toHaveAttribute("unoptimized", "true");
    });
  });
});
