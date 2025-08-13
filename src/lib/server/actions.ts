"use server";

import type { Variant } from "../types";
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
  aiInstructions: string,
  apiKey: string,
  selectedModel: string,
): Promise<Variant> {
  try {
    return await tailorResumeWithOpenAI(
      jobTitle,
      jobDescription,
      currentResume,
      aiInstructions,
      apiKey,
      selectedModel,
    );
  } catch (error) {
    console.error("Error tailoring resume:", error);
    // Re-throw the OpenRouter-specific error message if available
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Failed to tailor resume with OpenRouter. Please check your API key and selected model, then try again.",
    );
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant,
  apiKey: string,
  selectedModel: string,
  companyDescription?: string,
  language?: string,
): Promise<string | null> {
  try {
    return await generateCoverLetterWithOpenAI(
      jobTitle,
      jobDescription,
      currentResume,
      apiKey,
      selectedModel,
      companyDescription,
      language,
    );
  } catch (error) {
    console.error("Error generating cover letter:", error);
    // Re-throw the OpenRouter-specific error message if available
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Failed to generate cover letter with OpenRouter. Please check your API key and selected model, then try again.",
    );
  }
}
