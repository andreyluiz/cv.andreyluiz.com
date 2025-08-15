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
  const [errorType, setErrorType] = useState<
    "validation" | "network" | "auth" | "quota" | "ai" | "unknown" | null
  >(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);

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
      setErrorType(null);
      setRetryCount(0);
      setIsAutoRetrying(false);
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

  const categorizeError = useCallback((errorMessage: string) => {
    const lowerMessage = errorMessage.toLowerCase();

    if (
      lowerMessage.includes("api key") ||
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("authentication")
    ) {
      return "auth";
    }
    if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("quota") ||
      lowerMessage.includes("credits") ||
      lowerMessage.includes("insufficient")
    ) {
      return "quota";
    }
    if (
      lowerMessage.includes("network") ||
      lowerMessage.includes("connection") ||
      lowerMessage.includes("timeout")
    ) {
      return "network";
    }
    if (
      lowerMessage.includes("model") ||
      lowerMessage.includes("not found") ||
      lowerMessage.includes("unavailable")
    ) {
      return "ai";
    }
    if (
      lowerMessage.includes("validation") ||
      lowerMessage.includes("required")
    ) {
      return "validation";
    }
    return "unknown";
  }, []);

  const isRetryableError = useCallback(
    (errorType: string | null, errorMessage: string) => {
      if (!errorType) return false;

      // Don't retry authentication or validation errors
      if (errorType === "auth" || errorType === "validation") {
        return false;
      }

      // Don't retry quota errors (usually persistent)
      if (errorType === "quota") {
        return false;
      }

      // Retry network and AI errors (usually transient)
      if (errorType === "network" || errorType === "ai") {
        return true;
      }

      // For unknown errors, check specific patterns
      const lowerMessage = errorMessage.toLowerCase();
      const transientPatterns = [
        "timeout",
        "temporary",
        "try again",
        "service unavailable",
        "internal error",
        "server error",
        "500",
        "502",
        "503",
        "504",
      ];

      return transientPatterns.some((pattern) =>
        lowerMessage.includes(pattern),
      );
    },
    [],
  );

  const sleep = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    [],
  );

  const generateNewCoverLetter = useCallback(
    async (inputs: CoverLetterInputs, retryAttempt = 0) => {
      const maxRetries = 3;

      try {
        setCurrentPhase("generating");
        setError(null);
        setRetryCount(retryAttempt);

        if (retryAttempt > 0) {
          setIsAutoRetrying(true);
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.min(1000 * 2 ** (retryAttempt - 1), 4000);
          await sleep(delay);
        }

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
          setError(null);
          setErrorType(null);
          setRetryCount(0);
          setIsAutoRetrying(false);
        } else {
          setError(t("errors.generationFailed"));
          setErrorType("ai");
          setCurrentPhase("error");
          setIsAutoRetrying(false);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.apiError");
        const type = categorizeError(errorMessage);

        // Check if we should automatically retry
        if (retryAttempt < maxRetries && isRetryableError(type, errorMessage)) {
          console.log(
            `Retrying cover letter generation (attempt ${retryAttempt + 1}/${maxRetries}):`,
            errorMessage,
          );
          return generateNewCoverLetter(inputs, retryAttempt + 1);
        }

        setError(errorMessage);
        setErrorType(type);
        setCurrentPhase("error");
        setRetryCount(retryAttempt);
        setIsAutoRetrying(false);
        console.error("Error generating cover letter:", error);
      }
    },
    [
      resumeData,
      apiKey,
      selectedModel,
      setCoverLetter,
      t,
      locale,
      categorizeError,
      isRetryableError,
      sleep,
    ],
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
    setErrorType(null);
    setRetryCount(0);
    setIsAutoRetrying(false);
  };

  const handleEditInputs = () => {
    setCurrentPhase("input");
    setError(null);
    setErrorType(null);
    setRetryCount(0);
    setIsAutoRetrying(false);
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
              {isAutoRetrying
                ? t("generating.retryMessage")
                : t("generating.message")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isAutoRetrying
                ? t("generating.retrySubtitle", {
                    attempt: retryCount + 1,
                    max: 3,
                  })
                : t("generating.subtitle")}
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

      case "error": {
        const getErrorIcon = () => {
          switch (errorType) {
            case "auth":
              return (
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Authentication error icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              );
            case "network":
              return (
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Network error icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              );
            case "quota":
              return (
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Quota error icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              );
            case "ai":
              return (
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="AI service error icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              );
            default:
              return (
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
              );
          }
        };

        const getHelpfulSuggestion = () => {
          switch (errorType) {
            case "auth":
              return t("errors.authSuggestion");
            case "network":
              return t("errors.networkSuggestion");
            case "quota":
              return t("errors.quotaSuggestion");
            case "ai":
              return t("errors.aiSuggestion");
            default:
              return t("errors.generalSuggestion");
          }
        };

        return (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full dark:bg-red-900/20">
              {getErrorIcon()}
            </div>
            <div className="text-center space-y-3 max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("error.title")}
              </h3>
              {error && (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getHelpfulSuggestion()}
                  </p>
                </div>
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
      }

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
