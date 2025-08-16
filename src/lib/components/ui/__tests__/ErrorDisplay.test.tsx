import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import ErrorDisplay from "../ErrorDisplay";

const messages = {
  cvManagement: {
    errors: {
      networkError: "Network connection failed",
      rateLimitError: "Rate limit exceeded",
      quotaError: "Insufficient credits",
      modelError: "Model unavailable",
      authError: "Invalid API key",
      parseError: "Could not parse response",
      validationError: "Could not extract information",
      emptyResponseError: "Empty response",
      unexpectedError: "Unexpected error",
      retryPrompt: "Try again",
      settingsPrompt: "Check settings",
      modelSuggestion: "Try different model",
    },
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

describe("ErrorDisplay", () => {
  it("renders error message correctly", () => {
    render(
      <TestWrapper>
        <ErrorDisplay error="Test error message" />
      </TestWrapper>,
    );

    // Since "Test error message" doesn't match any specific pattern, it should show the original message
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("detects network error type and shows appropriate message", () => {
    render(
      <TestWrapper>
        <ErrorDisplay error="Network connection failed" />
      </TestWrapper>,
    );

    expect(screen.getByText("Network connection failed")).toBeInTheDocument();
    expect(screen.getByText("Try different model")).toBeInTheDocument();
  });

  it("detects rate limit error type", () => {
    render(
      <TestWrapper>
        <ErrorDisplay error="Rate limit exceeded. Please wait." />
      </TestWrapper>,
    );

    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("detects API key error type", () => {
    render(
      <TestWrapper>
        <ErrorDisplay error="Invalid API key provided" />
      </TestWrapper>,
    );

    expect(screen.getByText("Invalid API key")).toBeInTheDocument();
    expect(screen.getByText("Check settings")).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    const mockRetry = vi.fn();

    render(
      <TestWrapper>
        <ErrorDisplay error="Test error" onRetry={mockRetry} />
      </TestWrapper>,
    );

    const retryButton = screen.getByText("Try again");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalled();
  });

  it("shows dismiss button when onDismiss is provided", () => {
    const mockDismiss = vi.fn();

    render(
      <TestWrapper>
        <ErrorDisplay error="Test error" onDismiss={mockDismiss} />
      </TestWrapper>,
    );

    const dismissButton = screen.getByLabelText("Dismiss error");
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(mockDismiss).toHaveBeenCalled();
  });

  it("shows technical details when showDetails is true and error has stack", () => {
    const errorWithStack = new Error("Test error");
    errorWithStack.stack = "Error: Test error\n    at test.js:1:1";

    render(
      <TestWrapper>
        <ErrorDisplay error={errorWithStack} showDetails={true} />
      </TestWrapper>,
    );

    expect(screen.getByText("Technical Details")).toBeInTheDocument();
  });

  it("applies correct variant classes", () => {
    const { rerender } = render(
      <TestWrapper>
        <ErrorDisplay error="Test error" variant="banner" />
      </TestWrapper>,
    );

    // Find the root container with the variant classes
    let errorContainer = screen.getByText("Test error").closest(".rounded-lg");
    expect(errorContainer).toHaveClass("p-3");

    rerender(
      <TestWrapper>
        <ErrorDisplay error="Test error" variant="modal" />
      </TestWrapper>,
    );

    errorContainer = screen.getByText("Test error").closest(".rounded-lg");
    expect(errorContainer).toHaveClass("p-6");
  });

  it("handles Error objects correctly", () => {
    const error = new Error("Test error object");

    render(
      <TestWrapper>
        <ErrorDisplay error={error} />
      </TestWrapper>,
    );

    // Since "Test error object" doesn't match any specific pattern, it should show the original message
    expect(screen.getByText("Test error object")).toBeInTheDocument();
  });

  it("falls back to original message when translation not found", () => {
    render(
      <TestWrapper>
        <ErrorDisplay error="Some unknown error type" />
      </TestWrapper>,
    );

    // Since this doesn't match any pattern, it should show the original message
    expect(screen.getByText("Some unknown error type")).toBeInTheDocument();
  });
});
