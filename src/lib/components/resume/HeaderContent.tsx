import Title from "@/lib/components/ui/Title";
import { useStore } from "@/lib/store";
import Qualities from "./Qualities";

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
  const { layoutMode } = useStore();
  const isTwoColumn = layoutMode === "two-column";

  return (
    <div className="flex-1">
      <div
        className={
          isTwoColumn
            ? "flex flex-col items-center md:items-start print:items-start"
            : "flex items-baseline justify-center md:justify-start print:justify-start"
        }
      >
        <Title tag="h1" className="print:font-bold">
          {name}
        </Title>
        {!isTwoColumn && (
          <Title tag="h2" className="mx-2 !text-neutral-600 print:mx-1">
            -
          </Title>
        )}
        <Title tag="h2" className="print:font-semibold">
          {title}
        </Title>
      </div>
      <div className="mt-4 text-justify print:mt-2 print:leading-tight">
        {summary}
      </div>

      {!isTwoColumn && <Qualities qualities={qualities} />}
    </div>
  );
}
