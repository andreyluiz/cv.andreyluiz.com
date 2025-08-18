import { describe, expect, it, vi } from "vitest";
import type { Variant } from "../../types";
import { ingestCV } from "../actions";

// Mock the OpenAI module
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe("CV Ingestion Server Action", () => {
  const mockApiKey = "test-api-key";
  const mockModel = "test-model";
  const mockRawText = `
    John Doe
    Software Engineer
    john.doe@example.com
    +1-555-0123
    New York, NY
    
    EXPERIENCE
    Senior Software Engineer at Tech Corp (2020-Present)
    - Developed web applications using React and Node.js
    - Led a team of 5 developers
    
    EDUCATION
    Bachelor of Computer Science
    University of Technology (2018)
    
    SKILLS
    JavaScript, React, Node.js, Python
  `;

  const mockFormattedCV: Variant = {
    name: "John Doe",
    title: "Software Engineer",
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      location: "New York, NY",
      website: "",
      linkedin: "",
      github: "",
      age: "",
      nationality: "",
    },
    summary: "Experienced software engineer with expertise in web development",
    qualities: [],
    generalSkills: ["JavaScript", "React", "Node.js", "Python"],
    skills: [
      {
        domain: "Programming Languages",
        skills: ["JavaScript", "Python"],
      },
      {
        domain: "Frameworks",
        skills: ["React", "Node.js"],
      },
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "New York, NY",
        period: { start: "2020-01", end: "Present" },
        achievements: [
          "Developed web applications using React and Node.js",
          "Led a team of 5 developers",
        ],
        techStack: ["React", "Node.js"],
        isPrevious: false,
      },
    ],
    projects: [],
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "University of Technology",
        year: "2018",
        location: "",
      },
    ],
    certifications: [],
    languages: [],
    publications: [],
    personalityTraits: [],
  };

  describe("input validation", () => {
    it("should throw error for empty raw text", async () => {
      await expect(ingestCV("", mockApiKey, mockModel)).rejects.toThrow(
        "Raw CV text is required for ingestion.",
      );
    });

    it("should throw error for text that is too short", async () => {
      await expect(
        ingestCV("Short text", mockApiKey, mockModel),
      ).rejects.toThrow(
        "CV text is too short. Please provide at least 50 characters.",
      );
    });

    it("should throw error for text that is too long", async () => {
      const longText = "a".repeat(50001);
      await expect(ingestCV(longText, mockApiKey, mockModel)).rejects.toThrow(
        "CV text is too long. Please limit to 50,000 characters.",
      );
    });

    it("should throw error for empty API key", async () => {
      await expect(ingestCV(mockRawText, "", mockModel)).rejects.toThrow(
        "API key is required to process CV. Please configure your API key in settings.",
      );
    });

    it("should throw error for empty model", async () => {
      await expect(ingestCV(mockRawText, mockApiKey, "")).rejects.toThrow(
        "Model selection is required to process CV. Please select a model in settings.",
      );
    });
  });

  describe("successful CV ingestion", () => {
    it("should successfully ingest and format CV", async () => {
      // Mock the OpenAI response
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "ingest_cv",
                    arguments: JSON.stringify(mockFormattedCV),
                  },
                },
              ],
            },
          },
        ],
      });

      mockConstructor.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as any,
      );

      const result = await ingestCV(mockRawText, mockApiKey, mockModel);

      expect(result).toEqual(mockFormattedCV);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: mockModel,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("CV formatting assistant"),
            }),
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(mockRawText.trim()),
            }),
          ]),
          tools: expect.arrayContaining([
            expect.objectContaining({
              type: "function",
              function: expect.objectContaining({
                name: "ingest_cv",
              }),
            }),
          ]),
          tool_choice: { type: "function", function: { name: "ingest_cv" } },
          max_completion_tokens: 8000,
          temperature: 0.3,
        }),
      );
    });

    it("should handle different languages", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "ingest_cv",
                    arguments: JSON.stringify(mockFormattedCV),
                  },
                },
              ],
            },
          },
        ],
      });

      mockConstructor.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as any,
      );

      await ingestCV(mockRawText, mockApiKey, mockModel, "fr");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: expect.stringContaining("French"),
            }),
          ]),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle AI response parsing errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "ingest_cv",
                    arguments: "invalid json response",
                  },
                },
              ],
            },
          },
        ],
      });

      mockConstructor.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as any,
      );

      await expect(
        ingestCV(mockRawText, mockApiKey, mockModel),
      ).rejects.toThrow();
    });

    it("should handle missing required fields", async () => {
      const incompleteCV = { ...mockFormattedCV, name: "" };

      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "ingest_cv",
                    arguments: JSON.stringify(incompleteCV),
                  },
                },
              ],
            },
          },
        ],
      });

      mockConstructor.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as any,
      );

      await expect(
        ingestCV(mockRawText, mockApiKey, mockModel),
      ).rejects.toThrow("CV must contain a valid name");
    });

    it("should handle empty AI response", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: null,
            },
          },
        ],
      });

      mockConstructor.mockImplementation(
        () =>
          ({
            chat: {
              completions: {
                create: mockCreate,
              },
            },
          }) as any,
      );

      await expect(
        ingestCV(mockRawText, mockApiKey, mockModel),
      ).rejects.toThrow("Expected tool call to ingest_cv was not returned");
    });
  });

});
