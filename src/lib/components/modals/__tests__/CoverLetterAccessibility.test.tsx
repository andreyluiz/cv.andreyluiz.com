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
        expect(form).toHaveAttribute(
          "aria-labelledby",
          "cover-letter-form-title",
        );
        expect(form).toHaveAttribute(
          "aria-describedby",
          "cover-letter-form-description",
        );
        expect(form).toHaveAttribute("noValidate");
      });

      it("should have proper form group with screen reader label", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const formGroup = document.querySelector('[role="group"]');
        expect(formGroup).toBeInTheDocument();
        expect(formGroup).toHaveAttribute(
          "aria-labelledby",
          "form-fields-title",
        );

        const screenReaderTitle = document.getElementById("form-fields-title");
        expect(screenReaderTitle).toHaveTextContent("Cover Letter Information");
        expect(screenReaderTitle).toHaveClass("sr-only");
      });

      it("should have info box with proper ARIA structure", () => {
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const infoBox = document.querySelector('[role="region"]');
        expect(infoBox).toBeInTheDocument();
        expect(infoBox).toHaveAttribute("aria-labelledby", "info-box-title");
        expect(infoBox).toHaveAttribute(
          "aria-describedby",
          "info-box-description",
        );

        expect(document.getElementById("info-box-title")).toHaveTextContent(
          "Spontaneous Application",
        );
        expect(
          document.getElementById("info-box-description"),
        ).toHaveTextContent(
          "Leave job title and job description empty to create a spontaneous application cover letter that focuses on your interest in the company.",
        );
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

      it("should support form submission via Enter key", async () => {
        const user = userEvent.setup();
        renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

        const companyInput = screen.getByLabelText(/Company Description/);
        await user.type(companyInput, "Test company");
        await user.keyboard("{Enter}");

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
        expect(modalDialog).toHaveAttribute("aria-labelledby", "modal-title");

        const title = document.getElementById("modal-title");
        expect(title).toHaveTextContent("Test Modal");
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
        const user = userEvent.setup();
        renderWithIntl(
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <div>Test content</div>
          </Modal>,
        );

        await user.keyboard("{Escape}");
        expect(mockOnClose).toHaveBeenCalled();
      });

      it("should close modal on backdrop click", async () => {
        const user = userEvent.setup();
        renderWithIntl(
          <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
            <div>Test content</div>
          </Modal>,
        );

        const backdrop = screen.getByRole("dialog").parentElement;
        if (backdrop) {
          await user.click(backdrop);
        }
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
