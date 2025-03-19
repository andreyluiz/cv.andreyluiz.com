import { PropsWithChildren } from "react";
import { cn } from "../lib/utils";

interface Props extends PropsWithChildren {
  className?: string;
}

export default function Section({ children, className }: Props) {
  return <section className={cn("mb-8 print:mb-4", className)}>{children}</section>;
}