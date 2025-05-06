"use server";

import { Variant } from "../types";
import {
  generateCoverLetter as generateCoverLetterWithOpenAI,
  tailorResume as tailorResumeWithOpenAI,
} from "./openai";
import resumeEnglish from "./resume-en.json";
import resumeFrench from "./resume-fr.json";
import resumePortuguese from "./resume-pt.json";

export async function getResume(lang: string = "en"): Promise<Variant> {
  switch (lang) {
    case "fr":
      return resumeFrench as Variant;
    case "pt":
      return resumePortuguese as Variant;
    default:
      return resumeEnglish as Variant;
  }
}

export async function tailorResume(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant,
  aiInstructions: string
): Promise<Variant> {
  try {
    return await tailorResumeWithOpenAI(
      jobTitle,
      jobDescription,
      currentResume,
      aiInstructions
    );
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw new Error("Failed to tailor resume. Please try again.");
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant
): Promise<string | null> {
  try {
    return await generateCoverLetterWithOpenAI(
      jobTitle,
      jobDescription,
      currentResume
    );
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter. Please try again.");
  }
}
