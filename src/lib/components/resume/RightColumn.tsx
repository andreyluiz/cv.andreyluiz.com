import type { Variant } from "@/lib/types";
import HeaderContent from "./HeaderContent";
import GeneralSkills from "./GeneralSkills";
import Experience from "./Experience";
import Skills from "./Skills";
import Education from "./Education";
import Projects from "./Projects";
import Publications from "./Publications";

interface RightColumnProps {
  resumeData: Variant;
}

export default function RightColumn({ resumeData }: RightColumnProps) {
  const {
    name,
    title,
    summary,
    qualities,
    generalSkills,
    experience,
    skills,
    education,
    certifications,
    projects,
    publications,
  } = resumeData;

  return (
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
  );
}