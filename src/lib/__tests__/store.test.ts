import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "../store";
import type { CoverLetterInputs, IngestedCV, Variant } from "../types";

describe("Store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini",
      generatedCoverLetter: null,
      coverLetterInputs: null,
      hideBullets: false,
      layoutMode: "single",
      ingestedCVs: [],
      currentCV: null,
    });
  });

  describe("initial state", () => {
    it("should have empty apiKey initially", () => {
      const { apiKey } = useStore.getState();
      expect(apiKey).toBe("");
    });

    it("should have default model selected initially", () => {
      const { selectedModel } = useStore.getState();
      expect(selectedModel).toBe("openai/gpt-4.1-mini");
    });

    it("should have null generatedCoverLetter initially", () => {
      const { generatedCoverLetter } = useStore.getState();
      expect(generatedCoverLetter).toBeNull();
    });

    it("should have null coverLetterInputs initially", () => {
      const { coverLetterInputs } = useStore.getState();
      expect(coverLetterInputs).toBeNull();
    });

    it("should have single layout mode initially", () => {
      const { layoutMode } = useStore.getState();
      expect(layoutMode).toBe("single");
    });

    it("should have hideBullets false initially", () => {
      const { hideBullets } = useStore.getState();
      expect(hideBullets).toBe(false);
    });

    it("should have empty ingestedCVs array initially", () => {
      const { ingestedCVs } = useStore.getState();
      expect(ingestedCVs).toEqual([]);
    });

    it("should have null currentCV initially", () => {
      const { currentCV } = useStore.getState();
      expect(currentCV).toBeNull();
    });
  });

  describe("setApiKey", () => {
    it("should update apiKey when setApiKey is called", () => {
      const { setApiKey } = useStore.getState();
      const testApiKey = "sk-test-api-key-123";

      setApiKey(testApiKey);

      const { apiKey } = useStore.getState();
      expect(apiKey).toBe(testApiKey);
    });

    it("should handle empty string apiKey", () => {
      const { setApiKey } = useStore.getState();

      // First set a key
      setApiKey("test-key");
      expect(useStore.getState().apiKey).toBe("test-key");

      // Then clear it
      setApiKey("");
      expect(useStore.getState().apiKey).toBe("");
    });
  });

  describe("setSelectedModel", () => {
    it("should update selectedModel when setSelectedModel is called", () => {
      const { setSelectedModel } = useStore.getState();
      const testModel = "google/gemini-2.0-flash-exp:free";

      setSelectedModel(testModel);

      const { selectedModel } = useStore.getState();
      expect(selectedModel).toBe(testModel);
    });

    it("should handle different model selections", () => {
      const { setSelectedModel } = useStore.getState();
      const models = [
        "openai/gpt-oss-120b",
        "qwen/qwq-32b",
        "deepseek/deepseek-chat-v3-0324:free",
      ];

      models.forEach((model) => {
        setSelectedModel(model);
        expect(useStore.getState().selectedModel).toBe(model);
      });
    });
  });

  describe("setCoverLetter", () => {
    it("should set cover letter and inputs when setCoverLetter is called", () => {
      const { setCoverLetter } = useStore.getState();
      const testLetter = "Dear Hiring Manager,\n\nThis is a test cover letter.";
      const testInputs: CoverLetterInputs = {
        jobPosition: "Software Engineer",
        companyDescription: "A great tech company",
        jobDescription: "Looking for a skilled developer",
      };

      setCoverLetter(testLetter, testInputs);

      const state = useStore.getState();
      expect(state.generatedCoverLetter).toBe(testLetter);
      expect(state.coverLetterInputs).toEqual(testInputs);
    });

    it("should update existing cover letter and inputs", () => {
      const { setCoverLetter } = useStore.getState();

      // Set initial values
      const initialLetter = "Initial letter";
      const initialInputs: CoverLetterInputs = {
        jobPosition: "Initial Position",
        companyDescription: "Initial Company",
        jobDescription: "Initial Description",
      };
      setCoverLetter(initialLetter, initialInputs);

      // Update with new values
      const updatedLetter = "Updated letter";
      const updatedInputs: CoverLetterInputs = {
        jobPosition: "Updated Position",
        companyDescription: "Updated Company",
        jobDescription: "Updated Description",
      };
      setCoverLetter(updatedLetter, updatedInputs);

      const state = useStore.getState();
      expect(state.generatedCoverLetter).toBe(updatedLetter);
      expect(state.coverLetterInputs).toEqual(updatedInputs);
    });

    it("should handle empty strings in inputs", () => {
      const { setCoverLetter } = useStore.getState();
      const testLetter = "Test letter";
      const testInputs: CoverLetterInputs = {
        jobPosition: "",
        companyDescription: "Company description",
        jobDescription: "",
      };

      setCoverLetter(testLetter, testInputs);

      const state = useStore.getState();
      expect(state.generatedCoverLetter).toBe(testLetter);
      expect(state.coverLetterInputs).toEqual(testInputs);
    });
  });

  describe("clearCoverLetter", () => {
    it("should clear cover letter and inputs when clearCoverLetter is called", () => {
      const { setCoverLetter, clearCoverLetter } = useStore.getState();

      // First set some data
      const testLetter = "Test letter";
      const testInputs: CoverLetterInputs = {
        jobPosition: "Test Position",
        companyDescription: "Test Company",
        jobDescription: "Test Description",
      };
      setCoverLetter(testLetter, testInputs);

      // Verify data is set
      expect(useStore.getState().generatedCoverLetter).toBe(testLetter);
      expect(useStore.getState().coverLetterInputs).toEqual(testInputs);

      // Clear the data
      clearCoverLetter();

      const state = useStore.getState();
      expect(state.generatedCoverLetter).toBeNull();
      expect(state.coverLetterInputs).toBeNull();
    });

    it("should handle clearing when already null", () => {
      const { clearCoverLetter } = useStore.getState();

      // Ensure initial state is null
      expect(useStore.getState().generatedCoverLetter).toBeNull();
      expect(useStore.getState().coverLetterInputs).toBeNull();

      // Clear should not cause errors
      clearCoverLetter();

      const state = useStore.getState();
      expect(state.generatedCoverLetter).toBeNull();
      expect(state.coverLetterInputs).toBeNull();
    });
  });

  describe("state persistence", () => {
    it("should maintain state consistency across multiple updates", () => {
      const { setApiKey, setSelectedModel } = useStore.getState();

      const testApiKey = "sk-test-123";
      const testModel = "google/gemini-2.0-flash-exp:free";

      setApiKey(testApiKey);
      setSelectedModel(testModel);

      const state = useStore.getState();
      expect(state.apiKey).toBe(testApiKey);
      expect(state.selectedModel).toBe(testModel);
    });

    it("should maintain cover letter state with other state updates", () => {
      const { setApiKey, setSelectedModel, setCoverLetter } =
        useStore.getState();

      const testApiKey = "sk-test-123";
      const testModel = "google/gemini-2.0-flash-exp:free";
      const testLetter = "Test cover letter";
      const testInputs: CoverLetterInputs = {
        jobPosition: "Developer",
        companyDescription: "Tech company",
        jobDescription: "Build software",
      };

      setApiKey(testApiKey);
      setSelectedModel(testModel);
      setCoverLetter(testLetter, testInputs);

      const state = useStore.getState();
      expect(state.apiKey).toBe(testApiKey);
      expect(state.selectedModel).toBe(testModel);
      expect(state.generatedCoverLetter).toBe(testLetter);
      expect(state.coverLetterInputs).toEqual(testInputs);
    });
  });

  describe("setLayoutMode", () => {
    it("should update layoutMode when setLayoutMode is called", () => {
      const { setLayoutMode } = useStore.getState();

      setLayoutMode("two-column");

      const { layoutMode } = useStore.getState();
      expect(layoutMode).toBe("two-column");
    });

    it("should handle switching between layout modes", () => {
      const { setLayoutMode } = useStore.getState();

      // Start with single
      expect(useStore.getState().layoutMode).toBe("single");

      // Switch to two-column
      setLayoutMode("two-column");
      expect(useStore.getState().layoutMode).toBe("two-column");

      // Switch back to single
      setLayoutMode("single");
      expect(useStore.getState().layoutMode).toBe("single");
    });

    it("should maintain layout mode with other state updates", () => {
      const { setLayoutMode, setApiKey, setHideBullets } = useStore.getState();

      setLayoutMode("two-column");
      setApiKey("test-key");
      setHideBullets(true);

      const state = useStore.getState();
      expect(state.layoutMode).toBe("two-column");
      expect(state.apiKey).toBe("test-key");
      expect(state.hideBullets).toBe(true);
    });
  });

  describe("setHideBullets", () => {
    it("should update hideBullets when setHideBullets is called", () => {
      const { setHideBullets } = useStore.getState();

      setHideBullets(true);

      const { hideBullets } = useStore.getState();
      expect(hideBullets).toBe(true);
    });

    it("should handle toggling hideBullets", () => {
      const { setHideBullets } = useStore.getState();

      // Start with false
      expect(useStore.getState().hideBullets).toBe(false);

      // Set to true
      setHideBullets(true);
      expect(useStore.getState().hideBullets).toBe(true);

      // Set back to false
      setHideBullets(false);
      expect(useStore.getState().hideBullets).toBe(false);
    });
  });

  describe("CV CRUD operations", () => {
    const mockVariant: Variant = {
      name: "Test User",
      title: "Software Engineer",
      contactInfo: {
        email: "test@example.com",
        phone: "+1234567890",
        location: "Test City",
        website: "test.com",
        linkedin: "linkedin.com/in/test",
        github: "github.com/test",
        age: "30",
        nationality: "Test",
      },
      summary: "Test summary",
      qualities: ["Quality 1", "Quality 2"],
      generalSkills: ["Skill 1", "Skill 2"],
      skills: [
        {
          domain: "Programming",
          skills: ["JavaScript", "TypeScript"],
        },
      ],
      experience: [
        {
          title: "Developer",
          company: "Test Company",
          location: "Test City",
          period: { start: "2020-01", end: "2024-01" },
          achievements: ["Achievement 1"],
          techStack: ["React", "Node.js"],
        },
      ],
      education: [
        {
          degree: "Bachelor's",
          institution: "Test University",
          year: "2020",
          location: "Test City",
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
      personalityTraits: ["Trait 1", "Trait 2"],
    };

    const mockIngestedCV: IngestedCV = {
      id: "test-cv-1",
      title: "Test CV",
      rawText:
        "This is test CV raw text content that meets minimum requirements.",
      formattedCV: mockVariant,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    describe("addIngestedCV", () => {
      it("should add a new CV to the ingestedCVs array", () => {
        const { addIngestedCV } = useStore.getState();

        addIngestedCV(mockIngestedCV);

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(1);
        expect(ingestedCVs[0]).toEqual(mockIngestedCV);
      });

      it("should add multiple CVs to the array", () => {
        const { addIngestedCV } = useStore.getState();
        const secondCV: IngestedCV = {
          ...mockIngestedCV,
          id: "test-cv-2",
          title: "Second Test CV",
        };

        addIngestedCV(mockIngestedCV);
        addIngestedCV(secondCV);

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(2);
        expect(ingestedCVs[0]).toEqual(mockIngestedCV);
        expect(ingestedCVs[1]).toEqual(secondCV);
      });

      it("should maintain existing CVs when adding new ones", () => {
        const { addIngestedCV } = useStore.getState();
        const secondCV: IngestedCV = {
          ...mockIngestedCV,
          id: "test-cv-2",
          title: "Second Test CV",
        };

        // Add first CV
        addIngestedCV(mockIngestedCV);
        expect(useStore.getState().ingestedCVs).toHaveLength(1);

        // Add second CV
        addIngestedCV(secondCV);
        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(2);
        expect(ingestedCVs.find((cv) => cv.id === "test-cv-1")).toEqual(
          mockIngestedCV,
        );
        expect(ingestedCVs.find((cv) => cv.id === "test-cv-2")).toEqual(
          secondCV,
        );
      });
    });

    describe("updateIngestedCV", () => {
      beforeEach(() => {
        const { addIngestedCV } = useStore.getState();
        addIngestedCV(mockIngestedCV);
      });

      it("should update an existing CV by id", () => {
        const { updateIngestedCV } = useStore.getState();
        const updatedCV: IngestedCV = {
          ...mockIngestedCV,
          title: "Updated Test CV",
          rawText: "Updated raw text content that meets minimum requirements.",
          updatedAt: new Date("2024-02-01"),
        };

        updateIngestedCV("test-cv-1", updatedCV);

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(1);
        expect(ingestedCVs[0]).toEqual(updatedCV);
      });

      it("should not affect other CVs when updating one", () => {
        const { addIngestedCV, updateIngestedCV } = useStore.getState();
        const secondCV: IngestedCV = {
          ...mockIngestedCV,
          id: "test-cv-2",
          title: "Second Test CV",
        };

        addIngestedCV(secondCV);

        const updatedFirstCV: IngestedCV = {
          ...mockIngestedCV,
          title: "Updated First CV",
        };

        updateIngestedCV("test-cv-1", updatedFirstCV);

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(2);
        expect(ingestedCVs.find((cv) => cv.id === "test-cv-1")).toEqual(
          updatedFirstCV,
        );
        expect(ingestedCVs.find((cv) => cv.id === "test-cv-2")).toEqual(
          secondCV,
        );
      });

      it("should handle updating non-existent CV gracefully", () => {
        const { updateIngestedCV } = useStore.getState();
        const nonExistentCV: IngestedCV = {
          ...mockIngestedCV,
          id: "non-existent",
          title: "Non-existent CV",
        };

        updateIngestedCV("non-existent", nonExistentCV);

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(1);
        expect(ingestedCVs[0]).toEqual(mockIngestedCV); // Original CV unchanged
      });
    });

    describe("deleteIngestedCV", () => {
      beforeEach(() => {
        const { addIngestedCV } = useStore.getState();
        addIngestedCV(mockIngestedCV);
      });

      it("should remove CV by id", () => {
        const { deleteIngestedCV } = useStore.getState();

        deleteIngestedCV("test-cv-1");

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(0);
      });

      it("should only remove the specified CV", () => {
        const { addIngestedCV, deleteIngestedCV } = useStore.getState();
        const secondCV: IngestedCV = {
          ...mockIngestedCV,
          id: "test-cv-2",
          title: "Second Test CV",
        };

        addIngestedCV(secondCV);

        deleteIngestedCV("test-cv-1");

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(1);
        expect(ingestedCVs[0]).toEqual(secondCV);
      });

      it("should handle deleting non-existent CV gracefully", () => {
        const { deleteIngestedCV } = useStore.getState();

        deleteIngestedCV("non-existent");

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(1);
        expect(ingestedCVs[0]).toEqual(mockIngestedCV);
      });

      it("should handle deleting from empty array", () => {
        const { deleteIngestedCV } = useStore.getState();

        // Clear the array first
        useStore.setState({ ingestedCVs: [] });

        deleteIngestedCV("test-cv-1");

        const { ingestedCVs } = useStore.getState();
        expect(ingestedCVs).toHaveLength(0);
      });
    });

    describe("setCurrentCV", () => {
      it("should set the current CV", () => {
        const { setCurrentCV } = useStore.getState();

        setCurrentCV(mockVariant);

        const { currentCV } = useStore.getState();
        expect(currentCV).toEqual(mockVariant);
      });

      it("should update current CV when called multiple times", () => {
        const { setCurrentCV } = useStore.getState();
        const secondVariant: Variant = {
          ...mockVariant,
          name: "Second User",
          title: "Senior Engineer",
        };

        setCurrentCV(mockVariant);
        expect(useStore.getState().currentCV).toEqual(mockVariant);

        setCurrentCV(secondVariant);
        expect(useStore.getState().currentCV).toEqual(secondVariant);
      });

      it("should maintain other state when setting current CV", () => {
        const { setCurrentCV, setApiKey } = useStore.getState();
        const testApiKey = "test-key";

        setApiKey(testApiKey);
        setCurrentCV(mockVariant);

        const state = useStore.getState();
        expect(state.currentCV).toEqual(mockVariant);
        expect(state.apiKey).toBe(testApiKey);
      });
    });

    describe("clearCurrentCV", () => {
      it("should clear the current CV", () => {
        const { setCurrentCV, clearCurrentCV } = useStore.getState();

        // First set a CV
        setCurrentCV(mockVariant);
        expect(useStore.getState().currentCV).toEqual(mockVariant);

        // Then clear it
        clearCurrentCV();
        expect(useStore.getState().currentCV).toBeNull();
      });

      it("should handle clearing when already null", () => {
        const { clearCurrentCV } = useStore.getState();

        // Ensure it's already null
        expect(useStore.getState().currentCV).toBeNull();

        // Clear should not cause errors
        clearCurrentCV();
        expect(useStore.getState().currentCV).toBeNull();
      });

      it("should maintain other state when clearing current CV", () => {
        const { setCurrentCV, clearCurrentCV, setApiKey } = useStore.getState();
        const testApiKey = "test-key";

        setApiKey(testApiKey);
        setCurrentCV(mockVariant);
        clearCurrentCV();

        const state = useStore.getState();
        expect(state.currentCV).toBeNull();
        expect(state.apiKey).toBe(testApiKey);
      });
    });

    describe("CV state integration", () => {
      it("should handle complete CV workflow", () => {
        const {
          addIngestedCV,
          setCurrentCV,
          updateIngestedCV,
          deleteIngestedCV,
        } = useStore.getState();

        // Add a CV
        addIngestedCV(mockIngestedCV);
        expect(useStore.getState().ingestedCVs).toHaveLength(1);

        // Set it as current
        setCurrentCV(mockIngestedCV.formattedCV);
        expect(useStore.getState().currentCV).toEqual(
          mockIngestedCV.formattedCV,
        );

        // Update the CV
        const updatedCV: IngestedCV = {
          ...mockIngestedCV,
          title: "Updated CV",
          formattedCV: {
            ...mockIngestedCV.formattedCV,
            name: "Updated User",
          },
        };
        updateIngestedCV("test-cv-1", updatedCV);
        expect(useStore.getState().ingestedCVs[0]).toEqual(updatedCV);

        // Delete the CV
        deleteIngestedCV("test-cv-1");
        expect(useStore.getState().ingestedCVs).toHaveLength(0);
        // Note: currentCV is not automatically cleared when deleting a CV
        expect(useStore.getState().currentCV).toEqual(
          mockIngestedCV.formattedCV,
        );
      });

      it("should maintain CV state with other store operations", () => {
        const {
          addIngestedCV,
          setCurrentCV,
          setApiKey,
          setCoverLetter,
          setLayoutMode,
        } = useStore.getState();

        const testInputs: CoverLetterInputs = {
          jobPosition: "Developer",
          companyDescription: "Tech company",
          jobDescription: "Build software",
        };

        // Perform various operations
        addIngestedCV(mockIngestedCV);
        setCurrentCV(mockIngestedCV.formattedCV);
        setApiKey("test-key");
        setCoverLetter("Test letter", testInputs);
        setLayoutMode("two-column");

        const state = useStore.getState();
        expect(state.ingestedCVs).toHaveLength(1);
        expect(state.currentCV).toEqual(mockIngestedCV.formattedCV);
        expect(state.apiKey).toBe("test-key");
        expect(state.generatedCoverLetter).toBe("Test letter");
        expect(state.layoutMode).toBe("two-column");
      });
    });
  });
});
