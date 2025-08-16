"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ingestCV } from "@/lib/server/actions";
import resumeEnglish from "@/lib/server/resume-en.json";
import resumeFrench from "@/lib/server/resume-fr.json";
import resumePortuguese from "@/lib/server/resume-pt.json";
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

export default function CVManagementModal({
  isOpen,
  onClose,
  onCVLoad,
}: CVManagementModalProps) {
  const t = useTranslations("cvManagement");
  const locale = useLocale();
  const [modalState, setModalState] = useState<ModalState>("list");
  const [editingCV, setEditingCV] = useState<IngestedCV | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    ingestedCVs,
    apiKey,
    selectedModel,
    addIngestedCV,
    updateIngestedCV,
    deleteIngestedCV,
    setCurrentCV,
    clearCurrentCV,
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
    if (isDefault) {
      clearCurrentCV();
    } else {
      setCurrentCV(cv);
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

  const handleDeleteCV = (id: string) => {
    deleteIngestedCV(id);
  };

  const handleFormSubmit = async (data: { title: string; rawText: string }) => {
    if (!apiKey) {
      setError(t("errors.apiKeyRequired"));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setModalState("processing");

    try {
      const formattedCV = await ingestCV(
        data.rawText,
        apiKey,
        selectedModel,
        locale,
      );

      const cvData: IngestedCV = {
        id: editingCV?.id || crypto.randomUUID(),
        title: data.title,
        rawText: data.rawText,
        formattedCV,
        createdAt: editingCV?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingCV) {
        updateIngestedCV(editingCV.id, cvData);
      } else {
        addIngestedCV(cvData);
      }

      setModalState("list");
      setEditingCV(null);
    } catch (err) {
      console.error("Error processing CV:", err);
      setError(
        err instanceof Error ? err.message : t("errors.processingFailed"),
      );
      setModalState(editingCV ? "editing" : "ingesting");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormCancel = () => {
    setModalState("list");
    setEditingCV(null);
    setError(null);
  };

  const handleModalClose = () => {
    if (isProcessing) {
      return; // Prevent closing during processing
    }
    setModalState("list");
    setEditingCV(null);
    setError(null);
    onClose();
  };

  const getModalTitle = () => {
    switch (modalState) {
      case "ingesting":
        return t("form.ingestTitle");
      case "editing":
        return t("form.editTitle");
      case "processing":
        return t("form.processing");
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
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <CVIngestionForm
            initialData={
              editingCV
                ? { title: editingCV.title, rawText: editingCV.rawText }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isProcessing}
          />
        </div>
      );
    }

    if (modalState === "processing") {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {t("form.processing")}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
            {t("form.processingDescription")}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={getModalTitle()}>
      {renderModalContent()}
    </Modal>
  );
}
