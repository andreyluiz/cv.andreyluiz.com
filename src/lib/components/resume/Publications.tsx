import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  publications: Variant["publications"];
}

export default function Publications({ publications }: Props) {
  const t = useTranslations("resume.publications");

  if (!publications?.length) return null;

  return (
    <section className="break-inside-avoid">
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <div className="flex flex-col gap-4 print:gap-2">
        {publications.map((pub) => (
          <div
            key={pub.title}
            className="border-b border-neutral-300 pb-4 last:border-b-0"
          >
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 print:text-neutral-600"
            >
              <span>
                {pub.title} - {pub.location}
              </span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
