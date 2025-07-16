import { useTranslations } from "next-intl";
import { Section } from "../ui/Section";

interface Props {
  traits: string[];
}

export default function PersonalityTraits({ traits }: Props) {
  const t = useTranslations("resume.personalityTraits");

  return (
    <Section title={t("title")}>
      <ul className="grid grid-cols-3 list-disc list-outside ml-4">
        {traits.map((trait) => (
          <li key={trait}>{trait}</li>
        ))}
      </ul>
    </Section>
  );
}
