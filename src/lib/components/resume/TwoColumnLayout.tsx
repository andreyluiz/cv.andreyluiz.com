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
    <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_2fr] gap-6 md:gap-8 items-start print:grid-cols-[1fr_2fr] print:gap-4">
      {/* Left Column - Personal Information */}
      <div className="flex flex-col gap-6">
        <ProfileImage />
        <ContactInfo contactInfo={contactInfo} />
        <Languages languages={languages} />
      </div>

      {/* Right Column - Professional Content */}
      <div className="flex flex-col gap-6">
        <HeaderContent
          name={name}
          title={title}
          summary={summary}
          qualities={qualities}
        />
        <GeneralSkills skills={generalSkills} />
        <Experience experience={experience} />
        <Skills skills={skills} />
        <Education education={certifications.concat(education)} />
        <Projects projects={projects} />
        <Publications publications={publications} />
      </div>
    </div>
  );
}