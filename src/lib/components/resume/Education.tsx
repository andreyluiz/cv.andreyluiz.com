import Title from "@/lib/components/ui/Title";
import { Variant } from "@/lib/types";
import { useTranslations } from "next-intl";

interface Props {
  education: Variant["education"];
}

export default function Education({ education }: Props) {
  const t = useTranslations("resume.education");

  return (
    <section className="break-inside-avoid">
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="flex flex-col gap-4 print:gap-2">
        {education.map((edu, index) => (
          <div
            key={index}
            className="border-b border-neutral-200 pb-4 last:border-b-0"
          >
            <div className="flex flex-col gap-1">
              <Title tag="h3">{edu.degree}</Title>
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
