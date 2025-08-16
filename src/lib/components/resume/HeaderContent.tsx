import Title from "@/lib/components/ui/Title";

interface HeaderContentProps {
  name: string;
  title: string;
  summary: string;
  qualities: string[];
}

export default function HeaderContent({
  name,
  title,
  summary,
  qualities,
}: HeaderContentProps) {
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-center md:justify-start">
        <Title tag="h1" className="text-2xl md:text-3xl">
          {name}
        </Title>
        <Title tag="h2" className="mx-2 !text-neutral-600 text-xl md:text-2xl">
          -
        </Title>
        <Title tag="h2" className="text-xl md:text-2xl">
          {title}
        </Title>
      </div>
      <div className="mt-4 text-sm md:text-base">{summary}</div>

      <ul className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
        {qualities.map((quality) => (
          <li
            className="first:before:content-none before:content-['•'] before:mr-3 before:inline-block font-bold text-sm md:text-base"
            key={quality}
          >
            {quality}
          </li>
        ))}
      </ul>
    </div>
  );
}
