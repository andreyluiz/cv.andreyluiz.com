import { Variant } from "./types";

export async function getResume(): Promise<Variant> {
  const response = await fetch("/api/resume");
  return await response.json();
}

// The tailorResume function has been moved to server actions
// See src/lib/server/actions.ts
