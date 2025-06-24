import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  certifications: Variant["certifications"];
}

export default function Certifications({ certifications }: Props) {
  const t = useTranslations("resume.certifications");

  if (!certifications?.length) return null;

  return (
    <section className="break-inside-avoid">
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="flex flex-col gap-4 print:gap-2">
        {certifications.map((cert) => (
          <div
            key={cert.degree}
            className="border-b border-neutral-200 pb-4 last:border-b-0"
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
    </section>
  );
}
