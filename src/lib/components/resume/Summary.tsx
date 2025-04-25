import Title from "@/lib/components/ui/Title";

interface Props {
  summary: string;
}

export default function Summary({ summary }: Props) {
  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        Summary
      </Title>
      <p>{summary}</p>
    </section>
  );
}
