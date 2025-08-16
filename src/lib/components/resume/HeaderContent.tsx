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
      <div className="flex items-baseline justify-center md:justify-start print:justify-start">
        <Title
          tag="h1"
          className="text-2xl md:text-3xl print:text-lg print:font-bold"
        >
          {name}
        </Title>
        <Title
          tag="h2"
          className="mx-2 !text-neutral-600 text-xl md:text-2xl print:text-sm print:mx-1"
        >
          -
        </Title>
        <Title
          tag="h2"
          className="text-xl md:text-2xl print:text-base print:font-semibold"
        >
          {title}
        </Title>
      </div>
      <div className="mt-4 text-sm md:text-base print:mt-2 print:text-xs print:leading-tight">
        {summary}
      </div>

      <ul className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 print:justify-start print:gap-2 print:mt-2">
        {qualities.map((quality) => (
          <li
            className="first:before:content-none before:content-['•'] before:mr-3 before:inline-block font-bold text-sm md:text-base print:text-xs print:before:mr-2"
            key={quality}
          >
            {quality}
          </li>
        ))}
      </ul>
    </div>
  );
}
