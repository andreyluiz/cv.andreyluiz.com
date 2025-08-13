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
      <div className="min-h-[500px] rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800 print:min-h-0 print:border-none print:bg-white print:p-0 print:shadow-none">
        <div className="mx-auto max-w-4xl">
          <div
            className="cover-letter-content whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-900 selection:bg-blue-100 dark:text-gray-100 print:font-serif print:text-black print:text-sm print:leading-normal"
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
        >
          {t("regenerate")}
        </Button>
      </div>

      {/* Enhanced Print and Typography Styles */}
      <style jsx global>{`
        /* Screen typography improvements */
        .cover-letter-content {
          line-height: 1.7;
          font-feature-settings: "liga" 1, "kern" 1;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .cover-letter-content p {
          margin-bottom: 1.25rem;
          text-align: justify;
          hyphens: auto;
          -webkit-hyphens: auto;
          -moz-hyphens: auto;
          -ms-hyphens: auto;
        }

        .cover-letter-content h1,
        .cover-letter-content h2,
        .cover-letter-content h3 {
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
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
          margin-bottom: 1.5rem;
        }

        .cover-letter-content .subject-line {
          font-weight: 600;
          text-decoration: underline;
        }

        .cover-letter-content .closing {
          margin-top: 2rem;
        }

        .cover-letter-content .signature-line {
          margin-top: 3rem;
          font-weight: 500;
        }

        /* Print-specific optimizations */
        @media print {
          .cover-letter-content {
            font-family: "Times New Roman", "Times", serif !important;
            font-size: 12pt !important;
            line-height: 1.6 !important;
            color: black !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .cover-letter-content * {
            color: black !important;
          }

          .cover-letter-content p {
            margin-bottom: 12pt;
            text-align: left;
            orphans: 2;
            widows: 2;
          }

          .cover-letter-content h1,
          .cover-letter-content h2,
          .cover-letter-content h3 {
            font-weight: bold;
            margin-bottom: 6pt;
            margin-top: 12pt;
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
            margin-bottom: 24pt;
          }

          .cover-letter-content .recipient-address {
            text-align: left;
            margin-bottom: 24pt;
          }

          .cover-letter-content .date-line {
            text-align: right;
            margin-bottom: 24pt;
          }

          .cover-letter-content .subject-line {
            font-weight: bold;
            margin-bottom: 12pt;
            text-decoration: underline;
          }

          .cover-letter-content .salutation {
            margin-bottom: 12pt;
          }

          .cover-letter-content .closing {
            margin-top: 24pt;
            margin-bottom: 48pt;
          }

          .cover-letter-content .signature-line {
            margin-top: 36pt;
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
