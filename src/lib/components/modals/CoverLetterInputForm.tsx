import { useTranslations } from "next-intl";
import { useState } from "react";
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
        <Input
          label={`${t("jobPosition.label")} (${t("optional")})`}
          value={formData.jobPosition}
          onChange={(value) => handleInputChange("jobPosition", value)}
          placeholder={t("jobPosition.placeholder")}
        />

        <Textarea
          label={t("companyDescription.label")}
          value={formData.companyDescription}
          onChange={(value) => handleInputChange("companyDescription", value)}
          placeholder={t("companyDescription.placeholder")}
          required
          rows={4}
          error={validationErrors.companyDescription}
        />

        <Textarea
          label={`${t("jobDescription.label")} (${t("optional")})`}
          value={formData.jobDescription}
          onChange={(value) => handleInputChange("jobDescription", value)}
          placeholder={t("jobDescription.placeholder")}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? t("generating") : t("generate")}
        </Button>
      </div>
    </form>
  );
}
