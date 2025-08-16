import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoverLetterInputs, IngestedCV, Variant } from "./types";

interface StoreState {
  apiKey: string;
  selectedModel: string;
  generatedCoverLetter: string | null;
  coverLetterInputs: CoverLetterInputs | null;
  hideBullets: boolean;
  layoutMode: "single" | "two-column";
  ingestedCVs: IngestedCV[];
  currentCV: Variant | null;
  setApiKey: (apiKey: string) => void;
  setSelectedModel: (model: string) => void;
  setCoverLetter: (letter: string, inputs: CoverLetterInputs) => void;
  clearCoverLetter: () => void;
  setHideBullets: (hideBullets: boolean) => void;
  setLayoutMode: (mode: "single" | "two-column") => void;
  addIngestedCV: (cv: IngestedCV) => void;
  updateIngestedCV: (id: string, cv: IngestedCV) => void;
  deleteIngestedCV: (id: string) => void;
  setCurrentCV: (cv: Variant) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      apiKey: "",
      selectedModel: "openai/gpt-4.1-mini", // Default model for new users
      generatedCoverLetter: null,
      coverLetterInputs: null,
      hideBullets: false,
      layoutMode: "single", // Default to single column for backward compatibility
      ingestedCVs: [],
      currentCV: null,
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
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      addIngestedCV: (cv) =>
        set((state) => ({
          ingestedCVs: [...state.ingestedCVs, cv],
        })),
      updateIngestedCV: (id, updatedCV) =>
        set((state) => ({
          ingestedCVs: state.ingestedCVs.map((cv) =>
            cv.id === id ? updatedCV : cv,
          ),
        })),
      deleteIngestedCV: (id) =>
        set((state) => ({
          ingestedCVs: state.ingestedCVs.filter((cv) => cv.id !== id),
        })),
      setCurrentCV: (cv) => set({ currentCV: cv }),
    }),
    {
      name: "cv-tailor-storage", // name of the item in the storage (must be unique)
    },
  ),
);
