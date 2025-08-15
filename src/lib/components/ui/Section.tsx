import Title from "./Title";

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
  return (
    <section className={className}>
      {titleContent ? (
        <div className="mb-4 border-b-2 border-neutral-300 pb-2">
          {titleContent}
        </div>
      ) : (
        <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
          {title}
        </Title>
      )}
      {children}
    </section>
  );
};
