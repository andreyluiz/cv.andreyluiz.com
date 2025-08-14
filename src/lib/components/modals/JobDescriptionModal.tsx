import { useEffect, useState } from "react";
import Button from "@/lib/components/ui/Button";
import Input from "@/lib/components/ui/Input";
import Textarea from "@/lib/components/ui/Textarea";
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Job Title"
          value={jobTitle}
          onChange={setJobTitle}
          placeholder="Enter the job title..."
          required
        />

        <Textarea
          label="Job Description"
          value={jobDescription}
          onChange={setJobDescription}
          placeholder="Paste the job description here..."
          required
          rows={16}
        />

        <Textarea
          label="AI Instructions (Optional)"
          value={aiInstructions}
          onChange={setAiInstructions}
          placeholder="Add specific instructions for the AI model (e.g., focus on certain skills, emphasize particular experiences)..."
          rows={8}
        />

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Tailor Resume</Button>
        </div>
      </form>
    </Modal>
  );
}
