"use client";

import { FolderIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Variant } from "@/lib/types";
import CVManagementModal from "../modals/CVManagementModal";
import Button from "./Button";

interface MyCVsButtonProps {
  onCVLoad: (cv: Variant) => void;
}

export default function MyCVsButton({ onCVLoad }: MyCVsButtonProps) {
  const t = useTranslations("cvManagement");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCVLoad = (cv: Variant) => {
    onCVLoad(cv);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
      >
        <FolderIcon className="size-4" />
        {t("button.myCVs")}
      </Button>
      <CVManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCVLoad={handleCVLoad}
      />
    </>
  );
}
