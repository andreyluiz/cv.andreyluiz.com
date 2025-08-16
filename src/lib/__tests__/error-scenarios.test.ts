import { describe, expect, it, vi } from "vitest";
import { ingestCV } from "../server/actions";

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

describe("CV Ingestion Error Scenarios", () => {
  const mockApiKey = "test-api-key";
  const mockModel = "test-model";
  const mockRawText =
    "Valid CV text with enough content to pass validation requirements for testing purposes.";

  describe("network and connection errors", () => {
    it("should handle network timeout errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("Network timeout error"));

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
      ).rejects.toThrow(/Network error connecting to OpenRouter/);
    });

    it("should handle connection refused errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("Connection refused"));

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
      ).rejects.toThrow("Connection refused");
    });
  });

  describe("API authentication and authorization errors", () => {
    it("should handle invalid API key errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockRejectedValue({
        message: "Invalid API key provided",
        code: 401,
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
      ).rejects.toThrow(/Invalid API key/);
    });

    it("should handle unauthorized access errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockRejectedValue({
        message: "Unauthorized access",
        status: 401,
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
      ).rejects.toThrow(/Invalid API key/);
    });
  });

  describe("rate limiting and quota errors", () => {
    it("should handle rate limit exceeded errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockRejectedValue({
        message: "Rate limit exceeded",
        code: 429,
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
      ).rejects.toThrow(/Rate limit exceeded/);
    });

    it("should handle insufficient credits errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("Insufficient credits in your account"));

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
      ).rejects.toThrow(/Insufficient credits/);
    });

    it("should handle quota exceeded errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("Quota exceeded for this model"));

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
      ).rejects.toThrow(/Insufficient credits/);
    });
  });

  describe("model availability errors", () => {
    it("should handle model not found errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("The model 'test-model' does not exist"));

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
      ).rejects.toThrow(/currently unavailable on OpenRouter/);
    });

    it("should handle model unavailable errors", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi
        .fn()
        .mockRejectedValue(new Error("Model is currently unavailable"));

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
      ).rejects.toThrow(/Model is currently unavailable/);
    });
  });

  describe("AI response parsing errors", () => {
    it("should handle malformed JSON responses", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "{ invalid json response",
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
      ).rejects.toThrow(/could not be parsed as valid JSON/);
    });

    it("should handle responses with missing required fields", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                // Missing name and title
                contactInfo: { email: "test@example.com" },
                summary: "Test summary",
              }),
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
      ).rejects.toThrow(/must contain a valid name/);
    });

    it("should handle completely empty AI responses", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "",
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
      ).rejects.toThrow(/AI generated empty CV content/);
    });

    it("should handle null AI responses", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
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
      ).rejects.toThrow(/AI generated empty CV content/);
    });
  });

  describe("input validation edge cases", () => {
    it("should handle whitespace-only raw text", async () => {
      await expect(
        ingestCV("   \n\t   ", mockApiKey, mockModel),
      ).rejects.toThrow(/Raw CV text is required/);
    });

    it("should handle whitespace-only API key", async () => {
      await expect(
        ingestCV(mockRawText, "   \n\t   ", mockModel),
      ).rejects.toThrow(/API key is required/);
    });

    it("should handle whitespace-only model", async () => {
      await expect(
        ingestCV(mockRawText, mockApiKey, "   \n\t   "),
      ).rejects.toThrow(/Model selection is required/);
    });

    it("should handle text at exact minimum length", async () => {
      const exactMinText = "a".repeat(50);

      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: "Test User",
                title: "Test Title",
                contactInfo: {},
                summary: "",
                qualities: [],
                generalSkills: [],
                skills: [],
                experience: [],
                projects: [],
                education: [],
                certifications: [],
                languages: [],
                publications: [],
                personalityTraits: [],
              }),
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

      // Should not throw for exactly 50 characters
      await expect(
        ingestCV(exactMinText, mockApiKey, mockModel),
      ).resolves.toBeDefined();
    });

    it("should handle text at exact maximum length", async () => {
      const exactMaxText = "a".repeat(50000);

      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: "Test User",
                title: "Test Title",
                contactInfo: {},
                summary: "",
                qualities: [],
                generalSkills: [],
                skills: [],
                experience: [],
                projects: [],
                education: [],
                certifications: [],
                languages: [],
                publications: [],
                personalityTraits: [],
              }),
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

      // Should not throw for exactly 50,000 characters
      await expect(
        ingestCV(exactMaxText, mockApiKey, mockModel),
      ).resolves.toBeDefined();
    });
  });
});
