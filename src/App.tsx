import { useMemo, useState } from 'react';
import frontendData from './variants/frontend.json';
import fullstackData from './variants/fullstack.json';
import { Experience, Variant } from './variants/types';
import web3Data from './variants/web3.json';

enum VariantName {
  Frontend = 'frontend',
  Web3 = 'web3',
  FullStack = 'fullstack',
}

function App() {
  const [variant, setVariant] = useState<VariantName>(VariantName.Frontend);
  const [variants] = useState<{ [key in VariantName]: Variant }>({
    [VariantName.Frontend]: frontendData,
    [VariantName.Web3]: web3Data,
    [VariantName.FullStack]: fullstackData
  });
  const { 
    personalInfo, 
    summary,
    skills, 
    experience,
    projects, 
    education, 
    languages,
    publications
  } = useMemo(() => variants[variant], [variant, variants]);


  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVariant(e.target.value as VariantName);
  };

  const recentExperiences = experience.filter((exp: Experience) => 
    new Date(exp.period.start).getFullYear() >= 2020
  )
  const previousExperiences = experience.filter((exp: Experience) => 
    new Date(exp.period.start).getFullYear() < 2020
  )


  return (
    <div className="max-w-4xl mx-auto p-12 bg-white dark:bg-neutral-900 print:text-sm">
      {/* Header Section */}
      <header className="mb-8 print:mb-4">
        <div className="flex items-baseline">
          <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100 print:text-2xl">
            {personalInfo.name}
          </h1>
          <span className="text-neutral-600 mx-2">•</span>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 print:text-lg">
            {personalInfo.title}
          </h2>
          <select onChange={handleVariantChange} className="bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg ml-auto print:hidden text-neutral-800 dark:text-neutral-100">
            <option value="frontend">Frontend</option>
            <option value="web3">Web3</option>
            <option value="fullstack">Fullstack</option>
          </select>
        </div>
        <div className="text-neutral-600 dark:text-neutral-400 mt-2 print:mt-1 flex flex-wrap justify-between gap-4 print:gap-2 print:text-xs">
          <p>📧 {personalInfo.email}</p>
          <p>📞 {personalInfo.phone}</p>
          <p>📍 {personalInfo.location}</p>
          <p>🌐 {personalInfo.website}</p>
          <p>🔗 {personalInfo.linkedin}</p>
        </div>
      </header>

      {/* Summary Section */}
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Professional Summary
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-justify print:text-sm">{summary}</p>
      </section>

      {/* Skills Section */}
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Core Skills
        </h2>
        <div className="grid grid-cols-2 gap-6 print:gap-4">
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 print:p-3 rounded-lg">
            <h3 className="font-semibold mb-3 print:mb-2 text-neutral-800 dark:text-neutral-100 print:text-base">
              Programming Languages
            </h3>
            <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-1 print:space-y-0.5 print:text-xs">
              {skills.programmingLanguages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 print:p-3 rounded-lg">
            <h3 className="font-semibold mb-3 print:mb-2 text-neutral-800 dark:text-neutral-100 print:text-base">
              Technologies
            </h3>
            <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-1 print:space-y-0.5 print:text-xs">
              {skills.technologies.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recent Professional Experience */}
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Professional Experience
        </h2>
        <div className="space-y-6 print:space-y-3 print:text-sm">
          {recentExperiences.map((exp, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="p-3 print:p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:gap-1 border-b border-neutral-200">
                <div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-100">
                    {exp.company}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 mx-2">•</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{exp.title}</span>
                  <span className="text-neutral-600 dark:text-neutral-400 mx-2">•</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{exp.location}</span>
                </div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm print:text-xs">
                  {exp.period.start} - {exp.period.end}
                </div>
              </div>
              {exp.achievements.length > 0 && (
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 p-3 print:p-2 space-y-1 print:space-y-0.5 print:text-xs">
                  {exp.achievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="leading-relaxed print:leading-normal"
                    >
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Previous Experience */}
      <section className="mb-8 print:mb-4 print:pt-14 print:break-before-page">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Previous Experience
        </h2>
        <div className="grid grid-cols-1 gap-2 print:gap-1 print:text-sm">
          {previousExperiences.map((exp, index) => (
            <div
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800 p-3 print:p-2 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:gap-1"
            >
              <div>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{exp.company}</span>
                <span className="text-neutral-600 dark:text-neutral-400 mx-2">•</span>
                <span className="text-neutral-700 dark:text-neutral-300">{exp.title}</span>
                <span className="text-neutral-600 dark:text-neutral-400 mx-2">•</span>
                <span className="text-neutral-700 dark:text-neutral-300">{exp.location}</span>
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm print:text-xs">
                {exp.period.start} - {exp.period.end}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Notable Projects
        </h2>
        <div className="grid grid-cols-1 gap-4 print:gap-2 print:text-sm">
          {projects.map((project, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-800 p-4 print:p-3 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2 print:text-base">
                {project.name}
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300 print:text-xs">{project.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Certifications */}
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Education & Certifications
        </h2>
        <div className="space-y-4 print:space-y-2 print:text-sm">
          {education.map((edu, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-800 p-3 print:p-2 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 print:text-base">
                  {edu.degree}
                </h3>
                <span className="text-neutral-600 dark:text-neutral-400">{edu.year}</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mt-1 print:text-xs">{edu.institution} - {edu.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Publications */}
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Publications
        </h2>
        <div className="space-y-2 print:text-sm">
          {publications.map((pub, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-800 p-3 print:p-2 rounded-lg">
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
      <section className="mb-8 print:mb-4">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 border-b-2 border-neutral-300 pb-2 mb-3 print:mb-2 print:text-lg">
          Languages
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:gap-2 print:text-sm">
          {languages.map((language, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-800 p-3 print:p-2 rounded-lg">
              <p className="font-medium text-neutral-800 dark:text-neutral-100">{language.name}</p>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm print:text-xs">{language.level}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Print Source */}
      <div className="hidden print:block mt-6 pt-3 text-center text-neutral-400 dark:text-neutral-600 text-xs border-t border-neutral-200">
        This CV was generated with <a href="https://cv.andreyluiz.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline">cv.andreyluiz.com</a>
      </div>
    </div>
  );
}

export default App
