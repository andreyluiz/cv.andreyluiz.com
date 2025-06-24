import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  skills: Variant["skills"];
}

export default function Skills({ skills }: Props) {
  const t = useTranslations("resume.skills");

  if (!skills || !skills.length) {
    return null;
  }

  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <ul className="list-disc ml-4 dark:text-neutral-300">
        {skills.map((skill) => (
          <li
            key={skill.domain}
            className="leading-relaxed print:leading-normal"
          >
            <span className="font-bold">{skill.domain}:</span>{" "}
            <span className="text-neutral-600 dark:text-neutral-400">
              {skill.skills?.join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
