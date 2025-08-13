import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverLetter, tailorResume } from "../server/actions";
import type { Variant } from "../types";

// Mock the OpenAI client
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

describe("Error Scenarios Integration Tests", () => {
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
    summary: "Experienced software engineer",
    generalSkills: ["JavaScript", "TypeScript"],
    skills: [{ domain: "Frontend", skills: ["React"] }],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: ["Built applications"],
        techStack: ["React"],
        isPrevious: false,
      },
    ],
    projects: [],
    education: [],
    certifications: [],
    publications: [],
    personalityTraits: [],
    qualities: [],
    languages: [],
    changes: [],
  };

  const testJobTitle = "Frontend Developer";
  const testJobDescription = "React developer position";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Invalid API Key Scenarios", () => {
    it("should handle invalid API key error for resume tailoring", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        code: 401,
        message: "Invalid API key provided",
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
          "invalid-api-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(
        "Invalid OpenRouter API key. Please check your API key in the settings and ensure it's active on your OpenRouter account.",
      );
    });

    it("should handle invalid API key error for cover letter generation", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        status: 401,
        message: "unauthorized",
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "invalid-api-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(
        "Invalid OpenRouter API key. Please check your API key in the settings and ensure it's active on your OpenRouter account.",
      );
    });

    it("should handle empty API key", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "invalid api key",
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
          "",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/Invalid OpenRouter API key/);
    });
  });

  describe("Model Unavailability Scenarios", () => {
    it("should handle model not found error with free model suggestions", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "model openai/gpt-4.1-mini not found",
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
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(
        /currently unavailable.*Try one of these free alternatives/,
      );
    });

    it("should handle model unavailable error for free models", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "model google/gemini-2.0-flash-exp:free does not exist",
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "sk-valid-key",
          "google/gemini-2.0-flash-exp:free",
        ),
      ).rejects.toThrow(/Gemini 2.0 Flash.*currently unavailable/);
    });

    it("should handle unknown model error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "model unknown/invalid-model not found",
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
          "sk-valid-key",
          "unknown/invalid-model",
        ),
      ).rejects.toThrow(
        /currently unavailable.*Try one of these free alternatives/,
      );
    });
  });

  describe("Rate Limiting Scenarios", () => {
    it("should handle rate limit error with free model suggestion", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        code: 429,
        message: "Rate limit exceeded",
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
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/rate limit exceeded.*Try switching to a free model/);
    });

    it("should handle too many requests error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "too many requests",
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "sk-valid-key",
          "qwen/qwq-32b",
        ),
      ).rejects.toThrow(/rate limit exceeded.*Please wait a moment/);
    });
  });

  describe("Quota and Credit Scenarios", () => {
    it("should handle insufficient credits error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "Insufficient credits",
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
          "sk-valid-key",
          "openai/gpt-oss-120b",
        ),
      ).rejects.toThrow(
        /Insufficient OpenRouter credits.*Try switching to a free model/,
      );
    });

    it("should handle quota exceeded error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "quota exceeded for this model",
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "sk-valid-key",
          "deepseek/deepseek-chat-v3-0324:free",
        ),
      ).rejects.toThrow(
        /quota exceeded.*check your OpenRouter account balance/,
      );
    });
  });

  describe("Network and Connection Scenarios", () => {
    it("should handle network connection error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "network connection failed",
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
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/Network error connecting to OpenRouter/);
    });

    it("should handle timeout error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "Request timeout",
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "sk-valid-key",
          "google/gemini-2.0-flash-exp:free",
        ),
      ).rejects.toThrow(/Network error connecting to OpenRouter/);
    });
  });

  describe("Generic Error Scenarios", () => {
    it("should handle unknown OpenRouter API error", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "Unknown server error",
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
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/OpenRouter API error: Unknown server error/);
    });

    it("should handle error without message", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue(new Error());

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/OpenRouter API error/);
    });

    it("should handle non-Error objects", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue("String error");

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/OpenRouter API error: String error/);
    });
  });

  describe("Server Action Error Handling", () => {
    it("should wrap OpenRouter errors in server actions for resume tailoring", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        code: 401,
        message: "Invalid API key",
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
          "invalid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(/Invalid OpenRouter API key/);
    });

    it("should wrap OpenRouter errors in server actions for cover letter generation", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue({
        message: "model not found",
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          "sk-valid-key",
          "invalid/model",
        ),
      ).rejects.toThrow(/currently unavailable/);
    });

    it("should provide fallback error message when OpenRouter error is unclear", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue(null);

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      await expect(
        tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          "sk-valid-key",
          "openai/gpt-4.1-mini",
        ),
      ).rejects.toThrow(
        /OpenRouter API error.*Please try again or select a different model/,
      );
    });
  });
});
