import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

const titleVariants = cva("text-neutral-800 dark:text-neutral-100", {
  variants: {
    tag: {
      h1: "font-semibold text-2xl",
      h2: "font-semibold text-xl",
    },
  },
  defaultVariants: {
    tag: "h2",
  },
});

interface Props extends PropsWithChildren, VariantProps<typeof titleVariants> {
  className?: string;
}

export default function Title({ children, className, tag }: Props) {
  const Tag = tag as keyof React.JSX.IntrinsicElements;

  return (
    <Tag className={cn(titleVariants({ tag, className }))}>{children}</Tag>
  );
}
