import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../../../store";
import ApiKeyModal from "../ApiKeyModal";

// Mock the store
vi.mock("../../../store", () => ({
  useStore: vi.fn(),
}));

// Mock the models
vi.mock("../../../models", () => ({
  AVAILABLE_MODELS: [
    {
      id: "openai/gpt-4.1-mini",
      name: "GPT-4.1 Mini",
      provider: "OpenAI",
      isFree: false,
    },
    {
      id: "google/gemini-2.0-flash-exp:free",
      name: "Gemini 2.0 Flash (Free)",
      provider: "Google",
      isFree: true,
    },
    {
      id: "deepseek/deepseek-chat-v3-0324:free",
      name: "DeepSeek Chat V3 (Free)",
      provider: "DeepSeek",
      isFree: true,
    },
  ],
}));

describe("ApiKeyModal", () => {
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

  describe("rendering", () => {
    it("should render modal title correctly", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByRole("heading", { name: "OpenRouter API Key" }),
      ).toBeInTheDocument();
    });

    it("should render privacy notice with OpenRouter reference", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(
          /Your API key is stored locally in your browser and is never shared with anyone except OpenRouter/,
        ),
      ).toBeInTheDocument();
    });

    it("should render API key input field", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Enter your OpenRouter API key",
      );
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "password");
    });

    it("should render model selection dropdown", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("AI Model")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render Cancel and Save buttons", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
    });
  });

  describe("initial values", () => {
    it("should populate input with existing API key", () => {
      const storeWithApiKey = {
        ...defaultStoreState,
        apiKey: "sk-existing-key-123",
      };
      vi.mocked(useStore).mockReturnValue(storeWithApiKey);

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Enter your OpenRouter API key",
      );
      expect(input).toHaveValue("sk-existing-key-123");
    });

    it("should show selected model in dropdown", () => {
      const storeWithModel = {
        ...defaultStoreState,
        selectedModel: "google/gemini-2.0-flash-exp:free",
      };
      vi.mocked(useStore).mockReturnValue(storeWithModel);

      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // The Select component should show the selected model value
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("google/gemini-2.0-flash-exp:free");
    });
  });

  describe("user interactions", () => {
    it("should update local API key when user types", async () => {
      const user = userEvent.setup();
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Enter your OpenRouter API key",
      );
      await user.type(input, "sk-new-key-456");

      expect(input).toHaveValue("sk-new-key-456");
    });

    it("should call onClose when Cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should save API key and model when Save button is clicked", async () => {
      const user = userEvent.setup();
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Enter your OpenRouter API key",
      );
      await user.type(input, "sk-test-key-789");

      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      expect(mockSetApiKey).toHaveBeenCalledWith("sk-test-key-789");
      expect(mockSetSelectedModel).toHaveBeenCalledWith("openai/gpt-4.1-mini");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not render when isOpen is false", () => {
      render(<ApiKeyModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText("OpenRouter API Key")).not.toBeInTheDocument();
    });
  });

  describe("model options", () => {
    it("should display model options with correct formatting", () => {
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      // Check that model options are available in the select
      const modelSelect = screen.getByRole("combobox");
      expect(modelSelect).toBeInTheDocument();

      // Check that options are present
      expect(screen.getByText("GPT-4.1 Mini (OpenAI)")).toBeInTheDocument();
      expect(
        screen.getByText("Gemini 2.0 Flash (Free) (Google) - Free"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("DeepSeek Chat V3 (Free) (DeepSeek) - Free"),
      ).toBeInTheDocument();
    });

    it("should allow model selection change", async () => {
      const user = userEvent.setup();
      render(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const modelSelect = screen.getByRole("combobox");
      await user.selectOptions(modelSelect, "google/gemini-2.0-flash-exp:free");

      expect(modelSelect).toHaveValue("google/gemini-2.0-flash-exp:free");
    });
  });

  describe("state synchronization", () => {
    it("should reset local state when modal opens", () => {
      const { rerender } = render(
        <ApiKeyModal isOpen={false} onClose={mockOnClose} />,
      );

      // Open modal with new store state
      const updatedStore = {
        ...defaultStoreState,
        apiKey: "sk-updated-key",
        selectedModel: "google/gemini-2.0-flash-exp:free",
      };
      vi.mocked(useStore).mockReturnValue(updatedStore);

      rerender(<ApiKeyModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        "Enter your OpenRouter API key",
      );
      expect(input).toHaveValue("sk-updated-key");
    });
  });
});
