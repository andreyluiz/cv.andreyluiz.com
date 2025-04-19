"use server";

import { Variant } from "../types";
import { tailorResume as tailorResumeWithOpenAI } from "./openai";
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
