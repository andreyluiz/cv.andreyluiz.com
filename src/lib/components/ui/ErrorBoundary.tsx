"use client";

import { useTranslations } from "next-intl";
import React from "react";
import Button from "./Button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={this.state.error} retry={this.retry} />
        );
      }

      return (
        <DefaultErrorFallback error={this.state.error} retry={this.retry} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const t = useTranslations("cvManagement.errors");

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="text-red-500 text-5xl">⚠️</div>
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t("unexpectedError")}
      </h2>
      {error && (
        <details className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
          <summary className="cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200">
            Technical Details
          </summary>
          <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
      <Button onClick={retry} variant="primary">
        {t("retryPrompt")}
      </Button>
    </div>
  );
}

export default function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}

export { DefaultErrorFallback };
export type { ErrorFallbackProps };
