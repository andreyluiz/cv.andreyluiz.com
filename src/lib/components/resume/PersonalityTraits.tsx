import { useTranslations } from "next-intl";
import { Section } from "../ui/Section";

interface Props {
  traits: string[];
}

export default function PersonalityTraits({ traits }: Props) {
  const t = useTranslations("resume.personalityTraits");

  return (
    <Section title={t("title")}>
      <ul className="list-disc list-inside">
        {traits.map((trait) => (
          <li key={trait}>{trait}</li>
        ))}
      </ul>
    </Section>
  );
}
