import { Variant } from "./types";

export async function getResume(): Promise<Variant> {
  const response = await fetch("/api/resume");
  return await response.json();
}
