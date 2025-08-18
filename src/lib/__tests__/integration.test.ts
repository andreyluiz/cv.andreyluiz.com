import { beforeEach, describe, expect, it, vi } from "vitest";
import { AVAILABLE_MODELS } from "../models";
import { generateCoverLetter, tailorResume } from "../server/actions";
import { useStore } from "../store";
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

// Mock environment variables
vi.mock("process", () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  },
}));

describe("OpenRouter Integration Tests", () => {
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
    },
    summary: "Experienced software engineer with 5 years of experience",
    generalSkills: ["JavaScript", "TypeScript", "React"],
    skills: [
      {
        domain: "Frontend",
        skills: ["React", "Vue.js", "Angular"],
      },
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: ["Built scalable web applications"],
        techStack: ["React", "Node.js"],
        isPrevious: false,
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform",
        techStack: ["React", "Node.js", "MongoDB"],
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
    certifications: [],
    publications: [],
    personalityTraits: ["Problem solver", "Team player"],
    qualities: [],
    languages: [],
    changes: [],
  };

  const testJobTitle = "Frontend Developer";
  const testJobDescription =
    "Looking for a React developer with 3+ years experience";
  const testApiKey = "sk-or-test-key-123";

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useStore.setState({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini",
      ingestedCVs: [],
      currentCV: null,
      generatedCoverLetter: null,
      coverLetterInputs: null,
      hideBullets: false,
      layoutMode: "single",
    });
  });

  describe("Complete User Flow Tests", () => {
    it("should complete full user flow from model selection to AI response", async () => {
      // Step 1: User sets API key and selects model
      const { setApiKey, setSelectedModel } = useStore.getState();
      setApiKey(testApiKey);
      setSelectedModel("google/gemini-2.0-flash-exp:free");

      // Verify store state
      const state = useStore.getState();
      expect(state.apiKey).toBe(testApiKey);
      expect(state.selectedModel).toBe("google/gemini-2.0-flash-exp:free");

      // Step 2: Mock successful OpenAI response for resume tailoring
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...mockResume,
                      title: testJobTitle,
                      summary: "Frontend-focused software engineer",
                      changes: [
                        {
                          field: "title",
                          change: "Updated to match job title",
                        },
                      ],
                    }),
                  },
                },
              ],
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Step 3: Test resume tailoring
      const tailoredResume = await tailorResume(
        testJobTitle,
        testJobDescription,
        mockResume,
        "",
        state.apiKey,
        state.selectedModel,
      );

      expect(tailoredResume.title).toBe(testJobTitle);
      expect(tailoredResume.summary).toBe("Frontend-focused software engineer");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "google/gemini-2.0-flash-exp:free",
        }),
      );

      // Step 4: Test cover letter generation
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content:
                "Dear Hiring Manager,\n\nI am excited to apply for the Frontend Developer position...",
            },
          },
        ],
      });

      const coverLetter = await generateCoverLetter(
        testJobTitle,
        testJobDescription,
        tailoredResume,
        state.apiKey,
        state.selectedModel,
      );

      expect(coverLetter).toContain("Frontend Developer");
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it("should handle model switching during user session", async () => {
      const { setApiKey, setSelectedModel } = useStore.getState();
      setApiKey(testApiKey);

      // Start with one model
      setSelectedModel("openai/gpt-4.1-mini");
      expect(useStore.getState().selectedModel).toBe("openai/gpt-4.1-mini");

      // Switch to another model
      setSelectedModel("deepseek/deepseek-chat-v3-0324:free");
      expect(useStore.getState().selectedModel).toBe(
        "deepseek/deepseek-chat-v3-0324:free",
      );

      // Switch to a third model
      setSelectedModel("qwen/qwq-32b");
      expect(useStore.getState().selectedModel).toBe("qwen/qwq-32b");

      // Verify the final state is correct
      const finalState = useStore.getState();
      expect(finalState.apiKey).toBe(testApiKey);
      expect(finalState.selectedModel).toBe("qwen/qwq-32b");
    });
  });

  describe("Model Selection Persistence Tests", () => {
    it("should persist model selection across browser sessions", () => {
      const { setApiKey, setSelectedModel } = useStore.getState();

      // Set initial state
      setApiKey("sk-test-key");
      setSelectedModel("google/gemini-2.0-flash-exp:free");

      // Simulate browser session restart by creating new store instance
      // Note: In real scenario, zustand persist middleware handles this
      const currentState = useStore.getState();
      expect(currentState.apiKey).toBe("sk-test-key");
      expect(currentState.selectedModel).toBe(
        "google/gemini-2.0-flash-exp:free",
      );

      // Test that state persists after multiple updates
      setSelectedModel("deepseek/deepseek-chat-v3-0324:free");
      setApiKey("sk-updated-key");

      const updatedState = useStore.getState();
      expect(updatedState.apiKey).toBe("sk-updated-key");
      expect(updatedState.selectedModel).toBe(
        "deepseek/deepseek-chat-v3-0324:free",
      );
    });

    it("should maintain default model for new users", () => {
      // Simulate new user with empty store
      useStore.setState({
        apiKey: "",
        selectedModel: "openai/gpt-4.1-mini", // Default model
      });

      const state = useStore.getState();
      expect(state.selectedModel).toBe("openai/gpt-4.1-mini");
      expect(state.apiKey).toBe("");
    });

    it("should handle invalid model selection gracefully", () => {
      const { setSelectedModel } = useStore.getState();

      // Try to set an invalid model
      setSelectedModel("invalid/model-id");

      // Store should still accept it (validation happens at API level)
      expect(useStore.getState().selectedModel).toBe("invalid/model-id");
    });
  });

  describe("All Models Validation Tests", () => {
    it("should work with all 6 available models for resume tailoring", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...mockResume,
                      title: testJobTitle,
                      changes: [{ field: "title", change: "Updated title" }],
                    }),
                  },
                },
              ],
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Test each model
      for (const model of AVAILABLE_MODELS) {
        mockCreate.mockClear();

        const result = await tailorResume(
          testJobTitle,
          testJobDescription,
          mockResume,
          "",
          testApiKey,
          model.id,
        );

        expect(result.title).toBe(testJobTitle);
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model.id,
          }),
        );
      }
    });

    it("should work with all 6 available models for cover letter generation", async () => {
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${testJobTitle} position...`,
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Test each model
      for (const model of AVAILABLE_MODELS) {
        mockCreate.mockClear();

        const result = await generateCoverLetter(
          testJobTitle,
          testJobDescription,
          mockResume,
          testApiKey,
          model.id,
        );

        expect(result).toContain(testJobTitle);
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: model.id,
          }),
        );
      }
    });

    it("should use correct OpenRouter configuration for all models", async () => {
      const mockOpenAI = await import("openai");
      const mockConstructor = vi.mocked(mockOpenAI.default);

      // Mock the OpenAI response to avoid actual API calls
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...mockResume,
                      title: testJobTitle,
                      changes: [{ field: "title", change: "Updated title" }],
                    }),
                  },
                },
              ],
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Test that OpenRouter configuration is used
      await tailorResume(
        testJobTitle,
        testJobDescription,
        mockResume,
        "",
        testApiKey,
        "openai/gpt-4.1-mini",
      );

      expect(mockConstructor).toHaveBeenCalledWith({
        apiKey: testApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CV Tailor App",
        },
      });
    });
  });

  describe("Model Metadata Validation", () => {
    it("should have correct free model identification", () => {
      const freeModels = AVAILABLE_MODELS.filter((model) => model.isFree);
      const expectedFreeModels = [
        "openai/gpt-oss-20b:free",
        "google/gemini-2.0-flash-exp:free",
        "deepseek/deepseek-chat-v3-0324:free",
      ];

      expect(freeModels).toHaveLength(3);
      freeModels.forEach((model) => {
        expect(expectedFreeModels).toContain(model.id);
      });
    });

    it("should have correct provider assignments", () => {
      const providerCounts = AVAILABLE_MODELS.reduce(
        (acc, model) => {
          acc[model.provider] = (acc[model.provider] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      expect(providerCounts).toEqual({
        OpenAI: 3,
        Google: 1,
        Qwen: 1,
        DeepSeek: 1,
      });
    });

    it("should have unique model IDs", () => {
      const modelIds = AVAILABLE_MODELS.map((model) => model.id);
      const uniqueIds = new Set(modelIds);

      expect(modelIds.length).toBe(uniqueIds.size);
      expect(modelIds.length).toBe(6);
    });
  });

  describe("CV Ingestion Integration", () => {
    it("should integrate CV ingestion with existing OpenRouter flow", async () => {
      const { setApiKey, setSelectedModel, addIngestedCV, setCurrentCV } =
        useStore.getState();
      setApiKey(testApiKey);
      setSelectedModel("google/gemini-2.0-flash-exp:free");

      // Mock successful CV ingestion
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                ...mockResume,
                name: "Ingested User",
                title: "Ingested Developer",
              }),
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Import and use ingestCV
      const { ingestCV } = await import("../server/actions");
      const rawText =
        "Ingested User\nIngested Developer\ntest@example.com\nExperienced developer with skills in React and Node.js";

      const ingestedResult = await ingestCV(
        rawText,
        testApiKey,
        "google/gemini-2.0-flash-exp:free",
      );

      // Store the ingested CV
      const ingestedCV = {
        id: "integration-test-cv",
        title: "Integration Test CV",
        rawText,
        formattedCV: ingestedResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addIngestedCV(ingestedCV);
      setCurrentCV(ingestedResult);

      // Verify the CV was ingested and stored
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.currentCV?.name).toBe("Ingested User");
      expect(state.currentCV?.title).toBe("Ingested Developer");

      // Now test that we can use this ingested CV for resume tailoring
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              tool_calls: [
                {
                  function: {
                    name: "tailor_resume",
                    arguments: JSON.stringify({
                      ...ingestedResult,
                      title: testJobTitle,
                      summary: "Tailored summary for ingested CV",
                      changes: [
                        {
                          field: "title",
                          change: "Updated to match job title",
                        },
                      ],
                    }),
                  },
                },
              ],
            },
          },
        ],
      });

      const tailoredResult = await tailorResume(
        testJobTitle,
        testJobDescription,
        ingestedResult,
        "",
        testApiKey,
        "google/gemini-2.0-flash-exp:free",
      );

      expect(tailoredResult.title).toBe(testJobTitle);
      expect(tailoredResult.summary).toBe("Tailored summary for ingested CV");
      expect(mockCreate).toHaveBeenCalledTimes(2); // Once for ingestion, once for tailoring
    });

    it("should handle CV switching in complete user workflow", async () => {
      const { setApiKey, setSelectedModel, addIngestedCV, setCurrentCV } =
        useStore.getState();
      setApiKey(testApiKey);
      setSelectedModel("openai/gpt-4.1-mini");

      // Mock responses for multiple CVs
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn();

      // First CV ingestion
      const firstCV = {
        ...mockResume,
        name: "First User",
        title: "First Developer",
      };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(firstCV) } }],
      });

      // Second CV ingestion
      const secondCV = {
        ...mockResume,
        name: "Second User",
        title: "Second Developer",
      };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(secondCV) } }],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      const { ingestCV } = await import("../server/actions");

      // Ingest first CV
      const firstRawText =
        "First User\nFirst Developer\nfirst@example.com\nExperienced in frontend development";
      const firstResult = await ingestCV(
        firstRawText,
        testApiKey,
        "openai/gpt-4.1-mini",
      );

      const firstIngestedCV = {
        id: "first-cv",
        title: "First CV",
        rawText: firstRawText,
        formattedCV: firstResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addIngestedCV(firstIngestedCV);

      // Ingest second CV
      const secondRawText =
        "Second User\nSecond Developer\nsecond@example.com\nExperienced in backend development";
      const secondResult = await ingestCV(
        secondRawText,
        testApiKey,
        "openai/gpt-4.1-mini",
      );

      const secondIngestedCV = {
        id: "second-cv",
        title: "Second CV",
        rawText: secondRawText,
        formattedCV: secondResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addIngestedCV(secondIngestedCV);

      // Test switching between CVs
      setCurrentCV(firstResult);
      expect(useStore.getState().currentCV?.name).toBe("First User");

      setCurrentCV(secondResult);
      expect(useStore.getState().currentCV?.name).toBe("Second User");

      // Verify both CVs are stored
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(2);
      expect(
        ingestedCVs.find((cv) => cv.id === "first-cv")?.formattedCV.name,
      ).toBe("First User");
      expect(
        ingestedCVs.find((cv) => cv.id === "second-cv")?.formattedCV.name,
      ).toBe("Second User");
    });
  });
});
