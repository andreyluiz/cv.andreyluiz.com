import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoverLetterInputs } from "./types";

interface StoreState {
  apiKey: string;
  selectedModel: string;
  generatedCoverLetter: string | null;
  coverLetterInputs: CoverLetterInputs | null;
  hideBullets: boolean;
  setApiKey: (apiKey: string) => void;
  setSelectedModel: (model: string) => void;
  setCoverLetter: (letter: string, inputs: CoverLetterInputs) => void;
  clearCoverLetter: () => void;
  setHideBullets: (hideBullets: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini", // Default model for new users
      generatedCoverLetter: null,
      coverLetterInputs: null,
      hideBullets: false,
      setApiKey: (apiKey) => set({ apiKey }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setCoverLetter: (letter, inputs) =>
        set({
          generatedCoverLetter: letter,
          coverLetterInputs: inputs,
        }),
      clearCoverLetter: () =>
        set({
          generatedCoverLetter: null,
          coverLetterInputs: null,
        }),
      setHideBullets: (hideBullets) => set({ hideBullets }),
    }),
    {
      name: "cv-tailor-storage", // name of the item in the storage (must be unique)
    },
  ),
);
