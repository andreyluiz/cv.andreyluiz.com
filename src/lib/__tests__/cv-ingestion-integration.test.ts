import { beforeEach, describe, expect, it, vi } from "vitest";
import { ingestCV } from "../server/actions";
import { useStore } from "../store";
import type { IngestedCV, Variant } from "../types";

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

// Mock environment variables
vi.mock("process", () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  },
}));

describe("CV Ingestion Integration Tests", () => {
  const mockApiKey = "sk-or-test-key-123";
  const mockModel = "openai/gpt-4.1-mini";
  const mockRawText = `
    John Doe
    Senior Software Engineer
    john.doe@example.com
    +1-555-0123
    San Francisco, CA
    linkedin.com/in/johndoe
    github.com/johndoe
    
    PROFESSIONAL SUMMARY
    Experienced software engineer with 5+ years of experience in full-stack development.
    
    EXPERIENCE
    Senior Software Engineer at Tech Corp (2020-Present)
    - Developed scalable web applications using React and Node.js
    - Led a team of 5 developers on multiple projects
    - Implemented CI/CD pipelines reducing deployment time by 50%
    
    Software Engineer at StartupCo (2018-2020)
    - Built REST APIs using Python and Django
    - Collaborated with cross-functional teams
    
    EDUCATION
    Bachelor of Computer Science
    University of Technology (2018)
    San Francisco, CA
    
    SKILLS
    JavaScript, TypeScript, React, Node.js, Python, Django, AWS, Docker
    
    PROJECTS
    E-commerce Platform (2021-2022)
    - Built full-stack e-commerce platform with React and Node.js
    - Integrated payment processing and inventory management
    
    CERTIFICATIONS
    AWS Certified Developer Associate (2021)
    
    LANGUAGES
    English (Native), Spanish (Conversational)
  `;

  const mockFormattedCV: Variant = {
    name: "John Doe",
    title: "Senior Software Engineer",
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      website: "",
      age: "",
      nationality: "",
    },
    summary: "Experienced software engineer with 5+ years of experience in full-stack development.",
    qualities: [],
    generalSkills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Django", "AWS", "Docker"],
    skills: [
      {
        domain: "Frontend",
        skills: ["JavaScript", "TypeScript", "React"],
      },
      {
        domain: "Backend",
        skills: ["Node.js", "Python", "Django"],
      },
      {
        domain: "Cloud & DevOps",
        skills: ["AWS", "Docker"],
      },
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020-01", end: "Present" },
        achievements: [
          "Developed scalable web applications using React and Node.js",
          "Led a team of 5 developers on multiple projects",
          "Implemented CI/CD pipelines reducing deployment time by 50%",
        ],
        techStack: ["React", "Node.js"],
        isPrevious: false,
      },
      {
        title: "Software Engineer",
        company: "StartupCo",
        location: "San Francisco, CA",
        period: { start: "2018-01", end: "2020-01" },
        achievements: [
          "Built REST APIs using Python and Django",
          "Collaborated with cross-functional teams",
        ],
        techStack: ["Python", "Django"],
        isPrevious: true,
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        description: "Built full-stack e-commerce platform with React and Node.js. Integrated payment processing and inventory management.",
        techStack: ["React", "Node.js"],
        period: { start: "2021-01", end: "2022-01" },
      },
    ],
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "University of Technology",
        year: "2018",
        location: "San Francisco, CA",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Developer Associate",
        issuer: "Amazon Web Services",
        year: "2021",
      },
    ],
    languages: [
      {
        name: "English",
        level: "Native",
      },
      {
        name: "Spanish",
        level: "Conversational",
      },
    ],
    publications: [],
    personalityTraits: [],
  };

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

  describe("End-to-End CV Ingestion Flow", () => {
    it("should complete full CV ingestion workflow from raw text to stored CV", async () => {
      // Step 1: Setup API key and model
      const { setApiKey, setSelectedModel } = useStore.getState();
      setApiKey(mockApiKey);
      setSelectedModel(mockModel);

      // Step 2: Mock successful AI response
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockFormattedCV),
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Step 3: Ingest CV via server action
      const result = await ingestCV(mockRawText, mockApiKey, mockModel);

      // Step 4: Verify AI was called with correct parameters
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
          max_completion_tokens: 8000,
          temperature: 0.3,
        }),
      );

      // Step 5: Verify formatted CV structure
      expect(result).toEqual(mockFormattedCV);
      expect(result.name).toBe("John Doe");
      expect(result.title).toBe("Senior Software Engineer");
      expect(result.experience).toHaveLength(2);
      expect(result.projects).toHaveLength(1);
      expect(result.certifications).toHaveLength(1);
      expect(result.languages).toHaveLength(2);

      // Step 6: Store the ingested CV
      const { addIngestedCV } = useStore.getState();
      const ingestedCV: IngestedCV = {
        id: "test-cv-1",
        title: "John Doe - Senior Software Engineer",
        rawText: mockRawText,
        formattedCV: result,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addIngestedCV(ingestedCV);

      // Step 7: Verify CV is stored
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(1);
      expect(ingestedCVs[0].formattedCV).toEqual(result);

      // Step 8: Set as current CV
      const { setCurrentCV } = useStore.getState();
      setCurrentCV(result);

      // Step 9: Verify current CV is set
      const { currentCV } = useStore.getState();
      expect(currentCV).toEqual(result);
    });

    it("should handle multiple CV ingestion and switching", async () => {
      const { setApiKey, setSelectedModel, addIngestedCV, setCurrentCV } = useStore.getState();
      setApiKey(mockApiKey);
      setSelectedModel(mockModel);

      // Mock AI responses for multiple CVs
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn();

      // First CV response
      const firstCV = { ...mockFormattedCV, name: "Alice Smith", title: "Frontend Developer" };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(firstCV) } }],
      });

      // Second CV response
      const secondCV = { ...mockFormattedCV, name: "Bob Johnson", title: "Backend Developer" };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(secondCV) } }],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Ingest first CV
      const firstRawText = "Alice Smith Frontend Developer with 5 years experience in React and JavaScript development.";
      const firstResult = await ingestCV(firstRawText, mockApiKey, mockModel);
      const firstIngestedCV: IngestedCV = {
        id: "cv-1",
        title: "Alice Smith CV",
        rawText: firstRawText,
        formattedCV: firstResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addIngestedCV(firstIngestedCV);

      // Ingest second CV
      const secondRawText = "Bob Johnson Backend Developer with 3 years experience in Node.js and Python development.";
      const secondResult = await ingestCV(secondRawText, mockApiKey, mockModel);
      const secondIngestedCV: IngestedCV = {
        id: "cv-2",
        title: "Bob Johnson CV",
        rawText: secondRawText,
        formattedCV: secondResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addIngestedCV(secondIngestedCV);

      // Verify both CVs are stored
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(2);
      expect(ingestedCVs[0].formattedCV.name).toBe("Alice Smith");
      expect(ingestedCVs[1].formattedCV.name).toBe("Bob Johnson");

      // Test CV switching
      setCurrentCV(firstResult);
      expect(useStore.getState().currentCV?.name).toBe("Alice Smith");

      setCurrentCV(secondResult);
      expect(useStore.getState().currentCV?.name).toBe("Bob Johnson");

      // Verify AI was called twice
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it("should persist CV data across store operations", async () => {
      const { setApiKey, addIngestedCV, setCurrentCV, setCoverLetter } = useStore.getState();
      
      // Setup initial state
      setApiKey(mockApiKey);
      
      const ingestedCV: IngestedCV = {
        id: "persist-test-cv",
        title: "Persistence Test CV",
        rawText: mockRawText,
        formattedCV: mockFormattedCV,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add CV and set as current
      addIngestedCV(ingestedCV);
      setCurrentCV(mockFormattedCV);

      // Perform other store operations
      setCoverLetter("Test cover letter", {
        jobPosition: "Developer",
        companyDescription: "Tech company",
        jobDescription: "Build software",
      });

      // Verify CV data persists
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0]).toEqual(ingestedCV);
      expect(state.currentCV).toEqual(mockFormattedCV);
      expect(state.generatedCoverLetter).toBe("Test cover letter");
    });
  });

  describe("CV Management Operations", () => {
    const createMockIngestedCV = (id: string, name: string): IngestedCV => ({
      id,
      title: `${name} CV`,
      rawText: `${name} raw CV text content that meets minimum requirements.`,
      formattedCV: { ...mockFormattedCV, name },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("should handle complete CRUD operations on ingested CVs", async () => {
      const { addIngestedCV, updateIngestedCV, deleteIngestedCV } = useStore.getState();

      // Create
      const cv1 = createMockIngestedCV("cv-1", "John Doe");
      const cv2 = createMockIngestedCV("cv-2", "Jane Smith");
      
      addIngestedCV(cv1);
      addIngestedCV(cv2);

      expect(useStore.getState().ingestedCVs).toHaveLength(2);

      // Read
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs.find(cv => cv.id === "cv-1")).toEqual(cv1);
      expect(ingestedCVs.find(cv => cv.id === "cv-2")).toEqual(cv2);

      // Update
      const updatedCV1 = { ...cv1, title: "Updated John Doe CV", updatedAt: new Date() };
      updateIngestedCV("cv-1", updatedCV1);

      const updatedState = useStore.getState();
      expect(updatedState.ingestedCVs).toHaveLength(2);
      expect(updatedState.ingestedCVs.find(cv => cv.id === "cv-1")).toEqual(updatedCV1);
      expect(updatedState.ingestedCVs.find(cv => cv.id === "cv-2")).toEqual(cv2); // Unchanged

      // Delete
      deleteIngestedCV("cv-1");

      const finalState = useStore.getState();
      expect(finalState.ingestedCVs).toHaveLength(1);
      expect(finalState.ingestedCVs[0]).toEqual(cv2);
      expect(finalState.ingestedCVs.find(cv => cv.id === "cv-1")).toBeUndefined();
    });

    it("should handle CV editing and re-processing workflow", async () => {
      const { setApiKey, addIngestedCV, updateIngestedCV } = useStore.getState();
      setApiKey(mockApiKey);

      // Add initial CV
      const originalCV = createMockIngestedCV("edit-cv", "Original User");
      addIngestedCV(originalCV);

      // Mock AI response for re-processing
      const mockOpenAI = await import("openai");
      const updatedFormattedCV = { ...mockFormattedCV, name: "Updated User", title: "Updated Title" };
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(updatedFormattedCV) } }],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Simulate editing: re-process with updated raw text
      const updatedRawText = "Updated User\nUpdated Title\nupdated.user@example.com\nUpdated content...";
      const reprocessedCV = await ingestCV(updatedRawText, mockApiKey, mockModel);

      // Update the stored CV
      const updatedIngestedCV: IngestedCV = {
        ...originalCV,
        title: "Updated User CV",
        rawText: updatedRawText,
        formattedCV: reprocessedCV,
        updatedAt: new Date(),
      };

      updateIngestedCV("edit-cv", updatedIngestedCV);

      // Verify update
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(1);
      expect(ingestedCVs[0].formattedCV.name).toBe("Updated User");
      expect(ingestedCVs[0].formattedCV.title).toBe("Updated Title");
      expect(ingestedCVs[0].rawText).toBe(updatedRawText);
    });

    it("should maintain data integrity during concurrent operations", async () => {
      const { addIngestedCV, setCurrentCV, deleteIngestedCV } = useStore.getState();

      const cv1 = createMockIngestedCV("concurrent-1", "User One");
      const cv2 = createMockIngestedCV("concurrent-2", "User Two");
      const cv3 = createMockIngestedCV("concurrent-3", "User Three");

      // Simulate concurrent operations
      addIngestedCV(cv1);
      setCurrentCV(cv1.formattedCV);
      addIngestedCV(cv2);
      addIngestedCV(cv3);
      
      // Verify all operations completed correctly
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(3);
      expect(state.currentCV).toEqual(cv1.formattedCV);

      // Delete current CV and verify state consistency
      deleteIngestedCV("concurrent-1");
      
      const updatedState = useStore.getState();
      expect(updatedState.ingestedCVs).toHaveLength(2);
      expect(updatedState.currentCV).toEqual(cv1.formattedCV); // Current CV not auto-cleared
      expect(updatedState.ingestedCVs.find(cv => cv.id === "concurrent-1")).toBeUndefined();
    });
  });

  describe("Error Recovery and Resilience", () => {
    it("should recover from AI processing failures without corrupting store", async () => {
      const { setApiKey, addIngestedCV } = useStore.getState();
      setApiKey(mockApiKey);

      // Add a successful CV first
      const successfulCV = createMockIngestedCV("success-cv", "Successful User");
      addIngestedCV(successfulCV);

      // Mock AI failure
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockRejectedValue(new Error("AI processing failed"));

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Attempt to ingest CV that will fail (use valid length text to bypass input validation)
      const validLengthText = "Failed CV content that meets minimum length requirements for testing AI processing failures.";
      await expect(
        ingestCV(validLengthText, mockApiKey, mockModel)
      ).rejects.toThrow("AI processing failed");

      // Verify store state is not corrupted
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(1);
      expect(ingestedCVs[0]).toEqual(successfulCV);
    });

    it("should handle storage errors gracefully", async () => {
      const { addIngestedCV, updateIngestedCV, deleteIngestedCV } = useStore.getState();

      const cv1 = createMockIngestedCV("storage-test-1", "User One");
      const cv2 = createMockIngestedCV("storage-test-2", "User Two");

      // Add CVs successfully
      addIngestedCV(cv1);
      addIngestedCV(cv2);

      // Attempt operations on non-existent CV (should not crash)
      updateIngestedCV("non-existent", cv1);
      deleteIngestedCV("non-existent");

      // Verify original data is intact
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(2);
      expect(ingestedCVs).toContain(cv1);
      expect(ingestedCVs).toContain(cv2);
    });

    it("should handle malformed CV data gracefully", async () => {
      const { setApiKey } = useStore.getState();
      setApiKey(mockApiKey);

      // Mock AI response with malformed data
      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                // Missing required fields
                contactInfo: { email: "test@example.com" },
                summary: "Test summary",
              }),
            },
          },
        ],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Should throw validation error
      await expect(
        ingestCV(mockRawText, mockApiKey, mockModel)
      ).rejects.toThrow("CV must contain a valid name");

      // Verify store remains clean
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toHaveLength(0);
    });

    it("should maintain consistency during rapid state changes", async () => {
      const { addIngestedCV, setCurrentCV, clearCurrentCV, deleteIngestedCV } = useStore.getState();

      const cv1 = createMockIngestedCV("rapid-1", "Rapid User 1");
      const cv2 = createMockIngestedCV("rapid-2", "Rapid User 2");

      // Rapid state changes
      addIngestedCV(cv1);
      setCurrentCV(cv1.formattedCV);
      addIngestedCV(cv2);
      setCurrentCV(cv2.formattedCV);
      clearCurrentCV();
      setCurrentCV(cv1.formattedCV);
      deleteIngestedCV("rapid-2");

      // Verify final state is consistent
      const state = useStore.getState();
      expect(state.ingestedCVs).toHaveLength(1);
      expect(state.ingestedCVs[0]).toEqual(cv1);
      expect(state.currentCV).toEqual(cv1.formattedCV);
    });
  });

  describe("Multi-language Support", () => {
    it("should handle CV ingestion in different languages", async () => {
      const { setApiKey } = useStore.getState();
      setApiKey(mockApiKey);

      const mockOpenAI = await import("openai");
      const mockCreate = vi.fn();

      // French CV
      const frenchCV = { ...mockFormattedCV, name: "Jean Dupont", title: "Ingénieur Logiciel" };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(frenchCV) } }],
      });

      // Portuguese CV
      const portugueseCV = { ...mockFormattedCV, name: "João Silva", title: "Engenheiro de Software" };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(portugueseCV) } }],
      });

      const mockOpenAIInstance = new (mockOpenAI.default as any)();
      mockOpenAIInstance.chat.completions.create = mockCreate;
      vi.mocked(mockOpenAI.default).mockReturnValue(mockOpenAIInstance);

      // Test French CV ingestion
      const frenchRawText = "Jean Dupont\nIngénieur Logiciel\njean@example.com\nExpérience professionnelle...";
      const frenchResult = await ingestCV(frenchRawText, mockApiKey, mockModel, "fr");
      expect(frenchResult.name).toBe("Jean Dupont");

      // Test Portuguese CV ingestion
      const portugueseRawText = "João Silva\nEngenheiro de Software\njoao@example.com\nExperiência profissional...";
      const portugueseResult = await ingestCV(portugueseRawText, mockApiKey, mockModel, "pt");
      expect(portugueseResult.name).toBe("João Silva");

      // Verify language-specific prompts were used
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("French"),
            }),
          ]),
        })
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("Portuguese"),
            }),
          ]),
        })
      );
    });
  });

  // Helper function to create mock ingested CV
  function createMockIngestedCV(id: string, name: string): IngestedCV {
    return {
      id,
      title: `${name} CV`,
      rawText: `${name} raw CV text content that meets minimum requirements for testing purposes.`,
      formattedCV: { ...mockFormattedCV, name },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
});