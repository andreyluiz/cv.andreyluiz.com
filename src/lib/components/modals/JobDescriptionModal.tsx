import { useEffect, useId, useState } from "react";
import Button from "@/lib/components/ui/Button";
import Modal from "./Modal";

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    jobTitle: string,
    jobDescription: string,
    aiInstructions: string,
  ) => void;
  jobTitle: string;
  setJobTitle: (jobTitle: string) => void;
  jobDescription: string;
  setJobDescription: (jobDescription: string) => void;
}

export default function JobDescriptionModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
}: JobDescriptionModalProps) {
  const [aiInstructions, setAiInstructions] = useState("");

  const jobTitleId = useId();
  const jobDescriptionId = useId();
  const aiInstructionsId = useId();

  useEffect(() => {
    // Load AI instructions from localStorage when modal opens
    if (isOpen) {
      const savedInstructions = localStorage.getItem(
        "resumeTailorInstructions",
      );
      if (savedInstructions) {
        setAiInstructions(savedInstructions);
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save AI instructions to localStorage
    localStorage.setItem("resumeTailorInstructions", aiInstructions);
    onSubmit(jobTitle, jobDescription, aiInstructions);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tailor Your Resume">
      <p className="mb-4 text-neutral-600 dark:text-neutral-300">
        Enter the job title and paste the job description below to tailor your
        resume for this position.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="jobTitle" className="mb-2 block font-medium">
            Job Title
          </label>
          <input
            id={jobTitleId}
            type="text"
            className="w-full rounded-lg border border-neutral-300 p-4 dark:border-neutral-600 dark:bg-neutral-700"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter the job title..."
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="jobDescription" className="mb-2 block font-medium">
            Job Description
          </label>
          <textarea
            id={jobDescriptionId}
            className="h-64 w-full rounded-lg border border-neutral-300 p-4 dark:border-neutral-600 dark:bg-neutral-700"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="aiInstructions" className="mb-2 block font-medium">
            AI Instructions (Optional)
          </label>
          <textarea
            id={aiInstructionsId}
            className="h-32 w-full rounded-lg border border-neutral-300 p-4 dark:border-neutral-600 dark:bg-neutral-700"
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="Add specific instructions for the AI model (e.g., focus on certain skills, emphasize particular experiences)..."
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Tailor Resume</Button>
        </div>
      </form>
    </Modal>
  );
}
