import { useTranslations } from "next-intl";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  experience: Variant["experience"];
}

export default function Experience({ experience }: Props) {
  const t = useTranslations("resume.experience");

  const visibleExperiences = experience.filter((exp) => !exp.isHidden);

  return (
    <Section title={t("title")}>
      <div className="flex flex-col gap-3">
        {visibleExperiences.map((exp) => (
          <div
            key={exp.title + exp.company + exp.location + exp.period.start}
            className="break-inside-avoid not-last:border-b border-neutral-300 not-last:pb-4 space-y-2"
          >
            <div className="flex items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-0.5">
                <span>
                  <span className="font-bold">{exp.title}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    &nbsp;- {exp.company}, {exp.location}
                  </span>
                </span>
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                {exp.period.start} - {exp.period.end}
              </div>
            </div>
            {exp.achievements.length > 0 && !exp.isPrevious && (
              <ul className="list-disc ml-4">
                {exp.achievements.map((achievement) => (
                  <li key={achievement} className="leading-normal">
                    {achievement}
                  </li>
                ))}
              </ul>
            )}
            {exp.techStack?.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold">{t("tech_stack")}:</span>&nbsp;
                <span className="text-neutral-600 dark:text-neutral-400">
                  {exp.techStack.join(", ")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
