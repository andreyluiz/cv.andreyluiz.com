import { useTranslations } from "next-intl";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  experience: Variant["experience"];
}

export default function PreviousExperience({ experience }: Props) {
  const t = useTranslations("resume.experience");

  return (
    <Section title={t("title")}>
      <div className="flex flex-col gap-3">
        {experience.map((exp) => (
          <div
            key={exp.title + exp.company + exp.location + exp.period.start}
            className="break-inside-avoid space-y-2"
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
              <span className="ml-auto">|</span>
              <div className="text-neutral-600 dark:text-neutral-400">
                {exp.period.start} - {exp.period.end}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
