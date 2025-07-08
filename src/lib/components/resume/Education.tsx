import { useTranslations } from "next-intl";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  education: Variant["education"];
}

export default function Education({ education }: Props) {
  const t = useTranslations("resume.education");

  if (!education || !education.length) {
    return null;
  }

  return (
    <Section title={t("title")}>
      <div className="flex flex-col gap-2">
        {education.map((edu) => (
          <div
            key={edu.degree}
            className="not-last:border-b border-neutral-200 not-last:pb-4"
          >
            <div className="flex flex-col gap-1">
              <span className="font-bold">{edu.degree}</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {edu.year}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {edu.institution} - {edu.location}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
