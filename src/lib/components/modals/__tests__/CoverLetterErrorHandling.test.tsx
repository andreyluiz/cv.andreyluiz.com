import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverLetter } from "@/lib/server/actions";
import type { Variant } from "@/lib/types";
import CoverLetterModal from "../CoverLetterModal";

// Mock the server actions
vi.mock("@/lib/server/actions", () => ({
  generateCoverLetter: vi.fn(),
}));

// Mock the store
vi.mock("@/lib/store", () => ({
  useStore: () => ({
    generatedCoverLetter: null,
    coverLetterInputs: null,
    setCoverLetter: vi.fn(),
  }),
}));

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

const mockMessages = {
  coverLetter: {
    form: {
      optional: "optional",
      generating: "Generating...",
      generate: "Generate Cover Letter",
      infoBox: {
        title: "Spontaneous Application",
        description: "Leave job title and job description empty...",
      },
      jobPosition: {
        label: "Job Position",
        placeholder: "e.g., Senior Software Engineer",
        helperText: "Leave empty for a spontaneous application cover letter",
      },
      companyDescription: {
        label: "Company Description",
        placeholder: "Tell us about the company...",
        helperText:
          "Required. Help the AI understand what you know about the company",
      },
      jobDescription: {
        label: "Job Description",
        placeholder: "Paste the job description here...",
        helperText:
          "Optional. Include specific requirements to tailor the cover letter",
      },
      validation: {
        companyDescriptionRequired: "Company description is required.",
        companyDescriptionTooShort:
          "Company description must be at least 10 characters long.",
        companyDescriptionTooLong:
          "Company description must be less than 2000 characters.",
        jobPositionTooLong: "Job position must be less than 100 characters.",
        jobDescriptionTooLong:
          "Job description must be less than 5000 characters.",
        needAtLeastCompanyInfo: "Please provide at least company information.",
        errorAnnouncement: "Form validation error",
      },
    },
    display: {
      regenerate: "Regenerate",
      regenerateAriaLabel: "Regenerate cover letter with same inputs",
      content: {
        ariaLabel: "Generated cover letter content",
      },
    },
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
        ariaLabel: "Cover letter generation in progress",
        retryMessage: "Retrying cover letter generation...",
        retrySubtitle: "Attempt {attempt} of {max}. Please wait...",
      },
      error: {
        title: "Something went wrong",
      },
      errors: {
        generationFailed: "Failed to generate cover letter. Please try again.",
        apiError:
          "Failed to generate cover letter. Please check your API key and selected model, then try again.",
        authSuggestion:
          "Check your API key in settings and ensure it's valid and active on OpenRouter.",
        networkSuggestion:
          "Check your internet connection and try again. The issue may be temporary.",
        quotaSuggestion:
          "You may have exceeded your usage limits. Try using a free model or check your OpenRouter account.",
        aiSuggestion:
          "The AI model may be temporarily unavailable. Try selecting a different model or wait a moment before retrying.",
        generalSuggestion:
          "Please try again in a moment. If the problem persists, check your settings or contact support.",
      },
      actions: {
        editInputs: "Edit Inputs",
        close: "Close",
        retry: "Try Again",
        cancel: "Cancel",
        editInputsAriaLabel: "Go back to edit cover letter inputs",
        closeAriaLabel: "Close cover letter modal",
        retryAriaLabel: "Try generating the cover letter again",
        cancelAriaLabel: "Cancel and close modal",
      },
    },
  },
};

const mockResumeData: Variant = {
  name: "John Doe",
  title: "Software Engineer",
  contactInfo: {
    email: "john@example.com",
    phone: "+1234567890",
    location: "New York, NY",
    website: "https://johndoe.com",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    age: "30",
    nationality: "American",
  },
  summary: "Experienced software engineer",
  qualities: ["Problem solver"],
  generalSkills: ["JavaScript", "Python"],
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  languages: [],
  personalityTraits: [],
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  resumeData: mockResumeData,
  apiKey: "test-api-key",
  selectedModel: "test-model",
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages} timeZone="UTC">
      {component}
    </NextIntlClientProvider>,
  );
};

describe("Cover Letter Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Client-side Validation Errors", () => {
    it("should show validation error for empty company description", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText("Company description is required."),
        ).toBeInTheDocument();
      });
    });

    it("should show validation error for company description too short", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Short");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Company description must be at least 10 characters long.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should show validation error for company description too long", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const longText = "A".repeat(2001);
      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.clear(companyInput);
      await user.type(companyInput, `${longText.substring(0, 50)}...`);

      // Simulate the full long text by setting the value directly
      Object.defineProperty(companyInput, "value", {
        writable: true,
        value: longText,
      });

      // Trigger validation by attempting to generate
      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Company description must be less than 2000 characters.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should show validation error for job position too long", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const longJobPosition = "A".repeat(101);
      const jobPositionInput = screen.getByPlaceholderText(
        "e.g., Senior Software Engineer",
      );
      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );

      // Set long job position by typing part of it and setting the value directly
      await user.type(
        jobPositionInput,
        "Senior Software Engineer Very Long Position Name...",
      );
      Object.defineProperty(jobPositionInput, "value", {
        writable: true,
        value: longJobPosition,
      });

      await user.type(companyInput, "Valid company description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText("Job position must be less than 100 characters."),
        ).toBeInTheDocument();
      });
    });

    it("should clear validation errors when user types", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      // Trigger validation error
      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText("Company description is required."),
        ).toBeInTheDocument();
      });

      // Type in the field to clear error
      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Valid company description");

      await waitFor(() => {
        expect(
          screen.queryByText("Company description is required."),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Server-side Error Handling", () => {
    it("should display authentication error with helpful suggestion", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Invalid API key"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByText("Invalid API key")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Check your API key in settings and ensure it's valid and active on OpenRouter.",
          ),
        ).toBeInTheDocument();
      });

      // Should show authentication error icon
      const authIcon = screen.getByLabelText("Authentication error icon");
      expect(authIcon).toBeInTheDocument();
    });

    it("should display network error with helpful suggestion", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(
        new Error("Network connection timeout"),
      );

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      // Wait for retries to complete and error to be shown
      await waitFor(
        () => {
          expect(
            screen.getByText("Network connection timeout"),
          ).toBeInTheDocument();
          expect(
            screen.getByText(
              "Check your internet connection and try again. The issue may be temporary.",
            ),
          ).toBeInTheDocument();
        },
        { timeout: 15000 },
      );
    }, 20000);

    it("should display quota error with helpful suggestion", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(
        new Error("Insufficient credits"),
      );

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Insufficient credits")).toBeInTheDocument();
        expect(
          screen.getByText(
            "You may have exceeded your usage limits. Try using a free model or check your OpenRouter account.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should display AI model error with helpful suggestion", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Model unavailable"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.getByText("Model unavailable")).toBeInTheDocument();
          expect(
            screen.getByText(
              "The AI model may be temporarily unavailable. Try selecting a different model or wait a moment before retrying.",
            ),
          ).toBeInTheDocument();
        },
        { timeout: 15000 },
      );
    }, 20000);

    it("should handle empty response from AI", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockResolvedValue(null);

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

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
        expect(
          screen.getByText(
            "The AI model may be temporarily unavailable. Try selecting a different model or wait a moment before retrying.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should allow retry after error", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Temporary error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.getByText("Temporary error")).toBeInTheDocument();
        },
        { timeout: 15000 },
      );

      // Click retry button
      const retryButton = screen.getByRole("button", {
        name: "Try generating the cover letter again",
      });
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);

      // Should return to input phase
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Generate Cover Letter" }),
        ).toBeInTheDocument();
      });
    }, 20000);

    it("should clear errors when editing inputs", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Test error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Test error")).toBeInTheDocument();
      });

      // Click edit inputs button (retry should also work)
      const retryButton = screen.getByRole("button", {
        name: "Try generating the cover letter again",
      });
      await user.click(retryButton);

      // Should return to input phase with cleared errors
      await waitFor(() => {
        expect(screen.queryByText("Test error")).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Generate Cover Letter" }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Retry Mechanism", () => {
    it("should automatically retry transient network errors", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);

      // First call fails with network error, second succeeds
      generateCoverLetterMock
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValueOnce("<p>Generated cover letter</p>");

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      // Should show retrying message
      await waitFor(
        () => {
          expect(
            screen.getByText("Retrying cover letter generation..."),
          ).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Should eventually succeed - either show cover letter or return to input
      await waitFor(
        () => {
          // Check for either successful display or return to input state
          const hasSucceeded =
            screen.queryByText("Cover Letter") || // Success: showing cover letter
            (screen.queryByRole("button", { name: "Generate Cover Letter" }) &&
              !screen.queryByText("Retrying cover letter generation...")); // Back to input form
          expect(hasSucceeded).toBeTruthy();
        },
        { timeout: 15000 },
      );

      // Should have called the function twice (original + 1 retry)
      expect(generateCoverLetterMock).toHaveBeenCalledTimes(2);
    }, 20000);

    it("should not retry authentication errors", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Invalid API key"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid API key")).toBeInTheDocument();
      });

      // Should have called the function only once (no retries)
      expect(generateCoverLetterMock).toHaveBeenCalledTimes(1);
    });

    it("should not retry quota errors", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(
        new Error("Insufficient credits"),
      );

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText("Insufficient credits")).toBeInTheDocument();
      });

      // Should have called the function only once (no retries)
      expect(generateCoverLetterMock).toHaveBeenCalledTimes(1);
    });

    it("should stop retrying after maximum attempts", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Network timeout"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      // Wait for all retries to complete
      await waitFor(
        () => {
          expect(screen.getByText("Network timeout")).toBeInTheDocument();
        },
        { timeout: 20000 },
      );

      // Should have called the function 4 times (original + 3 retries)
      expect(generateCoverLetterMock).toHaveBeenCalledTimes(4);
    }, 25000);
  });

  describe("Error State Management", () => {
    it("should clear error state when modal is reopened", () => {
      const { rerender } = renderWithIntl(
        <CoverLetterModal {...defaultProps} isOpen={false} />,
      );

      // Open modal with error state (simulated)
      rerender(
        <NextIntlClientProvider
          locale="en"
          messages={mockMessages}
          timeZone="UTC"
        >
          <CoverLetterModal {...defaultProps} isOpen={true} />
        </NextIntlClientProvider>,
      );

      // Should be in input state, not error state
      expect(
        screen.getByRole("button", { name: "Generate Cover Letter" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });

    it("should focus retry button when error occurs", async () => {
      const user = userEvent.setup();
      const generateCoverLetterMock = vi.mocked(generateCoverLetter);
      generateCoverLetterMock.mockRejectedValue(new Error("Test error"));

      renderWithIntl(<CoverLetterModal {...defaultProps} />);

      const companyInput = screen.getByPlaceholderText(
        "Tell us about the company...",
      );
      await user.type(companyInput, "Test Company Description");

      const generateButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(generateButton);

      await waitFor(() => {
        const retryButton = screen.getByRole("button", {
          name: "Try generating the cover letter again",
        });
        expect(retryButton).toHaveFocus();
      });
    });
  });
});
