import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../ErrorBoundary";

const messages = {
  cvManagement: {
    errors: {
      unexpectedError: "An unexpected error occurred",
      retryPrompt: "Try again",
    },
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders default error fallback when error occurs", () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(
      screen.getByText("An unexpected error occurred"),
    ).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const mockOnError = vi.fn();

    render(
      <TestWrapper>
        <ErrorBoundary onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("shows technical details when error has message", () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(screen.getByText("Technical Details")).toBeInTheDocument();

    // Click to expand details
    const detailsElement = screen.getByText("Technical Details");
    detailsElement.click();

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("uses custom fallback component when provided", () => {
    const CustomFallback = ({
      error,
      retry,
    }: {
      error?: Error;
      retry: () => void;
    }) => (
      <div>
        <p>Custom error: {error?.message}</p>
        <button type="button" onClick={retry}>
          Custom retry
        </button>
      </div>
    );

    render(
      <TestWrapper>
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
    expect(screen.getByText("Custom retry")).toBeInTheDocument();
  });

  it("resets error state when retry is called", () => {
    const { rerender } = render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(
      screen.getByText("An unexpected error occurred"),
    ).toBeInTheDocument();

    const retryButton = screen.getByText("Try again");
    retryButton.click();

    // Re-render with no error
    rerender(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>,
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });
});
