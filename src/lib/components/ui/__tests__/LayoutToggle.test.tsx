import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/lib/store";
import LayoutToggle from "../LayoutToggle";

// Mock the store
const mockSetLayoutMode = vi.fn();
vi.mock("@/lib/store", () => ({
  useStore: vi.fn(),
}));

describe("LayoutToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with single column layout by default", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "single",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to two column layout");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("title", "Switch to two column layout");
  });

  it("renders with two column layout when active", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "two-column",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Switch to single column layout",
    );
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("title", "Switch to single column layout");
  });

  it("toggles layout when clicked", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "single",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockSetLayoutMode).toHaveBeenCalledWith("two-column");
  });

  it("toggles from two-column to single when clicked", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "two-column",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockSetLayoutMode).toHaveBeenCalledWith("single");
  });

  it("is keyboard accessible", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "single",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle />);

    const button = screen.getByRole("button");

    // Button should be focusable and have proper tab index
    expect(button).not.toHaveAttribute("tabindex", "-1");
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("has proper ARIA attributes for screen readers", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "single",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle />);

    const button = screen.getByRole("button");
    const icon = button.querySelector("svg");

    // Button should have proper ARIA attributes
    expect(button).toHaveAttribute("aria-label");
    expect(button).toHaveAttribute("aria-pressed");
    expect(button).toHaveAttribute("title");

    // Icon should be hidden from screen readers
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts custom className", () => {
    (useStore as any).mockReturnValue({
      layoutMode: "single",
      setLayoutMode: mockSetLayoutMode,
    });

    render(<LayoutToggle className="custom-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
