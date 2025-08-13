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
  // Input validation
  if (!currentResume) {
    throw new Error("Resume data is required to generate a cover letter.");
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "API key is required to generate a cover letter. Please configure your API key in settings.",
    );
  }

  if (!selectedModel || selectedModel.trim().length === 0) {
    throw new Error(
      "Model selection is required to generate a cover letter. Please select a model in settings.",
    );
  }

  // Validate resume has minimum required information
  const resumeName = currentResume.name || currentResume.personalInfo?.name;
  const resumeEmail =
    currentResume.contactInfo?.email || currentResume.personalInfo?.email;

  if (!resumeName || !resumeEmail) {
    throw new Error(
      "Resume must contain at least a name and email address to generate a cover letter.",
    );
  }

  // For spontaneous applications, company description is required
  const isSpontaneousApplication = !jobTitle?.trim() || !jobDescription?.trim();
  if (
    isSpontaneousApplication &&
    (!companyDescription || companyDescription.trim().length === 0)
  ) {
    throw new Error(
      "Company description is required for spontaneous applications. Please provide information about the company you're applying to.",
    );
  }

  // Validate and sanitize inputs
  const sanitizedJobTitle = jobTitle?.trim() || "";
  const sanitizedJobDescription = jobDescription?.trim() || "";
  const sanitizedCompanyDescription = companyDescription?.trim() || "";
  const sanitizedLanguage = language?.trim() || "en";

  // Validate language is supported
  const supportedLanguages = ["en", "fr", "pt"];
  if (!supportedLanguages.includes(sanitizedLanguage)) {
    console.warn(
      `Unsupported language "${sanitizedLanguage}", defaulting to English`,
    );
  }

  try {
    const result = await generateCoverLetterWithOpenAI(
      sanitizedJobTitle,
      sanitizedJobDescription,
      currentResume,
      apiKey.trim(),
      selectedModel.trim(),
      sanitizedCompanyDescription,
      supportedLanguages.includes(sanitizedLanguage) ? sanitizedLanguage : "en",
    );

    // Additional validation of the generated result
    if (!result || result.trim().length === 0) {
      throw new Error(
        "The AI service returned an empty response. Please try again or select a different model.",
      );
    }

    if (result.length < 100) {
      console.warn(
        "Generated cover letter appears to be unusually short, this may indicate an issue with the AI response",
      );
    }

    return result;
  } catch (error) {
    console.error("Error generating cover letter:", error);

    // Enhanced error handling with more specific error messages
    if (error instanceof Error) {
      // If this is our own validation error, re-throw as is
      if (error.message.includes("The AI service returned an empty response")) {
        throw error;
      }

      // Check for specific error patterns and provide better user guidance
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("api key") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid key")
      ) {
        throw new Error(
          "Invalid API key. Please check your OpenRouter API key in settings and ensure it's active on your account.",
        );
      }

      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests")
      ) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again, or consider switching to a free model.",
        );
      }

      if (
        errorMessage.includes("model") &&
        errorMessage.includes("not found")
      ) {
        throw new Error(
          "The selected AI model is currently unavailable. Please try a different model from the settings.",
        );
      }

      if (
        errorMessage.includes("insufficient credits") ||
        errorMessage.includes("quota exceeded")
      ) {
        throw new Error(
          "Insufficient credits or quota exceeded. Please check your OpenRouter account balance or switch to a free model.",
        );
      }

      if (
        errorMessage.includes("empty") ||
        errorMessage.includes("no content")
      ) {
        throw new Error(
          "The AI service did not generate any content. This may be due to content filtering or model issues. Please try again with different inputs or a different model.",
        );
      }

      // Re-throw the original error if it's already well-formatted
      throw error;
    }

    // Fallback error message
    throw new Error(
      "Failed to generate cover letter. Please check your API key and selected model, then try again.",
    );
  }
}
