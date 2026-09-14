import type { ReactNode } from "react";

type FeatureBadgeProps = {
  children: ReactNode;
};

export default function FeatureBadge({ children }: FeatureBadgeProps) {
  return (
    <span className="inline-block rounded-full bg-coral px-4 py-1 font-sans text-base font-normal text-white">
      {children}
    </span>
  );
}
