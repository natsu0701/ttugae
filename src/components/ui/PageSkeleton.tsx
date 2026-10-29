import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

type PageSkeletonProps = {
  tone?: "light" | "dark";
  label?: string;
};

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-current ${className}`} />;
}

function PageSkeleton({ tone = "light", label }: PageSkeletonProps) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex min-h-[100dvh] w-full flex-col ${dark ? "bg-stone-900 text-white/15" : "bg-[#FFFBF7] text-stone-200"}`}
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <div className={`flex h-[4.5rem] items-center justify-between px-6 ${dark ? "border-b border-white/10" : "border-b border-stone-100"}`}>
        <Bone className="h-6 w-28" />
        <div className="hidden items-center gap-4 sm:flex">
          <Bone className="h-4 w-12" />
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-14" />
        </div>
        <Bone className="h-9 w-9 rounded-full" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-10">
        <img
          src={TTEUNI_IMAGES.chatProfile}
          alt=""
          className="h-16 w-16 animate-pulse rounded-full bg-stone-100 object-cover"
        />
        <Bone className="mt-5 h-7 w-48" />
        <Bone className="mt-3 h-4 w-72 max-w-full" />

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-2xl ${dark ? "bg-white/5" : "bg-white shadow-sm"}`}
            >
              <Bone className={`h-36 w-full rounded-none ${dark ? "bg-white/10" : "bg-stone-100 text-stone-100"}`} />
              <div className={`space-y-2 p-4 ${dark ? "text-white/10" : "text-stone-100"}`}>
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(PageSkeleton);
