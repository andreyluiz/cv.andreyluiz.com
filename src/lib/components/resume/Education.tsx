import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  education: Variant["education"];
}

export default function Education({ education }: Props) {
  const t = useTranslations("resume.education");

  if (!education || !education.length) {
    return null;
  }

  return (
    <section className="break-inside-avoid">
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="flex flex-col gap-4 print:gap-2">
        {education.map((edu) => (
          <div
            key={edu.degree}
            className="border-b border-neutral-200 pb-4 last:border-b-0"
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
    </section>
  );
}
