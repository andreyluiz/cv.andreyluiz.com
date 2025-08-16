"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "@/lib/components/ui/Button";
import Input from "@/lib/components/ui/Input";
import Textarea from "@/lib/components/ui/Textarea";

interface CVIngestionFormProps {
  initialData?: { title: string; rawText: string };
  onSubmit: (data: { title: string; rawText: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormErrors {
  title?: string;
  rawText?: string;
}

export default function CVIngestionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CVIngestionFormProps) {
  const t = useTranslations("cvManagement");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    rawText: initialData?.rawText || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = t("errors.titleRequired");
    } else if (formData.title.length > 100) {
      newErrors.title = t("errors.titleTooLong");
    }

    // Raw text validation
    if (!formData.rawText.trim()) {
      newErrors.rawText = t("errors.rawTextRequired");
    } else if (formData.rawText.length < 50) {
      newErrors.rawText = t("errors.rawTextTooShort");
    } else if (formData.rawText.length > 50000) {
      newErrors.rawText = t("errors.rawTextTooLong");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      rawText: formData.rawText.trim(),
    });
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleRawTextChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rawText: value }));
    if (errors.rawText) {
      setErrors((prev) => ({ ...prev, rawText: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Input
        label={t("form.title")}
        value={formData.title}
        onChange={handleTitleChange}
        placeholder={t("form.titlePlaceholder")}
        required
        error={errors.title}
        disabled={isLoading}
      />

      <Textarea
        label={t("form.rawText")}
        value={formData.rawText}
        onChange={handleRawTextChange}
        placeholder={t("form.rawTextPlaceholder")}
        required
        rows={12}
        error={errors.rawText}
        disabled={isLoading}
      />

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t("form.cancel")}
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("form.processing") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}
