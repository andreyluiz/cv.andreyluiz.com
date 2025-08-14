"use client";

import { useState } from "react";
import ChangesModal from "@/lib/components/modals/ChangesModal";
import CoverLetterModal from "@/lib/components/modals/CoverLetterModal";
import JobDescriptionModal from "@/lib/components/modals/JobDescriptionModal";
import Button from "@/lib/components/ui/Button";
import { tailorResume } from "@/lib/server/actions";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";

interface Props {
  resumeData: Variant;
  onResumeUpdate: (resume: Variant) => void;
}

export default function ResumeTailor({ resumeData, onResumeUpdate }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState(resumeData.title || "");
  const [isTailored, setIsTailored] = useState(false);
  const { apiKey, selectedModel } = useStore();

  const handleJobDescriptionSubmit = async (
    jobTitle: string,
    jobDescription: string,
    aiInstructions: string,
  ) => {
    try {
      setIsLoading(true);
      const tailoredResume = await tailorResume(
        jobTitle,
        jobDescription,
        resumeData,
        aiInstructions,
        apiKey,
        selectedModel,
      );
      onResumeUpdate(tailoredResume);
      setIsTailored(true);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to tailor resume with OpenRouter. Please check your API key and selected model, then try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-end gap-2">
        <Button onClick={() => setIsModalOpen(true)} disabled={!apiKey}>
          {isTailored ? "Resume Tailored" : "Tailor Resume"}
        </Button>
        {isTailored && (
          <Button onClick={() => setIsChangesModalOpen(true)}>
            What changed?
          </Button>
        )}
        <Button
          onClick={() => setIsCoverLetterModalOpen(true)}
          disabled={!apiKey || !selectedModel}
        >
          Generate Cover Letter
        </Button>
      </div>

      <JobDescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleJobDescriptionSubmit}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
      />

      <ChangesModal
        isOpen={isChangesModalOpen}
        onClose={() => setIsChangesModalOpen(false)}
        changes={resumeData.changes || []}
      />

      <CoverLetterModal
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
        resumeData={resumeData}
        apiKey={apiKey}
        selectedModel={selectedModel}
      />

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-800">
            <p className="text-lg">Tailoring your resume...</p>
          </div>
        </div>
      )}
    </>
  );
}
