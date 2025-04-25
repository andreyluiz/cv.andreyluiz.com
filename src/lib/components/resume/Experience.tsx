import Title from "@/lib/components/ui/Title";
import { Variant } from "@/lib/types";

interface Props {
  experience: Variant["experience"];
}

export default function Experience({ experience }: Props) {
  return (
    <section>
      <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
        Professional Experience
      </Title>
      <div className="flex flex-col gap-6 print:gap-4">
        {experience.map((exp, index) => (
          <div
            key={index}
            className="break-inside-avoid border-b border-neutral-300 pb-4 last:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-2 print:gap-1">
              <div className="flex items-baseline gap-0.5">
                <span>
                  <Title tag="h3" className="inline !text-lg">
                    {exp.title}
                  </Title>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    &nbsp;- {exp.company}, {exp.location}
                  </span>
                </span>
              </div>
              <span className="ml-auto">|</span>
              <div className="text-neutral-600 dark:text-neutral-400">
                {exp.period.start} - {exp.period.end}
              </div>
            </div>
            {exp.achievements.length > 0 && (
              <ul className="list-inside list-none py-4">
                {exp.achievements.map((achievement, i) => (
                  <li key={i} className="leading-relaxed print:leading-normal">
                    - {achievement}
                  </li>
                ))}
              </ul>
            )}
            {exp.techStack.length > 0 && (
              <div className="flex items-baseline">
                <span className="font-bold">Tech Stack:</span>&nbsp;
                <span className="text-neutral-600 dark:text-neutral-400">
                  {exp.techStack.join(", ")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
