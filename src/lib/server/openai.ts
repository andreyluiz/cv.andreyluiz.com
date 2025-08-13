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
          content: `You are a professional cover letter writer. Your task is to write a compelling cover letter that:
1. Highlights the candidate's relevant experience and skills that match the job requirements
2. Demonstrates enthusiasm for the role and company
3. Shows how the candidate's background aligns with the job description
4. Maintains a professional and engaging tone
5. Is concise and well-structured
6. Includes a clear call to action
7. Doesn't include any augmentations, or lies about the candidate's skills or experiences.

The cover letter MUST have this format:

- Name and contact information
- A greeting
- A first paragraph highlighting how the candidate's background aligns with the job description, and how they are a great fit for the role. This paragraph should be short, and should be impactful, without buzz words, but with enthusiasm.
- A second paragraph explaining the background of the candidate and accomplishments that are relevant to the job description. This paragraph should be longer, and should be more detailed. No augmentations or lies. Just the facts.
- A third paragraph with other relevant information that might help the candidate stand out from other candidates. This paragraph should be short.
- The last paragraph should be a call to action, asking the recipient to schedule an interview with the candidate. This paragraph should be short. It also should be sincere and impactful, but without buzz words.
- Finally, the cover letter should finish with a greeting and the candidate's name.

The cover letter should be written in a professional tone and should be tailored to the specific job description.`,
        },
        {
          role: "user",
          content: `Job Title: ${jobTitle}\nJob Description:\n${jobDescription}\n\nCandidate's Resume:\n${JSON.stringify(
            currentResume,
            null,
            2,
          )}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw createOpenRouterError(error, selectedModel);
  }
}
