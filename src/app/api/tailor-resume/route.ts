import { tailorResume } from "@/lib/server/openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { jobDescription, currentResume } = await req.json();

  const tailoredResume = await tailorResume(jobDescription, currentResume);
  return Response.json(tailoredResume);
}
