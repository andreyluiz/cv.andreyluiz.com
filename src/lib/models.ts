import type { ModelOption } from "./types";

/**
 * Available AI models for OpenRouter integration
 * These models are supported for resume tailoring and cover letter generation
 */
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    isFree: false,
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    isFree: false,
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT OSS 20B (Free)",
    provider: "OpenAI",
    isFree: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "Google",
    isFree: true,
  },
  {
    id: "qwen/qwq-32b",
    name: "QwQ 32B",
    provider: "Qwen",
    isFree: false,
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat V3 (Free)",
    provider: "DeepSeek",
    isFree: true,
  },
];

/**
 * Default model selection for new users
 */
export const DEFAULT_MODEL = "openai/gpt-4.1-mini";

/**
 * Helper function to get model by ID
 */
export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((model) => model.id === id);
}

/**
 * Helper function to get free models only
 */
export function getFreeModels(): ModelOption[] {
  return AVAILABLE_MODELS.filter((model) => model.isFree);
}

/**
 * Helper function to get models by provider
 */
export function getModelsByProvider(provider: string): ModelOption[] {
  return AVAILABLE_MODELS.filter((model) => model.provider === provider);
}
