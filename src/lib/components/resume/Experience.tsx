import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  experience: Variant["experience"];
}

export default function Experience({ experience }: Props) {
  const t = useTranslations("resume.experience");

  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="flex flex-col gap-6 print:gap-3">
        {experience.map((exp) => (
          <div
            key={exp.title + exp.company + exp.location + exp.period.start}
            className="break-inside-avoid border-b border-neutral-300 pb-4 last:border-b-0 space-y-4 print:space-y-2"
          >
            <div className="flex items-baseline justify-between gap-2 print:gap-1">
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
            {exp.achievements.length > 0 && (
              <ul className="list-disc ml-4">
                {exp.achievements.map((achievement) => (
                  <li
                    key={achievement}
                    className="leading-relaxed print:leading-normal"
                  >
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
    </section>
  );
}
