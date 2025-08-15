import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";
import Title from "../ui/Title";

interface Props {
  experience: Variant["experience"];
}

export default function Experience({ experience }: Props) {
  const t = useTranslations("resume.experience");
  const { hideBullets, setHideBullets } = useStore();

  const visibleExperiences = experience.filter((exp) => !exp.isHidden);

  const handleHideBulletsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHideBullets(e.target.checked);
  };

  const titleContent = (
    <div className="flex items-center justify-between">
      <Title tag="h2">{t("title")}</Title>
      <label className="flex items-center gap-2 print:hidden">
        <input
          type="checkbox"
          checked={hideBullets}
          onChange={handleHideBulletsChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {t("hideBullets")}
        </span>
      </label>
    </div>
  );

  return (
    <Section titleContent={titleContent}>
      <div className="flex flex-col gap-3">
        {visibleExperiences.map((exp) => (
          <div
            key={exp.title + exp.company + exp.location + exp.period.start}
            className={`break-inside-avoid space-y-2 ${
              hideBullets
                ? ""
                : "not-last:border-b border-neutral-300 not-last:pb-4"
            }`}
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
            {exp.achievements.length > 0 && !exp.isPrevious && !hideBullets && (
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
