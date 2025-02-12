import { PropsWithChildren } from "react";

export default function Badge({ children }: PropsWithChildren) {
  return (
    <span className="text-neutral-700 dark:text-neutral-300 print:border print:border-neutral-200 bg-neutral-50 dark:bg-neutral-700 p-1 px-2 print:px-1 rounded-lg">
      {children}
    </span>
  );
}
