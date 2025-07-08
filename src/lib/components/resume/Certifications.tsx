import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
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
            key={cert.degree}
            className="not-last:border-b border-neutral-200 not-last:pb-4"
          >
            <div className="flex flex-col gap-1">
              <span className="font-bold">{cert.degree}</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {cert.institution} - {cert.location} - {cert.year}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
