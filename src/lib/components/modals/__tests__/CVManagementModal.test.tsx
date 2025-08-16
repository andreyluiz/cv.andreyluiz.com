import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/lib/store";

import CVManagementModal from "../CVManagementModal";

// Mock the store
vi.mock("@/lib/store");
const mockUseStore = vi.mocked(useStore);

// Mock server actions
vi.mock("@/lib/server/actions", () => ({
  ingestCV: vi.fn(),
}));

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
});
