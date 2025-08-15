import Title from "@/lib/components/ui/Title";

interface HeaderContentProps {
  name: string;
  title: string;
  summary: string;
  qualities: string[];
}

export default function HeaderContent({ name, title, summary, qualities }: HeaderContentProps) {
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-center">
        <Title tag="h1">{name}</Title>
        <Title tag="h2" className="mx-2 !text-neutral-600">
          -
        </Title>
        <Title tag="h2">{title}</Title>
      </div>
      <div className="mt-4">{summary}</div>

      <ul className="flex flex-wrap justify-center gap-3 mt-4">
        {qualities.map((quality) => (
          <li
            className="first:before:content-none before:content-['•'] before:mr-3 before:inline-block font-bold"
            key={quality}
          >
            {quality}
          </li>
        ))}
      </ul>
    </div>
  );
}