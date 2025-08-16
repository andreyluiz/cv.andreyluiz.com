"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getResume } from "@/lib/server/actions";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import ContactInfo from "./ContactInfo";
import Controls from "./Controls";
import Education from "./Education";
import Experience from "./Experience";
import GeneralSkills from "./GeneralSkills";
import Header from "./Header";
import Languages from "./Languages";
import Projects from "./Projects";
import Publications from "./Publications";
import Skills from "./Skills";
import TwoColumnLayout from "./TwoColumnLayout";

interface Props {
  initialResume: Variant;
}

// Custom hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

export default function ResumeContent({ initialResume }: Props) {
  const [currentResume, setCurrentResume] = useState<Variant>(initialResume);
  const { layoutMode } = useStore();
  const isMobile = useIsMobile();

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
    qualities,
    projects,
    generalSkills,
  } = currentResume;

  const renderSingleColumnLayout = () => (
    <>
      <Header
        name={name}
        title={title}
        summary={summary}
        qualities={qualities}
      />
      <ContactInfo contactInfo={contactInfo} />
      <GeneralSkills skills={generalSkills} />
      <Experience experience={experience} />
      <Skills skills={skills} />
      <Education education={certifications.concat(education)} />
      <Projects projects={projects} />
      <Publications publications={publications} />
      <Languages languages={languages} />
    </>
  );

  return (
    <main className="mx-auto max-w-[210mm] w-[210mm] space-y-6 bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 p-[10mm] print:p-0">
      <Controls
        currentResume={currentResume}
        setCurrentResume={setCurrentResume}
      />
      <hr className="border-neutral-200 dark:border-neutral-700 print:hidden" />

      {layoutMode === "two-column" && !isMobile ? (
        <TwoColumnLayout resumeData={currentResume} />
      ) : (
        renderSingleColumnLayout()
      )}
    </main>
  );
}
