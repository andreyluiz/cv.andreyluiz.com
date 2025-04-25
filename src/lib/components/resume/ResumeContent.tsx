"use client";

import { Variant } from "@/lib/types";
import { useEffect, useState } from "react";
import Certifications from "./Certifications";
import Education from "./Education";
import Experience from "./Experience";
import Header from "./Header";
import Languages from "./Languages";
import Projects from "./Projects";
import Publications from "./Publications";
import ResumeTailor from "./ResumeTailor";
import Skills from "./Skills";
import Summary from "./Summary";

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
    projects,
  } = currentResume;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 bg-white p-12 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 print:p-0">
      {hasTailoringFeature && (
        <ResumeTailor
          resumeData={currentResume}
          onResumeUpdate={setCurrentResume}
        />
      )}
      <Header name={name} title={title} contactInfo={contactInfo} />
      <Summary summary={summary} />
      <Skills skills={skills} />
      <Experience experience={experience} />
      <Certifications certifications={certifications} />
      <Education education={education} />
      <Projects projects={projects} />
      <Publications publications={publications} />
      <Languages languages={languages} />
    </main>
  );
}
