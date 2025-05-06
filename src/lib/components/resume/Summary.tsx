import Title from "@/lib/components/ui/Title";
import { useTranslations } from "next-intl";

interface Props {
  summary: string;
}

export default function Summary({ summary }: Props) {
  const t = useTranslations("resume.summary");

  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {t("title")}
      </Title>
      <p>{summary}</p>
    </section>
  );
}
