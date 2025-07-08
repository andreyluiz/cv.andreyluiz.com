import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  publications: Variant["publications"];
}

export default function Publications({ publications }: Props) {
  const t = useTranslations("resume.publications");

  if (!publications?.length) return null;

  return (
    <Section title={t("title")}>
      <div className="flex flex-col gap-2">
        {publications.map((pub) => (
          <div
            key={pub.title}
            className="not-last:border-b border-neutral-300 not-last:pb-4"
          >
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:text-blue-500 hover:underline dark:text-blue-400 text-neutral-600"
            >
              <span>
                {pub.title} - {pub.location}
              </span>
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
}
