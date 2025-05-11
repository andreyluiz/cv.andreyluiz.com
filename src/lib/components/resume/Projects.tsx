import { Variant } from "@/lib/types";
import { useTranslations } from "next-intl";
import Title from "../ui/Title";

interface Props {
  projects: Variant["projects"];
}

export default function Projects({ projects }: Props) {
  const t = useTranslations("resume.projects");

  if (!projects || projects.length === 0) return null;

  return (
    <section className="break-inside-avoid">
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="flex flex-col gap-4 print:gap-2">
        {projects.map((project, index) => (
          <div
            key={index}
            className="border-b border-neutral-200 pb-4 last:border-b-0"
          >
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold">{project.name}</span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {project.period.start} - {project.period.end}
                </p>
              </div>
              <span className="text-neutral-600 dark:text-neutral-400 py-2">
                {project.description}
              </span>
            </div>
            {project.techStack.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold">{t("tech_stack")}:</span>&nbsp;
                <span className="text-neutral-600 dark:text-neutral-400">
                  {project.techStack.join(", ")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
