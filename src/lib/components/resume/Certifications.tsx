import { useTranslations } from "next-intl";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  certifications: Variant["certifications"];
}

export default function Certifications({ certifications }: Props) {
  const t = useTranslations("resume.certifications");

  if (!certifications?.length) return null;

  return (
    <Section title={t("title")}>
      <div className="flex flex-col gap-2">
        {certifications.map((cert) => (
          <div
            className="flex items-baseline justify-between gap-1"
            key={cert.degree + cert.institution + cert.location + cert.year}
          >
            <div className="flex items-baseline gap-0.5">
              <span>
                <span className="font-bold">{cert.degree}</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  &nbsp;- {cert.institution}, {cert.location}
                </span>
              </span>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400">
              {cert.year}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
