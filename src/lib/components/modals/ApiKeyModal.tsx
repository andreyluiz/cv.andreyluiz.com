import { useEffect, useId, useState } from "react";
import { AVAILABLE_MODELS } from "@/lib/models";
import { useStore } from "@/lib/store";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Modal from "./Modal";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { apiKey, setApiKey, selectedModel, setSelectedModel } = useStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localSelectedModel, setLocalSelectedModel] = useState(selectedModel);
  const apiKeyInputId = useId();
  const modelSelectId = useId();

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey);
      setLocalSelectedModel(selectedModel);
    }
  }, [apiKey, selectedModel, isOpen]);

  const handleSave = () => {
    setApiKey(localApiKey);
    setSelectedModel(localSelectedModel);
    onClose();
  };

  // Convert models to select options
  const modelOptions = AVAILABLE_MODELS.map((model) => ({
    label: `${model.name} (${model.provider})${model.isFree ? " - Free" : ""}`,
    value: model.id,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OpenRouter API Key">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your API key is stored locally in your browser and is never shared
          with anyone except OpenRouter.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor={apiKeyInputId} className="text-sm font-medium">
            OpenRouter API Key
          </label>
          <input
            id={apiKeyInputId}
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your OpenRouter API key"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={modelSelectId} className="text-sm font-medium">
            AI Model
          </label>
          <Select
            options={modelOptions}
            value={localSelectedModel}
            onChange={setLocalSelectedModel}
            className="w-full"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
