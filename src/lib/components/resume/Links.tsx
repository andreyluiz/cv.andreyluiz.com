import { useTranslations } from "next-intl";
import { Fragment } from "react";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  links: Variant["links"];
}

export default function Links({ links }: Props) {
  const t = useTranslations("resume.links");

  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <ul className="grid grid-cols-[auto_1fr] gap-x-24">
        {links.map((link) => (
          <Fragment key={link.name}>
            <div className="w-16">
              <span className="font-bold">{link.name}:</span>
            </div>
            <div>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </div>
          </Fragment>
        ))}
      </ul>
    </section>
  );
}
