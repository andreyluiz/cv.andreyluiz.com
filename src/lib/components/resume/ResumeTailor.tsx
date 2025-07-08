"use client";

import { useState } from "react";
import ChangesModal from "@/lib/components/modals/ChangesModal";
import CoverLetterModal from "@/lib/components/modals/CoverLetterModal";
import JobDescriptionModal from "@/lib/components/modals/JobDescriptionModal";
import Button from "@/lib/components/ui/Button";
import { tailorResume } from "@/lib/server/actions";
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
  const [jobTitle, setJobTitle] = useState("");
  const [isTailored, setIsTailored] = useState(false);

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
      );
      onResumeUpdate(tailoredResume);
      setIsTailored(true);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      alert("Failed to tailor resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsModalOpen(true)}>
          {isTailored ? "Resume Tailored" : "Tailor Resume"}
        </Button>
        {isTailored && (
          <>
            <Button onClick={() => setIsChangesModalOpen(true)}>
              What changed?
            </Button>
            <Button onClick={() => setIsCoverLetterModalOpen(true)}>
              Generate Cover Letter
            </Button>
          </>
        )}
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
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        resumeData={resumeData}
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
