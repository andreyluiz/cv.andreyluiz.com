import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CoverLetterInputs } from "@/lib/types";
import CoverLetterDisplay from "../CoverLetterDisplay";

const mockMessages = {
  coverLetter: {
    display: {
      regenerate: "Regenerate",
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

describe("CoverLetterDisplay", () => {
  const mockOnRegenerate = vi.fn();

  const defaultInputs: CoverLetterInputs = {
    jobPosition: "Software Engineer",
    companyDescription: "Amazing tech company",
    jobDescription: "Looking for a skilled developer",
  };

  const mockContent = `
    <div class="sender-address">
      John Doe<br>
      123 Main St<br>
      City, State 12345
    </div>
    
    <div class="date-line">December 13, 2024</div>
    
    <div class="recipient-address">
      Hiring Manager<br>
      Amazing Tech Company<br>
      456 Business Ave<br>
      Business City, State 67890
    </div>
    
    <div class="subject-line">Cover letter for position Software Engineer</div>
    
    <div class="salutation">Dear Hiring Manager,</div>
    
    <p>I am writing to express my strong interest in the Software Engineer position at Amazing Tech Company. Your company's innovative approach to technology and commitment to excellence align perfectly with my professional goals and values.</p>
    
    <p>With my background in software development and passion for creating efficient solutions, I am confident I would be a valuable addition to your team.</p>
    
    <div class="closing">Sincerely,</div>
    <div class="signature-line">John Doe</div>
  `;

  const defaultProps = {
    content: mockContent,
    inputs: defaultInputs,
    onRegenerate: mockOnRegenerate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the cover letter content", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("December 13, 2024")).toBeInTheDocument();
      expect(screen.getByText("Dear Hiring Manager,")).toBeInTheDocument();
      expect(
        screen.getByText(/I am writing to express my strong interest/),
      ).toBeInTheDocument();
    });

    it("should render the regenerate button", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Regenerate" }),
      ).toBeInTheDocument();
    });

    it("should apply proper styling classes", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const contentDiv = document.querySelector(".cover-letter-content");
      expect(contentDiv).toHaveClass(
        "cover-letter-content",
        "whitespace-pre-wrap",
        "font-serif",
        "text-base",
        "leading-relaxed",
      );
    });

    it("should have print-friendly container styling", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const container = document.querySelector(".min-h-\\[500px\\]");
      expect(container).toHaveClass(
        "print:min-h-0",
        "print:border-none",
        "print:bg-white",
        "print:p-0",
        "print:shadow-none",
      );
    });
  });

  describe("content display", () => {
    it("should display HTML content correctly", () => {
      const htmlContent = `
        <h1>Cover Letter Title</h1>
        <p>This is a <strong>bold</strong> paragraph with <em>emphasis</em>.</p>
        <div class="subject-line">Subject: Application for Position</div>
      `;

      renderWithIntl(
        <CoverLetterDisplay {...defaultProps} content={htmlContent} />,
      );

      expect(screen.getByText("Cover Letter Title")).toBeInTheDocument();
      expect(screen.getByText("bold")).toBeInTheDocument();
      expect(screen.getByText("emphasis")).toBeInTheDocument();
      expect(
        screen.getByText("Subject: Application for Position"),
      ).toBeInTheDocument();
    });

    it("should handle empty content gracefully", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} content="" />);

      expect(
        screen.getByRole("button", { name: "Regenerate" }),
      ).toBeInTheDocument();
    });

    it("should preserve whitespace and line breaks", () => {
      const contentWithSpacing = `Line 1

Line 3 with spacing

    Indented line`;

      renderWithIntl(
        <CoverLetterDisplay {...defaultProps} content={contentWithSpacing} />,
      );

      const contentDiv = document.querySelector(".cover-letter-content");
      expect(contentDiv).toHaveClass("whitespace-pre-wrap");
    });
  });

  describe("regenerate functionality", () => {
    it("should call onRegenerate when regenerate button is clicked", async () => {
      const user = userEvent.setup();
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const regenerateButton = screen.getByRole("button", {
        name: "Regenerate",
      });
      await user.click(regenerateButton);

      expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
    });

    it("should render regenerate button with proper styling", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const regenerateButton = screen.getByRole("button", {
        name: "Regenerate",
      });
      expect(regenerateButton).toHaveClass("min-w-[120px]");
    });

    it("should have regenerate button hidden in print mode", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const buttonContainer = document.querySelector(".print\\:hidden");
      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer).toHaveClass("print:hidden");
    });
  });

  describe("responsive and accessibility", () => {
    it("should have proper max-width container", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const container = document.querySelector(".max-w-4xl");
      expect(container).toBeInTheDocument();
    });

    it("should have selection highlighting", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const contentDiv = document.querySelector(".cover-letter-content");
      expect(contentDiv).toHaveClass("selection:bg-blue-100");
    });

    it("should have dark mode support", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const container = document.querySelector(".dark\\:border-gray-700");
      expect(container).toHaveClass("dark:border-gray-700", "dark:bg-gray-800");

      const contentDiv = document.querySelector(".cover-letter-content");
      expect(contentDiv).toHaveClass("dark:text-gray-100");
    });

    it("should have smooth transitions", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const container = document.querySelector(".transition-colors");
      expect(container).toHaveClass("transition-colors", "duration-200");
    });
  });

  describe("print optimization", () => {
    it("should have print-specific text styling", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const contentDiv = document.querySelector(".cover-letter-content");
      expect(contentDiv).toHaveClass(
        "print:font-serif",
        "print:text-black",
        "print:text-sm",
        "print:leading-normal",
      );
    });

    it("should have print styles injected", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const styleElement = document.querySelector("style");
      expect(styleElement).toBeInTheDocument();

      const styleContent = styleElement?.textContent;
      expect(styleContent).toContain("@media print");
      expect(styleContent).toContain(".cover-letter-content");
      expect(styleContent).toContain("@page");
      expect(styleContent).toContain("size: A4");
      expect(styleContent).toContain("margin: 2cm");
    });

    it("should have business letter formatting styles", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const styleElement = document.querySelector("style");
      const styleContent = styleElement?.textContent;

      expect(styleContent).toContain(".sender-address");
      expect(styleContent).toContain(".recipient-address");
      expect(styleContent).toContain(".date-line");
      expect(styleContent).toContain(".subject-line");
      expect(styleContent).toContain(".salutation");
      expect(styleContent).toContain(".closing");
      expect(styleContent).toContain(".signature-line");
    });

    it("should have page break controls", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const styleElement = document.querySelector("style");
      const styleContent = styleElement?.textContent;

      expect(styleContent).toContain("page-break-after: avoid");
      expect(styleContent).toContain("page-break-before: avoid");
      expect(styleContent).toContain("page-break-inside: avoid");
      expect(styleContent).toContain("orphans: 2");
      expect(styleContent).toContain("widows: 2");
    });
  });

  describe("inputs handling", () => {
    it("should accept different input combinations", () => {
      const minimalInputs: CoverLetterInputs = {
        jobPosition: "",
        companyDescription: "Company only",
        jobDescription: "",
      };

      renderWithIntl(
        <CoverLetterDisplay {...defaultProps} inputs={minimalInputs} />,
      );

      expect(
        screen.getByRole("button", { name: "Regenerate" }),
      ).toBeInTheDocument();
    });

    it("should handle inputs with special characters", () => {
      const specialInputs: CoverLetterInputs = {
        jobPosition: "Senior Engineer & Team Lead",
        companyDescription: "Company with <special> & characters",
        jobDescription: "Role with $special$ #symbols# and @mentions",
      };

      renderWithIntl(
        <CoverLetterDisplay {...defaultProps} inputs={specialInputs} />,
      );

      // Should render without crashing
      expect(
        screen.getByRole("button", { name: "Regenerate" }),
      ).toBeInTheDocument();
    });
  });

  describe("typography features", () => {
    it("should have enhanced typography settings", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const styleElement = document.querySelector("style");
      const styleContent = styleElement?.textContent;

      expect(styleContent).toContain(
        'font-feature-settings: "liga" 1, "kern" 1',
      );
      expect(styleContent).toContain("text-rendering: optimizeLegibility");
      expect(styleContent).toContain("-webkit-font-smoothing: antialiased");
      expect(styleContent).toContain("-moz-osx-font-smoothing: grayscale");
    });

    it("should have justified text with hyphenation", () => {
      renderWithIntl(<CoverLetterDisplay {...defaultProps} />);

      const styleElement = document.querySelector("style");
      const styleContent = styleElement?.textContent;

      expect(styleContent).toContain("text-align: justify");
      expect(styleContent).toContain("hyphens: auto");
      expect(styleContent).toContain("-webkit-hyphens: auto");
      expect(styleContent).toContain("-moz-hyphens: auto");
    });
  });
});
