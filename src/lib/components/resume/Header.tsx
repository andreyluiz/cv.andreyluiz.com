import Title from "@/lib/components/ui/Title";

interface Props {
  name: string;
  title: string;
  summary: string;
}

export default function Header({ name, title, summary }: Props) {
  return (
    <header className="flex items-center justify-between gap-8">
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline">
            <Title tag="h1">{name}</Title>
            <Title tag="h2" className="mx-2 !text-neutral-600">
              -
            </Title>
            <Title tag="h2">{title}</Title>
          </div>
        </div>
        <div className="mt-4">{summary}</div>
      </div>
    </header>
  );
}
