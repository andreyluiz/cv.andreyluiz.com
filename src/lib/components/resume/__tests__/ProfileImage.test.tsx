import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfileImage from "../ProfileImage";

describe("ProfileImage", () => {
  it("should render profile image with correct alt text", () => {
    render(<ProfileImage />);

    const image = screen.getByRole("img", { name: /profile picture/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("alt", "Profile Picture");
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
});
