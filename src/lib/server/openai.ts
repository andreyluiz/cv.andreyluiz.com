import OpenAI from "openai";
import { AVAILABLE_MODELS, getFreeModels } from "../models";
import type { Variant } from "../types";

interface ErrorLike {
  message?: string;
  code?: number | string;
  status?: number | string;
  toString?: () => string;
}

/**
 * Creates OpenRouter-specific error messages with helpful suggestions
 */
function createOpenRouterError(error: unknown, selectedModel: string): Error {
  const errorLike = error as ErrorLike;
  const errorMessage =
    errorLike?.message ||
    errorLike?.toString?.() ||
    String(error) ||
    "Unknown error";
  const errorCode = errorLike?.code || errorLike?.status;

  // Model unavailable or not found
  if (
    errorMessage.includes("model") &&
    (errorMessage.includes("not found") ||
      errorMessage.includes("unavailable") ||
      errorMessage.includes("does not exist"))
  ) {
    const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);
    const freeModels = getFreeModels();
    const alternativeModels = AVAILABLE_MODELS.filter(
      (m) => m.id !== selectedModel,
    ).slice(0, 3);

    let suggestion = "";
    if (freeModels.length > 0) {
      suggestion = `Try one of these free alternatives: ${freeModels.map((m) => m.name).join(", ")}`;
    } else if (alternativeModels.length > 0) {
      suggestion = `Try one of these alternatives: ${alternativeModels.map((m) => m.name).join(", ")}`;
    }

    return new Error(
      `The selected model "${currentModel?.name || selectedModel}" is currently unavailable on OpenRouter. ${suggestion}`,
    );
  }

  // Authentication errors
  if (
    errorCode === 401 ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("invalid api key")
  ) {
    return new Error(
      "Invalid OpenRouter API key. Please check your API key in the settings and ensure it's active on your OpenRouter account.",
    );
  }

  // Rate limiting
  if (
    errorCode === 429 ||
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests")
  ) {
    const freeModels = getFreeModels();
    const suggestion =
      freeModels.length > 0
        ? ` Try switching to a free model like ${freeModels[0].name} to avoid rate limits.`
        : "";
    return new Error(
      `OpenRouter rate limit exceeded.${suggestion} Please wait a moment before trying again.`,
    );
  }

  // Insufficient credits/quota
  if (
    errorMessage.includes("insufficient") ||
    errorMessage.includes("quota") ||
    errorMessage.includes("credits")
  ) {
    const freeModels = getFreeModels();
    const suggestion =
      freeModels.length > 0
        ? ` Try switching to a free model like ${freeModels.map((m) => m.name).join(" or ")}.`
        : "";
    return new Error(
      `Insufficient OpenRouter credits or quota exceeded.${suggestion} Please check your OpenRouter account balance.`,
    );
  }

  // Network/connection errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return new Error(
      "Network error connecting to OpenRouter. Please check your internet connection and try again.",
    );
  }

  // Generic OpenRouter error
  return new Error(
    `OpenRouter API error: ${errorMessage}. Please try again or select a different model.`,
  );
}

export async function tailorResume(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant,
  aiInstructions: string,
  apiKey: string,
  selectedModel: string,
) {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "CV Tailor App",
    },
  });

  try {
    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: `You are a professional resume tailor. Your task is to modify the provided resume to better match the job description while maintaining truthfulness and accuracy. Focus on:
1. Tailoring the summary to highlight relevant experience
2. Prioritizing and emphasizing relevant skills
3. Highlighting relevant achievements in professional experience, maintaining most recent chronologically.
4. Including only relevant education, certifications, and publications
5. The title of the job should match exactly the required job title. Don't use generic titles like "Software Engineer" or "Software Developer". Be precise.
6. The summary should be a concise summary of the resume.
7. The skills should be a list of skills that are relevant to the job description.
8. The experience should be a list of experiences that are relevant to the job description. They should be in descending chronological order. The most recent experience should be always be present.
9. The education should be a list of education that is relevant to the job description.
10. The AI should also return an additional field containing what has been changed in the resume.
11. If the most recent experience is not relevant to the job description, keep it, but edit it to make it more relevant to the job description. Do not lie, just edit it to make it more relevant to the job description.
${aiInstructions ? `Additional Instructions:\n${aiInstructions}` : ""}
Return the modified resume in the exact same JSON structure as the input, but with tailored content.`,
        },
        {
          role: "user",
          content: `Job Title: ${jobTitle}\nJob Description:\n${jobDescription}\n\nCurrent Resume:\n${JSON.stringify(
            currentResume,
            null,
            2,
          )}`,
        },
      ],
      functions: [
        {
          name: "tailor_resume",
          description: "Tailor a resume based on a job description",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "The title of the job. Should match exactly the required job title.",
              },
              summary: {
                type: "string",
              },
              generalSkills: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    domain: { type: "string" },
                    skills: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["domain", "skills"],
                },
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    location: { type: "string" },
                    period: {
                      type: "object",
                      properties: {
                        start: { type: "string" },
                        end: { type: "string" },
                      },
                      required: ["start", "end"],
                    },
                    achievements: {
                      type: "array",
                      items: { type: "string" },
                    },
                    techStack: {
                      type: "array",
                      items: { type: "string" },
                    },
                    isPrevious: {
                      type: "boolean",
                      description:
                        "Indicates if this experience should be displayed on the Previous Experiences section.",
                      default: false,
                    },
                  },
                  required: [
                    "title",
                    "company",
                    "location",
                    "period",
                    "achievements",
                    "techStack",
                  ],
                },
              },
              projects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    techStack: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["name", "description", "techStack"],
                },
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    degree: { type: "string" },
                    institution: { type: "string" },
                    year: { type: "string" },
                    location: { type: "string" },
                  },
                  required: ["degree", "institution", "year", "location"],
                },
              },
              certifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    degree: { type: "string" },
                    institution: { type: "string" },
                    year: { type: "string" },
                    location: { type: "string" },
                  },
                  required: ["degree", "institution", "year", "location"],
                },
              },
              publications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    location: { type: "string" },
                    url: { type: "string" },
                  },
                  required: ["title", "location", "url"],
                },
              },
              personalityTraits: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              changes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    change: { type: "string" },
                  },
                  required: ["field", "change"],
                },
              },
            },
            required: [
              "summary",
              "skills",
              "experience",
              "education",
              "certifications",
              "publications",
              "changes",
            ],
          },
        },
      ],
      function_call: { name: "tailor_resume" },
      max_completion_tokens: 10000,
      temperature: 0.7,
    });

    const functionCall = response.choices[0].message.function_call;

    if (!functionCall || functionCall.name !== "tailor_resume") {
      throw new Error(
        "Expected function call to tailor_resume was not returned",
      );
    }

    const tailoredResumeData = JSON.parse(functionCall.arguments);

    const tailoredResume = {
      ...currentResume,
      ...tailoredResumeData,
    };

    return tailoredResume;
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw createOpenRouterError(error, selectedModel);
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
) {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "CV Tailor App",
    },
  });

  // Determine if this is a spontaneous application
  const isSpontaneousApplication = !jobTitle.trim() || !jobDescription.trim();

  // Set target language (default to English if not specified)
  const targetLanguage = language || "en";
  const languageMap: Record<string, string> = {
    en: "English",
    fr: "French",
    pt: "Portuguese",
  };
  const languageName = languageMap[targetLanguage] || "English";

  // Get current date for cover letter title
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat(
    targetLanguage === "en" ? "en-US" : targetLanguage,
    {
      year: "numeric",
      month: "long",
    },
  ).format(currentDate);

  try {
    const systemPrompt = `You are a professional cover letter writer specialized in creating compelling, structured cover letters. Your task is to write a cover letter in ${languageName} that follows this EXACT structure:

REQUIRED STRUCTURE:
1. **Header**: Candidate's name and complete contact information (email, phone, location) at the top left
2. **Company Information**: Company contact information aligned to the right (if available from company description)
3. **Title**: ${
      isSpontaneousApplication
        ? `A bold title: "Spontaneous Application - [Company Name] - ${formattedDate}"`
        : `A bold title: "Cover letter for position ${jobTitle} - [website/source where job was found] - ${formattedDate}"`
    }
4. **Salutation**: Professional greeting addressing the hiring manager
5. **Company Flattery Paragraph**: A paragraph highlighting the company's values, mission, ${isSpontaneousApplication ? "specific departments, technologies, or business models that interest the candidate" : "and how they align with the role"}
6. **Candidate Skills Paragraph**: Detailed paragraph about the candidate's relevant experience and skills
7. **Collaboration Vision Paragraph**: How the candidate envisions collaborating with the company
8. **Interview Request**: Professional closing requesting an interview opportunity
9. **Sign-off**: Professional closing with candidate's name

CRITICAL REQUIREMENTS:
- Write ONLY in ${languageName}
- Use information provided about the candidate (no fabrication or augmentation)
- ${isSpontaneousApplication ? "Focus on company-specific interests and general fit since no specific job details are provided" : "Tailor content to match the specific job requirements"}
- Maintain professional, engaging tone without buzzwords
- Include specific examples from the candidate's background
- Ensure proper business letter formatting
- Use HTML formatting for structure (headers, paragraphs, bold text)

CONTENT GUIDELINES:
- Be sincere and impactful without being overly enthusiastic
- Base all claims on actual resume content
- Show genuine interest in the company and role
- Include a compelling call to action
- Maintain professional formality appropriate for business correspondence`;

    const userPrompt = `Please generate a cover letter with the following information:

${
  isSpontaneousApplication
    ? `**SPONTANEOUS APPLICATION**
Company Information: ${companyDescription || "Not specified"}
Note: This is a spontaneous application - no specific job title or description provided.`
    : `**JOB APPLICATION**
Job Title: ${jobTitle}
Job Description: ${jobDescription}
Company Information: ${companyDescription || "Not specified"}`
}

**Candidate's Resume:**
${JSON.stringify(currentResume, null, 2)}

**Additional Context:**
- Target Language: ${languageName}
- Date: ${formattedDate}
- Application Type: ${isSpontaneousApplication ? "Spontaneous Application" : "Specific Position Application"}

Please generate a complete, properly formatted cover letter following the exact structure specified above.`;

    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const generatedContent = response.choices[0].message.content;

    // Validate that content was generated
    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error("AI generated empty cover letter content");
    }

    // Basic validation for required structure elements
    const requiredElements = [
      currentResume.contactInfo?.email || currentResume.personalInfo?.email,
      currentResume.contactInfo?.phone || currentResume.personalInfo?.phone,
      currentResume.name || currentResume.personalInfo?.name,
    ];

    const hasContactInfo = requiredElements.some(
      (element) => element && generatedContent.includes(element),
    );

    if (!hasContactInfo) {
      console.warn("Generated cover letter may be missing contact information");
    }

    return generatedContent;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw createOpenRouterError(error, selectedModel);
  }
}
