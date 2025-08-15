import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Variant } from "../../types";
import { generateCoverLetter, getResume, tailorResume } from "../actions";

// Mock the OpenAI functions
vi.mock("../openai", () => ({
  generateCoverLetter: vi.fn(),
  tailorResume: vi.fn(),
}));

const mockGenerateCoverLetterWithOpenAI = vi.fn();
const mockTailorResumeWithOpenAI = vi.fn();

vi.mocked(await import("../openai")).generateCoverLetter =
  mockGenerateCoverLetterWithOpenAI;
vi.mocked(await import("../openai")).tailorResume = mockTailorResumeWithOpenAI;

describe("Server Actions", () => {
  const mockResume: Variant = {
    name: "John Doe",
    title: "Software Engineer",
    contactInfo: {
      email: "john@example.com",
      phone: "+1234567890",
      location: "San Francisco, CA",
      website: "https://johndoe.dev",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      age: "30",
      nationality: "American",
    },
    summary: "Experienced software engineer",
    qualities: ["Problem-solving"],
    generalSkills: ["JavaScript", "Python"],
    skills: [
      {
        domain: "Programming",
        skills: ["JavaScript", "TypeScript"],
      },
    ],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: ["Built web applications"],
        techStack: ["React", "Node.js"],
      },
    ],
    projects: [
      {
        name: "Project A",
        description: "A web application",
        techStack: ["React"],
        period: { start: "2023", end: "2024" },
      },
    ],
    education: [
      {
        degree: "CS",
        institution: "University",
        year: "2020",
        location: "CA",
      },
    ],
    certifications: [],
    languages: [
      {
        name: "English",
        level: "Native",
      },
    ],
    publications: [],
    personalityTraits: ["Analytical"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateCoverLetter", () => {
    const defaultParams = {
      jobTitle: "Frontend Developer",
      jobDescription: "Looking for a React developer",
      currentResume: mockResume,
      apiKey: "test-api-key",
      selectedModel: "test-model",
    };

    describe("input validation", () => {
      it("should throw error when resume is missing", async () => {
        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            null as any,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "Resume data is required to generate a cover letter.",
        );
      });

      it("should throw error when API key is empty", async () => {
        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            "",
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "API key is required to generate a cover letter. Please configure your API key in settings.",
        );
      });

      it("should throw error when API key is only whitespace", async () => {
        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            "   ",
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "API key is required to generate a cover letter. Please configure your API key in settings.",
        );
      });

      it("should throw error when selected model is empty", async () => {
        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            "",
          ),
        ).rejects.toThrow(
          "Model selection is required to generate a cover letter. Please select a model in settings.",
        );
      });

      it("should throw error when resume lacks name", async () => {
        const resumeWithoutName = {
          ...mockResume,
          name: "",
        };

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            resumeWithoutName as any,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "Resume must contain at least a name to generate a cover letter.",
        );
      });

      it("should warn when resume lacks location but still generate cover letter", async () => {
        const resumeWithoutLocation = {
          ...mockResume,
          contactInfo: { ...mockResume.contactInfo, location: "" },
        };

        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Manager, I am writing to express my interest in this position. My experience and skills make me a great candidate for this role. I look forward to hearing from you.",
        );
        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        const result = await generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          resumeWithoutLocation as any,
          defaultParams.apiKey,
          defaultParams.selectedModel,
        );

        expect(result).toBe(
          "Dear Hiring Manager, I am writing to express my interest in this position. My experience and skills make me a great candidate for this role. I look forward to hearing from you.",
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          "Resume is missing location information for the cover letter header.",
        );

        consoleSpy.mockRestore();
      });

      it("should throw error for spontaneous application without company description", async () => {
        await expect(
          generateCoverLetter(
            "", // Empty job title for spontaneous application
            "",
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
            "", // Empty company description
          ),
        ).rejects.toThrow(
          "Company description is required for spontaneous applications. Please provide information about the company you're applying to.",
        );
      });

      it("should allow spontaneous application with company description", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Manager, I am excited to apply to your company. My background in software engineering aligns well with your team's needs. I would welcome the opportunity to contribute to your organization.",
        );

        const result = await generateCoverLetter(
          "", // Empty job title
          "", // Empty job description
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "Great tech company",
          "en",
        );

        expect(result).toBe(
          "Dear Hiring Manager, I am excited to apply to your company. My background in software engineering aligns well with your team's needs. I would welcome the opportunity to contribute to your organization.",
        );
        expect(mockGenerateCoverLetterWithOpenAI).toHaveBeenCalledWith(
          "",
          "",
          defaultParams.currentResume,
          "test-api-key",
          "test-model",
          "Great tech company",
          "en",
        );
      });
    });

    describe("input sanitization", () => {
      it("should trim whitespace from all string inputs", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Team, I am writing to express my strong interest in the position. My skills and experience make me an ideal candidate. I look forward to discussing how I can contribute to your team.",
        );

        await generateCoverLetter(
          "  Frontend Developer  ",
          "  Job description  ",
          defaultParams.currentResume,
          "  api-key  ",
          "  model-name  ",
          "  Company desc  ",
          "  en  ",
        );

        expect(mockGenerateCoverLetterWithOpenAI).toHaveBeenCalledWith(
          "Frontend Developer",
          "Job description",
          defaultParams.currentResume,
          "api-key",
          "model-name",
          "Company desc",
          "en",
        );
      });

      it("should handle undefined optional parameters gracefully", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Manager, I am pleased to submit my application for this role. My professional background and technical skills align perfectly with your requirements. I am eager to contribute to your organization.",
        );

        const result = await generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          // No companyDescription or language
        );

        expect(result).toBe(
          "Dear Hiring Manager, I am pleased to submit my application for this role. My professional background and technical skills align perfectly with your requirements. I am eager to contribute to your organization.",
        );
        expect(mockGenerateCoverLetterWithOpenAI).toHaveBeenCalledWith(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "",
          "en",
        );
      });

      it("should default to English for unsupported language", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Manager, I am thrilled to apply for this position. My diverse skill set and passion for technology make me a strong candidate. I would love to discuss my qualifications further.",
        );
        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        await generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "Company description",
          "unsupported-lang",
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          'Unsupported language "unsupported-lang", defaulting to English',
        );
        expect(mockGenerateCoverLetterWithOpenAI).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.any(Object),
          expect.any(String),
          expect.any(String),
          expect.any(String),
          "en", // Should default to en
        );

        consoleSpy.mockRestore();
      });

      it("should accept supported languages", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Manager, I am writing to express my interest in joining your team. My experience and dedication make me well-suited for this role. I am excited about the opportunity to contribute.",
        );

        for (const lang of ["en", "fr", "pt"]) {
          vi.clearAllMocks();

          await generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
            "Company description",
            lang,
          );

          expect(mockGenerateCoverLetterWithOpenAI).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            expect.any(String),
            lang,
          );
        }
      });
    });

    describe("result validation", () => {
      it("should throw error when AI returns null", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(null);

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "The AI service returned an empty response. Please try again or select a different model.",
        );
      });

      it("should throw error when AI returns empty string", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue("");

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "The AI service returned an empty response. Please try again or select a different model.",
        );
      });

      it("should throw error when cover letter content is too short", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue("Short");

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "The AI generated an invalid cover letter: Content too short. Please try again with a different model or adjust your input.",
        );
      });

      it("should return valid cover letter without warnings", async () => {
        const longCoverLetter =
          "Dear Hiring Manager, I am writing to express my strong interest in this position at your company. My extensive experience in software development and my passion for creating innovative solutions make me an ideal candidate for this role. I have worked on numerous projects that demonstrate my ability to work effectively in team environments and deliver high-quality results on time.";
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(longCoverLetter);

        const result = await generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
        );

        expect(result).toBe(longCoverLetter);
      });
    });

    describe("enhanced error handling", () => {
      it("should provide specific error for API key issues", async () => {
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(
          new Error("Invalid API key provided"),
        );

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "Invalid API key. Please check your OpenRouter API key in settings and ensure it's active on your account.",
        );
      });

      it("should provide specific error for rate limiting", async () => {
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(
          new Error("Rate limit exceeded"),
        );

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "Rate limit exceeded. Please wait a moment before trying again, or consider switching to a free model.",
        );
      });

      it("should provide specific error for model unavailability", async () => {
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(
          new Error("Model not found"),
        );

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "The selected AI model is currently unavailable. Please try a different model from the settings.",
        );
      });

      it("should provide specific error for quota issues", async () => {
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(
          new Error("Insufficient credits"),
        );

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "Insufficient credits or quota exceeded. Please check your OpenRouter account balance or switch to a free model.",
        );
      });

      it("should provide specific error for empty content", async () => {
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(
          new Error("AI generated empty cover letter content"),
        );

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "The AI service did not generate any content. This may be due to content filtering or model issues. Please try again with different inputs or a different model.",
        );
      });

      it("should re-throw well-formatted errors", async () => {
        const customError = new Error("Custom well-formatted error message");
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(customError);

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow("Custom well-formatted error message");
      });

      it("should provide fallback error for non-Error objects", async () => {
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue("String error");

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow(
          "Failed to generate cover letter. Please check your API key and selected model, then try again.",
        );
      });

      it("should log all errors for debugging", async () => {
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});
        mockGenerateCoverLetterWithOpenAI.mockRejectedValue(
          new Error("Test error"),
        );

        await expect(
          generateCoverLetter(
            defaultParams.jobTitle,
            defaultParams.jobDescription,
            defaultParams.currentResume,
            defaultParams.apiKey,
            defaultParams.selectedModel,
          ),
        ).rejects.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(
          "Error generating cover letter:",
          expect.any(Error),
        );
        consoleSpy.mockRestore();
      });
    });

    describe("successful execution", () => {
      it("should call OpenAI function with correct parameters", async () => {
        mockGenerateCoverLetterWithOpenAI.mockResolvedValue(
          "Dear Hiring Manager, I am delighted to apply for this opportunity. My professional experience and technical expertise align well with your needs. I am confident I can make a valuable contribution to your team.",
        );

        const result = await generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "Company description",
          "fr",
        );

        expect(result).toBe(
          "Dear Hiring Manager, I am delighted to apply for this opportunity. My professional experience and technical expertise align well with your needs. I am confident I can make a valuable contribution to your team.",
        );
        expect(mockGenerateCoverLetterWithOpenAI).toHaveBeenCalledWith(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "Company description",
          "fr",
        );
      });
    });
  });

  describe("getResume", () => {
    it("should return English resume by default", async () => {
      const result = await getResume();
      expect(result).toBeDefined();
      expect(result).toHaveProperty("name");
    });

    it("should return French resume for 'fr' locale", async () => {
      const result = await getResume("fr");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("name");
    });

    it("should return Portuguese resume for 'pt' locale", async () => {
      const result = await getResume("pt");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("name");
    });

    it("should return English resume for unsupported locale", async () => {
      const result = await getResume("unsupported");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("name");
    });
  });

  describe("tailorResume", () => {
    const defaultParams = {
      jobTitle: "Software Engineer",
      jobDescription: "Looking for a developer",
      currentResume: mockResume,
      aiInstructions: "Tailor the resume",
      apiKey: "test-api-key",
      selectedModel: "test-model",
    };

    it("should call OpenAI function and return result", async () => {
      const tailoredResume = { ...mockResume, title: "Updated Title" };
      mockTailorResumeWithOpenAI.mockResolvedValue(tailoredResume);

      const result = await tailorResume(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.aiInstructions,
        defaultParams.apiKey,
        defaultParams.selectedModel,
      );

      expect(result).toEqual(tailoredResume);
      expect(mockTailorResumeWithOpenAI).toHaveBeenCalledWith(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.aiInstructions,
        defaultParams.apiKey,
        defaultParams.selectedModel,
      );
    });

    it("should handle and re-throw Error instances", async () => {
      const customError = new Error("Tailoring failed");
      mockTailorResumeWithOpenAI.mockRejectedValue(customError);

      await expect(
        tailorResume(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.aiInstructions,
          defaultParams.apiKey,
          defaultParams.selectedModel,
        ),
      ).rejects.toThrow("Tailoring failed");
    });

    it("should provide fallback error message for non-Error objects", async () => {
      mockTailorResumeWithOpenAI.mockRejectedValue("String error");

      await expect(
        tailorResume(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.aiInstructions,
          defaultParams.apiKey,
          defaultParams.selectedModel,
        ),
      ).rejects.toThrow(
        "Failed to tailor resume with OpenRouter. Please check your API key and selected model, then try again.",
      );
    });

    it("should log errors for debugging", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockTailorResumeWithOpenAI.mockRejectedValue(new Error("Test error"));

      await expect(
        tailorResume(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.aiInstructions,
          defaultParams.apiKey,
          defaultParams.selectedModel,
        ),
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error tailoring resume:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
