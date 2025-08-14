import { useId } from "react";

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "password";
  error?: string;
  helperText?: string;
  id?: string;
  className?: string;
}

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  error,
  helperText,
  id,
  className = "",
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperTextId = `${inputId}-helper`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-2 block font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-lg border p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-neutral-300 focus:border-blue-500"
        } dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-gray-400`}
        aria-describedby={
          error ? errorId : helperText ? helperTextId : undefined
        }
        aria-invalid={error ? "true" : "false"}
      />
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={helperTextId}
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
