import { useTranslations } from "next-intl";
import Button from "@/lib/components/ui/Button";
import type { CoverLetterInputs } from "@/lib/types";

interface CoverLetterDisplayProps {
  content: string;
  inputs: CoverLetterInputs;
  onRegenerate: () => void;
}

export default function CoverLetterDisplay({
  content,
  inputs: _inputs,
  onRegenerate,
}: CoverLetterDisplayProps) {
  const t = useTranslations("coverLetter.display");

  const getCoverLetterHTML = () => ({
    __html: content,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Cover Letter Content */}
      <div
        className="max-h-[75vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800 print:max-h-none print:overflow-visible print:border-none print:bg-white print:p-0 print:shadow-none"
        role="document"
        aria-label={t("content.ariaLabel")}
      >
        <div className="mx-auto max-w-4xl">
          <div
            className="cover-letter-content whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-900 selection:bg-blue-100 dark:text-gray-100 print:font-sans print:text-black print:text-sm print:leading-normal"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content comes from AI generation and is safe
            dangerouslySetInnerHTML={getCoverLetterHTML()}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 print:hidden">
        <Button
          onClick={onRegenerate}
          variant="secondary"
          className="min-w-[120px]"
          aria-label={t("regenerateAriaLabel")}
        >
          {t("regenerate")}
        </Button>
      </div>

      {/* Enhanced Print and Typography Styles */}
      <style jsx global>{`
        /* Screen typography improvements */
        .cover-letter-content {
          line-height: 1.5;
          font-feature-settings: "liga" 1, "kern" 1;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .cover-letter-content p {
          margin-bottom: 0.5rem;
          text-align: justify;
          hyphens: auto;
          -webkit-hyphens: auto;
          -moz-hyphens: auto;
          -ms-hyphens: auto;
        }

        .cover-letter-content p + p {
          margin-top: 0.25rem;
        }

        .cover-letter-content h1,
        .cover-letter-content h2,
        .cover-letter-content h3 {
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
          letter-spacing: -0.025em;
        }

        .cover-letter-content h1 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .cover-letter-content h2 {
          font-size: 1.125rem;
        }

        .cover-letter-content h3 {
          font-size: 1rem;
        }

        /* Business letter specific elements */
        .cover-letter-content .sender-address,
        .cover-letter-content .recipient-address,
        .cover-letter-content .date-line,
        .cover-letter-content .subject-line,
        .cover-letter-content .salutation,
        .cover-letter-content .closing,
        .cover-letter-content .signature-line {
          margin-bottom: 0.75rem;
        }

        /* Address blocks - target specific classes */
        .cover-letter-content .sender-address,
        .cover-letter-content .recipient-address {
          line-height: 1.2;
        }

        .cover-letter-content .sender-address *,
        .cover-letter-content .recipient-address * {
          margin-bottom: 0.1rem !important;
          line-height: 1.2;
        }

        /* Cover letter title styling */
        .cover-letter-content .cover-letter-title {
          font-weight: 600;
          text-align: left;
          margin: 1rem 0;
        }

        /* Other section styling */
        .cover-letter-content .salutation {
          margin-bottom: 0.75rem;
        }

        .cover-letter-content .company-paragraph,
        .cover-letter-content .skills-paragraph,
        .cover-letter-content .collaboration-paragraph,
        .cover-letter-content .interview-request {
          margin-bottom: 0.75rem;
        }

        .cover-letter-content .closing-signature {
          margin-top: 1.5rem;
          font-weight: 500;
        }

        .cover-letter-content .subject-line {
          font-weight: 600;
          text-decoration: underline;
        }

        .cover-letter-content .closing {
          margin-top: 1rem;
        }

        .cover-letter-content .signature-line {
          margin-top: 1.5rem;
          font-weight: 500;
        }

        /* Print-specific optimizations */
        @media print {
          .cover-letter-content {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 12pt !important;
            line-height: 1.4 !important;
            color: black !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .cover-letter-content * {
            color: black !important;
          }

          .cover-letter-content p {
            margin-bottom: 6pt;
            text-align: left;
            orphans: 2;
            widows: 2;
          }

          .cover-letter-content p + p {
            margin-top: 2pt;
          }

          .cover-letter-content h1,
          .cover-letter-content h2,
          .cover-letter-content h3 {
            font-weight: bold;
            margin-bottom: 4pt;
            margin-top: 8pt;
            page-break-after: avoid;
            page-break-inside: avoid;
          }

          .cover-letter-content h1 {
            font-size: 14pt;
          }

          .cover-letter-content h2 {
            font-size: 13pt;
          }

          .cover-letter-content h3 {
            font-size: 12pt;
          }

          /* Business letter print formatting */
          .cover-letter-content .sender-address {
            text-align: left;
            margin-bottom: 12pt;
            line-height: 1.1;
          }

          .cover-letter-content .recipient-address {
            text-align: left;
            margin-bottom: 12pt;
            line-height: 1.1;
          }

          /* Address blocks - reduce internal spacing for print */
          .cover-letter-content .sender-address *,
          .cover-letter-content .recipient-address * {
            margin-bottom: 1pt !important;
            line-height: 1.1;
          }

          /* Cover letter title print styling */
          .cover-letter-content .cover-letter-title {
            font-weight: bold;
            text-align: left;
            margin: 8pt 0;
          }

          /* Other section print styling */
          .cover-letter-content .salutation {
            margin-bottom: 6pt;
          }

          .cover-letter-content .company-paragraph,
          .cover-letter-content .skills-paragraph,
          .cover-letter-content .collaboration-paragraph,
          .cover-letter-content .interview-request {
            margin-bottom: 6pt;
          }

          .cover-letter-content .closing-signature {
            margin-top: 18pt;
            font-weight: bold;
          }

          .cover-letter-content .date-line {
            text-align: right;
            margin-bottom: 12pt;
          }

          .cover-letter-content .subject-line {
            font-weight: bold;
            margin-bottom: 6pt;
            text-decoration: underline;
          }

          .cover-letter-content .salutation {
            margin-bottom: 6pt;
          }

          .cover-letter-content .closing {
            margin-top: 12pt;
            margin-bottom: 24pt;
          }

          .cover-letter-content .signature-line {
            margin-top: 18pt;
          }

          /* Prevent awkward page breaks */
          .cover-letter-content .salutation,
          .cover-letter-content .closing {
            page-break-after: avoid;
          }

          .cover-letter-content .signature-line {
            page-break-before: avoid;
          }
        }

        @page {
          size: A4;
          margin: 2cm;
        }
      `}</style>
    </div>
  );
}
