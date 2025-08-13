import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverLetter } from "../openai";
import type { Variant } from "../../types";

// Mock OpenAI
const mockCreate = vi.fn();
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

describe("Enhanced Cover Letter Generation", () => {
  const mockResume: Variant = {
    name: "John Doe",
    title: "Software Engineer",
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      location: "San Francisco, CA",
      website: "https://johndoe.dev",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      age: "30",
      nationality: "American",
      permit: "US Citizen",
    },
    personalInfo: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      location: "San Francisco, CA",
    },
    summary: "Experienced software engineer with 5+ years of experience",
    qualities: ["Problem-solving", "Team leadership"],
    generalSkills: ["JavaScript", "Python", "React"],
    skills: [
      {
        domain: "Programming Languages",
        skills: ["JavaScript", "TypeScript", "Python"],
      },
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2021", end: "Present" },
        achievements: ["Led team of 5 developers", "Increased performance by 40%"],
        techStack: ["React", "Node.js", "AWS"],
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built scalable e-commerce solution",
        techStack: ["React", "Node.js", "MongoDB"],
      },
    ],
    education: [
      {
        degree: "Computer Science",
        institution: "UC Berkeley",
        year: "2018",
        location: "Berkeley, CA",
      },
    ],
    certifications: [],
    languages: [
      {
        language: "English",
        proficiency: "Native",
      },
    ],
    publications: [],
    personalityTraits: ["Analytical", "Creative"],
  };

  const defaultParams = {
    jobTitle: "Frontend Developer",
    jobDescription: "Looking for a skilled React developer",
    currentResume: mockResume,
    apiKey: "test-api-key",
    selectedModel: "test-model",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Enhanced prompting with company information", () => {
    it("should include company description in prompt for job applications", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: `<div>
                <h1>John Doe</h1>
                <p>john.doe@example.com | +1-555-0123 | San Francisco, CA</p>
                
                <h2>Cover letter for position Frontend Developer - Company Website - December 2024</h2>
                
                <p>Dear Hiring Manager,</p>
                
                <p>I am excited to express my interest in the Frontend Developer position at Amazing Tech Company...</p>
              </div>`,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Amazing Tech Company focused on innovation",
        "en"
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "test-model",
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("English"),
            }),
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("Amazing Tech Company focused on innovation"),
            }),
          ]),
        })
      );

      expect(result).toContain("john.doe@example.com");
      expect(result).toContain("Frontend Developer");
    });

    it("should handle spontaneous applications correctly", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: `<div>
                <h1>John Doe</h1>
                <p>john.doe@example.com | +1-555-0123 | San Francisco, CA</p>
                
                <h2>Spontaneous Application - Tech Startup Inc - December 2024</h2>
                
                <p>Dear Hiring Manager,</p>
                
                <p>I am writing to express my interest in potential opportunities at Tech Startup Inc...</p>
              </div>`,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCoverLetter(
        "", // Empty job title
        "", // Empty job description
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Tech Startup Inc working on AI solutions",
        "en"
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("Focus on company-specific interests and general fit"),
            }),
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("SPONTANEOUS APPLICATION"),
            }),
          ]),
        })
      );

      expect(result).toContain("Spontaneous Application");
      expect(result).toContain("Tech Startup Inc");
    });

    it("should generate cover letter in specified language", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: `<div>
                <h1>John Doe</h1>
                <p>john.doe@example.com | +1-555-0123 | San Francisco, CA</p>
                
                <h2>Lettre de motivation pour le poste Frontend Developer - Site Web - décembre 2024</h2>
                
                <p>Cher responsable du recrutement,</p>
                
                <p>Je suis ravi d'exprimer mon intérêt pour le poste de Frontend Developer...</p>
              </div>`,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Entreprise technologique française",
        "fr"
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("French"),
            }),
          ]),
        })
      );

      expect(result).toContain("Lettre de motivation");
    });

    it("should include proper date formatting for different locales", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: `<div>
                <h1>John Doe</h1>
                <p>john.doe@example.com | +1-555-0123 | San Francisco, CA</p>
                
                <h2>Carta de apresentação para a posição Frontend Developer - dezembro de 2024</h2>
                
                <p>Caro gerente de contratação,</p>
              </div>`,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Empresa brasileira de tecnologia",
        "pt"
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("Portuguese"),
            }),
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("Portuguese"),
            }),
          ]),
        })
      );
    });
  });

  describe("Content validation", () => {
    it("should validate that generated content includes contact information", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: `<div>
                <h1>John Doe</h1>
                <p>john.doe@example.com | +1-555-0123 | San Francisco, CA</p>
                <p>Cover letter content...</p>
              </div>`,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Test Company",
        "en"
      );

      expect(result).toContain("john.doe@example.com");
      expect(result).toContain("+1-555-0123");
      expect(result).toContain("John Doe");
    });

    it("should throw error for empty AI response", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "Test Company",
          "en"
        )
      ).rejects.toThrow("AI generated empty cover letter content");
    });

    it("should log warning for missing contact information", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: `<div>
                <h1>Anonymous</h1>
                <p>Cover letter without contact info...</p>
              </div>`,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Test Company",
        "en"
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Generated cover letter may be missing contact information"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Structured format requirements", () => {
    it("should include structured format requirements in system prompt", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Mock cover letter content",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Test Company",
        "en"
      );

      const systemPrompt = mockCreate.mock.calls[0][0].messages[0].content;

      expect(systemPrompt).toContain("REQUIRED STRUCTURE:");
      expect(systemPrompt).toContain("Header");
      expect(systemPrompt).toContain("Company Information");
      expect(systemPrompt).toContain("Salutation");
      expect(systemPrompt).toContain("Company Flattery Paragraph");
      expect(systemPrompt).toContain("Candidate Skills Paragraph");
      expect(systemPrompt).toContain("Collaboration Vision Paragraph");
      expect(systemPrompt).toContain("Interview Request");
      expect(systemPrompt).toContain("Sign-off");
    });

    it("should specify different title format for spontaneous applications", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Mock spontaneous application",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        "", // Empty job title for spontaneous application
        "",
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Test Company",
        "en"
      );

      const systemPrompt = mockCreate.mock.calls[0][0].messages[0].content;

      expect(systemPrompt).toContain("Spontaneous Application - [Company Name]");
    });
  });

  describe("Error handling", () => {
    it("should handle OpenAI API errors", async () => {
      const apiError = new Error("API rate limit exceeded");
      mockCreate.mockRejectedValue(apiError);

      await expect(
        generateCoverLetter(
          defaultParams.jobTitle,
          defaultParams.jobDescription,
          defaultParams.currentResume,
          defaultParams.apiKey,
          defaultParams.selectedModel,
          "Test Company",
          "en"
        )
      ).rejects.toThrow();
    });

    it("should use default language when none specified", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Mock cover letter in English",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Test Company"
        // No language parameter
      );

      const systemPrompt = mockCreate.mock.calls[0][0].messages[0].content;
      expect(systemPrompt).toContain("English");
    });
  });

  describe("Parameters validation", () => {
    it("should handle missing company description", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Cover letter without company description",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        defaultParams.jobTitle,
        defaultParams.jobDescription,
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel
        // No company description
      );

      const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
      expect(userPrompt).toContain("Company Information: Not specified");
    });

    it("should detect spontaneous application when job details are empty strings", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Spontaneous application",
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        "   ", // Whitespace only
        "   ", // Whitespace only
        defaultParams.currentResume,
        defaultParams.apiKey,
        defaultParams.selectedModel,
        "Test Company",
        "en"
      );

      const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
      expect(userPrompt).toContain("SPONTANEOUS APPLICATION");
    });
  });
});