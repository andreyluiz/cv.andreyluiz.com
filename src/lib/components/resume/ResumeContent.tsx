"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { langsOptions } from "@/lib/lang";
import { getResume } from "@/lib/server/actions";
import type { Variant } from "@/lib/types";
import Select from "../ui/Select";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import Break from "./Break";
import Certifications from "./Certifications";
import ContactInfo from "./ContactInfo";
import Education from "./Education";
import Experience from "./Experience";
import Header from "./Header";
import Languages from "./Languages";
import PreviousExperience from "./PreviousExperience";
import Projects from "./Projects";
import Publications from "./Publications";
import ResumeTailor from "./ResumeTailor";
import Skills from "./Skills";

interface Props {
  initialResume: Variant;
}

export default function ResumeContent({ initialResume }: Props) {
  const [currentResume, setCurrentResume] = useState<Variant>(initialResume);
  const [hasTailoringFeature, setHasTailoringFeature] = useState(false);
  const { locale } = useParams();
  const router = useRouter();

  const fetchResume = useCallback(async (lang: string) => {
    const resume = await getResume(lang);
    setCurrentResume(resume);
  }, []);

  useEffect(() => {
    setHasTailoringFeature(
      localStorage.getItem("tailoring") === "true" ||
        process.env.NODE_ENV === "development",
    );
  }, []);

  useEffect(() => {
    fetchResume(locale as string);
  }, [locale, fetchResume]);

  const handleLangChange = (locale: string) => {
    router.replace("/", { locale });
  };

  const {
    name,
    title,
    contactInfo,
    skills,
    experience,
    breaks,
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
      <div className="flex justify-between items-center gap-4 print:hidden">
        {hasTailoringFeature && (
          <ResumeTailor
            resumeData={currentResume}
            onResumeUpdate={setCurrentResume}
          />
        )}
        <div className="flex items-center justify-center gap-2">
          <Select
            options={langsOptions}
            value={locale as string}
            onChange={handleLangChange}
          />
          <ThemeSwitcher />
        </div>
      </div>
      <Header name={name} title={title} summary={summary} />
      <ContactInfo contactInfo={contactInfo} />
      <Skills skills={skills} />
      <Experience experience={recentExperiences} />
      {previousExperiences.length && <PreviousExperience experience={previousExperiences} />}
      <Break breaks={breaks} />
      <Certifications certifications={certifications} />
      <Education education={education} />
      <Projects projects={projects} />
      <Publications publications={publications} />
      <Languages languages={languages} />
    </main>
  );
}
