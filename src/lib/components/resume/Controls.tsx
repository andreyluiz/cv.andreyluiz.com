import { KeyIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { langsOptions } from "@/lib/lang";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import ApiKeyModal from "../modals/ApiKeyModal";
import Button from "../ui/Button";
import LayoutToggle from "../ui/LayoutToggle";
import Select from "../ui/Select";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import ResumeTailor from "./ResumeTailor";

interface Props {
  currentResume: Variant;
  setCurrentResume: (resume: Variant) => void;
}

export default function Controls({ currentResume, setCurrentResume }: Props) {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const { apiKey } = useStore();

  const handleLangChange = (locale: string) => {
    router.replace("/", { locale });
  };

  return (
    <div className="flex items-center justify-between gap-4 print:hidden">
      <div className="flex items-center gap-2">
        <ResumeTailor
          resumeData={currentResume}
          onResumeUpdate={setCurrentResume}
        />
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          {!apiKey && (
            <span className="text-xs text-red-500">Set your API key</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsApiKeyModalOpen(true)}
          >
            <KeyIcon className="size-5" />
            <span
              className={`absolute right-1 top-1 block h-2 w-2 rounded-full ${
                apiKey ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </Button>
        </div>
        <LayoutToggle />
        <Select
          options={langsOptions}
          value={locale as string}
          onChange={handleLangChange}
        />
        <ThemeSwitcher />
      </div>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
