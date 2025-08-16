"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";
import Button from "@/lib/components/ui/Button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
}: ConfirmationDialogProps) {
  const titleId = useId();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIconColor = () => {
    switch (variant) {
      case "danger":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return "heroicons:exclamation-triangle";
      case "warning":
        return "heroicons:exclamation-triangle";
      case "info":
        return "heroicons:information-circle";
      default:
        return "heroicons:exclamation-triangle";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-800"
        role="document"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 ${getIconColor()}`}>
            <Icon icon={getIcon()} className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id={titleId}
              className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2"
            >
              {title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              {message}
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "primary"}
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
