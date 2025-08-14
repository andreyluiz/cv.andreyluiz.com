import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverLetterInputs } from "@/lib/types";
import CoverLetterInputForm from "../CoverLetterInputForm";

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
      },
      companyDescription: {
        label: "Company Description",
        placeholder:
          "Tell us about the company, its mission, values, products, or what interests you about working there...",
      },
      jobDescription: {
        label: "Job Description",
        placeholder:
          "Paste the job description here or describe the role requirements...",
      },
      validation: {
        companyDescriptionRequired:
          "Company description is required to generate a personalized cover letter.",
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

describe("CoverLetterInputForm", () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all form fields", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      expect(screen.getByLabelText(/Job Position/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Job Description/)).toBeInTheDocument();
    });

    it("should show required indicator for company description", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const companyLabel = screen.getByText("Company Description");
      expect(companyLabel.parentElement).toHaveTextContent("*");
    });

    it("should show optional indicator for job position and description", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      expect(screen.getByText(/Job Position.*optional/)).toBeInTheDocument();
      expect(screen.getByText(/Job Description.*optional/)).toBeInTheDocument();
    });

    it("should render information box about spontaneous applications", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      expect(screen.getByText("Spontaneous Application")).toBeInTheDocument();
      expect(
        screen.getByText(/Leave job title and job description empty/),
      ).toBeInTheDocument();
    });

    it("should render generate button", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Generate Cover Letter" }),
      ).toBeInTheDocument();
    });
  });

  describe("initial values", () => {
    it("should populate fields with initial inputs", () => {
      const initialInputs: CoverLetterInputs = {
        jobPosition: "Software Engineer",
        companyDescription: "Amazing tech company",
        jobDescription: "Looking for a developer",
      };

      renderWithIntl(
        <CoverLetterInputForm
          {...defaultProps}
          initialInputs={initialInputs}
        />,
      );

      expect(screen.getByDisplayValue("Software Engineer")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Amazing tech company"),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Looking for a developer"),
      ).toBeInTheDocument();
    });

    it("should render empty fields when no initial inputs provided", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const jobPositionInput = screen.getByLabelText(/Job Position/);
      const companyDescInput = screen.getByLabelText(/Company Description/);
      const jobDescInput = screen.getByLabelText(/Job Description/);

      expect(jobPositionInput).toHaveValue("");
      expect(companyDescInput).toHaveValue("");
      expect(jobDescInput).toHaveValue("");
    });
  });

  describe("form validation", () => {
    it("should allow submit button click when company description is empty", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      expect(submitButton).not.toBeDisabled();
    });

    it("should keep submit button enabled when company description is provided", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const companyDescInput = screen.getByLabelText(/Company Description/);
      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });

      await user.type(companyDescInput, "Great company");

      expect(submitButton).not.toBeDisabled();
    });

    it("should show validation error when trying to submit without company description", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });

      // Try to submit empty form
      await user.click(submitButton);

      expect(
        screen.getByText(/Company description is required/),
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should clear validation error when user starts typing in company description", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const companyDescInput = screen.getByLabelText(/Company Description/);
      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });

      // Trigger validation error by submitting empty form
      await user.click(submitButton);
      expect(
        screen.getByText(/Company description is required/),
      ).toBeInTheDocument();

      // Start typing to clear error
      await user.type(companyDescInput, "A");
      expect(
        screen.queryByText(/Company description is required/),
      ).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should call onSubmit with form data when valid", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const jobPositionInput = screen.getByLabelText(/Job Position/);
      const companyDescInput = screen.getByLabelText(/Company Description/);
      const jobDescInput = screen.getByLabelText(/Job Description/);
      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });

      await user.type(jobPositionInput, "Senior Developer");
      await user.type(companyDescInput, "Innovative tech company");
      await user.type(jobDescInput, "Looking for experienced developer");

      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        jobPosition: "Senior Developer",
        companyDescription: "Innovative tech company",
        jobDescription: "Looking for experienced developer",
      });
    });

    it("should work with only company description (spontaneous application)", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const companyDescInput = screen.getByLabelText(/Company Description/);
      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });

      await user.type(companyDescInput, "Company I want to work for");
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        jobPosition: "",
        companyDescription: "Company I want to work for",
        jobDescription: "",
      });
    });

    it("should not call onSubmit when form is invalid", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });

      // Try to submit without company description
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading text when isLoading is true", () => {
      renderWithIntl(
        <CoverLetterInputForm {...defaultProps} isLoading={true} />,
      );

      expect(screen.getByText("Generating...")).toBeInTheDocument();
    });

    it("should disable submit button when loading", () => {
      renderWithIntl(
        <CoverLetterInputForm {...defaultProps} isLoading={true} />,
      );

      const submitButton = screen.getByRole("button");
      expect(submitButton).toBeDisabled();
    });

    it("should show normal text when not loading", () => {
      renderWithIntl(
        <CoverLetterInputForm {...defaultProps} isLoading={false} />,
      );

      expect(screen.getByText("Generate Cover Letter")).toBeInTheDocument();
    });
  });

  describe("input handling", () => {
    it("should update job position field correctly", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const jobPositionInput = screen.getByLabelText(/Job Position/);

      await user.type(jobPositionInput, "Product Manager");

      expect(jobPositionInput).toHaveValue("Product Manager");
    });

    it("should update company description field correctly", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const companyDescInput = screen.getByLabelText(/Company Description/);

      await user.type(companyDescInput, "Leading fintech company");

      expect(companyDescInput).toHaveValue("Leading fintech company");
    });

    it("should update job description field correctly", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const jobDescInput = screen.getByLabelText(/Job Description/);

      await user.type(jobDescInput, "Full-time remote position");

      expect(jobDescInput).toHaveValue("Full-time remote position");
    });
  });

  describe("accessibility", () => {
    it("should have proper labels for all inputs", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const jobPositionInput = screen.getByLabelText(/Job Position/);
      const companyDescInput = screen.getByLabelText(/Company Description/);
      const jobDescInput = screen.getByLabelText(/Job Description/);

      expect(jobPositionInput).toHaveAttribute("id");
      expect(companyDescInput).toHaveAttribute("id");
      expect(jobDescInput).toHaveAttribute("id");
    });

    it("should associate validation error with company description input", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: "Generate Cover Letter",
      });
      await user.click(submitButton);

      const companyDescInput = screen.getByLabelText(/Company Description/);
      const errorMessage = screen.getByText(/Company description is required/);

      expect(companyDescInput).toHaveAttribute("aria-describedby");
      expect(errorMessage).toHaveAttribute("id");
    });

    it("should have proper form structure", () => {
      renderWithIntl(<CoverLetterInputForm {...defaultProps} />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });
  });
});
