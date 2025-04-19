import { PropsWithChildren } from "react";

export default function Badge({ children }: PropsWithChildren) {
  return (
    <span className="rounded-lg bg-neutral-50 p-1 px-2 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 print:border print:border-neutral-200 print:px-1">
      {children}
    </span>
  );
}
