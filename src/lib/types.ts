export interface Variant {
  name: string;
  title: string;
  contactInfo: ContactInfo;
  summary: string;
  generalSkills: string[];
  skills: SkillDomain[];
  experience: Experience[];
  projects?: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  publications: Publication[];
  personalityTraits: string[];
  changes: Change[];
}

export interface Change {
  field: string;
  change: string;
}

export interface SkillDomain {
  domain: string;
  skills: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  isPrevious?: boolean;
  period: {
    start: string;
    end: string;
  };
  achievements: string[];
  techStack: string[];
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  period: {
    start: string;
    end: string;
  };
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  location: string;
  gpa?: string;
  topics?: string;
}

export interface Certification {
  degree: string;
  institution: string;
  year: string;
  location: string;
}
export interface Language {
  name: string;
  level: string;
}

export interface Publication {
  title: string;
  location: string;
  url: string;
}
