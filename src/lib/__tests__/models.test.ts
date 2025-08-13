import { describe, expect, it } from "vitest";
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  getFreeModels,
  getModelById,
  getModelsByProvider,
} from "../models";

describe("Models Configuration", () => {
  describe("AVAILABLE_MODELS", () => {
    it("should contain all 6 required models", () => {
      expect(AVAILABLE_MODELS).toHaveLength(6);

      const expectedModelIds = [
        "openai/gpt-4.1-mini",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b:free",
        "google/gemini-2.0-flash-exp:free",
        "qwen/qwq-32b",
        "deepseek/deepseek-chat-v3-0324:free",
      ];

      const actualModelIds = AVAILABLE_MODELS.map((model) => model.id);
      expect(actualModelIds).toEqual(expect.arrayContaining(expectedModelIds));
    });

    it("should have correct structure for each model", () => {
      AVAILABLE_MODELS.forEach((model) => {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("isFree");

        expect(typeof model.id).toBe("string");
        expect(typeof model.name).toBe("string");
        expect(typeof model.provider).toBe("string");
        expect(typeof model.isFree).toBe("boolean");

        expect(model.id).toBeTruthy();
        expect(model.name).toBeTruthy();
        expect(model.provider).toBeTruthy();
      });
    });

    it("should have correct free model flags", () => {
      const freeModelIds = [
        "openai/gpt-oss-20b:free",
        "google/gemini-2.0-flash-exp:free",
        "deepseek/deepseek-chat-v3-0324:free",
      ];

      const paidModelIds = [
        "openai/gpt-4.1-mini",
        "openai/gpt-oss-120b",
        "qwen/qwq-32b",
      ];

      freeModelIds.forEach((id) => {
        const model = AVAILABLE_MODELS.find((m) => m.id === id);
        expect(model?.isFree).toBe(true);
      });

      paidModelIds.forEach((id) => {
        const model = AVAILABLE_MODELS.find((m) => m.id === id);
        expect(model?.isFree).toBe(false);
      });
    });

    it("should have correct provider assignments", () => {
      const providerMappings = {
        "openai/gpt-4.1-mini": "OpenAI",
        "openai/gpt-oss-120b": "OpenAI",
        "openai/gpt-oss-20b:free": "OpenAI",
        "google/gemini-2.0-flash-exp:free": "Google",
        "qwen/qwq-32b": "Qwen",
        "deepseek/deepseek-chat-v3-0324:free": "DeepSeek",
      };

      Object.entries(providerMappings).forEach(
        ([modelId, expectedProvider]) => {
          const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
          expect(model?.provider).toBe(expectedProvider);
        },
      );
    });
  });

  describe("DEFAULT_MODEL", () => {
    it("should be set to openai/gpt-4.1-mini", () => {
      expect(DEFAULT_MODEL).toBe("openai/gpt-4.1-mini");
    });

    it("should exist in AVAILABLE_MODELS", () => {
      const defaultModelExists = AVAILABLE_MODELS.some(
        (model) => model.id === DEFAULT_MODEL,
      );
      expect(defaultModelExists).toBe(true);
    });
  });

  describe("getModelById", () => {
    it("should return correct model for valid ID", () => {
      const model = getModelById("openai/gpt-4.1-mini");

      expect(model).toBeDefined();
      expect(model?.id).toBe("openai/gpt-4.1-mini");
      expect(model?.name).toBe("GPT-4.1 Mini");
      expect(model?.provider).toBe("OpenAI");
      expect(model?.isFree).toBe(false);
    });

    it("should return undefined for invalid ID", () => {
      const model = getModelById("invalid/model-id");
      expect(model).toBeUndefined();
    });

    it("should work for all available models", () => {
      AVAILABLE_MODELS.forEach((expectedModel) => {
        const foundModel = getModelById(expectedModel.id);
        expect(foundModel).toEqual(expectedModel);
      });
    });
  });

  describe("getFreeModels", () => {
    it("should return only free models", () => {
      const freeModels = getFreeModels();

      expect(freeModels.length).toBe(3);
      freeModels.forEach((model) => {
        expect(model.isFree).toBe(true);
      });
    });

    it("should include all expected free models", () => {
      const freeModels = getFreeModels();
      const freeModelIds = freeModels.map((model) => model.id);

      const expectedFreeIds = [
        "openai/gpt-oss-20b:free",
        "google/gemini-2.0-flash-exp:free",
        "deepseek/deepseek-chat-v3-0324:free",
      ];

      expect(freeModelIds).toEqual(expect.arrayContaining(expectedFreeIds));
    });

    it("should not include paid models", () => {
      const freeModels = getFreeModels();
      const paidModelIds = [
        "openai/gpt-4.1-mini",
        "openai/gpt-oss-120b",
        "qwen/qwq-32b",
      ];

      freeModels.forEach((model) => {
        expect(paidModelIds).not.toContain(model.id);
      });
    });
  });

  describe("getModelsByProvider", () => {
    it("should return OpenAI models", () => {
      const openaiModels = getModelsByProvider("OpenAI");

      expect(openaiModels.length).toBe(3);
      openaiModels.forEach((model) => {
        expect(model.provider).toBe("OpenAI");
      });

      const openaiIds = openaiModels.map((model) => model.id);
      expect(openaiIds).toEqual(
        expect.arrayContaining([
          "openai/gpt-4.1-mini",
          "openai/gpt-oss-120b",
          "openai/gpt-oss-20b:free",
        ]),
      );
    });

    it("should return Google models", () => {
      const googleModels = getModelsByProvider("Google");

      expect(googleModels.length).toBe(1);
      expect(googleModels[0].provider).toBe("Google");
      expect(googleModels[0].id).toBe("google/gemini-2.0-flash-exp:free");
    });

    it("should return Qwen models", () => {
      const qwenModels = getModelsByProvider("Qwen");

      expect(qwenModels.length).toBe(1);
      expect(qwenModels[0].provider).toBe("Qwen");
      expect(qwenModels[0].id).toBe("qwen/qwq-32b");
    });

    it("should return DeepSeek models", () => {
      const deepseekModels = getModelsByProvider("DeepSeek");

      expect(deepseekModels.length).toBe(1);
      expect(deepseekModels[0].provider).toBe("DeepSeek");
      expect(deepseekModels[0].id).toBe("deepseek/deepseek-chat-v3-0324:free");
    });

    it("should return empty array for non-existent provider", () => {
      const nonExistentModels = getModelsByProvider("NonExistent");
      expect(nonExistentModels).toEqual([]);
    });

    it("should be case sensitive", () => {
      const lowercaseModels = getModelsByProvider("openai");
      expect(lowercaseModels).toEqual([]);
    });
  });

  describe("model data integrity", () => {
    it("should have unique model IDs", () => {
      const modelIds = AVAILABLE_MODELS.map((model) => model.id);
      const uniqueIds = [...new Set(modelIds)];

      expect(modelIds.length).toBe(uniqueIds.length);
    });

    it("should have non-empty names", () => {
      AVAILABLE_MODELS.forEach((model) => {
        expect(model.name.trim()).toBeTruthy();
        expect(model.name.length).toBeGreaterThan(0);
      });
    });

    it("should have valid provider names", () => {
      const validProviders = ["OpenAI", "Google", "Qwen", "DeepSeek"];

      AVAILABLE_MODELS.forEach((model) => {
        expect(validProviders).toContain(model.provider);
      });
    });
  });
});
