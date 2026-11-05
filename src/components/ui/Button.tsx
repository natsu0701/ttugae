import type { ButtonHTMLAttributes, ReactNode } from "react";
import { softShadow } from "./tabButtonStyles.ts";

type Variant = "primary" | "secondary" | "ghost" | "black" | "kakao" | "google" | "apple";

type ButtonProps = {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base = `inline-flex h-auto min-h-11 min-w-0 shrink-0 items-center justify-center gap-2 whitespace-normal break-keep rounded-2xl font-sans text-base font-semibold leading-snug transition-colors duration-200 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral disabled:opacity-50 bg-white !text-gray-900 hover:bg-black hover:!text-white active:bg-coral active:!text-white ${softShadow}`;

const variantExtra: Partial<Record<Variant, string>> = {
  kakao:
    `!bg-[#FEE500] !text-gray-900 hover:!bg-black hover:!text-white active:!bg-coral ${softShadow}`,
  ghost:
    `!bg-white !text-gray-900 hover:!bg-black hover:!text-white active:!bg-coral active:!text-white ${softShadow}`,
  secondary:
    `border border-gray-300 bg-white !text-gray-900 hover:bg-black hover:!text-white hover:border-black active:bg-coral active:border-coral active:!text-white ${softShadow}`,
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variantExtra[variant] ?? ""} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
