"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "inline" | "modal" | "banner";
  className?: string;
  showDetails?: boolean;
}

function getErrorType(error: string | Error): string | null {
  const errorMessage = typeof error === "string" ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return "networkError";
  }
  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests")
  ) {
    return "rateLimitError";
  }
  if (lowerMessage.includes("quota") || lowerMessage.includes("credits")) {
    return "quotaError";
  }
  if (lowerMessage.includes("model") && lowerMessage.includes("not found")) {
    return "modelError";
  }
  if (
    lowerMessage.includes("api key") ||
    lowerMessage.includes("unauthorized")
  ) {
    return "authError";
  }
  if (lowerMessage.includes("parse") || lowerMessage.includes("json")) {
    return "parseError";
  }
  if (lowerMessage.includes("empty response")) {
    return "emptyResponseError";
  }
  if (lowerMessage.includes("essential information")) {
    return "validationError";
  }

  // Return null for unknown error types to use original message
  return null;
}

function getErrorSuggestion(
  errorType: string | null,
  t: (key: string) => string,
): string {
  if (!errorType) return "";

  switch (errorType) {
    case "networkError":
    case "rateLimitError":
    case "quotaError":
    case "modelError":
      return t("modelSuggestion");
    case "authError":
      return t("settingsPrompt");
    case "parseError":
    case "emptyResponseError":
      return t("modelSuggestion");
    case "validationError":
      return t("retryPrompt");
    default:
      return t("settingsPrompt");
  }
}

export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  variant = "inline",
  className,
  showDetails = false,
}: ErrorDisplayProps) {
  const t = useTranslations("cvManagement.errors");

  const errorMessage = typeof error === "string" ? error : error.message;
  const errorType = getErrorType(error);
  const suggestion = getErrorSuggestion(errorType, t);

  // Use translated error message if we have a specific error type, otherwise use original message
  const displayError = errorType ? t(errorType) : errorMessage;

  const baseClasses = "rounded-lg border";
  const variantClasses = {
    inline:
      "p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    modal:
      "p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    banner:
      "p-3 bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <div className="flex items-start space-x-3">
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

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {displayError}
          </h3>

          {suggestion && (
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {suggestion}
            </p>
          )}

          {showDetails && typeof error === "object" && error.stack && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:text-red-800 dark:hover:text-red-200">
                Technical Details
              </summary>
              <pre className="mt-1 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex-shrink-0 flex space-x-2">
          {onRetry && (
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={onRetry}
              className="text-red-800 dark:text-red-200 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm px-3 py-1"
            >
              {t("retryPrompt")}
            </Button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
              aria-label="Dismiss error"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
