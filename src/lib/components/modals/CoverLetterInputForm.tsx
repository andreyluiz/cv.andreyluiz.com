import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import Button from "@/lib/components/ui/Button";
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
  const formId = useId();

  const [formData, setFormData] = useState<CoverLetterInputs>({
    jobPosition: initialInputs?.jobPosition || "",
    companyDescription: initialInputs?.companyDescription || "",
    jobDescription: initialInputs?.jobDescription || "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    companyDescription?: string;
  }>({});

  const handleInputChange = (field: keyof CoverLetterInputs, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (field === "companyDescription" && value.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        companyDescription: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { companyDescription?: string } = {};

    if (!formData.companyDescription.trim()) {
      errors.companyDescription = t("validation.companyDescriptionRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const jobPositionId = `${formId}-jobPosition`;
  const companyDescriptionId = `${formId}-companyDescription`;
  const jobDescriptionId = `${formId}-jobDescription`;
  const companyDescriptionErrorId = `${formId}-companyDescription-error`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
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
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t("infoBox.title")}
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>{t("infoBox.description")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={jobPositionId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("jobPosition.label")}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              ({t("optional")})
            </span>
          </label>
          <input
            type="text"
            id={jobPositionId}
            name="jobPosition"
            value={formData.jobPosition}
            onChange={(e) => handleInputChange("jobPosition", e.target.value)}
            placeholder={t("jobPosition.placeholder")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label
            htmlFor={companyDescriptionId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("companyDescription.label")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id={companyDescriptionId}
            name="companyDescription"
            rows={4}
            value={formData.companyDescription}
            onChange={(e) =>
              handleInputChange("companyDescription", e.target.value)
            }
            placeholder={t("companyDescription.placeholder")}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
              validationErrors.companyDescription
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            } dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
            aria-describedby={
              validationErrors.companyDescription
                ? companyDescriptionErrorId
                : undefined
            }
          />
          {validationErrors.companyDescription && (
            <p
              id={companyDescriptionErrorId}
              className="mt-2 text-sm text-red-600 dark:text-red-400"
            >
              {validationErrors.companyDescription}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={jobDescriptionId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("jobDescription.label")}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              ({t("optional")})
            </span>
          </label>
          <textarea
            id={jobDescriptionId}
            name="jobDescription"
            rows={4}
            value={formData.jobDescription}
            onChange={(e) =>
              handleInputChange("jobDescription", e.target.value)
            }
            placeholder={t("jobDescription.placeholder")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? t("generating") : t("generate")}
        </Button>
      </div>
    </form>
  );
}
