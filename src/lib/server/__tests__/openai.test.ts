import OpenAI from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Variant } from "../../types";
import { generateCoverLetter, tailorResume } from "../openai";

// Mock OpenAI
const mockCreate = vi.fn();

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

// Mock models
vi.mock("../../models", () => ({
  AVAILABLE_MODELS: [
    {
      id: "openai/gpt-4.1-mini",
      name: "GPT-4.1 Mini",
      provider: "OpenAI",
      isFree: false,
    },
    {
      id: "google/gemini-2.0-flash-exp:free",
      name: "Gemini 2.0 Flash (Free)",
      provider: "Google",
      isFree: true,
    },
  ],
  getFreeModels: () => [
    {
      id: "google/gemini-2.0-flash-exp:free",
      name: "Gemini 2.0 Flash (Free)",
      provider: "Google",
      isFree: true,
    },
  ],
}));

describe("OpenRouter Client", () => {
  const mockApiKey = "sk-test-openrouter-key";
  const mockSelectedModel = "openai/gpt-4.1-mini";
  const mockJobTitle = "Software Engineer";
  const mockJobDescription =
    "We are looking for a skilled software engineer...";
  const mockAiInstructions = "Focus on backend experience";

  const mockResume: Variant = {
    name: "John Doe",
    title: "Developer",
    contactInfo: {
      email: "john@example.com",
      phone: "+1234567890",
      location: "New York, NY",
      website: "https://johndoe.com",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      age: "30",
      nationality: "American",
    },
    summary: "Experienced developer",
    qualities: ["Problem solver"],
    generalSkills: ["JavaScript", "Python"],
    skills: [
      {
        domain: "Programming",
        skills: ["JavaScript", "Python", "TypeScript"],
      },
    ],
    experience: [
      {
        title: "Software Developer",
        company: "Tech Corp",
        location: "New York, NY",
        period: { start: "2020", end: "2023" },
        achievements: ["Built web applications"],
        techStack: ["React", "Node.js"],
      },
    ],
    education: [
      {
        degree: "BS Computer Science",
        institution: "University",
        year: "2020",
        location: "New York, NY",
      },
    ],
    certifications: [],
    languages: [
      {
        name: "English",
        level: "Native",
      },
    ],
    personalityTraits: ["Collaborative"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  describe("OpenAI client configuration", () => {
    it("should configure OpenAI client with OpenRouter settings", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...mockResume,
                      title: mockJobTitle,
                      changes: [{ field: "title", change: "Updated title" }],
                    }),
                  },
                },
              ],
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await tailorResume(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockAiInstructions,
        mockApiKey,
        mockSelectedModel,
      );

      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: mockApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CV Tailor App",
        },
      });
    });

    it("should use environment variable for site URL", async () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const mockResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...mockResume,
                      changes: [],
                    }),
                  },
                },
              ],
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await tailorResume(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockAiInstructions,
        mockApiKey,
        mockSelectedModel,
      );

      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: mockApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://example.com",
          "X-Title": "CV Tailor App",
        },
      });
    });
  });

  describe("tailorResume", () => {
    it("should call OpenAI API with correct parameters", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...mockResume,
                      title: mockJobTitle,
                      changes: [{ field: "title", change: "Updated title" }],
                    }),
                  },
                },
              ],
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await tailorResume(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockAiInstructions,
        mockApiKey,
        mockSelectedModel,
      );

      expect(mockCreate).toHaveBeenCalledWith({
        model: mockSelectedModel,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: expect.stringContaining(
              "You are a professional resume tailor",
            ),
          }),
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining(mockJobTitle),
          }),
        ]),
        tools: expect.arrayContaining([
          expect.objectContaining({
            type: "function",
            function: expect.objectContaining({
              name: "tailor_resume",
            }),
          }),
        ]),
        tool_choice: { type: "function", function: { name: "tailor_resume" } },
        max_completion_tokens: 10000,
        temperature: 0.7,
      });
    });

    it("should return tailored resume data", async () => {
      const tailoredData = {
        ...mockResume,
        title: mockJobTitle,
        summary: "Updated summary",
        changes: [{ field: "summary", change: "Updated summary" }],
      };

      const mockResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify(tailoredData),
                  },
                },
              ],
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await tailorResume(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockAiInstructions,
        mockApiKey,
        mockSelectedModel,
      );

      expect(result).toEqual(tailoredData);
    });

    it("should include AI instructions in system prompt", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({ ...mockResume, changes: [] }),
                  },
                },
              ],
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await tailorResume(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockAiInstructions,
        mockApiKey,
        mockSelectedModel,
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining(mockAiInstructions),
            }),
          ]),
        }),
      );
    });
  });

  describe("generateCoverLetter", () => {
    it("should call OpenAI API with correct parameters", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Generated cover letter content",
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await generateCoverLetter(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockApiKey,
        mockSelectedModel,
        "Test Company Description",
        "en",
      );

      expect(mockCreate).toHaveBeenCalledWith({
        model: mockSelectedModel,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: expect.stringContaining(
              "professional cover letter writer",
            ),
          }),
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining(mockJobTitle),
          }),
        ]),
        max_tokens: 3000,
        temperature: 0.7,
      });
    });

    it("should return cover letter content", async () => {
      const coverLetterContent = "Generated cover letter content";
      const mockResponse = {
        choices: [
          {
            message: {
              content: coverLetterContent,
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateCoverLetter(
        mockJobTitle,
        mockJobDescription,
        mockResume,
        mockApiKey,
        mockSelectedModel,
        "Test Company Description",
        "en",
      );

      expect(result).toBe(coverLetterContent);
    });
  });

  describe("error handling", () => {
    it("should handle model unavailable errors", async () => {
      const modelError = new Error("model not found");
      mockCreate.mockRejectedValue(modelError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          "invalid/model",
        ),
      ).rejects.toThrow(/currently unavailable on OpenRouter/);
    });

    it("should handle authentication errors", async () => {
      const authError = { code: 401, message: "unauthorized" };
      mockCreate.mockRejectedValue(authError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/Invalid OpenRouter API key/);
    });

    it("should handle rate limit errors", async () => {
      const rateLimitError = { code: 429, message: "rate limit exceeded" };
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/OpenRouter rate limit exceeded/);
    });

    it("should handle insufficient credits errors", async () => {
      const creditsError = { message: "insufficient credits" };
      mockCreate.mockRejectedValue(creditsError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/Insufficient OpenRouter credits/);
    });

    it("should handle network errors", async () => {
      const networkError = { message: "network timeout" };
      mockCreate.mockRejectedValue(networkError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/Network error connecting to OpenRouter/);
    });

    it("should handle generic errors", async () => {
      const genericError = { message: "unknown error" };
      mockCreate.mockRejectedValue(genericError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/OpenRouter API error: unknown error/);
    });

    it("should suggest free models for rate limit errors", async () => {
      const rateLimitError = { code: 429, message: "rate limit exceeded" };
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/Try switching to a free model like Gemini 2.0 Flash/);
    });
  });

  describe("function call validation", () => {
    it("should throw error when function call is missing", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Regular response without function call",
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/Expected tool call to tailor_resume was not returned/);
    });

    it("should throw error when wrong function is called", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "wrong_function",
                    arguments: "{}",
                  },
                },
              ],
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        tailorResume(
          mockJobTitle,
          mockJobDescription,
          mockResume,
          mockAiInstructions,
          mockApiKey,
          mockSelectedModel,
        ),
      ).rejects.toThrow(/Expected tool call to tailor_resume was not returned/);
    });
  });
});
