import { Select as HeadlessSelect } from "@headlessui/react";
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
          "mt-3 block w-full rounded-lg border-none bg-white/5 px-4 py-1.5 text-sm/6 text-white",
          "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
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
    </div>
  );
}
