import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { langsOptions } from "@/lib/lang";
import type { Variant } from "@/lib/types";
import Select from "../ui/Select";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import ResumeTailor from "./ResumeTailor";

interface Props {
  currentResume: Variant;
  setCurrentResume: (resume: Variant) => void;
}

export default function Controls({ currentResume, setCurrentResume }: Props) {
  const [hasTailoringFeature, setHasTailoringFeature] = useState(false);
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    setHasTailoringFeature(
      localStorage.getItem("tailoring") === "true" ||
        process.env.NODE_ENV === "development",
    );
  }, []);

  const handleLangChange = (locale: string) => {
    router.replace("/", { locale });
  };

  return (
    <div className="flex justify-between items-center gap-4 print:hidden">
      {hasTailoringFeature && (
        <ResumeTailor
          resumeData={currentResume}
          onResumeUpdate={setCurrentResume}
        />
      )}
      <div className="flex items-center justify-center gap-2">
        <Select
          options={langsOptions}
          value={locale as string}
          onChange={handleLangChange}
        />
        <ThemeSwitcher />
      </div>
    </div>
  );
}
