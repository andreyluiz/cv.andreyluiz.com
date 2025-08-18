"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { PhotoService, photoService } from "@/lib/services/photoService";

// Accepted image file types
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export interface PhotoUploadProps {
  value?: string | null; // Photo ID for preview
  onChange: (photoId: string | null) => void;
  disabled?: boolean;
  error?: string;
  cvId?: string; // CV ID for associating photos
}

export function PhotoUpload({
  value,
  onChange,
  disabled = false,
  error,
  cvId = "temp", // Default temp ID for new CVs
}: PhotoUploadProps) {
  const t = useTranslations();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const helpId = useId();
  const errorId = useId();

  // Load preview when value changes
  useEffect(() => {
    let mounted = true;

    const loadPreview = async () => {
      if (value && value !== previewUrl) {
        try {
          const url = await photoService.getPhotoUrl(value);
          if (mounted) {
            setPreviewUrl(url);
          }
        } catch (error) {
          console.error("Failed to load photo preview:", error);
          if (mounted) {
            setPreviewUrl(null);
          }
        }
      } else if (!value && previewUrl) {
        if (mounted) {
          PhotoService.revokePhotoUrl(previewUrl);
          setPreviewUrl(null);
        }
      }
    };

    loadPreview();

    return () => {
      mounted = false;
      if (previewUrl) {
        PhotoService.revokePhotoUrl(previewUrl);
      }
    };
  }, [value, previewUrl]);

  // Validate file type and size
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type.toLowerCase())) {
        return t("cvManagement.errors.photoInvalidType");
      }

      if (file.size > MAX_FILE_SIZE) {
        return t("cvManagement.errors.photoTooLarge");
      }

      return null;
    },
    [t],
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const photoId = await photoService.storePhoto(file, cvId);
        onChange(photoId);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("cvManagement.errors.photoUploadFailed");
        setUploadError(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onChange, cvId, t],
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
      // Reset input value to allow selecting the same file again
      event.target.value = "";
    },
    [handleFileUpload],
  );

  // Handle drag and drop
  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(event.dataTransfer.files);
      const imageFile = files.find((file) =>
        ACCEPTED_FILE_TYPES.includes(file.type.toLowerCase()),
      );

      if (imageFile) {
        handleFileUpload(imageFile);
      } else if (files.length > 0) {
        setUploadError(t("cvManagement.errors.photoInvalidType"));
      }
    },
    [disabled, handleFileUpload, t],
  );

  // Handle click to browse
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle remove photo
  const handleRemove = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();

      if (value) {
        try {
          await photoService.deletePhoto(value);
        } catch (error) {
          console.error("Failed to delete photo:", error);
        }
      }

      onChange(null);
      setUploadError(null);
    },
    [value, onChange],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const displayError = error || uploadError;

  return (
    <div className="space-y-2">
      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("cvManagement.photo.upload")}
      </div>

      {/* Preview state - separate from upload area to avoid nested buttons */}
      {!isUploading && previewUrl && (
        <div className="flex flex-col items-center space-y-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="relative">
            <Image
              src={previewUrl}
              alt={t("cvManagement.photo.alt")}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              unoptimized={true} // Since this is a blob URL
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t("cvManagement.photo.removeAlt")}
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("cvManagement.photo.preview")}
          </p>
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cvManagement.photo.clickToReplace")}
          </button>
        </div>
      )}

      {/* Upload area - only shown when no preview */}
      {!previewUrl && (
        <button
          type="button"
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center w-full transition-colors
            ${
              isDragOver && !disabled
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600"
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                : "hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
            }
            ${displayError ? "border-red-300 dark:border-red-600" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={t("cvManagement.photo.upload")}
          aria-describedby={displayError ? errorId : helpId}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={handleFileChange}
            className="sr-only"
            disabled={disabled}
            tabIndex={-1}
          />

          {/* Loading state */}
          {isUploading && (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("cvManagement.photo.uploading")}
              </p>
            </div>
          )}

          {/* Upload state */}
          {!isUploading && (
            <div className="flex flex-col items-center space-y-2">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("cvManagement.photo.dragDrop")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {t("cvManagement.photo.supportedFormats")}
                </p>
              </div>
            </div>
          )}
        </button>
      )}

      {/* Help text */}
      {!displayError && (
        <p id={helpId} className="text-xs text-gray-500 dark:text-gray-500">
          {t("cvManagement.photo.helpText")}
        </p>
      )}

      {/* Error message */}
      {displayError && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}
