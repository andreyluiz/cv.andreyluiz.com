import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Textarea from "../Textarea";

describe("Textarea", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with label and textarea", () => {
    render(
      <Textarea
        label="Test Label"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should show required indicator when required", () => {
    render(
      <Textarea
        label="Required Field"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should show error message when error is provided", () => {
    render(
      <Textarea
        label="Test Field"
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should call onChange when typing", async () => {
    const user = userEvent.setup();
    
    render(
      <Textarea
        label="Test Field"
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "test");

    expect(mockOnChange).toHaveBeenCalledWith("t");
    expect(mockOnChange).toHaveBeenCalledWith("e");
    expect(mockOnChange).toHaveBeenCalledWith("s");
    expect(mockOnChange).toHaveBeenCalledWith("t");
  });

  it("should have proper styling classes including padding", () => {
    render(
      <Textarea
        label="Test Field"
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("p-4"); // Verify padding is applied
    expect(textarea).toHaveClass("rounded-lg");
    expect(textarea).toHaveClass("border");
  });

  it("should set correct number of rows", () => {
    render(
      <Textarea
        label="Test Field"
        value=""
        onChange={mockOnChange}
        rows={8}
      />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "8");
  });
});