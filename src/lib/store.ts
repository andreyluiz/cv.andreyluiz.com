import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  apiKey: string;
  selectedModel: string;
  setApiKey: (apiKey: string) => void;
  setSelectedModel: (model: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini", // Default model for new users
      setApiKey: (apiKey) => set({ apiKey }),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "cv-tailor-storage", // name of the item in the storage (must be unique)
    },
  ),
);
