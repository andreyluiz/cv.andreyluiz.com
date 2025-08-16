import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading");
    expect(spinner).toHaveClass("h-8", "w-8", "border-2");
  });

  it("renders with small size", () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-4", "w-4", "border-2");
  });

  it("renders with large size", () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-12", "w-12", "border-4");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("custom-class");
  });

  it("uses custom aria-label", () => {
    render(<LoadingSpinner aria-label="Processing data" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-label", "Processing data");
  });

  it("includes screen reader text", () => {
    render(<LoadingSpinner aria-label="Custom loading" />);

    expect(screen.getByText("Custom loading")).toBeInTheDocument();
    expect(screen.getByText("Custom loading")).toHaveClass("sr-only");
  });

  it("has proper animation classes", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("animate-spin", "rounded-full");
  });
});
