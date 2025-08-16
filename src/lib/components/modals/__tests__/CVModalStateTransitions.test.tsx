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
      confirmDeleteTitle: "Delete CV",
      confirmDeleteMessage: "This action cannot be undone.",
      confirmDeleteButton: "Delete",
      cancelDelete: "Cancel",
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
  setCurrentCV: vi.fn(),
  clearCurrentCV: vi.fn(),
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe("CV Modal State Transitions", () => {
  const mockOnClose = vi.fn();
  const mockOnCVLoad = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockReturnValue(mockStore as any);
  });

  describe("Initial state", () => {
    it("should start in list view state", () => {
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

    it("should not render when closed", () => {
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

  describe("List to Ingestion Form transition", () => {
    it("should transition from list to ingestion form when 'Ingest New CV' is clicked", async () => {
      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Verify initial list state
      expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      expect(screen.getByText("Default CV")).toBeInTheDocument();

      // Click to transition to form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument(); // Form title
        expect(
          screen.getByPlaceholderText("Enter a name for this CV"),
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Paste your CV text here..."),
        ).toBeInTheDocument();
        expect(screen.getByText("Process CV")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      // Verify list elements are no longer visible
      expect(screen.queryByText("Default CV")).not.toBeInTheDocument();
    });

    it("should show form with empty fields for new CV", async () => {
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
        const titleInput = screen.getByPlaceholderText(
          "Enter a name for this CV",
        );
        const textArea = screen.getByPlaceholderText(
          "Paste your CV text here...",
        );

        expect(titleInput).toHaveValue("");
        expect(textArea).toHaveValue("");
      });
    });
  });

  describe("List to Edit Form transition", () => {
    beforeEach(() => {
      mockUseStore.mockReturnValue({
        ...mockStore,
        ingestedCVs: [mockIngestedCV],
      } as any);
    });

    it("should transition from list to edit form when edit button is clicked", async () => {
      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Verify initial list state with ingested CV
      expect(screen.getByText("Test CV")).toBeInTheDocument();

      // Click edit button
      const editButton = screen.getByLabelText("Edit CV: Test CV");
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit CV")).toBeInTheDocument(); // Form title
        expect(screen.getByDisplayValue("Test CV")).toBeInTheDocument();
        expect(
          screen.getByDisplayValue(mockIngestedCV.rawText),
        ).toBeInTheDocument();
        expect(screen.getByText("Process CV")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      // Verify list elements are no longer visible
      expect(screen.queryByText("Default CV")).not.toBeInTheDocument();
    });

    it("should show form with pre-filled data for editing", async () => {
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
        const titleInput = screen.getByDisplayValue("Test CV");
        const textArea = screen.getByDisplayValue(mockIngestedCV.rawText);

        expect(titleInput).toHaveValue("Test CV");
        expect(textArea).toHaveValue(mockIngestedCV.rawText);
      });
    });
  });

  describe("Form to List transition", () => {
    it("should return to list when cancel is clicked from ingestion form", async () => {
      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      // Cancel back to list
      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.getAllByText("My CVs")).toHaveLength(2); // Back to list
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
        expect(screen.getByText("Default CV")).toBeInTheDocument();
      });
    });

    it("should return to list when cancel is clicked from edit form", async () => {
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

      // Go to edit form
      const editButton = screen.getByLabelText("Edit CV: Test CV");
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit CV")).toBeInTheDocument();
      });

      // Cancel back to list
      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.getAllByText("My CVs")).toHaveLength(2); // Back to list
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
        expect(screen.getByText("Test CV")).toBeInTheDocument();
      });
    });

    it("should return to list after successful CV ingestion", async () => {
      const mockFormattedCV = {
        ...mockIngestedCV.formattedCV,
        name: "New User",
      };

      mockIngestCV.mockResolvedValue(mockFormattedCV);

      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });

      // Fill and submit form
      const titleInput = screen.getByPlaceholderText(
        "Enter a name for this CV",
      );
      const textArea = screen.getByPlaceholderText(
        "Paste your CV text here...",
      );

      fireEvent.change(titleInput, { target: { value: "New Test CV" } });
      fireEvent.change(textArea, {
        target: {
          value:
            "New CV raw text content that is long enough to pass validation requirements.",
        },
      });

      fireEvent.click(screen.getByText("Process CV"));

      await waitFor(() => {
        expect(screen.getAllByText("My CVs")).toHaveLength(2); // Back to list
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });
    });

    it("should return to list after successful CV update", async () => {
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

      // Go to edit form
      const editButton = screen.getByLabelText("Edit CV: Test CV");
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("Edit CV")).toBeInTheDocument();
      });

      // Submit form
      fireEvent.click(screen.getByText("Process CV"));

      await waitFor(() => {
        expect(screen.getAllByText("My CVs")).toHaveLength(2); // Back to list
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });
    });
  });

  describe("Processing state", () => {
    it("should show processing state during CV ingestion", async () => {
      // Mock a delayed response
      mockIngestCV.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });

      // Fill and submit form
      const titleInput = screen.getByPlaceholderText(
        "Enter a name for this CV",
      );
      const textArea = screen.getByPlaceholderText(
        "Paste your CV text here...",
      );

      fireEvent.change(titleInput, { target: { value: "Test CV" } });
      fireEvent.change(textArea, {
        target: {
          value:
            "Test CV raw text content that is long enough to pass validation requirements.",
        },
      });

      fireEvent.click(screen.getByText("Process CV"));

      // Should show processing state with heading and spinner
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Processing CV..." }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("status", { name: "Processing CV..." }),
        ).toBeInTheDocument();
      });
    });

    it("should show processing view instead of form during processing", async () => {
      // Mock a delayed response
      mockIngestCV.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });

      // Fill and submit form
      const titleInput = screen.getByPlaceholderText(
        "Enter a name for this CV",
      );
      const textArea = screen.getByPlaceholderText(
        "Paste your CV text here...",
      );

      fireEvent.change(titleInput, { target: { value: "Test CV" } });
      fireEvent.change(textArea, {
        target: {
          value:
            "Test CV raw text content that is long enough to pass validation requirements.",
        },
      });

      fireEvent.click(screen.getByText("Process CV"));

      // Should show processing view instead of form
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Processing CV..." }),
        ).toBeInTheDocument();
        // Form fields should no longer be visible
        expect(
          screen.queryByPlaceholderText("Enter a name for this CV"),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByPlaceholderText("Paste your CV text here..."),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error handling in state transitions", () => {
    it("should remain in form state when validation fails", async () => {
      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });

      // Submit form without filling required fields
      fireEvent.click(screen.getByText("Process CV"));

      await waitFor(() => {
        expect(screen.getByText("CV title is required")).toBeInTheDocument();
        expect(screen.getByText("CV text is required")).toBeInTheDocument();
      });

      // Should still be in form state
      expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter a name for this CV"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Paste your CV text here..."),
      ).toBeInTheDocument();
    });

    it("should remain in form state when API call fails", async () => {
      mockIngestCV.mockRejectedValue(new Error("API Error"));

      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });

      // Fill and submit form
      const titleInput = screen.getByPlaceholderText(
        "Enter a name for this CV",
      );
      const textArea = screen.getByPlaceholderText(
        "Paste your CV text here...",
      );

      fireEvent.change(titleInput, { target: { value: "Test CV" } });
      fireEvent.change(textArea, {
        target: {
          value:
            "Test CV raw text content that is long enough to pass validation requirements.",
        },
      });

      fireEvent.click(screen.getByText("Process CV"));

      await waitFor(() => {
        expect(screen.getByText("API Error")).toBeInTheDocument();
      });

      // Should still be in form state
      expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      expect(screen.getByText("Process CV")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  describe("Modal close behavior", () => {
    it("should close modal from list state", () => {
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

    it("should close modal from form state", async () => {
      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      // Go to ingestion form
      fireEvent.click(screen.getByText("Ingest New CV"));

      await waitFor(() => {
        expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText("Close modal");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close modal and call onCVLoad when CV is loaded", () => {
      render(
        <TestWrapper>
          <CVManagementModal
            isOpen={true}
            onClose={mockOnClose}
            onCVLoad={mockOnCVLoad}
          />
        </TestWrapper>,
      );

      const loadButton = screen.getByLabelText(
        /Load CV: Test User - Test Title/,
      );
      fireEvent.click(loadButton);

      expect(mockOnCVLoad).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
