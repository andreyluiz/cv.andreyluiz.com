import Title from "./Title";
import { useId } from "react";

interface SectionProps {
  title?: string;
  titleContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Section = ({
  title,
  titleContent,
  children,
  className,
}: SectionProps) => {
  const headingId = useId();

  return (
    <section className={className} aria-labelledby={headingId}>
      {titleContent ? (
        <div className="mb-4 border-b-2 border-neutral-300 pb-2">
          {titleContent}
        </div>
      ) : (
        <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2" id={headingId}>
          {title}
        </Title>
      )}
      {children}
    </section>
  );
};
