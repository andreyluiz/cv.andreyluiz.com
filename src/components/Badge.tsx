import { PropsWithChildren } from "react";

export default function Badge({ children }: PropsWithChildren) {
  return (
    <li className="bg-neutral-50 dark:bg-neutral-700 p-1 px-2 print:px-1 rounded-lg">{children}</li>
  );
}
