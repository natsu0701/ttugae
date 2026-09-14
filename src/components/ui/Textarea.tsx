import type { TextareaHTMLAttributes } from "react";
import { softShadow } from "./tabButtonStyles.ts";

type TextareaProps = {
  label?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ label, className = "", id, ...props }: TextareaProps) {
  const inputId = id ?? label?.replace(/\s/g, "-").toLowerCase();

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block font-sans text-base font-normal text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`min-h-[120px] w-full resize-y rounded-xl bg-gray-50 px-4 py-3 font-sans text-base font-normal leading-normal text-gray-800 outline-none transition-colors focus:bg-white ${softShadow} ${className}`}
        {...props}
      />
    </div>
  );
}
