import { useStore } from "@/lib/store";

interface QualitiesProps {
  qualities: string[];
}

export default function Qualities({ qualities }: QualitiesProps) {
  const { layoutMode } = useStore();
  const isTwoColumn = layoutMode === "two-column";

  if (isTwoColumn) {
    return (
      <div className="flex flex-col gap-2">
        {qualities.map((quality) => (
          <div className="font-bold text-left" key={quality}>
            • {quality}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 print:justify-start print:gap-2 print:mt-2">
      {qualities.map((quality) => (
        <li
          className="first:before:content-none before:content-['•'] before:mr-3 before:inline-block font-bold print:before:mr-2"
          key={quality}
        >
          {quality}
        </li>
      ))}
    </ul>
  );
}
