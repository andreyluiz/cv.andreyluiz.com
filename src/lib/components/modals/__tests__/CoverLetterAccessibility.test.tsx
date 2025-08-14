import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CoverLetterInputForm from "../CoverLetterInputForm";
import Modal from "../Modal";

const mockMessages = {
  coverLetter: {
    form: {
      optional: "optional",
      generating: "Generating...",
      generate: "Generate Cover Letter",
      infoBox: {
        title: "Spontaneous Application",
        description:
          "Leave job title and job description empty to create a spontaneous application cover letter that focuses on your interest in the company.",
      },
      jobPosition: {
        label: "Job Position",
        placeholder: "e.g., Senior Software Engineer",
        helperText: "Leave empty for a spontaneous application cover letter",
      },
      companyDescription: {
        label: "Company Description",
        placeholder:
          "Tell us about the company, its mission, values, products, or what interests you about working there...",
        helperText:
          "Required. Help the AI understand what you know about the company",
      },
      jobDescription: {
        label: "Job Description",
        placeholder:
          "Paste the job description here or describe the role requirements...",
        helperText:
          "Optional. Include specific requirements to tailor the cover letter",
      },
      validation: {
        companyDescriptionRequired:
          "Company description is required to generate a personalized cover letter.",
        errorAnnouncement: "Form validation error",
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

describe("Cover Letter Accessibility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CoverLetterInputForm Accessibility", () => {
    const mockOnSubmit = vi.fn();
    const defaultProps = {
      onSubmit: mockOnSubmit,
      isLoading: false,
    };

    describe("ARIA Labels and Descriptions", () => {
      it("should have proper form role and ARIA attributes", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const form = screen.getByRole("form");
        // Check that aria-labelledby and aria-describedby are present (IDs are dynamic)
        expect(form).toHaveAttribute("aria-labelledby");
        expect(form).toHaveAttribute("aria-describedby");
        expect(form).toHaveAttribute("noValidate");
      });

      it("should have proper fieldset with screen reader label", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const fieldset = document.querySelector("fieldset");
        expect(fieldset).toBeInTheDocument();
        expect(fieldset).toHaveAttribute("aria-labelledby");

        const legend = fieldset?.querySelector("legend");
        expect(legend).toHaveTextContent("Cover Letter Information");
        expect(legend).toHaveClass("sr-only");
      });

      it("should have info box with proper ARIA structure", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const infoBox = document.querySelector("section");
        expect(infoBox).toBeInTheDocument();
        expect(infoBox).toHaveAttribute("aria-labelledby");
        expect(infoBox).toHaveAttribute("aria-describedby");

        const title = screen.getByText("Spontaneous Application");
        const description = screen.getByText(
          /Leave job title and job description empty/i,
        );
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
      });

      it("should have helper text for all form inputs", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const jobPositionHelperText = screen.getByText(
          "Leave empty for a spontaneous application cover letter",
        );
        const companyDescHelperText = screen.getByText(
          "Required. Help the AI understand what you know about the company",
        );
        const jobDescHelperText = screen.getByText(
          "Optional. Include specific requirements to tailor the cover letter",
        );

        expect(jobPositionHelperText).toBeInTheDocument();
        expect(companyDescHelperText).toBeInTheDocument();
        expect(jobDescHelperText).toBeInTheDocument();
      });
    });

    describe("Screen Reader Support for Validation", () => {
      it("should have live region for error announcements", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const liveRegion = document.querySelector('output[aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
        expect(liveRegion).toHaveAttribute("aria-atomic", "true");
        expect(liveRegion).toHaveClass("sr-only");
      });

      it("should announce validation errors to screen readers", async () => {
        const user = userEvent.setup();
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const submitButton = screen.getByRole("button", {
          name: "Generate Cover Letter",
        });
        await user.click(submitButton);

        await waitFor(() => {
          const liveRegion = document.querySelector(
            'output[aria-live="polite"]',
          );
          expect(liveRegion?.textContent).toContain("Form validation error");
        });
      });
    });

    describe("Keyboard Navigation", () => {
      it("should be navigable with Tab key", async () => {
        const user = userEvent.setup();
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const jobPositionInput = screen.getByLabelText(/Job Position/);
        const companyInput = screen.getByLabelText(/Company Description/);
        const jobDescInput = screen.getByLabelText(/Job Description/);
        const submitButton = screen.getByRole("button", {
          name: "Generate Cover Letter",
        });

        // Test tab order
        await user.tab();
        expect(jobPositionInput).toHaveFocus();

        await user.tab();
        expect(companyInput).toHaveFocus();

        await user.tab();
        expect(jobDescInput).toHaveFocus();

        await user.tab();
        expect(submitButton).toHaveFocus();
      });

      it("should support form submission by clicking submit button", async () => {
        const user = userEvent.setup();
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const companyInput = screen.getByLabelText(/Company Description/);
        await user.type(companyInput, "Test company");

        const submitButton = screen.getByRole("button", {
          name: "Generate Cover Letter",
        });
        await user.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith({
          jobPosition: "",
          companyDescription: "Test company",
          jobDescription: "",
        });
      });
    });
  });

  describe("Modal Accessibility", () => {
    const mockOnClose = vi.fn();

    describe("Modal Structure and ARIA", () => {
      it("should have proper modal ARIA attributes", () => {
        renderWithIntl(
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <div>Test content</div>
          </Modal>,
        );

        const modalDialog = screen.getByRole("dialog");
        expect(modalDialog).toHaveAttribute("aria-modal", "true");
        expect(modalDialog).toHaveAttribute("aria-labelledby");

        const title = screen.getByRole("heading", { name: "Test Modal" });
        expect(title).toBeInTheDocument();
      });

      it("should focus close button when modal opens", async () => {
        renderWithIntl(
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <div>Test content</div>
          </Modal>,
        );

        await waitFor(() => {
          const closeButton = screen.getByRole("button", {
            name: "Close modal",
          });
          expect(closeButton).toHaveFocus();
        });
      });

      it("should close modal on Escape key", async () => {
        renderWithIntl(
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <div>Test content</div>
          </Modal>,
        );

        // Wait for modal to be ready
        await waitFor(() => {
          const closeButton = screen.getByRole("button", {
            name: "Close modal",
          });
          expect(closeButton).toHaveFocus();
        });

        // Simulate escape key press on document
        const escapeEvent = new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          bubbles: true,
        });
        document.dispatchEvent(escapeEvent);

        expect(mockOnClose).toHaveBeenCalled();
      });

      it("should close modal on backdrop click", async () => {
        const user = userEvent.setup();
        renderWithIntl(
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <div>Test content</div>
          </Modal>,
        );

        const backdrop = screen.getByRole("dialog");
        // Click on the backdrop (dialog container)
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
