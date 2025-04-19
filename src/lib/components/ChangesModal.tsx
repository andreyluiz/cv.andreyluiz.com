import { Change } from "@/lib/types";
import Button from "./Button";
import Modal from "./Modal";

interface ChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: Change[];
}

export default function ChangesModal({
  isOpen,
  onClose,
  changes,
}: ChangesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changes Made to Your Resume"
    >
      <div className="space-y-4">
        {changes.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-300">
            No changes have been made yet.
          </p>
        ) : (
          <ul className="list-inside list-disc space-y-2">
            {changes.map((change, index) => (
              <li
                key={index}
                className="text-neutral-700 dark:text-neutral-200"
              >
                <span className="font-semibold">{change.field}:</span>{" "}
                {change.change}
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
