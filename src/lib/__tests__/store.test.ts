import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../store";

// Mock zustand persist
vi.mock("zustand/middleware", () => ({
  persist: (fn: unknown) => fn,
}));

describe("Store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini",
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
  });
});
