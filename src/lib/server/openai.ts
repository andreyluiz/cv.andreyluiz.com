import OpenAI from "openai";
import { Variant } from "../types";

// This file is now used by the server, so we use the server-side environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error(
    "OpenAI API key is not set. Please set OPENAI_API_KEY in your .env file.",
  );
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function tailorResume(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant,
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
      messages: [
        {
          role: "system",
          content: `You are a professional resume tailor. Your task is to modify the provided resume to better match the job description while maintaining truthfulness and accuracy. Focus on:
1. Tailoring the summary to highlight relevant experience
2. Prioritizing and emphasizing relevant skills
3. Highlighting relevant achievements in professional experience
4. Including only relevant education, certifications, and publications
5. The title of the job should match exactly the required job title. Don't use generic titles like "Software Engineer" or "Software Developer". Be precise.
6. The summary should be a concise summary of the resume.
7. The skills should be a list of skills that are relevant to the job description.
8. The experience should be a list of experiences that are relevant to the job description. They should be in descending chronological order.
9. The education should be a list of education that is relevant to the job description.
10. The AI should also return an additional field containing what has been changed in the resume.

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

    // Extract the function call result
    const functionCall = response.choices[0].message.function_call;
    console.log(response.choices[0].message);

    if (!functionCall || functionCall.name !== "tailor_resume") {
      throw new Error(
        "Expected function call to tailor_resume was not returned",
      );
    }

    // Parse the function call arguments
    const tailoredResumeData = JSON.parse(functionCall.arguments);

    // Create a complete Variant object by combining the tailored data with the original personalInfo and languages
    const tailoredResume = {
      ...currentResume, // Keep the original personalInfo and languages
      ...tailoredResumeData, // Override with the tailored data
    };

    return tailoredResume;
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw error;
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  currentResume: Variant,
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
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
    throw error;
  }
}
