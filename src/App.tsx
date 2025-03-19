import Title from "./components/Title";
import data from "./variants/fullstack.json";
import { Variant } from "./variants/types";

function App() {
  const {
    personalInfo,
    skills,
    experience,
    education,
    languages,
    publications,
    summary,
  } = data as Variant;

  return (
    <main className="flex flex-col gap-8 print:gap-4 max-w-4xl mx-auto p-12 print:p-0 bg-white dark:bg-neutral-900 print:text-sm text-neutral-800 dark:text-neutral-200">
      {/* Header section */}
      <section>
        <div className="flex items-baseline">
          <Title tag="h1">{personalInfo.name}</Title>
          <span className="text-neutral-600 mx-2">•</span>
          <Title tag="h2">{personalInfo.title}</Title>
        </div>
        <div className="mt-2 print:mt-1 print:gap-2 print:text-xs grid grid-cols-2">
          <p>Email: {personalInfo.email}</p>
          <p>Phone: {personalInfo.phone}</p>
          <p>Location: {personalInfo.location}</p>
          <p>Website: {personalInfo.website}</p>
          <p>LinkedIn: {personalInfo.linkedin}</p>
          <p>Available: Immediately</p>
        </div>
      </section>

      {/* Summary section */}
      <section>
        <Title
          tag="h2"
          className="border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2"
        >
          Summary
        </Title>
        <p className="print:text-xs">{summary}</p>
      </section>

      {/* Skills section */}
      <section>
        <Title
          tag="h2"
          className="border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2"
        >
          Core Skills
        </Title>
        <ul className="bg-neutral-50 dark:bg-neutral-800 rounded-lg list-none list-inside text-neutral-700 dark:text-neutral-300 py-3 print:py-2 print:text-xs">
          {skills.map(([category, skills]) => (
            <li key={category} className="leading-relaxed print:leading-normal">
              - <span className="font-bold">{category}</span>:{" "}
              {Array.isArray(skills) ? skills.join(", ") : skills}
            </li>
          ))}
        </ul>
      </section>

      {/* Professional Experience */}
      <section>
        <Title
          tag="h2"
          className="border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2"
        >
          Professional Experience
        </Title>
        <div className="space-y-6 print:space-y-3 print:text-sm">
          {experience.map((exp, index) => (
            <div
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-lg break-inside-avoid"
            >
              <div className="py-3 print:py-2 flex flex-col gap-2 print:gap-1 border-b border-neutral-200">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    <Title tag="h3" className="font-medium  inline">
                      {exp.company}
                    </Title>
                    &nbsp;- {exp.title} - {exp.location}
                  </span>
                </div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm print:text-xs">
                  {exp.period.start} - {exp.period.end}
                </div>
              </div>
              {exp.achievements.length > 0 && (
                <ul className="list-none list-inside text-neutral-700 dark:text-neutral-300 py-3 print:py-2 print:text-xs">
                  {exp.achievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="leading-relaxed print:leading-normal"
                    >
                      - {achievement}
                    </li>
                  ))}
                </ul>
              )}
              {exp.techStack.length > 0 && (
                <div className="flex items-baseline py-3 print:py-2">
                  <span className="font-medium ">Tech Stack:</span>&nbsp;
                  <span className="leading-relaxed print:leading-normal">
                    {exp.techStack.join(", ")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Education & Certifications */}
      <section className="break-inside-avoid">
        <Title
          tag="h2"
          className="border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2"
        >
          Education & Certifications
        </Title>
        <div className="space-y-4 print:space-y-2 print:text-sm">
          {education.map((edu, index) => (
            <div
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 py-3 print:py-2 rounded-lg"
            >
              <div className="flex flex-col gap-1">
                <Title tag="h3">{edu.degree}</Title>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {edu.year}
                </span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mt-1 print:text-xs">
                {edu.institution} - {edu.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Publications */}
      <section className="break-inside-avoid">
        <Title
          tag="h2"
          className="border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2"
        >
          Publications
        </Title>
        <div className="space-y-2 print:text-sm">
          {publications.map((pub, index) => (
            <div
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 py-3 print:py-2 rounded-lg"
            >
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline print:text-neutral-600"
              >
                {pub.title} - {pub.location}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="break-inside-avoid">
        <Title tag="h2">Languages</Title>
        <div className="grid grid-cols-2 gap-4 print:gap-2 print:text-sm">
          {languages.map((language, index) => (
            <div
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 py-3 print:py-2 rounded-lg"
            >
              <p className="font-medium ">{language.name}</p>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm print:text-xs">
                {language.level}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
