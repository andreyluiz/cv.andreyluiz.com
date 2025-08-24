export interface Variant {
  name: string;
  title: string;
  contactInfo: ContactInfo;
  summary: string;
  qualities: string[];
  generalSkills: string[];
  skills: SkillDomain[];
  experience: Experience[];
  projects?: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  publications?: Publication[];
  personalityTraits: string[];
  changes?: Change[];
  profilePhotoId?: string;
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
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  age?: string;
  nationality?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  isPrevious?: boolean;
  isHidden?: boolean;
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

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
}

export interface CoverLetterInputs {
  jobPosition: string;
  companyDescription: string;
  jobDescription: string;
}

export interface IngestedCV {
  id: string;
  title: string;
  rawText: string;
  formattedCV: Variant;
  createdAt: Date;
  updatedAt: Date;
  profilePhotoId?: string; // Reference to photo stored in IndexedDB
}

// Photo record interface for IndexedDB storage structure
export interface PhotoRecord {
  id: string; // Unique photo identifier
  blob: Blob; // Binary image data
  type: string; // MIME type (image/jpeg, image/png, etc.)
  size: number; // File size in bytes
  uploadedAt: Date; // Upload timestamp
  cvId: string; // Associated CV identifier
}

// Photo-related types for form handling
export interface PhotoFormData {
  photoId?: string | null;
}

export interface CVFormData {
  title: string;
  rawText: string;
  photoId?: string | null;
}
