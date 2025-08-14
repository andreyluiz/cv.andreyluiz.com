import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { generateCoverLetter } from "@/lib/server/actions";
import { useStore } from "@/lib/store";
import type { CoverLetterInputs, Variant } from "@/lib/types";
import CoverLetterDisplay from "./CoverLetterDisplay";
import CoverLetterInputForm from "./CoverLetterInputForm";
import Modal from "./Modal";

type ModalPhase = "input" | "generating" | "display" | "error";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: Variant;
  apiKey: string;
  selectedModel: string;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  resumeData,
  apiKey,
  selectedModel,
}: CoverLetterModalProps) {
  const t = useTranslations("coverLetter.modal");
  const { locale } = useParams();
  const { generatedCoverLetter, coverLetterInputs, setCoverLetter } =
    useStore();

  const [currentPhase, setCurrentPhase] = useState<ModalPhase>("input");
  const [error, setError] = useState<string | null>(null);

  // Focus management refs
  const generatingStatusRef = useRef<HTMLOutputElement>(null);
  const displayActionsRef = useRef<HTMLDivElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  // Determine initial phase when modal opens
  useEffect(() => {
    if (isOpen) {
      if (generatedCoverLetter && coverLetterInputs) {
        setCurrentPhase("display");
      } else {
        setCurrentPhase("input");
      }
      setError(null);
    }
  }, [isOpen, generatedCoverLetter, coverLetterInputs]);

  // Focus management for phase transitions
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow DOM updates to complete
    const focusTimeout = setTimeout(() => {
      switch (currentPhase) {
        case "generating":
          generatingStatusRef.current?.focus();
          break;
        case "error":
          retryButtonRef.current?.focus();
          break;
        case "display":
          displayActionsRef.current?.focus();
          break;
        // No focus change needed for input phase as it's handled by Modal component
      }
    }, 100);

    return () => clearTimeout(focusTimeout);
  }, [currentPhase, isOpen]);

  const generateNewCoverLetter = useCallback(
    async (inputs: CoverLetterInputs) => {
      try {
        setCurrentPhase("generating");
        setError(null);

        const newCoverLetter = await generateCoverLetter(
          inputs.jobPosition || "",
          inputs.jobDescription || "",
          resumeData,
          apiKey,
          selectedModel,
          inputs.companyDescription || "",
          Array.isArray(locale) ? locale[0] : locale || "en",
        );

        if (newCoverLetter) {
          setCoverLetter(newCoverLetter, inputs);
          setCurrentPhase("display");
        } else {
          setError(t("errors.generationFailed"));
          setCurrentPhase("error");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.apiError");
        setError(errorMessage);
        setCurrentPhase("error");
        console.error("Error generating cover letter:", error);
      }
    },
    [resumeData, apiKey, selectedModel, setCoverLetter, t, locale],
  );

  const handleFormSubmit = (inputs: CoverLetterInputs) => {
    generateNewCoverLetter(inputs);
  };

  const handleRegenerate = () => {
    if (coverLetterInputs) {
      generateNewCoverLetter(coverLetterInputs);
    } else {
      setCurrentPhase("input");
    }
  };

  const handleRetry = () => {
    setCurrentPhase("input");
    setError(null);
  };

  const handleEditInputs = () => {
    setCurrentPhase("input");
    setError(null);
  };

  const getModalTitle = (): string => {
    switch (currentPhase) {
      case "input":
        return t("titles.input");
      case "generating":
        return t("titles.generating");
      case "display":
        return t("titles.display");
      case "error":
        return t("titles.error");
      default:
        return t("titles.default");
    }
  };

  const renderContent = () => {
    switch (currentPhase) {
      case "input":
        return (
          <CoverLetterInputForm
            initialInputs={coverLetterInputs}
            onSubmit={handleFormSubmit}
            isLoading={false}
          />
        );

      case "generating":
        return (
          <output
            ref={generatingStatusRef}
            className="flex flex-col items-center justify-center gap-4 py-12"
            tabIndex={-1}
            aria-live="polite"
            aria-label={t("generating.ariaLabel")}
          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
              aria-hidden="true"
            ></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {t("generating.message")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("generating.subtitle")}
            </p>
          </output>
        );

      case "display":
        if (!generatedCoverLetter || !coverLetterInputs) {
          setCurrentPhase("input");
          return null;
        }
        return (
          <div className="flex flex-col gap-4">
            <CoverLetterDisplay
              content={generatedCoverLetter}
              inputs={coverLetterInputs}
              onRegenerate={handleRegenerate}
            />
            <div
              ref={displayActionsRef}
              className="flex justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              tabIndex={-1}
            >
              <button
                type="button"
                onClick={handleEditInputs}
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                aria-label={t("actions.editInputsAriaLabel")}
              >
                {t("actions.editInputs")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t("actions.closeAriaLabel")}
              >
                {t("actions.close")}
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full dark:bg-red-900/20">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Error icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("error.title")}
              </h3>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 max-w-md">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                ref={retryButtonRef}
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t("actions.retryAriaLabel")}
              >
                {t("actions.retry")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t("actions.cancelAriaLabel")}
              >
                {t("actions.cancel")}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      {renderContent()}
    </Modal>
  );
}
