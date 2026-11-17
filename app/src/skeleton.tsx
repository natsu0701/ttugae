import type { Route } from "./types.ts";

function Bone({ className }: { className?: string }) {
  const radius = className?.includes("rounded") ? "" : "rounded-lg";
  return <span aria-hidden className={["skeleton", radius, className].filter(Boolean).join(" ")} />;
}

function HomeSkeleton() {
  return (
    <div className="pb-8">
      <div className="flex items-end justify-between px-4 pb-2 pt-1">
        <div className="flex gap-4">
          <Bone className="h-6 w-8" />
          <Bone className="h-6 w-16" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-8 w-8 rounded-full" />
          <Bone className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="px-4 pt-4">
        <Bone className="h-6 w-56" />
        <div className="mt-3 overflow-hidden rounded-lg shadow-card">
          <Bone className="h-52 rounded-none" />
          <div className="px-4 py-3">
            <Bone className="h-6 w-40" />
            <Bone className="mt-3 h-3 w-full" />
            <Bone className="mt-4 h-12 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-4 gap-2 px-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Bone className="h-16 w-16 rounded-full" />
            <Bone className="h-3 w-12" />
          </div>
        ))}
      </div>
      <Bone className="mx-4 mt-8 h-28 rounded-lg" />
      <div className="mt-8 px-4">
        <Bone className="h-5 w-36" />
        <div className="mt-3 flex gap-3 overflow-hidden">
          <Bone className="h-32 w-[78%] shrink-0 rounded-lg" />
          <Bone className="h-32 w-28 shrink-0 rounded-lg" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-2 px-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Bone key={index} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function BagSkeleton() {
  return (
    <div className="pb-28">
      <Bone className="mx-auto mt-2 h-5 w-24" />
      <div className="mt-5 flex justify-between px-5">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone key={index} className="h-4 w-14" />
        ))}
      </div>
      <div className="mt-5 flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex w-16 shrink-0 flex-col items-center gap-2">
            <Bone className="h-14 w-14 rounded-full" />
            <Bone className="h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="px-4 pt-5">
        <Bone className="h-4 w-32" />
        <Bone className="mt-3 h-52 w-full rounded-lg" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 px-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <Bone className="aspect-square rounded-lg" />
            <Bone className="mt-2 h-4 w-24" />
            <Bone className="mt-1 h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoungeSkeleton() {
  return (
    <div>
      <Bone className="ml-4 mt-2 h-6 w-28" />
      <div className="mt-5 flex justify-around px-8">
        <Bone className="h-4 w-10" />
        <Bone className="h-4 w-10" />
        <Bone className="h-4 w-16" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-px bg-[#f4f4f4]">
        {Array.from({ length: 9 }, (_, index) => (
          <Bone key={index} className="aspect-square rounded-none" />
        ))}
      </div>
    </div>
  );
}

function MySkeleton() {
  return (
    <div className="pb-8">
      <Bone className="mx-auto mt-3 h-5 w-24" />
      <div className="mt-4 flex items-center gap-3 border-b border-[#f6f6f6] px-4 pb-4">
        <Bone className="h-14 w-14 rounded-full" />
        <div className="min-w-0 flex-1">
          <Bone className="h-4 w-32" />
          <Bone className="mt-2 h-3 w-40" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 px-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-3 w-12" />
          </div>
        ))}
      </div>
      <Bone className="mx-4 mt-4 h-28 rounded-lg" />
      <div className="mx-4 mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone key={index} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="pb-8">
      <Bone className="mx-4 mt-4 h-72 rounded-lg" />
      <Bone className="mx-4 mt-3 h-20 rounded-lg" />
      <Bone className="mx-4 mt-3 h-24 rounded-lg" />
      <Bone className="mx-4 mt-4 h-16 rounded-lg" />
      <div className="mt-4 flex gap-2 px-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Bone key={index} className="h-28 w-28 shrink-0 rounded-lg" />
        ))}
      </div>
      <Bone className="mx-4 mt-4 h-48 rounded-lg" />
      <Bone className="mx-4 mt-4 h-40 rounded-lg" />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="pb-10">
      <div className="mt-2 flex justify-between px-5">
        <Bone className="h-4 w-20" />
        <Bone className="h-4 w-28" />
      </div>
      <Bone className="mx-4 mt-3 h-52 rounded-lg" />
      <div className="mx-4 mt-4 rounded-lg bg-[#fafafa] p-4">
        <div className="flex items-center justify-between">
          <Bone className="h-8 w-28" />
          <div className="flex gap-2">
            <Bone className="h-10 w-10 rounded-full" />
            <Bone className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="mt-4 flex justify-around">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Bone className="h-16 w-16 rounded-full" />
              <Bone className="h-3 w-10" />
            </div>
          ))}
        </div>
        <Bone className="mt-4 h-12 rounded-full" />
      </div>
      <div className="mt-5 flex justify-around px-6">
        <Bone className="h-4 w-16" />
        <Bone className="h-4 w-10" />
        <Bone className="h-4 w-14" />
      </div>
      <div className="mt-4 space-y-3 px-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <Bone className="h-4 w-28" />
              <Bone className="mt-2 h-3 w-40" />
            </div>
            <Bone className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="pb-10">
      <Bone className={tall ? "h-72 rounded-none" : "mx-4 mt-3 h-52 rounded-lg"} />
      <div className="px-5 pt-4">
        <Bone className="h-3 w-16" />
        <Bone className="mt-3 h-6 w-48" />
        <Bone className="mt-4 h-3 w-full" />
        <Bone className="mt-2 h-3 w-5/6" />
        <Bone className="mt-2 h-3 w-2/3" />
        <Bone className="mt-6 h-12 rounded-full" />
      </div>
    </div>
  );
}

function ListSkeleton({ thumb = false, rows = 5 }: { thumb?: boolean; rows?: number }) {
  return (
    <ul className="space-y-3 px-4 pt-3">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center gap-3 rounded-lg border border-[#f4f4f4] p-3">
          {thumb ? <Bone className="h-16 w-16 shrink-0 rounded-lg" /> : null}
          <div className="min-w-0 flex-1">
            <Bone className="h-4 w-2/3" />
            <Bone className="mt-2 h-3 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pt-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index}>
          <Bone className="aspect-square rounded-lg" />
          <Bone className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="px-4 pt-2 pb-8">
      <div className="flex gap-2">
        <Bone className="h-11 flex-1 rounded-full" />
        <Bone className="h-11 w-11 rounded-full" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Bone key={index} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <Bone className="aspect-[4/3] rounded-lg" />
            <Bone className="mt-2 h-4 w-3/4" />
            <Bone className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CounterSkeleton() {
  return (
    <div className="px-4 pt-4">
      <Bone className="h-11 rounded-full" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="rounded-lg border border-[#f3f3f3] px-4 py-5">
            <Bone className="h-4 w-14" />
            <Bone className="mx-auto mt-4 h-12 w-20" />
            <div className="mt-5 flex justify-center gap-6">
              <Bone className="h-12 w-12 rounded-full" />
              <Bone className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <Bone className="mx-auto mt-8 h-12 w-36 rounded-full" />
    </div>
  );
}

function GaugeSkeleton() {
  return (
    <div className="px-4 pt-3">
      <Bone className="h-11 rounded-full" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex gap-3 rounded-lg border border-[#f0f0f0] p-3">
            <div className="flex-1">
              <Bone className="h-4 w-24" />
              <Bone className="mt-2 h-3 w-32" />
              <Bone className="mt-3 h-3 w-16" />
              <Bone className="mt-2 h-4 w-28" />
            </div>
            <Bone className="h-16 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index}>
          <Bone className="h-3 w-16" />
          <Bone className="mt-2 h-11 rounded-xl" />
        </div>
      ))}
      <Bone className="h-12 rounded-full" />
    </div>
  );
}

function HelpSkeleton() {
  return (
    <div className="px-4 pt-2">
      <Bone className="h-20 rounded-lg" />
      <div className="mt-4 flex gap-2">
        <Bone className="h-11 flex-1 rounded-full" />
        <Bone className="h-11 flex-1 rounded-full" />
      </div>
      <Bone className="mt-6 h-6 w-32" />
      <Bone className="mt-3 h-48 rounded-lg" />
      <Bone className="mt-3 h-3 w-full" />
      <Bone className="mt-2 h-3 w-4/5" />
    </div>
  );
}

function DiarySkeleton() {
  return (
    <div>
      <div className="flex h-12 items-center px-4">
        <Bone className="h-5 w-5 rounded-full" />
        <Bone className="mx-auto h-5 w-20" />
        <Bone className="h-4 w-8" />
      </div>
      <div className="flex gap-2 px-4 pt-3">
        <Bone className="h-16 w-16 rounded-full" />
        <Bone className="h-16 flex-1 rounded-lg" />
      </div>
      <div className="px-4 pt-6">
        <Bone className="h-4 w-36" />
        <Bone className="mt-3 h-32 rounded-lg" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 px-4">
        <Bone className="h-28 rounded-lg" />
        <Bone className="h-28 rounded-lg" />
      </div>
      <div className="mt-6 flex gap-2 px-4">
        <Bone className="h-9 w-24 rounded-full" />
        <Bone className="h-9 w-20 rounded-full" />
        <Bone className="h-9 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="flex-1 space-y-3 px-4 py-4">
        <div className="flex gap-2">
          <Bone className="h-11 w-11 shrink-0 rounded-full" />
          <Bone className="h-16 w-3/5 rounded-lg" />
        </div>
        <div className="flex justify-end">
          <Bone className="h-10 w-2/5 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-11 w-11 shrink-0 rounded-full" />
          <Bone className="h-20 w-2/3 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2 border-t border-[#f2f2f2] px-3 py-3">
        <Bone className="h-11 flex-1 rounded-full" />
        <Bone className="h-11 w-16 rounded-full" />
      </div>
    </div>
  );
}

function bodyFor(route: Route) {
  switch (route.name) {
    case "home":
      return <HomeSkeleton />;
    case "bag":
      return <BagSkeleton />;
    case "lounge":
      return <LoungeSkeleton />;
    case "my":
      return <MySkeleton />;
    case "profile":
      return <ProfileSkeleton />;
    case "project":
    case "finished":
      return <ProjectSkeleton />;
    case "diary":
    case "diary-entry":
      return <DiarySkeleton />;
    case "counter":
      return <CounterSkeleton />;
    case "counters":
    case "notifications":
    case "navi":
    case "ranking":
      return <ListSkeleton />;
    case "orders":
      return <ListSkeleton thumb rows={4} />;
    case "cart":
      return <ListSkeleton thumb rows={3} />;
    case "likes":
      return <GridSkeleton />;
    case "codex":
    case "collection":
      return <SearchSkeleton />;
    case "chat":
      return <ChatSkeleton />;
    case "gauge":
      return <GaugeSkeleton />;
    case "gauge-form":
    case "project-form":
    case "skill":
      return <FormSkeleton />;
    case "gauge-help":
      return <HelpSkeleton />;
    case "work":
    case "short":
      return <DetailSkeleton tall />;
    default:
      return <DetailSkeleton />;
  }
}

export function PageSkeleton({ route }: { route: Route }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" data-skeleton="true">
      <span className="sr-only">화면을 불러오는 중</span>
      {bodyFor(route)}
    </div>
  );
}
