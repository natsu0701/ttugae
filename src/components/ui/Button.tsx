import type { ButtonHTMLAttributes, ReactNode } from "react";
import { softShadow } from "./tabButtonStyles.ts";

type Variant = "primary" | "secondary" | "ghost" | "black" | "kakao" | "google" | "apple";

type ButtonProps = {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base = `inline-flex items-center justify-center gap-2 rounded-full font-sans font-normal transition-colors duration-200 focus:outline-none disabled:opacity-50 bg-white text-gray-700 hover:bg-black hover:text-white active:bg-coral active:text-white ${softShadow}`;

const variantExtra: Partial<Record<Variant, string>> = {
  kakao:
    `!bg-[#FEE500] !text-gray-900 hover:!bg-black hover:!text-white active:!bg-coral ${softShadow}`,
  ghost:
    `!bg-white !text-gray-600 hover:!bg-black hover:!text-white active:!bg-coral active:!text-white ${softShadow}`,
  secondary:
    `border border-gray-300 bg-white text-gray-700 hover:bg-black hover:text-white hover:border-black active:bg-coral active:border-coral active:text-white ${softShadow}`,
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
