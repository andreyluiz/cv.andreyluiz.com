import ResumeContent from "@/lib/components/resume/ResumeContent";
import { getResume } from "@/lib/server/actions";
import { Variant } from "@/lib/types";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Andrey Luiz CV",
  description: "Andrey Luiz CV",
};

export default async function Page() {
  const resumeData = await getResume();

  return <ResumeContent initialResume={resumeData as Variant} />;
}
