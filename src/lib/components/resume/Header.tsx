import Image from "next/image";
import Title from "@/lib/components/ui/Title";

interface Props {
  name: string;
  title: string;
  summary: string;
  qualities: string[];
}

export default function Header({ name, title, summary, qualities }: Props) {
  return (
    <header className="flex items-center justify-between gap-8">
      <Image
        src="/profile.png"
        alt="Profile Picture"
        width={150}
        height={150}
        className="rounded-full"
      />
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

        <ul className="flex flex-wrap gap-3 mt-4">
          {qualities.map((quality) => (
            <li
              className="first:before:content-none before:content-['•'] before:mr-3 before:inline-block"
              key={quality}
            >
              {quality}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
