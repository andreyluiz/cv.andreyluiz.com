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
      tools: [
        {
          type: "function",
          function: {
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
        },
      ],
      tool_choice: { type: "function", function: { name: "tailor_resume" } },
      max_completion_tokens: 10000,
      temperature: 0.7,
    });

    const toolCalls = response.choices[0].message.tool_calls;

    if (
      !toolCalls ||
      toolCalls.length === 0 ||
      toolCalls[0].function.name !== "tailor_resume"
    ) {
      throw new Error("Expected tool call to tailor_resume was not returned");
    }

    const tailoredResumeData = JSON.parse(toolCalls[0].function.arguments);

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

export async function ingestCV(
  rawText: string,
  apiKey: string,
  selectedModel: string,
  language: string = "en",
): Promise<Variant> {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "CV Tailor App",
    },
  });

  // Language-specific instructions
  const languageMap: Record<string, string> = {
    en: "English",
    fr: "French",
    pt: "Portuguese",
  };
  const languageName = languageMap[language] || "English";

  try {
    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: `You are a professional CV formatting assistant. Your task is to convert raw CV text into a structured JSON format that matches the exact schema provided. 

CRITICAL REQUIREMENTS:
1. Extract ALL relevant information from the raw text
2. Maintain accuracy - do not fabricate or add information not present in the source
3. Format dates consistently as YYYY-MM (e.g., "2023-01" for January 2023)
4. If specific information is missing, use appropriate defaults:
   - Empty strings for missing text fields
   - Empty arrays for missing lists
   - "Present" for current/ongoing positions
5. Organize skills into logical domains (e.g., "Programming Languages", "Frameworks", "Tools")
6. Extract achievements and format them as clear, concise bullet points
7. Preserve the original meaning and context of all information
8. Handle text in ${languageName} appropriately
9. Return ONLY valid JSON that matches the schema exactly

The JSON structure must include all required fields from the Variant interface. Pay special attention to:
- contactInfo: Extract email, phone, location, and any web presence
- experience: Include all work history with achievements and tech stack
- skills: Group technical and soft skills into appropriate domains
- education: Include all educational background
- certifications: List any certifications or professional qualifications
- languages: Include language proficiencies if mentioned`,
        },
        {
          role: "user",
          content: `Please convert this raw CV text into the structured JSON format:

${rawText}

Return the formatted CV as a JSON object that matches this exact structure:
{
  "name": "string",
  "title": "string", 
  "contactInfo": {
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "linkedin": "string", 
    "github": "string",
    "age": "string",
    "nationality": "string"
  },
  "summary": "string",
  "qualities": ["string"],
  "generalSkills": ["string"],
  "skills": [{"domain": "string", "skills": ["string"]}],
  "experience": [{
    "title": "string",
    "company": "string", 
    "location": "string",
    "period": {"start": "YYYY-MM", "end": "YYYY-MM or Present"},
    "achievements": ["string"],
    "techStack": ["string"],
    "isPrevious": false
  }],
  "projects": [{
    "name": "string",
    "description": "string", 
    "techStack": ["string"],
    "period": {"start": "YYYY-MM", "end": "YYYY-MM"}
  }],
  "education": [{
    "degree": "string",
    "institution": "string",
    "year": "string",
    "location": "string",
    "gpa": "string",
    "topics": "string"
  }],
  "certifications": [{
    "degree": "string",
    "institution": "string", 
    "year": "string",
    "location": "string"
  }],
  "languages": [{"name": "string", "level": "string"}],
  "publications": [{
    "title": "string",
    "location": "string",
    "url": "string"
  }],
  "personalityTraits": ["string"]
}

IMPORTANT: Return ONLY the JSON object, no additional text or formatting.`,
        },
      ],
      max_completion_tokens: 8000,
      temperature: 0.3, // Lower temperature for more consistent formatting
    });

    const generatedContent = response.choices[0].message.content;

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error("AI generated empty CV content");
    }

    // Parse the JSON response
    let parsedCV: Variant;
    try {
      // Clean the response in case there are markdown code blocks
      const cleanedContent = generatedContent
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      parsedCV = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      throw new Error(
        "The AI response could not be parsed as valid JSON. Please try again with a different model.",
      );
    }

    // Validate required fields are present
    if (!parsedCV.name || typeof parsedCV.name !== "string") {
      throw new Error("CV must contain a valid name");
    }

    if (!parsedCV.title || typeof parsedCV.title !== "string") {
      throw new Error("CV must contain a valid title/position");
    }

    // Ensure all required fields exist with proper defaults
    const formattedCV: Variant = {
      name: parsedCV.name,
      title: parsedCV.title,
      contactInfo: {
        email: parsedCV.contactInfo?.email || "",
        phone: parsedCV.contactInfo?.phone || "",
        location: parsedCV.contactInfo?.location || "",
        website: parsedCV.contactInfo?.website || "",
        linkedin: parsedCV.contactInfo?.linkedin || "",
        github: parsedCV.contactInfo?.github || "",
        age: parsedCV.contactInfo?.age || "",
        nationality: parsedCV.contactInfo?.nationality || "",
      },
      summary: parsedCV.summary || "",
      qualities: Array.isArray(parsedCV.qualities) ? parsedCV.qualities : [],
      generalSkills: Array.isArray(parsedCV.generalSkills)
        ? parsedCV.generalSkills
        : [],
      skills: Array.isArray(parsedCV.skills) ? parsedCV.skills : [],
      experience: Array.isArray(parsedCV.experience) ? parsedCV.experience : [],
      projects: Array.isArray(parsedCV.projects) ? parsedCV.projects : [],
      education: Array.isArray(parsedCV.education) ? parsedCV.education : [],
      certifications: Array.isArray(parsedCV.certifications)
        ? parsedCV.certifications
        : [],
      languages: Array.isArray(parsedCV.languages) ? parsedCV.languages : [],
      publications: Array.isArray(parsedCV.publications)
        ? parsedCV.publications
        : [],
      personalityTraits: Array.isArray(parsedCV.personalityTraits)
        ? parsedCV.personalityTraits
        : [],
    };

    return formattedCV;
  } catch (error) {
    console.error("Error ingesting CV:", error);
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

REQUIRED STRUCTURE WITH SPECIFIC CSS CLASSES:
1. **Header**: <div class="sender-address">ONLY candidate's name and address (street address/location) - NO email, phone, or other contact details</div>
2. **Company Information**: <div class="recipient-address">Company contact information aligned to the right (if available from company description)</div>
3. **Title**: <div class="cover-letter-title">${
      isSpontaneousApplication
        ? `A bold title in ${languageName}: ${
            targetLanguage === "fr"
              ? `"Candidature spontanée - [Company Name] - ${formattedDate}"`
              : targetLanguage === "pt"
                ? `"Candidatura espontânea - [Company Name] - ${formattedDate}"`
                : `"Spontaneous Application - [Company Name] - ${formattedDate}"`
          }`
        : `A bold title in ${languageName}: ${
            targetLanguage === "fr"
              ? `"Lettre de motivation pour le poste ${jobTitle} - [website/source where job was found] - ${formattedDate}"`
              : targetLanguage === "pt"
                ? `"Carta de apresentação para o cargo ${jobTitle} - [website/source where job was found] - ${formattedDate}"`
                : `"Cover letter for position ${jobTitle} - [website/source where job was found] - ${formattedDate}"`
          }`
    }</div>
4. **Salutation**: <div class="salutation">Professional greeting addressing the hiring manager</div>
5. **Company Flattery Paragraph**: <div class="company-paragraph">A paragraph highlighting the company's values, mission, ${isSpontaneousApplication ? "specific departments, technologies, or business models that interest the candidate" : "and how they align with the role"}</div>
6. **Candidate Skills Paragraph**: <div class="skills-paragraph">Detailed paragraph about the candidate's relevant experience and skills</div>
7. **Collaboration Vision Paragraph**: <div class="collaboration-paragraph">How the candidate envisions collaborating with the company</div>
8. **Interview Request**: <div class="interview-request">Professional closing requesting an interview opportunity</div>
9. **Sign-off**: <div class="closing-signature">Professional closing with candidate's name</div>

CRITICAL FORMATTING REQUIREMENTS:
- Write ONLY in ${languageName}
- Return ONLY the formatted HTML content - NO code blocks, NO \`\`\`html tags, NO markdown formatting
- MANDATORY: Use the exact CSS classes specified above for each section:
  - sender-address (for candidate's name and address)
  - recipient-address (for company information) 
  - cover-letter-title (for the title)
  - salutation (for greeting)
  - company-paragraph (for company information paragraph)
  - skills-paragraph (for candidate skills paragraph)
  - collaboration-paragraph (for collaboration vision)
  - interview-request (for interview request)
  - closing-signature (for sign-off)
- Use HTML tags directly: <h1>, <h2>, <h3>, <p>, <strong>, <br> etc.
- The response should start immediately with HTML content
- Use information provided about the candidate (no fabrication or augmentation)
- ${isSpontaneousApplication ? "Focus on company-specific interests and general fit since no specific job details are provided" : "Tailor content to match the specific job requirements"}
- Maintain professional, engaging tone without buzzwords
- Include specific examples from the candidate's background
- Ensure proper business letter formatting

CONTACT INFO RESTRICTIONS:
- Header must contain ONLY: candidate name and address/location
- DO NOT include: email, phone number, LinkedIn, GitHub, website, or any other contact details
- If resume contains email/phone, ignore them for the header

CONTENT GUIDELINES:
- Be sincere and impactful without being overly enthusiastic
- Base all claims on actual resume content
- Show genuine interest in the company and role
- Include a compelling call to action
- Maintain professional formality appropriate for business correspondence
- Generate complete, full-length cover letter content (not abbreviated or truncated)`;

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

IMPORTANT: Generate a complete, full-length cover letter following the exact structure specified above. 

FORMATTING REQUIREMENTS:
- Return ONLY HTML content (no code blocks, no \`\`\`html tags)
- Start response immediately with HTML tags
- Include ONLY name and address in header (NO email, phone, LinkedIn, etc.)
- Generate complete paragraphs (not truncated or abbreviated)
- Use proper HTML formatting throughout

Please generate the cover letter now.`;

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
      max_tokens: 3000,
      temperature: 0.7,
    });

    const generatedContent = response.choices[0].message.content;

    // Validate that content was generated
    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error("AI generated empty cover letter content");
    }

    // Basic validation for required structure elements (name and location)
    const candidateName = currentResume.name;
    const candidateLocation = currentResume.contactInfo?.location;

    const requiredElements = [candidateName, candidateLocation].filter(Boolean);

    const hasRequiredInfo = requiredElements.some(
      (element) => element && generatedContent.includes(element),
    );

    if (!hasRequiredInfo) {
      console.warn(
        "Generated cover letter may be missing required information (name or address)",
      );
    }

    return generatedContent;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw createOpenRouterError(error, selectedModel);
  }
}
