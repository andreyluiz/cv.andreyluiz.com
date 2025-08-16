"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

export default function LoadingSpinner({
  size = "md",
  className,
  "aria-label": ariaLabel = "Loading",
}: LoadingSpinnerProps) {
  return (
    <output
      className={cn(
        "animate-spin rounded-full border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400",
        sizeClasses[size],
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </output>
  );
}
