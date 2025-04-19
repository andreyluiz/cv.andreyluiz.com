"use server";

import { Variant } from "../types";
import {
  generateCoverLetter as generateCoverLetterWithOpenAI,
  tailorResume as tailorResumeWithOpenAI,
} from "./openai";
import resumeData from "./resume.json";

export async function getResume(): Promise<Variant> {
  return resumeData as Variant;
}

export async function tailorResume(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant
): Promise<Variant> {
  try {
    return await tailorResumeWithOpenAI(
      jobTitle,
      jobDescription,
      currentResume
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
): Promise<string> {
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
