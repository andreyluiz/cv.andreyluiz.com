"use client";

import type { Variant } from "@/lib/types";
import ContactInfo from "./ContactInfo";
import Education from "./Education";
import Experience from "./Experience";
import GeneralSkills from "./GeneralSkills";
import HeaderContent from "./HeaderContent";
import Languages from "./Languages";
import ProfileImage from "./ProfileImage";
import Projects from "./Projects";
import Publications from "./Publications";
import Qualities from "./Qualities";
import Skills from "./Skills";

interface TwoColumnLayoutProps {
  resumeData: Variant;
}

export default function TwoColumnLayout({ resumeData }: TwoColumnLayoutProps) {
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
  } = resumeData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_2fr] gap-6 md:gap-8 items-start print:grid-cols-[200px_1fr] print:gap-4 print:text-xs print:leading-tight touch-pan-y">
      {/* Left Column - Personal Information */}
      <div className="flex flex-col gap-6 min-w-0 print:gap-3 print:break-inside-avoid">
        <div className="print:break-inside-avoid">
          <ProfileImage />
        </div>
        <div className="print:break-inside-avoid">
          <Qualities qualities={qualities} />
        </div>
        <div className="print:break-inside-avoid">
          <ContactInfo contactInfo={contactInfo} />
        </div>
        <div className="print:break-inside-avoid">
          <Languages languages={languages} />
        </div>
      </div>

      {/* Right Column - Professional Content */}
      <div className="flex flex-col gap-6 min-w-0 print:gap-3">
        <div className="print:break-inside-avoid">
          <HeaderContent
            name={name}
            title={title}
            summary={summary}
            qualities={qualities}
          />
        </div>
        <div className="print:break-inside-avoid-page">
          <GeneralSkills skills={generalSkills} />
        </div>
        <div className="print:break-inside-avoid-page">
          <Experience experience={experience} />
        </div>
        <div className="print:break-inside-avoid-page">
          <Skills skills={skills} />
        </div>
        <div className="print:break-inside-avoid-page">
          <Education education={certifications.concat(education)} />
        </div>
        <div className="print:break-inside-avoid-page">
          <Projects projects={projects} />
        </div>
        <div className="print:break-inside-avoid-page">
          <Publications publications={publications} />
        </div>
      </div>
    </div>
  );
}
