import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      apiKey: "",
      setApiKey: (apiKey) => set({ apiKey }),
    }),
    {
      name: "cv-tailor-storage", // name of the item in the storage (must be unique)
    },
  ),
);
