import { useCallback, useEffect, useState } from "react";
import Button from "@/lib/components/ui/Button";
import { generateCoverLetter } from "@/lib/server/actions";
import type { Variant } from "@/lib/types";
import Modal from "./Modal";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobDescription: string;
  resumeData: Variant;
  apiKey: string;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  jobTitle,
  jobDescription,
  resumeData,
  apiKey,
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
        apiKey,
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
  }, [jobTitle, jobDescription, resumeData, apiKey]);

  const getCoverLetter = () => ({
    __html: coverLetter,
  });

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
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Comes from the AI, so it's safe
                dangerouslySetInnerHTML={getCoverLetter()}
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
