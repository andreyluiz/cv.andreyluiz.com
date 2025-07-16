import { useTranslations } from "next-intl";
import { Section } from "../ui/Section";

interface Props {
  skills: string[];
}

export default function GeneralSkills({ skills }: Props) {
  const t = useTranslations("resume.generalSkills");

  return (
    <Section title={t("title")}>
      <ul className="list-disc list-outisde ml-4">
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </Section>
  );
}