import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import ResumeTailor from "../ResumeTailor";

// Mock the store
vi.mock("@/lib/store");

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

// Mock server actions
vi.mock("@/lib/server/actions", () => ({
  tailorResume: vi.fn(),
}));

// Mock child components
vi.mock("../../modals/JobDescriptionModal", () => ({
  default: ({ isOpen, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="job-description-modal">
        <h2>Job Description Modal</h2>
        <button
          type="button"
          onClick={() =>
            onSubmit("Test Job", "Test Description", "AI Instructions")
          }
        >
          Submit Job Description
        </button>
        <button type="button" onClick={onClose}>
          Close Job Modal
        </button>
      </div>
    ) : null,
}));

vi.mock("../../modals/ChangesModal", () => ({
  default: ({ isOpen, onClose, changes }: any) =>
    isOpen ? (
      <div data-testid="changes-modal">
        <h2>Changes Modal</h2>
        <div data-testid="changes-count">{changes?.length || 0} changes</div>
        <button type="button" onClick={onClose}>
          Close Changes Modal
        </button>
      </div>
    ) : null,
}));

vi.mock("../../modals/CoverLetterModal", () => ({
  default: ({ isOpen, onClose, resumeData, apiKey, selectedModel }: any) =>
    isOpen ? (
      <div data-testid="cover-letter-modal">
        <h2>Cover Letter Modal</h2>
        <div data-testid="modal-props">
          API Key: {apiKey || "none"}
          <br />
          Model: {selectedModel || "none"}
          <br />
          Resume Name: {resumeData?.name || "none"}
        </div>
        <button type="button" onClick={onClose}>
          Close Cover Letter Modal
        </button>
      </div>
    ) : null,
}));

vi.mock("../../ui/Button", () => ({
  default: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const mockMessages = {
  coverLetter: {
    modal: {
      titles: {
        input: "Generate Cover Letter",
        generating: "Generating Cover Letter",
        display: "Cover Letter",
        error: "Generation Failed",
        default: "Cover Letter",
      },
      generating: {
        message: "Creating your personalized cover letter...",
        subtitle: "This may take a few moments",
      },
      error: {
        title: "Something went wrong",
      },
      errors: {
        generationFailed: "Failed to generate cover letter. Please try again.",
        apiError:
          "Failed to generate cover letter. Please check your API key and selected model, then try again.",
      },
      actions: {
        editInputs: "Edit Inputs",
        close: "Close",
        retry: "Try Again",
        cancel: "Cancel",
      },
    },
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages} timeZone="UTC">
      {component}
    </NextIntlClientProvider>,
  );
};

describe("ResumeTailor Integration Tests", () => {
  const mockOnResumeUpdate = vi.fn();
  const mockedUseStore = vi.mocked(useStore);

  const defaultResumeData: Variant = {
    name: "John Doe",
    title: "Software Engineer",
    contactInfo: {
      email: "john@example.com",
      phone: "+1234567890",
      location: "City, Country",
      website: "https://johndoe.dev",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      age: "30",
      nationality: "American",
      permit: "US Citizen",
    },
    summary: "Experienced software engineer",
    qualities: ["Problem-solving"],
    generalSkills: ["JavaScript", "Python"],
    skills: [
      {
        domain: "Programming",
        skills: ["JavaScript", "TypeScript"],
      },
    ],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: ["Built web applications"],
        techStack: ["React", "Node.js"],
      },
    ],
    projects: [
      {
        name: "Project A",
        description: "A web application",
        techStack: ["React"],
        period: { start: "2023", end: "2024" },
      },
    ],
    education: [
      {
        degree: "CS",
        institution: "University",
        year: "2020",
        location: "CA",
      },
    ],
    certifications: [],
    languages: [
      {
        name: "English",
        level: "Native",
      },
    ],
    publications: [],
    personalityTraits: ["Analytical"],
  };

  const defaultProps = {
    resumeData: defaultResumeData,
    onResumeUpdate: mockOnResumeUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store state
    mockedUseStore.mockReturnValue({
      apiKey: "test-api-key",
      selectedModel: "test-model",
    });
  });

  describe("Button Rendering and State", () => {
    it("should render all buttons correctly", () => {
      renderWithIntl(<ResumeTailor {...defaultProps} />);

      expect(screen.getByText("Tailor Resume")).toBeInTheDocument();
      expect(screen.getByText("Generate Cover Letter")).toBeInTheDocument();
    });

    it("should disable buttons when API key is missing", () => {
      mockedUseStore.mockReturnValue({
        apiKey: "",
        selectedModel: "test-model",
      });

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const tailorButton = screen.getByText("Tailor Resume");
      const coverLetterButton = screen.getByText("Generate Cover Letter");

      expect(tailorButton).toBeDisabled();
      expect(coverLetterButton).toBeDisabled();
    });

    it("should disable cover letter button when model is missing", () => {
      mockedUseStore.mockReturnValue({
        apiKey: "test-api-key",
        selectedModel: "",
      });

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const coverLetterButton = screen.getByText("Generate Cover Letter");
      expect(coverLetterButton).toBeDisabled();
    });

    it("should enable buttons when both API key and model are provided", () => {
      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const tailorButton = screen.getByText("Tailor Resume");
      const coverLetterButton = screen.getByText("Generate Cover Letter");

      expect(tailorButton).not.toBeDisabled();
      expect(coverLetterButton).not.toBeDisabled();
    });
  });

  describe("Cover Letter Modal Integration", () => {
    it("should open cover letter modal when button is clicked", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const coverLetterButton = screen.getByText("Generate Cover Letter");
      await user.click(coverLetterButton);

      // Verify modal opens
      expect(screen.getByTestId("cover-letter-modal")).toBeInTheDocument();
      expect(screen.getByText("Cover Letter Modal")).toBeInTheDocument();
    });

    it("should close cover letter modal when close button is clicked", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      // Open modal
      const coverLetterButton = screen.getByText("Generate Cover Letter");
      await user.click(coverLetterButton);

      expect(screen.getByTestId("cover-letter-modal")).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText("Close Cover Letter Modal");
      await user.click(closeButton);

      expect(
        screen.queryByTestId("cover-letter-modal"),
      ).not.toBeInTheDocument();
    });

    it("should pass correct props to cover letter modal", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const coverLetterButton = screen.getByText("Generate Cover Letter");
      await user.click(coverLetterButton);

      const modalProps = screen.getByTestId("modal-props");
      expect(modalProps).toHaveTextContent("API Key: test-api-key");
      expect(modalProps).toHaveTextContent("Model: test-model");
      expect(modalProps).toHaveTextContent("Resume Name: John Doe");
    });

    it("should not pass jobTitle or jobDescription to enhanced modal", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const coverLetterButton = screen.getByText("Generate Cover Letter");
      await user.click(coverLetterButton);

      // The modal should only receive resumeData, apiKey, and selectedModel
      const modalProps = screen.getByTestId("modal-props");
      expect(modalProps).toHaveTextContent("API Key: test-api-key");
      expect(modalProps).toHaveTextContent("Model: test-model");
      expect(modalProps).toHaveTextContent("Resume Name: John Doe");

      // Should not contain job title or description references
      expect(modalProps).not.toHaveTextContent("Job Title:");
      expect(modalProps).not.toHaveTextContent("Job Description:");
    });
  });

  describe("Button Validation", () => {
    it("should validate both API key and model for cover letter button", () => {
      const testCases = [
        { apiKey: "", selectedModel: "", expectedDisabled: true },
        { apiKey: "key", selectedModel: "", expectedDisabled: true },
        { apiKey: "", selectedModel: "model", expectedDisabled: true },
        { apiKey: "key", selectedModel: "model", expectedDisabled: false },
      ];

      testCases.forEach(({ apiKey, selectedModel, expectedDisabled }) => {
        mockedUseStore.mockReturnValue({
          apiKey,
          selectedModel,
        });

        const { unmount } = renderWithIntl(<ResumeTailor {...defaultProps} />);

        const coverLetterButton = screen.getByText("Generate Cover Letter");

        if (expectedDisabled) {
          expect(coverLetterButton).toBeDisabled();
        } else {
          expect(coverLetterButton).not.toBeDisabled();
        }

        unmount();
      });
    });

    it("should validate only API key for tailor resume button", () => {
      const testCases = [
        { apiKey: "", expectedDisabled: true },
        { apiKey: "key", expectedDisabled: false },
      ];

      testCases.forEach(({ apiKey, expectedDisabled }) => {
        mockedUseStore.mockReturnValue({
          apiKey,
          selectedModel: "test-model", // Model doesn't matter for tailor resume
        });

        const { unmount } = renderWithIntl(<ResumeTailor {...defaultProps} />);

        const tailorButton = screen.getByText("Tailor Resume");

        if (expectedDisabled) {
          expect(tailorButton).toBeDisabled();
        } else {
          expect(tailorButton).not.toBeDisabled();
        }

        unmount();
      });
    });
  });

  describe("Modal Integration", () => {
    it("should open job description modal when tailor button is clicked", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      const tailorButton = screen.getByText("Tailor Resume");
      await user.click(tailorButton);

      expect(screen.getByTestId("job-description-modal")).toBeInTheDocument();
    });

    it("should show changes button after resume is tailored", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      // Initially, changes button should not be visible
      expect(screen.queryByText("What changed?")).not.toBeInTheDocument();

      // Open job description modal and submit
      const tailorButton = screen.getByText("Tailor Resume");
      await user.click(tailorButton);

      const submitButton = screen.getByText("Submit Job Description");
      await user.click(submitButton);

      // After tailoring, changes button should appear
      expect(screen.getByText("Resume Tailored")).toBeInTheDocument();
      expect(screen.getByText("What changed?")).toBeInTheDocument();
    });

    it("should open changes modal when changes button is clicked", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      // First tailor the resume
      const tailorButton = screen.getByText("Tailor Resume");
      await user.click(tailorButton);

      const submitButton = screen.getByText("Submit Job Description");
      await user.click(submitButton);

      // Now click the changes button
      const changesButton = screen.getByText("What changed?");
      await user.click(changesButton);

      expect(screen.getByTestId("changes-modal")).toBeInTheDocument();
    });
  });

  describe("Store Integration", () => {
    it("should use store values for API key and model", () => {
      const customStoreState = {
        apiKey: "custom-api-key",
        selectedModel: "custom-model",
      };
      mockedUseStore.mockReturnValue(customStoreState);

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      // Verify buttons are enabled with custom store values
      const coverLetterButton = screen.getByText("Generate Cover Letter");
      expect(coverLetterButton).not.toBeDisabled();
    });

    it("should react to store changes", () => {
      // Start with no API key
      mockedUseStore.mockReturnValue({
        apiKey: "",
        selectedModel: "test-model",
      });

      const { rerender } = renderWithIntl(<ResumeTailor {...defaultProps} />);

      let coverLetterButton = screen.getByText("Generate Cover Letter");
      expect(coverLetterButton).toBeDisabled();

      // Update store to have API key
      mockedUseStore.mockReturnValue({
        apiKey: "new-api-key",
        selectedModel: "test-model",
      });

      rerender(
        <NextIntlClientProvider
          locale="en"
          messages={mockMessages}
          timeZone="UTC"
        >
          <ResumeTailor {...defaultProps} />
        </NextIntlClientProvider>,
      );

      coverLetterButton = screen.getByText("Generate Cover Letter");
      expect(coverLetterButton).not.toBeDisabled();
    });
  });

  describe("Enhanced Modal Integration", () => {
    it("should work with enhanced modal without job dependencies", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      // Open cover letter modal
      const coverLetterButton = screen.getByText("Generate Cover Letter");
      await user.click(coverLetterButton);

      // Verify modal opens and receives correct props
      const modal = screen.getByTestId("cover-letter-modal");
      expect(modal).toBeInTheDocument();

      // Verify props are passed correctly (without job title/description)
      const modalProps = screen.getByTestId("modal-props");
      expect(modalProps).toHaveTextContent("API Key: test-api-key");
      expect(modalProps).toHaveTextContent("Model: test-model");
      expect(modalProps).toHaveTextContent("Resume Name: John Doe");

      // Close modal
      const closeButton = screen.getByText("Close Cover Letter Modal");
      await user.click(closeButton);

      expect(
        screen.queryByTestId("cover-letter-modal"),
      ).not.toBeInTheDocument();
    });

    it("should handle multiple modal interactions", async () => {
      const user = userEvent.setup();

      renderWithIntl(<ResumeTailor {...defaultProps} />);

      // Open and close cover letter modal multiple times
      for (let i = 0; i < 3; i++) {
        const coverLetterButton = screen.getByText("Generate Cover Letter");
        await user.click(coverLetterButton);

        expect(screen.getByTestId("cover-letter-modal")).toBeInTheDocument();

        const closeButton = screen.getByText("Close Cover Letter Modal");
        await user.click(closeButton);

        expect(
          screen.queryByTestId("cover-letter-modal"),
        ).not.toBeInTheDocument();
      }
    });
  });
});
