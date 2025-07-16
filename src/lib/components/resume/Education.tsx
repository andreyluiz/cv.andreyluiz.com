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
            <div className="flex items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-0.5">
                <span>
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    &nbsp;- {edu.institution}, {edu.location}
                  </span>
                </span>
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                {edu.year}
              </div>
            </div>
            <ul className="list-disc list-outside ml-4">
            {edu.gpa && (
              <li className="text-neutral-600 dark:text-neutral-400">
                <span className="font-bold">{t("gpa")}:</span> {edu.gpa}
              </li>
            )}
            {edu.topics && (
              <li className="text-neutral-600 dark:text-neutral-400">
                <span className="font-bold">{t("topics")}:</span> {edu.topics}
              </li>
            )}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
