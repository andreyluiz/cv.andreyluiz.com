"use client";

import { useEffect, useState } from "react";
import { Variant } from "../types";
import ResumeTailor from "./ResumeTailor";
import Title from "./Title";

interface Props {
  initialResume: Variant;
}

export default function ResumeContent({ initialResume }: Props) {
  const [currentResume, setCurrentResume] = useState<Variant>(initialResume);
  const [hasTailoringFeature, setHasTailoringFeature] = useState(false);

  useEffect(() => {
    setHasTailoringFeature(
      localStorage.getItem("tailoring") === "true" ||
        process.env.NODE_ENV === "development"
    );
  }, []);

  const {
    name,
    title,
    contactInfo,
    skills,
    experience,
    education,
    certifications,
    languages,
    publications,
    summary,
  } = currentResume;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 bg-white p-12 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 print:p-0">
      {hasTailoringFeature && (
        <ResumeTailor
          resumeData={currentResume}
          onResumeUpdate={setCurrentResume}
        />
      )}
      {/* Header section */}
      <header>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline">
            <Title tag="h1">{name}</Title>
            <Title tag="h2" className="mx-2 !text-neutral-600">
              -
            </Title>
            <Title tag="h2">{title}</Title>
          </div>
        </div>
        <table className="mt-4 w-full">
          <tbody>
            <tr className="mb-2">
              <td className="w-24 pr-2">
                <span className="font-bold">Email:</span>
              </td>
              <td className="pr-6">{contactInfo.email}</td>
              <td className="w-24 pr-2">
                <span className="font-bold">Phone:</span>
              </td>
              <td>{contactInfo.phone}</td>
            </tr>
            <tr className="my-2">
              <td className="w-24 pr-2">
                <span className="font-bold">Location:</span>
              </td>
              <td className="pr-6">{contactInfo.location}</td>
              <td className="w-24 pr-2">
                <span className="font-bold">Website:</span>
              </td>
              <td>{contactInfo.website}</td>
            </tr>
            <tr className="mt-2">
              <td className="w-24 pr-2">
                <span className="font-bold">LinkedIn:</span>
              </td>
              <td className="pr-6">{contactInfo.linkedin}</td>
              <td className="w-24 pr-2">
                <span className="font-bold">Available:</span>
              </td>
              <td>Immediately</td>
            </tr>
          </tbody>
        </table>
      </header>

      {/* Summary section */}
      <section>
        <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
          Summary
        </Title>
        <p>{summary}</p>
      </section>

      {/* Skills section */}
      <section>
        <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
          Core Skills
        </Title>
        <ul className="list-inside list-none dark:text-neutral-300">
          {skills.map((skill) => (
            <li
              key={skill.domain}
              className="leading-relaxed print:leading-normal"
            >
              - <span className="font-bold">{skill.domain}:</span>{" "}
              <span className="text-neutral-600 dark:text-neutral-400">
                {skill.skills?.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Professional Experience */}
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

      {/* Certifications */}
      {certifications?.length > 0 && (
        <section className="break-inside-avoid">
          <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
            Certifications
          </Title>
          <div className="flex flex-col gap-4 print:gap-2">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="border-b border-neutral-200 pb-4 last:border-b-0"
              >
                <div className="flex flex-col gap-1">
                  <Title tag="h3">{cert.degree}</Title>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {cert.year}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {cert.institution} - {cert.location}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      <section className="break-inside-avoid">
        <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
          Education
        </Title>
        <div className="flex flex-col gap-4 print:gap-2">
          {education.map((edu, index) => (
            <div
              key={index}
              className="border-b border-neutral-200 pb-4 last:border-b-0"
            >
              <div className="flex flex-col gap-1">
                <Title tag="h3">{edu.degree}</Title>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {edu.year}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                {edu.institution} - {edu.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Publications */}
      {publications?.length > 0 && (
        <section className="break-inside-avoid">
          <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
            Publications
          </Title>
          <div className="flex flex-col gap-4 print:gap-2">
            {publications.map((pub, index) => (
              <div
                key={index}
                className="border-b border-neutral-300 pb-4 last:border-b-0"
              >
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 print:text-neutral-600"
                >
                  <span>
                    {pub.title} - {pub.location}
                  </span>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      <section className="break-inside-avoid">
        <Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
          Languages
        </Title>
        <div className="grid grid-cols-4 gap-4 print:gap-2">
          {languages.map((language, index) => (
            <div key={index}>
              <p className="font-bold">{language.name}</p>
              <p className="text-neutral-600 dark:text-neutral-400">
                {language.level}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
