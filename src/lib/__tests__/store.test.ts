import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "../store";
import type { CoverLetterInputs } from "../types";

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
});
