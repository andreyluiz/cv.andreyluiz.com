import { Select as HeadlessSelect } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export default function Select({
  options,
  value,
  onChange,
  className,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      <HeadlessSelect
        className={cn(
          "block w-full appearance-none rounded-lg border-none bg-gray-200 px-4 py-1.5 pr-8 text-sm/6 text-black dark:bg-white/5 dark:text-white",
          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-black/25 dark:data-focus:outline-white/25",
          "*:text-black",
        )}
        value={value}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </HeadlessSelect>
      <ChevronDownIcon
        className="pointer-events-none absolute right-2.5 top-2.5 size-4 fill-black/60 dark:fill-white/60"
        aria-hidden="true"
      />
    </div>
  );
}
