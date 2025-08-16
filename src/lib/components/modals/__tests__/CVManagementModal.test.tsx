import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/lib/store";
import type { IngestedCV } from "@/lib/types";

import CVManagementModal from "../CVManagementModal";

// Mock the store
vi.mock("@/lib/store");
const mockUseStore = vi.mocked(useStore);

// Mock server actions
vi.mock("@/lib/server/actions", () => ({
  ingestCV: vi.fn(),
}));

import { ingestCV } from "@/lib/server/actions";

const mockIngestCV = vi.mocked(ingestCV);

// Mock resume data
vi.mock("@/lib/server/resume-en.json", () => ({
  default: {
    name: "Test User",
    title: "Test Title",
    contactInfo: {
      email: "test@example.com",
      phone: "+1234567890",
      location: "Test Location",
      github: "github.com/test",
      linkedin: "linkedin.com/in/test",
      website: "test.com",
      age: "30",
      nationality: "Test",
    },
    summary: "Test summary",
    qualities: [],
    generalSkills: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    personalityTraits: [],
  },
}));

const messages = {
  cvManagement: {
    modal: {
      title: "My CVs",
      ingestNew: "Ingest New CV",
      defaultCV: "Default CV",
      noIngestedCVs: "No ingested CVs yet",
    },
    form: {
      title: "CV Title",
      titlePlaceholder: "Enter a name for this CV",
      rawText: "Raw CV Text",
      rawTextPlaceholder: "Paste your CV text here...",
      submit: "Process CV",
      cancel: "Cancel",
      processing: "Processing CV...",
      ingestTitle: "Ingest New CV",
      editTitle: "Edit CV",
      processingDescription: "Please wait while we format your CV using AI.",
    },
    actions: {
      load: "Load CV",
      edit: "Edit CV",
      delete: "Delete CV",
      confirmDelete: "Are you sure you want to delete this CV?",
    },
    errors: {
      titleRequired: "CV title is required",
      titleTooLong: "CV title must be less than 100 characters",
      rawTextRequired: "CV text is required",
      rawTextTooShort: "CV text must be at least 50 characters",
      rawTextTooLong: "CV text must be less than 50,000 characters",
      processingFailed: "Failed to process CV",
      storageError: "Failed to save CV",
      apiKeyRequired: "API key is required to process CV.",
    },
  },
};

const mockIngestedCV: IngestedCV = {
  id: "test-cv-1",
  title: "Test CV",
  rawText:
    "This is test CV raw text content that is long enough to pass validation requirements.",
  formattedCV: {
    name: "Test User",
    title: "Test Title",
    contactInfo: {
      email: "test@example.com",
      phone: "+1234567890",
      location: "Test Location",
      github: "github.com/test",
      linkedin: "linkedin.com/in/test",
      website: "test.com",
      age: "30",
      nationality: "Test",
    },
    summary: "Test summary",
    qualities: [],
    generalSkills: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    personalityTraits: [],
  },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockStore = {
  ingestedCVs: [],
  apiKey: "test-api-key",
  selectedModel: "test-model",
  addIngestedCV: vi.fn(),
  updateIngestedCV: vi.fn(),
  deleteIngestedCV: vi.fn(),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe("CVManagementModal", () => {
  const mockOnClose = vi.fn();
  const mockOnCVLoad = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockReturnValue(mockStore as any);
  });

  it("renders modal with CV list view by default", () => {
    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    expect(screen.getAllByText("My CVs")).toHaveLength(2); // Modal title and list header
    expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
    expect(screen.getByText("Default CV")).toBeInTheDocument();
  });

  it("shows ingestion form when Ingest New CV is clicked", async () => {
    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText("Ingest New CV"));

    await waitFor(() => {
      expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter a name for this CV"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Paste your CV text here..."),
      ).toBeInTheDocument();
    });
  });

  it("calls onClose when modal is closed", () => {
    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    const closeButton = screen.getByLabelText("Close modal");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onCVLoad and onClose when default CV is loaded", () => {
    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    const loadButton = screen.getByLabelText(/Load CV: Test User - Test Title/);
    fireEvent.click(loadButton);

    expect(mockOnCVLoad).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={false}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    expect(screen.queryByText("My CVs")).not.toBeInTheDocument();
  });

  it("shows edit form when edit button is clicked on ingested CV", async () => {
    mockUseStore.mockReturnValue({
      ...mockStore,
      ingestedCVs: [mockIngestedCV],
    } as any);

    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    const editButton = screen.getByLabelText("Edit CV: Test CV");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit CV")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test CV")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(mockIngestedCV.rawText),
      ).toBeInTheDocument();
    });
  });

  it("updates existing CV when edit form is submitted", async () => {
    const mockUpdatedCV = {
      ...mockIngestedCV.formattedCV,
      name: "Updated User",
    };

    mockIngestCV.mockResolvedValue(mockUpdatedCV);

    mockUseStore.mockReturnValue({
      ...mockStore,
      ingestedCVs: [mockIngestedCV],
    } as any);

    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    // Click edit button
    const editButton = screen.getByLabelText("Edit CV: Test CV");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit CV")).toBeInTheDocument();
    });

    // Update the title
    const titleInput = screen.getByDisplayValue("Test CV");
    fireEvent.change(titleInput, { target: { value: "Updated Test CV" } });

    // Update the raw text
    const rawTextArea = screen.getByDisplayValue(mockIngestedCV.rawText);
    fireEvent.change(rawTextArea, {
      target: {
        value:
          "Updated CV raw text content that is long enough to pass validation requirements.",
      },
    });

    // Submit the form
    const submitButton = screen.getByText("Process CV");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockIngestCV).toHaveBeenCalledWith(
        "Updated CV raw text content that is long enough to pass validation requirements.",
        "test-api-key",
        "test-model",
        "en",
      );
      expect(mockStore.updateIngestedCV).toHaveBeenCalledWith(
        "test-cv-1",
        expect.objectContaining({
          id: "test-cv-1",
          title: "Updated Test CV",
          rawText:
            "Updated CV raw text content that is long enough to pass validation requirements.",
          formattedCV: mockUpdatedCV,
        }),
      );
    });
  });

  it("returns to list view after successful CV update", async () => {
    const mockUpdatedCV = {
      ...mockIngestedCV.formattedCV,
      name: "Updated User",
    };

    mockIngestCV.mockResolvedValue(mockUpdatedCV);

    mockUseStore.mockReturnValue({
      ...mockStore,
      ingestedCVs: [mockIngestedCV],
    } as any);

    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    // Click edit button
    const editButton = screen.getByLabelText("Edit CV: Test CV");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit CV")).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByText("Process CV");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText("My CVs")).toHaveLength(2); // Back to list view
      expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
    });
  });

  it("handles edit form cancellation", async () => {
    mockUseStore.mockReturnValue({
      ...mockStore,
      ingestedCVs: [mockIngestedCV],
    } as any);

    render(
      <TestWrapper>
        <CVManagementModal
          isOpen={true}
          onClose={mockOnClose}
          onCVLoad={mockOnCVLoad}
        />
      </TestWrapper>,
    );

    // Click edit button
    const editButton = screen.getByLabelText("Edit CV: Test CV");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("Edit CV")).toBeInTheDocument();
    });

    // Cancel the form
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getAllByText("My CVs")).toHaveLength(2); // Back to list view
      expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
    });
  });
});
