"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { langsOptions } from "@/lib/lang";
import { getResume } from "@/lib/server/actions";
import type { Variant } from "@/lib/types";
import Select from "../ui/Select";
import Break from "./Break";
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

  return (
    <main className="mx-auto max-w-4xl space-y-8 print:space-y-3 bg-white p-12 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 print:p-0">
      <div className="flex justify-between items-center gap-4">
        {hasTailoringFeature && (
          <ResumeTailor
            resumeData={currentResume}
            onResumeUpdate={setCurrentResume}
          />
        )}
        <Select
          className="print:hidden"
          options={langsOptions}
          value={locale as string}
          onChange={handleLangChange}
        />
      </div>
      <Header name={name} title={title} contactInfo={contactInfo} />
      <Summary summary={summary} />
      <Skills skills={skills} />
      <Experience experience={experience} />
      <Break breaks={breaks} />
      <Certifications certifications={certifications} />
      <Education education={education} />
      <Projects projects={projects} />
      <Publications publications={publications} />
      <Languages languages={languages} />
    </main>
  );
}
