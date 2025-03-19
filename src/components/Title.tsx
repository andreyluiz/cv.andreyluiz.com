import { PropsWithChildren } from "react";
import { cn } from "../lib/utils";

interface Props extends PropsWithChildren {
  className?: string;
  tag?: "h1" | "h2" | "h3";
}

export default function Title({ children, className, tag = "h2" }: Props) {
  const Tag = tag as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={cn("text-neutral-800 dark:text-neutral-100", className, {
        "text-4xl print:text-2xl font-bold": tag === "h1",
        "text-2xl print:text-lg font-bold": tag === "h2",
        "text-xl print:text-md font-semibold": tag === "h3",
      })}
    >
      {children}
    </Tag>
  );
}
