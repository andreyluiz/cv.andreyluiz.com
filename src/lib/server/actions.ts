"use server";

import type { Variant } from "../types";
import {
  generateCoverLetter as generateCoverLetterWithOpenAI,
  ingestCV as ingestCVWithOpenAI,
  tailorResume as tailorResumeWithOpenAI,
} from "./openai";
import resumeEnglish from "./resume-en.json";
import resumeFrench from "./resume-fr.json";
import resumePortuguese from "./resume-pt.json";

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  severity?: "low" | "medium" | "high";
}

function validateCoverLetterContent(content: string): ValidationResult {
  const trimmedContent = content.trim();

  // Check for completely empty content
  if (!trimmedContent) {
    return { isValid: false, reason: "Content is empty", severity: "high" };
  }

  // Check minimum reasonable length
  if (trimmedContent.length < 50) {
    return { isValid: false, reason: "Content too short", severity: "high" };
  }

  // Check for maximum reasonable length (cover letters shouldn't be extremely long)
  if (trimmedContent.length > 10000) {
    return {
      isValid: false,
      reason: "Content unusually long",
      severity: "medium",
    };
  }

  // Check for malformed HTML/formatting issues
  const htmlTagCount = (content.match(/<[^>]*>/g) || []).length;
  const openingTags = (content.match(/<[^/>][^>]*>/g) || []).length;
  const closingTags = (content.match(/<\/[^>]*>/g) || []).length;

  // If there are HTML tags, check basic structure
  if (htmlTagCount > 0) {
    // Check for severely mismatched tags (allowing some flexibility)
    if (Math.abs(openingTags - closingTags) > 3) {
      return {
        isValid: false,
        reason: "Malformed HTML structure",
        severity: "medium",
      };
    }

    // Check for unclosed paragraph tags or similar structural issues
    const paragraphsOpen = (content.match(/<p[^>]*>/g) || []).length;
    const paragraphsClose = (content.match(/<\/p>/g) || []).length;
    if (paragraphsOpen > 0 && Math.abs(paragraphsOpen - paragraphsClose) > 1) {
      return {
        isValid: false,
        reason: "Malformed paragraph structure",
        severity: "medium",
      };
    }
  }

  // Check for suspicious patterns that might indicate corrupted AI output
  const suspiciousPatterns = [
    /\[.*?\]/g, // Unexpanded placeholders like [Company Name]
    /{{.*?}}/g, // Template variables that weren't replaced
    /undefined|null|NaN/gi, // Programming artifacts
    /<\?.*?\?>/g, // PHP-like tags
    /error|exception|stack/gi, // Error messages
  ];

  for (const pattern of suspiciousPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      return {
        isValid: false,
        reason: `Contains suspicious content: ${matches[0]}`,
        severity: "high",
      };
    }
  }

  // Check for repeated content (possible AI hallucination)
  const words = trimmedContent.toLowerCase().split(/\s+/);
  const wordSet = new Set(words);
  const uniqueRatio = wordSet.size / words.length;

  if (uniqueRatio < 0.3) {
    return {
      isValid: false,
      reason: "Content appears to be highly repetitive",
      severity: "medium",
    };
  }

  // Check for basic cover letter structure indicators
  const _hasGreeting = /dear|hello|greetings|to whom/gi.test(content);
  const _hasClosing = /sincerely|regards|best|yours/gi.test(content);
  const hasPersonalPronouns = /\b(i|my|me)\b/gi.test(content);

  if (!hasPersonalPronouns) {
    return {
      isValid: false,
      reason: "Missing personal context typical of cover letters",
      severity: "low",
    };
  }

  // All validations passed
  return { isValid: true };
}

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

export async function ingestCV(
  rawText: string,
  apiKey: string,
  selectedModel: string,
  language: string = "en",
): Promise<Variant> {
  // Input validation
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Raw CV text is required for ingestion.");
  }

  if (rawText.trim().length < 50) {
    throw new Error(
      "CV text is too short. Please provide at least 50 characters.",
    );
  }

  if (rawText.trim().length > 50000) {
    throw new Error("CV text is too long. Please limit to 50,000 characters.");
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "API key is required to process CV. Please configure your API key in settings.",
    );
  }

  if (!selectedModel || selectedModel.trim().length === 0) {
    throw new Error(
      "Model selection is required to process CV. Please select a model in settings.",
    );
  }

  // Validate language is supported
  const supportedLanguages = ["en", "fr", "pt"];
  const sanitizedLanguage = language?.trim() || "en";
  if (!supportedLanguages.includes(sanitizedLanguage)) {
    console.warn(
      `Unsupported language "${sanitizedLanguage}", defaulting to English`,
    );
  }

  try {
    const result = await ingestCVWithOpenAI(
      rawText.trim(),
      apiKey.trim(),
      selectedModel.trim(),
      supportedLanguages.includes(sanitizedLanguage) ? sanitizedLanguage : "en",
    );

    // Validate the generated CV structure
    if (!result) {
      throw new Error(
        "The AI service returned an empty response. Please try again or select a different model.",
      );
    }

    // Basic validation of required fields
    if (!result.name || !result.title) {
      throw new Error(
        "The AI could not extract essential information (name or title) from the CV text. Please ensure your CV contains clear personal information and try again.",
      );
    }

    return result;
  } catch (error) {
    console.error("Error ingesting CV:", error);

    // Enhanced error handling with specific error messages
    if (error instanceof Error) {
      // If this is our own validation error, re-throw as is
      if (
        error.message.includes("The AI service returned an empty response") ||
        error.message.includes("The AI could not extract essential information")
      ) {
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

      // Re-throw the original error if it's already well-formatted
      throw error;
    }

    // Fallback error message
    throw new Error(
      "Failed to process CV. Please check your API key and selected model, then try again.",
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
  const resumeName = currentResume.name;
  const resumeLocation = currentResume.contactInfo?.location;

  if (!resumeName) {
    throw new Error(
      "Resume must contain at least a name to generate a cover letter.",
    );
  }

  if (!resumeLocation) {
    console.warn(
      "Resume is missing location information for the cover letter header.",
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

    // Enhanced validation of the generated result
    if (!result || result.trim().length === 0) {
      throw new Error(
        "The AI service returned an empty response. Please try again or select a different model.",
      );
    }

    // Validate the response structure and content
    const validationResult = validateCoverLetterContent(result);
    if (!validationResult.isValid) {
      console.warn(
        `Cover letter validation failed: ${validationResult.reason}`,
        { result: result.substring(0, 200) },
      );

      // For severe issues, throw an error
      if (validationResult.severity === "high") {
        throw new Error(
          `The AI generated an invalid cover letter: ${validationResult.reason}. Please try again with a different model or adjust your input.`,
        );
      }
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
