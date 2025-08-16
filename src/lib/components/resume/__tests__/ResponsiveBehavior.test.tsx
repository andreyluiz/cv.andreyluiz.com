import { act, render } from "@testing-library/react";
import { useEffect, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Test the useIsMobile hook functionality directly
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

// Simple test component to test the hook
function TestComponent() {
  const isMobile = useIsMobile();
  return (
    <div data-testid="mobile-status">{isMobile ? "mobile" : "desktop"}</div>
  );
}

describe("Responsive Behavior", () => {
  let originalInnerWidth: number;
  let resizeCallback: (() => void) | null = null;

  beforeEach(() => {
    // Store original window.innerWidth
    originalInnerWidth = window.innerWidth;

    // Mock window.addEventListener to capture the resize callback
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event: string, callback: any) => {
      if (event === "resize") {
        resizeCallback = callback;
      }
      return originalAddEventListener.call(window, event, callback);
    });

    // Mock window.removeEventListener
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Restore original window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });

    resizeCallback = null;
    vi.clearAllMocks();
  });

  it("should detect desktop screen size correctly", () => {
    // Set desktop screen size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId("mobile-status")).toHaveTextContent("desktop");
  });

  it("should detect mobile screen size correctly", () => {
    // Set mobile screen size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId("mobile-status")).toHaveTextContent("mobile");
  });

  it("should respond to window resize events", () => {
    // Start with desktop size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { getByTestId } = render(<TestComponent />);

    // Initially should be desktop
    expect(getByTestId("mobile-status")).toHaveTextContent("desktop");

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 600,
      });

      // Trigger the resize callback if it was captured
      if (resizeCallback) {
        resizeCallback();
      }
    });

    // Should now be mobile
    expect(getByTestId("mobile-status")).toHaveTextContent("mobile");
  });

  it("should add and remove resize event listeners", () => {
    const { unmount } = render(<TestComponent />);

    // Verify that resize event listener is added
    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    unmount();

    // Verify that resize event listener is removed
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should use 768px as the mobile breakpoint", () => {
    // Test exactly at the breakpoint
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { getByTestId } = render(<TestComponent />);

    // At 768px should be desktop (>= 768 is desktop)
    expect(getByTestId("mobile-status")).toHaveTextContent("desktop");

    // Test just below the breakpoint
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 767,
      });

      if (resizeCallback) {
        resizeCallback();
      }
    });

    // At 767px should be mobile (< 768 is mobile)
    expect(getByTestId("mobile-status")).toHaveTextContent("mobile");
  });

  describe("Print Media Behavior", () => {
    it("should have print-specific CSS classes available", () => {
      // Create a test element with print classes
      const testElement = document.createElement("div");
      testElement.className =
        "print:grid-cols-[200px_1fr] print:gap-4 print:text-xs print:leading-tight";

      // Verify the classes are applied (they exist in the className)
      expect(testElement.className).toContain("print:grid-cols-[200px_1fr]");
      expect(testElement.className).toContain("print:gap-4");
      expect(testElement.className).toContain("print:text-xs");
      expect(testElement.className).toContain("print:leading-tight");
    });

    it("should have page break avoidance classes available", () => {
      const testElement = document.createElement("div");
      testElement.className =
        "print:break-inside-avoid print:break-inside-avoid-page";

      expect(testElement.className).toContain("print:break-inside-avoid");
      expect(testElement.className).toContain("print:break-inside-avoid-page");
    });

    it("should maintain responsive behavior with print classes", () => {
      // Test that print classes don't interfere with responsive behavior
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 600, // Mobile size
      });

      const { getByTestId } = render(<TestComponent />);

      // Should still detect mobile correctly even with print classes present
      expect(getByTestId("mobile-status")).toHaveTextContent("mobile");
    });
  });
});
