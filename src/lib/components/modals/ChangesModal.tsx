import Button from "@/lib/components/ui/Button";
import type { Change } from "@/lib/types";
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-100 dark:bg-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {changes.map((change) => (
                  <tr
                    key={change.field}
                    className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {change.field}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                      {change.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
