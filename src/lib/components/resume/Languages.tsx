import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  languages: Variant["languages"];
}

export default function Languages({ languages }: Props) {
  const t = useTranslations("resume.languages");

  return (
    <section className="break-inside-avoid">
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="grid grid-cols-4 gap-4 print:gap-2">
        {languages.map((language) => (
          <div key={language.name}>
            <p className="font-bold">{language.name}</p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {language.level}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
