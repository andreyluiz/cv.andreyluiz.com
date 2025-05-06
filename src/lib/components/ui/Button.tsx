import { cn } from "@/lib/utils";
import { Button as HeadlessButton } from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";

const buttonVariants = cva("rounded-lg px-4 py-2", {
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary:
        "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function Button({
  children,
  className,
  variant,
  ...props
}: ButtonProps) {
  return (
    <HeadlessButton
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    >
      {children}
    </HeadlessButton>
  );
}
