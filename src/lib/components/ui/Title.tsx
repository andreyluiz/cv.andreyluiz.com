import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

const titleVariants = cva(
  "text-neutral-800 dark:text-neutral-100 print:text-black",
  {
    variants: {
      tag: {
        h1: "font-semibold text-2xl print:text-lg print:font-bold print:break-after-avoid",
        h2: "font-semibold text-xl print:text-base print:font-semibold print:break-after-avoid print:mb-1",
      },
    },
    defaultVariants: {
      tag: "h2",
    },
  },
);

interface Props extends PropsWithChildren, VariantProps<typeof titleVariants> {
  className?: string;
}

export default function Title({ children, className, tag }: Props) {
  const Tag = tag as keyof React.JSX.IntrinsicElements;

  return (
    <Tag className={cn(titleVariants({ tag, className }))}>{children}</Tag>
  );
}
