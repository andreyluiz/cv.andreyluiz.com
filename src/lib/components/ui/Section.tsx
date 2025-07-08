import Title from "./Title";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Section = ({ title, children, className }: SectionProps) => {
  return (
    <section className={className}>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        {title}
      </Title>
      {children}
    </section>
  );
};
