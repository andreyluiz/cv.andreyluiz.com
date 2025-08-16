import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  languages: Variant["languages"];
}

export default function Languages({ languages }: Props) {
  const t = useTranslations("resume.languages");
  const { layoutMode } = useStore();

  return (
    <Section title={t("title")}>
      <div
        className={
          layoutMode === "two-column"
            ? "flex flex-col gap-3"
            : "grid grid-cols-4 gap-2"
        }
      >
        {languages.map((language) => (
          <div key={language.name}>
            <p className="font-bold">{language.name}</p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {language.level}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
