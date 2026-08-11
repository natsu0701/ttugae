import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.replace(/\s/g, "-").toLowerCase();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block font-sans text-sm font-normal text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-2xl bg-gray-100 px-4 py-3 font-sans font-normal text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:bg-gray-50 ${className}`}
        {...props}
      />
    </div>
  );
}
