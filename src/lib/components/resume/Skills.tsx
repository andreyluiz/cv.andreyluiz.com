import Title from "@/lib/components/ui/Title";
import { Variant } from "@/lib/types";
import { useTranslations } from "next-intl";

interface Props {
  skills: Variant["skills"];
}

export default function Skills({ skills }: Props) {
  const t = useTranslations("resume.skills");

  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <ul className="list-inside list-none dark:text-neutral-300">
        {skills.map((skill) => (
          <li
            key={skill.domain}
            className="leading-relaxed print:leading-normal"
          >
            - <span className="font-bold">{skill.domain}:</span>{" "}
            <span className="text-neutral-600 dark:text-neutral-400">
              {skill.skills?.join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
