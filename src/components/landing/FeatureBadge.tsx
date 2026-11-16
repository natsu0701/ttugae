import type { ReactNode } from "react";

type FeatureBadgeProps = {
  children: ReactNode;
};

export default function FeatureBadge({ children }: FeatureBadgeProps) {
  return (
    <span className="block font-sans text-sm font-bold uppercase tracking-widest text-coral">
      {children}
    </span>
  );
}
