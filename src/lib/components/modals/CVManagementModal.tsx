"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import ErrorBoundary from "@/lib/components/ui/ErrorBoundary";
import ErrorDisplay from "@/lib/components/ui/ErrorDisplay";
import LoadingSpinner from "@/lib/components/ui/LoadingSpinner";
import { ingestCV } from "@/lib/server/actions";
import resumeEnglish from "@/lib/server/resume-en.json";
import resumeFrench from "@/lib/server/resume-fr.json";
import resumePortuguese from "@/lib/server/resume-pt.json";
import { photoService } from "@/lib/services/photoService";
import { useStore } from "@/lib/store";
import type { IngestedCV, Variant } from "@/lib/types";
import CVIngestionForm from "./CVIngestionForm";
import CVListView from "./CVListView";
import Modal from "./Modal";

interface CVManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCVLoad: (cv: Variant, isDefault?: boolean) => void;
}

type ModalState = "list" | "ingesting" | "editing" | "processing";

interface ProcessingState {
  isProcessing: boolean;
  progress?: string;
  attempt?: number;
  maxAttempts?: number;
}

export default function CVManagementModal({
  isOpen,
  onClose,
  onCVLoad,
}: CVManagementModalProps) {
  const t = useTranslations("cvManagement");
  const locale = useLocale();
  const [modalState, setModalState] = useState<ModalState>("list");
  const [editingCV, setEditingCV] = useState<IngestedCV | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
  });
  const [error, setError] = useState<Error | string | null>(null);
  const [retryData, setRetryData] = useState<{
    title: string;
    rawText: string;
    photoId?: string | null;
  } | null>(null);

  const {
    ingestedCVs,
    apiKey,
    selectedModel,
    addIngestedCV,
    updateIngestedCV,
    deleteIngestedCV,
    setCurrentCV,
    clearCurrentCV,
    setCurrentPhotoId,
  } = useStore();

  // Get default CV based on locale
  const getDefaultCV = (): Variant => {
    switch (locale) {
      case "fr":
        return resumeFrench as Variant;
      case "pt":
        return resumePortuguese as Variant;
      default:
        return resumeEnglish as Variant;
    }
  };

  const defaultCV = getDefaultCV();

  const handleLoadCV = (cv: Variant, isDefault = false) => {
    console.log("Loading saved CV:", cv)
    if (isDefault) {
      clearCurrentCV();
      setCurrentPhotoId(null);
    } else {
      setCurrentCV(cv);
      setCurrentPhotoId(cv.profilePhotoId || null);
    }
    onCVLoad(cv);
    onClose();
  };

  const handleIngestNew = () => {
    setEditingCV(null);
    setError(null);
    setModalState("ingesting");
  };

  const handleEditCV = (cv: IngestedCV) => {
    setEditingCV(cv);
    setError(null);
    setModalState("editing");
  };

  const handleDeleteCV = async (id: string) => {
    try {
      // Find the CV to get its photo ID before deletion
      const cvToDelete = ingestedCVs.find((cv) => cv.id === id);

      // Delete the CV from store first
      deleteIngestedCV(id);

      // If the CV had a photo, delete it from IndexedDB
      if (cvToDelete?.profilePhotoId) {
        try {
          await photoService.deletePhoto(cvToDelete.profilePhotoId);
        } catch (photoError) {
          // Log photo deletion error but don't prevent CV deletion
          console.error("Failed to delete photo for CV:", photoError);

          // Show a non-blocking error message to the user
          setError(
            new Error(
              "CV deleted successfully, but failed to remove associated photo. The photo may remain in storage.",
            ),
          );

          // Clear the error after a delay
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      }
    } catch (error) {
      console.error("Error deleting CV:", error);

      // Show error to user
      setError(
        error instanceof Error ? error : new Error("Failed to delete CV"),
      );

      // Re-add the CV if deletion failed (only if it was actually removed)
      const isStillInList = ingestedCVs.some((cv) => cv.id === id);
      if (!isStillInList) {
        const cvToRestore = ingestedCVs.find((cv) => cv.id === id);
        if (cvToRestore) {
          addIngestedCV(cvToRestore);
        }
      }
    }
  };

  const processCV = useCallback(
    async (
      data: { title: string; rawText: string; photoId?: string | null },
      attempt = 1,
    ) => {
      const maxAttempts = 3;

      setProcessingState({
        isProcessing: true,
        progress: attempt > 1 ? t("form.retrying") : t("form.processing"),
        attempt,
        maxAttempts,
      });
      setError(null);

      try {
        const formattedCV = await ingestCV(
          data.rawText,
          apiKey,
          selectedModel,
          locale,
        );

        console.log('Ingestion done');

        const cvData: IngestedCV = {
          id: editingCV?.id || crypto.randomUUID(),
          title: data.title,
          rawText: data.rawText,
          formattedCV,
          createdAt: editingCV?.createdAt || new Date(),
          updatedAt: new Date(),
          profilePhotoId: data.photoId || undefined,
        };

        console.log('Photo ID on CV data: ', data.photoId)

        if (editingCV) {
          updateIngestedCV(editingCV.id, cvData);
        } else {
          addIngestedCV(cvData);
        }

        // Ensure uploaded photo is associated with the final CV id
        if (cvData.profilePhotoId) {
          try {
            await photoService.updatePhotoCvId(cvData.profilePhotoId, cvData.id);
          } catch (assocErr) {
            console.warn("Failed to associate photo with CV:", assocErr);
          }
        }

        // Success - reset states and return to list
        setModalState("list");
        setEditingCV(null);
        setRetryData(null);
        setProcessingState({ isProcessing: false });
      } catch (err) {
        console.error("Error processing CV:", err);

        const error = err instanceof Error ? err : new Error(String(err));

        // Check if we should retry for certain types of errors
        const shouldRetry =
          attempt < maxAttempts &&
          (error.message.toLowerCase().includes("network") ||
            error.message.toLowerCase().includes("timeout") ||
            error.message.toLowerCase().includes("rate limit"));

        if (shouldRetry) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * 2 ** (attempt - 1), 5000);
          setTimeout(() => {
            processCV(data, attempt + 1);
          }, delay);
        } else {
          // Final failure - show error and return to form
          setError(error);
          setRetryData(data);
          setModalState(editingCV ? "editing" : "ingesting");
          setProcessingState({ isProcessing: false });
        }
      }
    },
    [
      apiKey,
      selectedModel,
      locale,
      editingCV,
      updateIngestedCV,
      addIngestedCV,
      t,
    ],
  );

  const handleFormSubmit = async (data: {
    title: string;
    rawText: string;
    photoId?: string | null;
  }) => {
    if (!apiKey) {
      setError(new Error(t("errors.apiKeyRequired")));
      return;
    }

    if (!selectedModel) {
      setError(new Error(t("errors.modelRequired")));
      return;
    }

    setModalState("processing");
    await processCV(data);
  };

  const handleFormCancel = () => {
    setModalState("list");
    setEditingCV(null);
    setError(null);
  };

  const handleModalClose = () => {
    if (processingState.isProcessing) {
      return; // Prevent closing during processing
    }
    setModalState("list");
    setEditingCV(null);
    setError(null);
    setRetryData(null);
    setProcessingState({ isProcessing: false });
    onClose();
  };

  // Clean up orphaned photos when modal opens
  const cleanupOrphanedPhotos = useCallback(async () => {
    try {
      const existingCvIds = ingestedCVs.map((cv) => cv.id);
      const result = await photoService.cleanupOrphanedPhotos(existingCvIds);

      if (result.cleaned > 0) {
        console.log(`Cleaned up ${result.cleaned} orphaned photos`);
      }

      if (result.errors.length > 0) {
        console.warn("Photo cleanup errors:", result.errors);
      }
    } catch (error) {
      console.error("Failed to cleanup orphaned photos:", error);
    }
  }, [ingestedCVs]);

  // Run cleanup when modal opens
  useEffect(() => {
    if (isOpen) {
      // Run cleanup after a short delay to avoid blocking the UI
      const timeoutId = setTimeout(cleanupOrphanedPhotos, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, cleanupOrphanedPhotos]);

  const handleRetry = () => {
    if (retryData) {
      handleFormSubmit(retryData);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const getModalTitle = () => {
    switch (modalState) {
      case "ingesting":
        return t("form.ingestTitle");
      case "editing":
        return t("form.editTitle");
      case "processing":
        return processingState.attempt && processingState.attempt > 1
          ? t("form.retrying")
          : t("form.processing");
      default:
        return t("modal.title");
    }
  };

  const renderModalContent = () => {
    if (modalState === "list") {
      return (
        <CVListView
          cvs={ingestedCVs}
          defaultCV={defaultCV}
          onLoadCV={handleLoadCV}
          onEditCV={handleEditCV}
          onDeleteCV={handleDeleteCV}
          onIngestNew={handleIngestNew}
        />
      );
    }

    if (modalState === "ingesting" || modalState === "editing") {
      return (
        <div className="space-y-4">
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={retryData ? handleRetry : undefined}
              onDismiss={handleDismissError}
              variant="modal"
            />
          )}
          <CVIngestionForm
            initialData={
              editingCV
                ? {
                    title: editingCV.title,
                    rawText: editingCV.rawText,
                    photoId: editingCV.profilePhotoId,
                    cvId: editingCV.id,
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={processingState.isProcessing}
          />
        </div>
      );
    }

    if (modalState === "processing") {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <LoadingSpinner size="lg" aria-label={t("form.processing")} />
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {processingState.progress || t("form.processing")}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
            {t("form.processingDescription")}
          </p>
          {processingState.attempt &&
            processingState.maxAttempts &&
            processingState.attempt > 1 && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {t("form.attemptProgress", {
                  attempt: processingState.attempt,
                  max: processingState.maxAttempts,
                })}
              </p>
            )}
        </div>
      );
    }

    return null;
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("CVManagementModal error:", error, errorInfo);
        setError(error);
        setModalState("list");
        setProcessingState({ isProcessing: false });
      }}
    >
      <Modal isOpen={isOpen} onClose={handleModalClose} title={getModalTitle()}>
        {renderModalContent()}
      </Modal>
    </ErrorBoundary>
  );
}
