import type { Variant } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Section } from "../ui/Section";

interface Props {
  breaks: Variant["breaks"];
}

export default function Break({ breaks }: Props) {
  const t = useTranslations("resume.breaks");

  if (!breaks || breaks.length === 0) {
    return null;
  }

  return (
    <Section title={t("title")}>
      <div className="flex flex-col gap-4">
        {breaks.map((b) => (
          <div
            key={b.period.start}
            className="break-inside-avoid border-neutral-300 not-last:pb-4 not-last:border-b space-y-2"
          >
            <div className="flex items-baseline justify-between gap-1">
              <div className="text-neutral-600 dark:text-neutral-400">
                {b.period.start} - {b.period.end}
              </div>
            </div>
            <p className="mb-4">{t("description")}</p>
            {b.achievements.length > 0 && (
              <ul className="list-disc ml-4">
                {b.achievements.map((achievement) => (
                  <li key={achievement} className="leading-normal">
                    {achievement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
