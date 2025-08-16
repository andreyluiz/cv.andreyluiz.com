import HeaderContent from "./HeaderContent";
import ProfileImage from "./ProfileImage";

interface Props {
  name: string;
  title: string;
  summary: string;
  qualities: string[];
}

export default function Header({ name, title, summary, qualities }: Props) {
  return (
    <header className="flex items-center justify-between gap-8">
      <ProfileImage />
      <HeaderContent
        name={name}
        title={title}
        summary={summary}
        qualities={qualities}
      />
    </header>
  );
}
