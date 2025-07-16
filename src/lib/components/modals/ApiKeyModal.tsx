import { useEffect, useId, useState } from "react";
import { useStore } from "@/lib/store";
import Button from "../ui/Button";
import Modal from "./Modal";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { apiKey, setApiKey } = useStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const apiKeyInputId = useId();

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey);
    }
  }, [apiKey, isOpen]);

  const handleSave = () => {
    setApiKey(localApiKey);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OpenAI API Key">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your API key is stored locally in your browser and is never shared
          with anyone except OpenAI.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor={apiKeyInputId} className="text-sm font-medium">
            API Key
          </label>
          <input
            id={apiKeyInputId}
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your OpenAI API key"
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
