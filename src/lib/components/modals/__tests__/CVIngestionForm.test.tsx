import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CVIngestionForm from "../CVIngestionForm";

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

describe("CVIngestionForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByLabelText(/CV Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Raw CV Text/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Process CV/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/ })).toBeInTheDocument();
  });

  it("renders with initial data when provided", () => {
    const initialData = {
      title: "Test CV",
      rawText:
        "This is a test CV with enough content to pass validation requirements for the minimum character count.",
    };

    renderWithIntl(
      <CVIngestionForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByDisplayValue("Test CV")).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialData.rawText)).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("CV title is required")).toBeInTheDocument();
      expect(screen.getByText("CV text is required")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for title too long", async () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const titleInput = screen.getByLabelText(/CV Title/);
    const longTitle = "a".repeat(101);
    fireEvent.change(titleInput, { target: { value: longTitle } });

    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("CV title must be less than 100 characters"),
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for raw text too short", async () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const titleInput = screen.getByLabelText(/CV Title/);
    const rawTextInput = screen.getByLabelText(/Raw CV Text/);

    fireEvent.change(titleInput, { target: { value: "Test CV" } });
    fireEvent.change(rawTextInput, { target: { value: "Short text" } });

    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("CV text must be at least 50 characters"),
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const titleInput = screen.getByLabelText(/CV Title/);
    const rawTextInput = screen.getByLabelText(/Raw CV Text/);

    const validTitle = "Test CV";
    const validRawText =
      "This is a valid CV text with enough content to pass the minimum character count validation requirements.";

    fireEvent.change(titleInput, { target: { value: validTitle } });
    fireEvent.change(rawTextInput, { target: { value: validRawText } });

    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: validTitle,
        rawText: validRawText,
        photoId: null,
      });
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /Cancel/ });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("disables form when loading", () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />,
    );

    expect(screen.getByLabelText(/CV Title/)).toBeDisabled();
    expect(screen.getByLabelText(/Raw CV Text/)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Processing CV.../ }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /Cancel/ })).toBeDisabled();
  });

  it("clears validation errors when user starts typing", async () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    // Trigger validation errors
    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("CV title is required")).toBeInTheDocument();
      expect(screen.getByText("CV text is required")).toBeInTheDocument();
    });

    // Start typing in title field
    const titleInput = screen.getByLabelText(/CV Title/);
    fireEvent.change(titleInput, { target: { value: "Test" } });

    await waitFor(() => {
      expect(
        screen.queryByText("CV title is required"),
      ).not.toBeInTheDocument();
    });

    // Start typing in raw text field
    const rawTextInput = screen.getByLabelText(/Raw CV Text/);
    fireEvent.change(rawTextInput, { target: { value: "Test content" } });

    await waitFor(() => {
      expect(screen.queryByText("CV text is required")).not.toBeInTheDocument();
    });
  });

  it("trims whitespace from form data before submission", async () => {
    renderWithIntl(
      <CVIngestionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const titleInput = screen.getByLabelText(/CV Title/);
    const rawTextInput = screen.getByLabelText(/Raw CV Text/);

    const titleWithSpaces = "  Test CV  ";
    const rawTextWithSpaces =
      "  This is a valid CV text with enough content to pass validation requirements.  ";

    fireEvent.change(titleInput, { target: { value: titleWithSpaces } });
    fireEvent.change(rawTextInput, { target: { value: rawTextWithSpaces } });

    const submitButton = screen.getByRole("button", { name: /Process CV/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Test CV",
        rawText:
          "This is a valid CV text with enough content to pass validation requirements.",
        photoId: null,
      });
    });
  });
});
