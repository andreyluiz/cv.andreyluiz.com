import { generateCoverLetter } from "@/lib/server/actions";
import { Variant } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobDescription: string;
  resumeData: Variant;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  jobTitle,
  jobDescription,
  resumeData,
}: CoverLetterModalProps) {
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewCoverLetter = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newCoverLetter = await generateCoverLetter(
        jobTitle,
        jobDescription,
        resumeData,
      );
      if (newCoverLetter) {
        setCoverLetter(newCoverLetter);
      } else {
        setError("Failed to generate cover letter. Please try again.");
      }
    } catch (error) {
      setError("Failed to generate cover letter. Please try again.");
      console.error("Error generating cover letter:", error);
    } finally {
      setIsLoading(false);
    }
  }, [jobTitle, jobDescription, resumeData]);

  useEffect(() => {
    if (isOpen && !coverLetter) {
      generateNewCoverLetter();
    }
  }, [coverLetter, generateNewCoverLetter, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cover Letter">
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-lg">Generating your cover letter...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-red-500">{error}</p>
            <Button onClick={generateNewCoverLetter}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="prose max-w-none dark:prose-invert">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: coverLetter }}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button onClick={generateNewCoverLetter} variant="secondary">
                Regenerate
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
