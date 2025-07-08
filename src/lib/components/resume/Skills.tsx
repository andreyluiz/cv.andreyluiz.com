import { useTranslations } from "next-intl";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  skills: Variant["skills"];
}

export default function Skills({ skills }: Props) {
  const t = useTranslations("resume.skills");

  if (!skills || !skills.length) {
    return null;
  }

  return (
    <Section title={t("title")}>
      <ul className="list-disc ml-4 dark:text-neutral-300">
        {skills.map((skill) => (
          <li key={skill.domain} className="leading-normal">
            <span className="font-bold">{skill.domain}:</span>{" "}
            <span className="text-neutral-600 dark:text-neutral-400">
              {skill.skills?.join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
