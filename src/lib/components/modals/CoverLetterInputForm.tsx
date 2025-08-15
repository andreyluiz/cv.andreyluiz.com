import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import Button from "@/lib/components/ui/Button";
import Input from "@/lib/components/ui/Input";
import Textarea from "@/lib/components/ui/Textarea";
import type { CoverLetterInputs } from "@/lib/types";

interface CoverLetterInputFormProps {
  initialInputs?: CoverLetterInputs | null;
  onSubmit: (inputs: CoverLetterInputs) => void;
  isLoading: boolean;
}

export default function CoverLetterInputForm({
  initialInputs,
  onSubmit,
  isLoading,
}: CoverLetterInputFormProps) {
  const t = useTranslations("coverLetter.form");
  const formTitleId = useId();
  const formDescId = useId();
  const infoBoxTitleId = useId();
  const infoBoxDescId = useId();
  const fieldsTitleId = useId();

  const [formData, setFormData] = useState<CoverLetterInputs>({
    jobPosition: initialInputs?.jobPosition || "",
    companyDescription: initialInputs?.companyDescription || "",
    jobDescription: initialInputs?.jobDescription || "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    companyDescription?: string;
    jobPosition?: string;
    jobDescription?: string;
    general?: string;
  }>({});

  const [announcedErrors, setAnnouncedErrors] = useState<Set<string>>(
    new Set(),
  );

  const handleInputChange = (field: keyof CoverLetterInputs, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation errors when user starts typing
    if (value.trim() !== formData[field].trim()) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };

        // Clear field-specific error
        if (field in newErrors) {
          delete newErrors[field as keyof typeof newErrors];
        }

        // Clear general error if any field is being modified
        if (field === "companyDescription" && value.trim() && prev.general) {
          delete newErrors.general;
        }

        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      companyDescription?: string;
      jobPosition?: string;
      jobDescription?: string;
      general?: string;
    } = {};

    // Required field validation
    if (!formData.companyDescription.trim()) {
      errors.companyDescription = t("validation.companyDescriptionRequired");
    } else if (formData.companyDescription.trim().length < 10) {
      errors.companyDescription = t("validation.companyDescriptionTooShort");
    } else if (formData.companyDescription.trim().length > 2000) {
      errors.companyDescription = t("validation.companyDescriptionTooLong");
    }

    // Optional field validation
    if (formData.jobPosition.trim().length > 100) {
      errors.jobPosition = t("validation.jobPositionTooLong");
    }

    if (formData.jobDescription.trim().length > 5000) {
      errors.jobDescription = t("validation.jobDescriptionTooLong");
    }

    // Cross-field validation
    if (!formData.jobPosition.trim() && !formData.jobDescription.trim()) {
      // This is allowed for spontaneous applications, but we should warn the user
      if (!formData.companyDescription.trim()) {
        errors.general = t("validation.needAtLeastCompanyInfo");
      }
    }

    setValidationErrors(errors);

    // Announce new errors to screen readers
    const errorMessages = Object.values(errors).filter(Boolean);
    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.join(". ");
      // Use a brief timeout to ensure the screen reader picks up the message
      setTimeout(() => {
        const errorAnnouncement = `${t("validation.errorAnnouncement")}: ${errorMessage}`;
        setAnnouncedErrors(new Set([errorAnnouncement]));
      }, 100);
    } else {
      setAnnouncedErrors(new Set());
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div>
      {/* Live region for screen reader announcements */}
      <output aria-live="polite" aria-atomic="true" className="sr-only">
        {Array.from(announcedErrors).map((error) => (
          <div key={error}>{error}</div>
        ))}
      </output>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        aria-labelledby={formTitleId}
        aria-describedby={formDescId}
        noValidate
      >
        <section
          className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20"
          aria-labelledby={infoBoxTitleId}
          aria-describedby={infoBoxDescId}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3
                id={infoBoxTitleId}
                className="text-sm font-medium text-blue-800 dark:text-blue-200"
              >
                {t("infoBox.title")}
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p id={infoBoxDescId}>{t("infoBox.description")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* General Error Display */}
        {validationErrors.general && (
          <div
            className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {validationErrors.general}
                </p>
              </div>
            </div>
          </div>
        )}

        <fieldset className="space-y-4" aria-labelledby={fieldsTitleId}>
          <legend id={fieldsTitleId} className="sr-only">
            Cover Letter Information
          </legend>

          <Input
            label={`${t("jobPosition.label")} (${t("optional")})`}
            value={formData.jobPosition}
            onChange={(value) => handleInputChange("jobPosition", value)}
            placeholder={t("jobPosition.placeholder")}
            helperText={t("jobPosition.helperText")}
            error={validationErrors.jobPosition}
            aria-describedby="job-position-help"
          />

          <Textarea
            label={t("companyDescription.label")}
            value={formData.companyDescription}
            onChange={(value) => handleInputChange("companyDescription", value)}
            placeholder={t("companyDescription.placeholder")}
            required
            rows={4}
            error={validationErrors.companyDescription}
            helperText={t("companyDescription.helperText")}
            aria-describedby="company-description-help"
          />

          <Textarea
            label={`${t("jobDescription.label")} (${t("optional")})`}
            value={formData.jobDescription}
            onChange={(value) => handleInputChange("jobDescription", value)}
            placeholder={t("jobDescription.placeholder")}
            rows={4}
            helperText={t("jobDescription.helperText")}
            error={validationErrors.jobDescription}
            aria-describedby="job-description-help"
          />
        </fieldset>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? t("generating") : t("generate")}
          </Button>
        </div>
      </form>
    </div>
  );
}
