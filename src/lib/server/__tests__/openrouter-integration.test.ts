import { beforeEach, describe, expect, it, vi } from "vitest";
import { AVAILABLE_MODELS } from "../../models";
import type { Variant } from "../../types";
import { generateCoverLetter, tailorResume } from "../openai";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

describe("OpenRouter Integration Server Tests", () => {
  const mockResume: Variant = {
    title: "Software Engineer",
    name: "John Doe",
    contactInfo: {
      email: "john@example.com",
      phone: "+1234567890",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      website: "johndoe.dev",
      age: "30",
      nationality: "American",
      permit: "US Citizen",
    },
    summary: "Experienced software engineer with 5 years of experience",
    generalSkills: ["JavaScript", "TypeScript", "React", "Node.js"],
    skills: [
      {
        domain: "Frontend",
        skills: ["React", "Vue.js", "Angular", "HTML", "CSS"],
      },
      {
        domain: "Backend",
        skills: ["Node.js", "Express", "MongoDB", "PostgreSQL"],
      },
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: [
          "Built scalable web applications serving 100k+ users",
          "Led team of 5 developers",
          "Improved application performance by 40%",
        ],
        techStack: ["React", "Node.js", "MongoDB"],
        isPrevious: false,
      },
      {
        title: "Software Engineer",
        company: "StartupCo",
        location: "Austin, TX",
        period: { start: "2018", end: "2020" },
        achievements: ["Developed REST APIs", "Implemented CI/CD pipelines"],
        techStack: ["JavaScript", "Express", "PostgreSQL"],
        isPrevious: true,
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description:
          "Built a full-stack e-commerce platform with payment integration",
        techStack: ["React", "Node.js", "Stripe", "MongoDB"],
        period: { start: "2021", end: "2022" },
      },
    ],
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "University of Technology",
        year: "2018",
        location: "California, USA",
      },
    ],
    certifications: [
      {
        degree: "AWS Certified Developer",
        institution: "Amazon Web Services",
        year: "2021",
        location: "Online",
      },
    ],
    publications: [],
    personalityTraits: ["Problem solver", "Team player", "Detail-oriented"],
    qualities: [],
    languages: [],
    changes: [],
  };

  const testJobTitle = "Frontend Developer";
  const testJobDescription = `
    We are looking for a Frontend Developer with 3+ years of experience in React.
    The ideal candidate should have experience with:
    - React and modern JavaScript
    - State management (Redux, Context API)
    - RESTful APIs
    - Responsive design
    - Git version control
  `;
  const testApiKey = "sk-or-test-key-123456789";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("OpenRouter Configuration Tests", () => {
    it("should configure OpenAI client with OpenRouter settings", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              function_call: {
                name: "tailor_resume",
                arguments: JSON.stringify({
                  ...mockResume,
                  title: testJobTitle,
                  changes: [
                    { field: "title", change: "Updated to match job title" },
                  ],
                }),
              },
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await tailorResume(
        testJobTitle,
        testJobDescription,
        mockResume,
        "",
        testApiKey,
        "openai/gpt-4.1-mini",
      );

      // Verify OpenAI client was configured with OpenRouter settings
      expect(mockOpenAI.default).toHaveBeenCalledWith({
        apiKey: testApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CV Tailor App",
        },
      });
    });

    it("should use environment variable for site URL when available", async () => {
      // Mock environment variable
      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = "https://cv-tailor.example.com";

      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "Test cover letter content",
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await generateCoverLetter(
        testJobTitle,
        testJobDescription,
        mockResume,
        testApiKey,
        "google/gemini-2.0-flash-exp:free",
      );

      expect(mockOpenAI.default).toHaveBeenCalledWith({
        apiKey: testApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://cv-tailor.example.com",
          "X-Title": "CV Tailor App",
        },
      });

      // Restore original environment
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    });
  });

  describe("Resume Tailoring with All Models", () => {
    it("should successfully tailor resume with each available model", async () => {
      const mockOpenAI = await import("openai");

      for (const model of AVAILABLE_MODELS) {
        const mockCreate = vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                function_call: {
                  name: "tailor_resume",
                  arguments: JSON.stringify({
                    ...mockResume,
                    title: testJobTitle,
                    summary: `Frontend-focused engineer with React expertise (tailored for ${model.name})`,
                    generalSkills: [
                      "React",
                      "JavaScript",
                      "TypeScript",
                      "HTML",
                      "CSS",
                    ],
                    changes: [
                      { field: "title", change: `Updated to ${testJobTitle}` },
                      {
                        field: "summary",
                        change: `Tailored for frontend role using ${model.name}`,
                      },
                      {
                        field: "skills",
                        change: "Prioritized frontend skills",
                      },
                    ],
                  }),
                },
              },
            },
          ],
        });

        const mockOpenAIInstance = new (mockOpenAI.default as any)();
        mockOpenAIInstance.chat.completions.create = mockCreate;
        vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

        const result = await tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          `Additional instructions for ${model.name}`,
          testApiKey,
          model.id,
        );

        // Verify the result
        expect(result.title).toBe(testJobTitle);
        expect(result.summary).toContain("Frontend-focused");
        expect(result.changes).toHaveLength(3);

        // Verify correct model was used
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model.id,
            functions: expect.arrayContaining([
              expect.objectContaining({
                name: "tailor_resume",
              }),
            ]),
            function_call: { name: "tailor_resume" },
          }),
        );

        // Verify system prompt includes additional instructions
        const systemMessage = mockCreate.mock.calls[0][0].messages[0];
        expect(systemMessage.role).toBe("system");
        expect(systemMessage.content).toContain(
          `Additional instructions for ${model.name}`,
        );

        vi.clearAllMocks();
      }
    });

    it("should handle function call response correctly for all models", async () => {
      const mockOpenAI = await import("openai");

      for (const model of AVAILABLE_MODELS) {
        const tailoredData = {
          title: `${testJobTitle} - ${model.provider}`,
          summary: `Tailored summary for ${model.name}`,
          generalSkills: ["React", "JavaScript"],
          skills: [{ domain: "Frontend", skills: ["React"] }],
          experience: mockResume.experience,
          projects: mockResume.projects,
          education: mockResume.education,
          certifications: mockResume.certifications,
          publications: mockResume.publications,
          personalityTraits: mockResume.personalityTraits,
          changes: [
            { field: "title", change: `Updated for ${model.provider}` },
          ],
        };

        const mockCreate = vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                function_call: {
                  name: "tailor_resume",
                  arguments: JSON.stringify(tailoredData),
                },
              },
            },
          ],
        });

        const mockOpenAIInstance = new (mockOpenAI.default as any)();
        mockOpenAIInstance.chat.completions.create = mockCreate;
        vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

        const result = await tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          testApiKey,
          model.id,
        );

        expect(result.title).toBe(`${testJobTitle} - ${model.provider}`);
        expect(result.summary).toBe(`Tailored summary for ${model.name}`);
        expect(result.changes[0].change).toBe(`Updated for ${model.provider}`);

        vi.clearAllMocks();
      }
    });
  });

  describe("Cover Letter Generation with All Models", () => {
    it("should successfully generate cover letter with each available model", async () => {
      const mockOpenAI = await import("openai");

      for (const model of AVAILABLE_MODELS) {
        const expectedCoverLetter = `
Dear Hiring Manager,

I am excited to apply for the ${testJobTitle} position. With my 5 years of experience in software engineering and expertise in React, I am confident I would be a valuable addition to your team.

In my current role as Senior Software Engineer at Tech Corp, I have built scalable web applications serving over 100,000 users and led a team of 5 developers. My experience with React, JavaScript, and modern frontend technologies aligns perfectly with your requirements.

I am particularly drawn to this opportunity because of my passion for creating exceptional user experiences and my proven track record of improving application performance by 40%.

I would welcome the opportunity to discuss how my skills and experience can contribute to your team's success.

Best regards,
[Candidate Name]

Generated by ${model.name}
        `.trim();

        const mockCreate = vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: expectedCoverLetter,
              },
            },
          ],
        });

        const mockOpenAIInstance = new (mockOpenAI.default as any)();
        mockOpenAIInstance.chat.completions.create = mockCreate;
        vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

        const result = await generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          testApiKey,
          model.id,
        );

        expect(result).toBe(expectedCoverLetter);
        expect(result).toContain(testJobTitle);
        expect(result).toContain("Tech Corp");
        expect(result).toContain(model.name);

        // Verify correct model was used
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model.id,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        );

        vi.clearAllMocks();
      }
    });

    it("should include resume data in cover letter generation prompt", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "Generated cover letter content",
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await generateCoverLetter(
        testJobTitle,
        testJobDescription,
        mockResume,
        testApiKey,
        "deepseek/deepseek-chat-v3-0324:free",
      );

      const userMessage = mockCreate.mock.calls[0][0].messages[1];
      expect(userMessage.role).toBe("user");
      expect(userMessage.content).toContain(testJobTitle);
      expect(userMessage.content).toContain(testJobDescription);
      expect(userMessage.content).toContain("Tech Corp");
      expect(userMessage.content).toContain("Senior Software Engineer");
    });
  });

  describe("API Response Validation", () => {
    it("should handle missing function call in resume tailoring", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "Regular text response without function call",
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          testApiKey,
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(
        "Expected function call to tailor_resume was not returned",
      );
    });

    it("should handle invalid JSON in function call arguments", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              function_call: {
                name: "tailor_resume",
                arguments: "invalid json {",
              },
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          testApiKey,
          "google/gemini-2.0-flash-exp:free",
        ),
      ).rejects.toThrow();
    });

    it("should handle null cover letter response", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      const result = await generateCoverLetter(
        testJobTitle,
        testJobDescription,
        mockResume,
        testApiKey,
        "qwen/qwq-32b",
      );

      expect(result).toBeNull();
    });
  });

  describe("Model-Specific Behavior Tests", () => {
    it("should handle free models correctly", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "Cover letter from free model",
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      const freeModels = AVAILABLE_MODELS.filter((model) => model.isFree);

      for (const model of freeModels) {
        mockCreate.mockClear();

        const result = await generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          testApiKey,
          model.id,
        );

        expect(result).toBe("Cover letter from free model");
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model.id,
          }),
        );
      }
    });

    it("should handle paid models correctly", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              function_call: {
                name: "tailor_resume",
                arguments: JSON.stringify({
                  ...mockResume,
                  title: "Premium tailored title",
                  changes: [{ field: "title", change: "Premium tailoring" }],
                }),
              },
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      const paidModels = AVAILABLE_MODELS.filter((model) => !model.isFree);

      for (const model of paidModels) {
        mockCreate.mockClear();

        const result = await tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          testApiKey,
          model.id,
        );

        expect(result.title).toBe("Premium tailored title");
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model.id,
          }),
        );
      }
    });
  });
});
