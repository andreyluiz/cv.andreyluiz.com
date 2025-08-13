import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../../store";
import ApiKeyModal from "../modals/ApiKeyModal";

// Mock the store
vi.mock("../../store", () => ({
  useStore: vi.fn(),
}));

// Mock the models
vi.mock("../../models", () => ({
  AVAILABLE_MODELS: [
    {
      id: "openai/gpt-4.1-mini",
      name: "GPT-4.1 Mini",
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
    {
      id: "openai/gpt-oss-120b",
      name: "GPT OSS 120B",
      provider: "OpenAI",
      isFree: false,
    },
  ],
}));

describe("UI Integration Tests", () => {
  const mockSetApiKey = vi.fn();
  const mockSetSelectedModel = vi.fn();
  const mockOnClose = vi.fn();

  const defaultStoreState = {
    apiKey: "",
    selectedModel: "openai/gpt-4.1-mini",
    setApiKey: mockSetApiKey,
    setSelectedModel: mockSetSelectedModel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useStore).mockReturnValue(defaultStoreState);
  });

  describe("Complete UI Flow Tests", () => {
    it("should complete full UI flow from opening modal to saving configuration", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Step 1: Verify modal opens with correct OpenRouter branding
      expect(
        screen.getByRole("heading", { name: "OpenRouter API Key" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Your API key is stored locally in your browser and is never shared with anyone except OpenRouter/,
        ),
      ).toBeInTheDocument();

      // Step 2: Enter API key
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      await user.type(apiKeyInput, "sk-or-test-key-123456");
      expect(apiKeyInput).toHaveValue("sk-or-test-key-123456");

      // Step 3: Select a different model
      const modelSelect = screen.getByRole("combobox");
      await user.selectOptions(modelSelect, "google/gemini-2.0-flash-exp:free");
      expect(modelSelect).toHaveValue("google/gemini-2.0-flash-exp:free");

      // Step 4: Save configuration
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      // Step 5: Verify store was updated and modal closed
      expect(mockSetApiKey).toHaveBeenCalledWith("sk-or-test-key-123456");
      expect(mockSetSelectedModel).toHaveBeenCalledWith(
        "google/gemini-2.0-flash-exp:free",
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should handle model selection changes in real-time", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const modelSelect = screen.getByRole("combobox");

      // Test multiple model selections
      const modelsToTest = [
        "openai/gpt-oss-20b:free",
        "qwen/qwq-32b",
        "deepseek/deepseek-chat-v3-0324:free",
        "openai/gpt-oss-120b",
      ];

      for (const modelId of modelsToTest) {
        await user.selectOptions(modelSelect, modelId);
        expect(modelSelect).toHaveValue(modelId);
      }
    });

    it("should preserve existing configuration when modal reopens", async () => {
      const existingState = {
        ...defaultStoreState,
        apiKey: "sk-existing-key",
        selectedModel: "deepseek/deepseek-chat-v3-0324:free",
      };
      vi.mocked(useStore).mockReturnValue(existingState);

      const { rerender } = render(
        <ApiKeyModal isOpen={false} onClose={mockOnClose} />,
      );

      // Reopen modal
      rerender(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Verify existing values are loaded
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      const modelSelect = screen.getByRole("combobox");

      expect(apiKeyInput).toHaveValue("sk-existing-key");
      expect(modelSelect).toHaveValue("deepseek/deepseek-chat-v3-0324:free");
    });

    it("should handle cancel action without saving changes", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Make changes
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      await user.type(apiKeyInput, "sk-temp-key");

      const modelSelect = screen.getByRole("combobox");
      await user.selectOptions(modelSelect, "qwen/qwq-32b");

      // Cancel instead of save
      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      // Verify no store updates occurred
      expect(mockSetApiKey).not.toHaveBeenCalled();
      expect(mockSetSelectedModel).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Model Selection UI Tests", () => {
    it("should display all 6 models with correct formatting", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Check that all models are available as options
      expect(screen.getByText("GPT-4.1 Mini (OpenAI)")).toBeInTheDocument();
      expect(
        screen.getByText("GPT OSS 20B (Free) (OpenAI) - Free"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Gemini 2.0 Flash (Free) (Google) - Free"),
      ).toBeInTheDocument();
      expect(screen.getByText("QwQ 32B (Qwen)")).toBeInTheDocument();
      expect(
        screen.getByText("DeepSeek Chat V3 (Free) (DeepSeek) - Free"),
      ).toBeInTheDocument();
      expect(screen.getByText("GPT OSS 120B (OpenAI)")).toBeInTheDocument();
    });

    it("should correctly identify free models in the UI", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Free models should have "- Free" suffix
      const freeModelLabels = [
        "GPT OSS 20B (Free) (OpenAI) - Free",
        "Gemini 2.0 Flash (Free) (Google) - Free",
        "DeepSeek Chat V3 (Free) (DeepSeek) - Free",
      ];

      freeModelLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });

      // Paid models should not have "- Free" suffix
      const paidModelLabels = [
        "GPT-4.1 Mini (OpenAI)",
        "QwQ 32B (Qwen)",
        "GPT OSS 120B (OpenAI)",
      ];

      paidModelLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("should handle model selection for each provider", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const modelSelect = screen.getByRole("combobox");

      // Test one model from each provider
      const providerModels = [
        "openai/gpt-4.1-mini", // OpenAI
        "google/gemini-2.0-flash-exp:free", // Google
        "qwen/qwq-32b", // Qwen
        "deepseek/deepseek-chat-v3-0324:free", // DeepSeek
      ];

      for (const modelId of providerModels) {
        await user.selectOptions(modelSelect, modelId);
        expect(modelSelect).toHaveValue(modelId);
      }
    });
  });

  describe("Accessibility and UX Tests", () => {
    it("should have proper form labels and accessibility attributes", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Check form labels
      expect(screen.getByLabelText("OpenRouter API Key")).toBeInTheDocument();
      expect(screen.getByText("AI Model")).toBeInTheDocument();

      // Check input attributes
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      expect(apiKeyInput).toHaveAttribute("type", "password");
      expect(apiKeyInput).toHaveAttribute(
        "placeholder",
        "Enter your OpenRouter API key",
      );

      // Check that modal has proper heading
      expect(
        screen.getByRole("heading", { name: "OpenRouter API Key" }),
      ).toBeInTheDocument();
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Test that form elements can be focused
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      const modelSelect = screen.getByRole("combobox");
      const cancelButton = screen.getByText("Cancel");
      const saveButton = screen.getByText("Save");

      // Focus each element to verify they're focusable
      await user.click(apiKeyInput);
      expect(apiKeyInput).toHaveFocus();

      await user.click(modelSelect);
      expect(modelSelect).toHaveFocus();

      await user.click(cancelButton);
      expect(cancelButton).toHaveFocus();

      await user.click(saveButton);
      expect(saveButton).toHaveFocus();
    });

    it("should display privacy notice with OpenRouter reference", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const privacyNotice = screen.getByText(
        /Your API key is stored locally in your browser and is never shared with anyone except OpenRouter/,
      );
      expect(privacyNotice).toBeInTheDocument();
    });
  });

  describe("State Synchronization Tests", () => {
    it("should sync local state with store state when modal opens", async () => {
      const initialState = {
        ...defaultStoreState,
        apiKey: "sk-initial-key",
        selectedModel: "qwen/qwq-32b",
      };
      vi.mocked(useStore).mockReturnValue(initialState);

      const { rerender } = render(
        <ApiKeyModal isOpen={false} onClose={mockOnClose} />,
      );

      // Update store state
      const updatedState = {
        ...defaultStoreState,
        apiKey: "sk-updated-key",
        selectedModel: "google/gemini-2.0-flash-exp:free",
      };
      vi.mocked(useStore).mockReturnValue(updatedState);

      // Reopen modal
      rerender(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Verify UI reflects updated store state
      expect(screen.getByLabelText("OpenRouter API Key")).toHaveValue(
        "sk-updated-key",
      );
      expect(screen.getByRole("combobox")).toHaveValue(
        "google/gemini-2.0-flash-exp:free",
      );
    });

    it("should not update store until save is clicked", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Make changes but don't save
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      await user.type(apiKeyInput, "sk-temp-key");

      const modelSelect = screen.getByRole("combobox");
      await user.selectOptions(
        modelSelect,
        "deepseek/deepseek-chat-v3-0324:free",
      );

      // Verify store hasn't been updated yet
      expect(mockSetApiKey).not.toHaveBeenCalled();
      expect(mockSetSelectedModel).not.toHaveBeenCalled();

      // Now save
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      // Verify store is updated
      expect(mockSetApiKey).toHaveBeenCalledWith("sk-temp-key");
      expect(mockSetSelectedModel).toHaveBeenCalledWith(
        "deepseek/deepseek-chat-v3-0324:free",
      );
    });
  });

  describe("Error Handling in UI", () => {
    it("should handle empty API key gracefully", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Clear API key input (if it had a value)
      const apiKeyInput = screen.getByLabelText("OpenRouter API Key");
      await user.clear(apiKeyInput);

      // Save with empty key
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      // Should still call store methods (validation happens elsewhere)
      expect(mockSetApiKey).toHaveBeenCalledWith("");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should handle rapid model selection changes", async () => {
      const user = userEvent.setup();

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const modelSelect = screen.getByRole("combobox");

      // Rapidly change models
      await user.selectOptions(modelSelect, "openai/gpt-oss-20b:free");
      await user.selectOptions(modelSelect, "google/gemini-2.0-flash-exp:free");
      await user.selectOptions(modelSelect, "qwen/qwq-32b");
      await user.selectOptions(
        modelSelect,
        "deepseek/deepseek-chat-v3-0324:free",
      );

      // Final selection should be preserved
      expect(modelSelect).toHaveValue("deepseek/deepseek-chat-v3-0324:free");

      // Save and verify final state
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      expect(mockSetSelectedModel).toHaveBeenCalledWith(
        "deepseek/deepseek-chat-v3-0324:free",
      );
    });
  });
});
