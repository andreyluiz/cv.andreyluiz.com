export interface Variant {
  personalInfo: PersonalInfo;
  summary: string;
  skills: [string, string[]][];
  experience: Experience[];
  projects?: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  publications: Publication[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
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
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  location: string;
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
