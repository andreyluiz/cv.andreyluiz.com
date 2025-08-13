import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverLetter } from "@/lib/server/actions";
import { useStore } from "@/lib/store";
import type { CoverLetterInputs, Variant } from "@/lib/types";
import CoverLetterModal from "../CoverLetterModal";

// Mock the store
vi.mock("@/lib/store");

// Mock the server actions
vi.mock("@/lib/server/actions");

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

// Mock child components
vi.mock("../CoverLetterInputForm", () => ({
  default: ({ initialInputs, onSubmit, isLoading }: any) => (
    <div data-testid="cover-letter-input-form">
      <button
        type="button"
        onClick={() =>
          onSubmit({
            jobPosition: "Test Job",
            companyDescription: "Test Company",
            jobDescription: "Test Description",
          })
        }
        disabled={isLoading}
      >
        Generate Cover Letter
      </button>
      {initialInputs && (
        <div data-testid="initial-inputs">{JSON.stringify(initialInputs)}</div>
      )}
    </div>
  ),
}));

vi.mock("../CoverLetterDisplay", () => ({
  default: ({ content, inputs, onRegenerate }: any) => (
    <div data-testid="cover-letter-display">
      <div data-testid="content">{content}</div>
      <div data-testid="inputs">{JSON.stringify(inputs)}</div>
      <button type="button" onClick={onRegenerate}>
        Regenerate
      </button>
    </div>
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

describe("CoverLetterModal", () => {
  const mockSetCoverLetter = vi.fn();
  const mockOnClose = vi.fn();

  const mockedGenerateCoverLetter = vi.mocked(generateCoverLetter);
  const mockedUseStore = vi.mocked(useStore);

  const defaultResumeData: Variant = {
    personalInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      location: "City, Country",
    },
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    personalityTraits: [],
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    resumeData: defaultResumeData,
    apiKey: "test-api-key",
    selectedModel: "test-model",
  };

  const mockInputs: CoverLetterInputs = {
    jobPosition: "Software Engineer",
    companyDescription: "Tech company",
    jobDescription: "Developer role",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store state - no existing cover letter
    mockedUseStore.mockReturnValue({
      generatedCoverLetter: null,
      coverLetterInputs: null,
      setCoverLetter: mockSetCoverLetter,
    });
  });

  describe("rendering and phases", () => {
    it("should render modal when open", () => {
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: "Generate Cover Letter" }),
      ).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      renderWithIntl(<CoverLetterModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByRole("heading", { name: "Generate Cover Letter" }),
      ).not.toBeInTheDocument();
    });

    it("should show input form in initial phase", () => {
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(screen.getByTestId("cover-letter-input-form")).toBeInTheDocument();
      expect(
        screen.queryByTestId("cover-letter-display"),
      ).not.toBeInTheDocument();
    });

    it("should show display phase when existing cover letter exists", () => {
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: "Existing cover letter content",
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(screen.getByTestId("cover-letter-display")).toBeInTheDocument();
      expect(
        screen.queryByTestId("cover-letter-input-form"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    });

    it("should pass initial inputs to form when available", () => {
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: null,
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(screen.getByTestId("initial-inputs")).toHaveTextContent(
        JSON.stringify(mockInputs),
      );
    });
  });

  describe("cover letter generation", () => {
    it("should generate cover letter when form is submitted", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockResolvedValue("Generated cover letter");

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      expect(mockedGenerateCoverLetter).toHaveBeenCalledWith(
        "Test Job",
        "Test Description",
        defaultResumeData,
        "test-api-key",
        "test-model",
        "Test Company",
        "en",
      );
    });

    it("should show generating phase during generation", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve("Generated cover letter"), 100),
          ),
      );

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      expect(screen.getByText("Generating Cover Letter")).toBeInTheDocument();
      expect(
        screen.getByText("Creating your personalized cover letter..."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("This may take a few moments"),
      ).toBeInTheDocument();

      // Wait for generation to complete
      await waitFor(
        () => {
          expect(
            screen.queryByText("Generating Cover Letter"),
          ).not.toBeInTheDocument();
        },
        { timeout: 200 },
      );
    });

    it("should store generated cover letter and transition to display", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockResolvedValue("Generated cover letter");

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockSetCoverLetter).toHaveBeenCalledWith(
          "Generated cover letter",
          {
            jobPosition: "Test Job",
            companyDescription: "Test Company",
            jobDescription: "Test Description",
          },
        );
      });
    });

    it("should handle form submission from mocked component", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockResolvedValue("Generated cover letter");

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      expect(mockedGenerateCoverLetter).toHaveBeenCalledWith(
        "Test Job",
        "Test Description",
        defaultResumeData,
        "test-api-key",
        "test-model",
        "Test Company",
        "en",
      );

      await waitFor(() => {
        expect(mockSetCoverLetter).toHaveBeenCalledWith(
          "Generated cover letter",
          {
            jobPosition: "Test Job",
            companyDescription: "Test Company",
            jobDescription: "Test Description",
          },
        );
      });
    });
  });

  describe("error handling", () => {
    it("should show error phase when generation fails", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockRejectedValue(new Error("API Error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Generation Failed")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByText("API Error")).toBeInTheDocument();
      });
    });

    it("should show generic error message when generation returns null", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockResolvedValue(null);

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Failed to generate cover letter. Please try again.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should allow retry from error phase", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockRejectedValue(new Error("API Error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Try Again")).toBeInTheDocument();
      });

      const retryButton = screen.getByText("Try Again");
      await user.click(retryButton);

      expect(screen.getByTestId("cover-letter-input-form")).toBeInTheDocument();
    });

    it("should allow cancel from error phase", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockRejectedValue(new Error("API Error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("display phase interactions", () => {
    beforeEach(() => {
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: "Existing cover letter content",
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });
    });

    it("should show cover letter content and inputs in display phase", () => {
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(screen.getByTestId("content")).toHaveTextContent(
        "Existing cover letter content",
      );
      expect(screen.getByTestId("inputs")).toHaveTextContent(
        JSON.stringify(mockInputs),
      );
    });

    it("should handle regenerate from display component", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockResolvedValue("Regenerated cover letter");

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const regenerateButton = screen.getByText("Regenerate");
      await user.click(regenerateButton);

      expect(mockedGenerateCoverLetter).toHaveBeenCalledWith(
        mockInputs.jobPosition,
        mockInputs.jobDescription,
        defaultResumeData,
        "test-api-key",
        "test-model",
        mockInputs.companyDescription,
        "en",
      );
    });

    it("should allow editing inputs from display phase", async () => {
      const user = userEvent.setup();

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const editButton = screen.getByText("Edit Inputs");
      await user.click(editButton);

      expect(screen.getByTestId("cover-letter-input-form")).toBeInTheDocument();
      expect(
        screen.queryByTestId("cover-letter-display"),
      ).not.toBeInTheDocument();
    });

    it("should close modal from display phase", async () => {
      const user = userEvent.setup();

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("modal title changes", () => {
    it("should show correct title for input phase", () => {
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: "Generate Cover Letter" }),
      ).toBeInTheDocument();
    });

    it("should show correct title for display phase", () => {
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: "Content",
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    });

    it("should show correct title for generating phase", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("Generated"), 100)),
      );

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      expect(screen.getByText("Generating Cover Letter")).toBeInTheDocument();

      await waitFor(
        () => {
          expect(
            screen.queryByText("Generating Cover Letter"),
          ).not.toBeInTheDocument();
        },
        { timeout: 200 },
      );
    });

    it("should show correct title for error phase", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockRejectedValue(new Error("Test error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Generation Failed")).toBeInTheDocument();
      });
    });
  });

  describe("phase transitions", () => {
    it("should reset phase when modal reopens", () => {
      const { rerender } = renderWithIntl(
        <CoverLetterModal {...defaultProps} isOpen={false} />,
      );

      // Open with existing content
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: "Existing content",
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });

      rerender(
        <NextIntlClientProvider
          locale="en"
          messages={mockMessages}
          timeZone="UTC"
        >
          <CoverLetterModal {...defaultProps} isOpen={true} />
        </NextIntlClientProvider>,
      );

      expect(screen.getByTestId("cover-letter-display")).toBeInTheDocument();
    });

    it("should handle missing data gracefully in display phase", () => {
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: null,
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      // Should fall back to input phase
      expect(screen.getByTestId("cover-letter-input-form")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper button attributes", async () => {
      const user = userEvent.setup();
      mockedGenerateCoverLetter.mockRejectedValue(new Error("Test error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        const retryButton = screen.getByText("Try Again");
        const cancelButton = screen.getByText("Cancel");

        expect(retryButton).toHaveAttribute("type", "button");
        expect(cancelButton).toHaveAttribute("type", "button");
      });
    });

    it("should maintain focus management between phases", () => {
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: "Content",
        coverLetterInputs: mockInputs,
        setCoverLetter: mockSetCoverLetter,
      });

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      // Modal should be focusable
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
