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
import MyCVsButton from "../ui/MyCVsButton";
import Select from "../ui/Select";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import ResumeTailor from "./ResumeTailor";

interface Props {
  currentResume: Variant;
  setCurrentResume: (resume: Variant, isDefault?: boolean) => void;
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
    <div className="flex flex-col justify-between gap-4 print:hidden">
      <div className="flex justify-between gap-2 w-full">
        <div className="flex">
          <Select
            options={langsOptions}
            value={locale as string}
            onChange={handleLangChange}
          />
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
          <LayoutToggle />

          <ThemeSwitcher />
        </div>

        <div className="ml-auto">
          <MyCVsButton onCVLoad={setCurrentResume} />
        </div>
      </div>
      <ResumeTailor
        resumeData={currentResume}
        onResumeUpdate={setCurrentResume}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
