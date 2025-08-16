"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "@/lib/components/ui/Button";
import type { IngestedCV, Variant } from "@/lib/types";
import ConfirmationDialog from "./ConfirmationDialog";

interface CVListViewProps {
  cvs: IngestedCV[];
  defaultCV: Variant;
  onLoadCV: (cv: Variant) => void;
  onEditCV: (cv: IngestedCV) => void;
  onDeleteCV: (id: string) => void;
  onIngestNew: () => void;
}

interface CVListItemProps {
  title: string;
  isDefault?: boolean;
  onLoad: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CVListItem({
  title,
  isDefault = false,
  onLoad,
  onEdit,
  onDelete,
}: CVListItemProps) {
  const t = useTranslations("cvManagement.actions");
  const modalT = useTranslations("cvManagement.modal");

  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {title}
        </h3>
        {isDefault && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {modalT("defaultCV")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button
          type="button"
          onClick={onLoad}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
          title={t("load")}
          aria-label={`${t("load")}: ${title}`}
        >
          <Icon icon="heroicons:arrow-down-tray" className="h-5 w-5" />
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
            title={t("edit")}
            aria-label={`${t("edit")}: ${title}`}
          >
            <Icon icon="heroicons:pencil" className="h-5 w-5" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
            title={t("delete")}
            aria-label={`${t("delete")}: ${title}`}
          >
            <Icon icon="heroicons:trash" className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CVListView({
  cvs,
  defaultCV,
  onLoadCV,
  onEditCV,
  onDeleteCV,
  onIngestNew,
}: CVListViewProps) {
  const t = useTranslations("cvManagement");
  const [confirmDeleteCV, setConfirmDeleteCV] = useState<IngestedCV | null>(
    null,
  );

  const handleDeleteClick = (cv: IngestedCV) => {
    setConfirmDeleteCV(cv);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteCV) {
      onDeleteCV(confirmDeleteCV.id);
      setConfirmDeleteCV(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteCV(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t("modal.title")}
          </h3>
          <Button onClick={onIngestNew} variant="primary">
            {t("modal.ingestNew")}
          </Button>
        </div>

        <div className="space-y-3">
          {/* Default CV - always first */}
          <CVListItem
            title={`${defaultCV.name} - ${defaultCV.title}`}
            isDefault={true}
            onLoad={() => onLoadCV(defaultCV)}
          />

          {/* Ingested CVs */}
          {cvs.length > 0 ? (
            cvs.map((cv) => (
              <CVListItem
                key={cv.id}
                title={cv.title}
                onLoad={() => onLoadCV(cv.formattedCV)}
                onEdit={() => onEditCV(cv)}
                onDelete={() => handleDeleteClick(cv)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <Icon
                icon="heroicons:document-text"
                className="h-12 w-12 mx-auto mb-3 opacity-50"
              />
              <p>{t("modal.noIngestedCVs")}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDeleteCV !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("actions.confirmDeleteTitle")}
        message={`${t("actions.confirmDeleteMessage")} "${confirmDeleteCV?.title}"`}
        confirmText={t("actions.confirmDeleteButton")}
        cancelText={t("actions.cancelDelete")}
        variant="danger"
      />
    </>
  );
}
