"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getResume } from "@/lib/server/actions";
import type { Variant } from "@/lib/types";
import Certifications from "./Certifications";
import ContactInfo from "./ContactInfo";
import Controls from "./Controls";
import Education from "./Education";
import Experience from "./Experience";
import Header from "./Header";
import Languages from "./Languages";
import PreviousExperience from "./PreviousExperience";
import Projects from "./Projects";
import Publications from "./Publications";
import Skills from "./Skills";

interface Props {
  initialResume: Variant;
}

export default function ResumeContent({ initialResume }: Props) {
  const [currentResume, setCurrentResume] = useState<Variant>(initialResume);

  const { locale } = useParams();

  const fetchResume = useCallback(async (lang: string) => {
    const resume = await getResume(lang);
    setCurrentResume(resume);
  }, []);

  useEffect(() => {
    fetchResume(locale as string);
  }, [locale, fetchResume]);

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

  const recentExperiences = experience.filter((exp) => !exp.isPrevious);
  const previousExperiences = experience.filter((exp) => exp.isPrevious);

  return (
    <main className="mx-auto max-w-[210mm] w-[210mm] space-y-6 bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 p-[10mm] print:p-0">
      <Controls
        currentResume={currentResume}
        setCurrentResume={setCurrentResume}
      />
      <Header name={name} title={title} summary={summary} />
      <ContactInfo contactInfo={contactInfo} />
      <Skills skills={skills} />
      <Experience experience={recentExperiences} />
      {previousExperiences.length ? (
        <PreviousExperience experience={previousExperiences} />
      ) : null}
      <Certifications certifications={certifications} />
      <Education education={education} />
      <Projects projects={projects} />
      <Publications publications={publications} />
      <Languages languages={languages} />
    </main>
  );
}
