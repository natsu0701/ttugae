import { useApp } from "../store.tsx";
import type { ToolKind, UnitSystem } from "../types.ts";
import { Mascot, cx } from "../ui.tsx";

export function MyScreen() {
  const { data, patch, push, goTab, replace } = useApp();
  const units: { id: UnitSystem; label: string }[] = [
    { id: "metric", label: "미터법" },
    { id: "imperial", label: "영미식" },
  ];
  const tools: ToolKind[] = ["코바늘", "대바늘", "손뜨개"];

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-3 pt-2">
        <Mascot className="h-16 w-16" mood="cheer" />
        <div>
          <p className="text-[20px] font-bold">{data.nickname}</p>
          <p className="text-[13px] text-[#888]">{data.level ? `${data.level} 뜨개더` : "실력을 아직 재지 않았어요"}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="프로젝트" value={String(data.projects.length)} />
        <Stat label="게이지" value={String(data.gauges.length)} />
        <Stat label="실" value={String(data.yarns.length)} />
      </dl>
      <div className="mt-5 space-y-2">
        <Row label="행/코 카운터" onClick={() => push({ name: "counters" })} />
        <Row label="게이지" onClick={() => push({ name: "gauge", tab: "manage" })} />
        <Row label="뜨개가방" onClick={() => goTab("bag")} />
        <Row label="실력 다시 재기" onClick={() => push({ name: "skill" })} />
      </div>
      <section className="mt-6">
        <h2 className="text-[14px] font-bold">단위</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {units.map((unit) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => patch({ unit: unit.id })}
              className={cx("h-11 rounded-2xl border text-[14px]", data.unit === unit.id ? "border-blush bg-blush-soft font-semibold" : "border-[#eee]")}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </section>
      <section className="mt-5">
        <h2 className="text-[14px] font-bold">주로 쓰는 도구</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => patch({ tool })}
              className={cx("h-11 rounded-2xl border text-[13px]", data.tool === tool ? "border-blush bg-blush-soft font-semibold" : "border-[#eee]")}
            >
              {tool}
            </button>
          ))}
        </div>
      </section>
      <button
        type="button"
        onClick={() => replace({ name: "login" })}
        className="mt-8 h-12 w-full rounded-full bg-[#f6f6f6] text-[14px] font-semibold"
      >
        로그아웃
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f7f7] py-3">
      <dt className="text-[12px] text-[#888]">{label}</dt>
      <dd className="text-[18px] font-bold">{value}</dd>
    </div>
  );
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center justify-between rounded-2xl border border-[#f2f2f2] px-4 text-left text-[14px] font-semibold">
      {label}
      <span aria-hidden>›</span>
    </button>
  );
}
