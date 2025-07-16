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
import GeneralSkills from "./GeneralSkills";
import Header from "./Header";
import Languages from "./Languages";
import PersonalityTraits from "./PersonalityTraits";
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
    generalSkills,
    personalityTraits,
  } = currentResume;

  const recentExperiences = experience.filter((exp) => !exp.isPrevious);
  const previousExperiences = experience.filter((exp) => exp.isPrevious);

  return (
    <main className="mx-auto max-w-[210mm] w-[210mm] space-y-6 bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 p-[10mm] print:p-0">
      <Controls
        currentResume={currentResume}
        setCurrentResume={setCurrentResume}
      />
      <hr className="border-neutral-200 dark:border-neutral-700 print:hidden" />
      <Header name={name} title={title} summary={summary} />
      <ContactInfo contactInfo={contactInfo} />
      <GeneralSkills skills={generalSkills} />
      <Experience experience={recentExperiences} />
      {previousExperiences.length ? (
        <PreviousExperience experience={previousExperiences} />
      ) : null}
      <Skills skills={skills} />
      <Certifications certifications={certifications} />
      <Education education={education} />
      <Projects projects={projects} />
      <Publications publications={publications} />
      <PersonalityTraits traits={personalityTraits} />
      <Languages languages={languages} />
    </main>
  );
}
