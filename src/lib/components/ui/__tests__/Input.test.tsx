import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Input from "../Input";

describe("Input", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with label and input", () => {
    render(<Input label="Test Label" value="" onChange={mockOnChange} />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should show required indicator when required", () => {
    render(
      <Input
        label="Required Field"
        value=""
        onChange={mockOnChange}
        required
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should show error message when error is provided", () => {
    render(
      <Input
        label="Test Field"
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />,
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should call onChange when typing", async () => {
    const user = userEvent.setup();

    render(<Input label="Test Field" value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test");

    expect(mockOnChange).toHaveBeenCalledWith("t");
    expect(mockOnChange).toHaveBeenCalledWith("e");
    expect(mockOnChange).toHaveBeenCalledWith("s");
    expect(mockOnChange).toHaveBeenCalledWith("t");
  });

  it("should have proper styling classes including padding", () => {
    render(<Input label="Test Field" value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("p-4"); // Verify padding is applied
    expect(input).toHaveClass("rounded-lg");
    expect(input).toHaveClass("border");
  });
});
