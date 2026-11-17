import { useApp } from "../store.tsx";
import { ClockIcon, MinusIcon, PinIcon, PlusIcon, UnderlineTabs } from "../ui.tsx";
import type { ReactNode } from "react";

const YARN_DOTS: Record<string, string> = {
  "더스티 핑크": "#e8b7b0",
  "헤더 그레이": "#a39e99",
  로즈: "#e7b7b2",
  "베이비 핑크": "#f3b6c0",
  샌드: "#e6d3b4",
};

function yarnDot(color: string) {
  return YARN_DOTS[color] ?? "#dddddd";
}

export function YarnScreen({ id }: { id: string }) {
  const { data, goTab, setBalls } = useApp();
  const yarn = data.yarns.find((item) => item.id === id);
  if (!yarn) return <p className="px-6 py-16 text-center text-[14px]">실을 찾지 못했어요.</p>;
  return (
    <div className="pb-10">
      <div className="mt-1">
        <UnderlineTabs
          value="yarn"
          options={[
            { id: "projects", label: "프로젝트" },
            { id: "done", label: "완성작" },
            { id: "yarn", label: "실 창고" },
            { id: "needles", label: "바늘 창고" },
          ]}
          onChange={(tab) => goTab("bag", tab)}
        />
      </div>
      <div className="px-5 pt-4">
        <div className="relative mx-auto w-52">
          <span className="grid aspect-square w-full place-items-center rounded-lg" style={{ background: yarnDot(yarn.colorName) }}>
            <YarnBallGlyph />
          </span>
          <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] shadow-card">
            <i className="h-2 w-2 rounded-full" style={{ background: yarnDot(yarn.colorName) }} />
            {yarn.colorName}
          </span>
        </div>
        <h2 className="mt-4 text-center text-[20px] font-bold">{yarn.name}</h2>
        <p className="text-center text-[12px] text-[#999]">{yarn.lot}</p>
        <section className="mt-5 rounded-lg border border-[#f0f0f0] px-4 py-4">
          <p className="text-center text-[13px] text-[#888]">남은 수량</p>
          <div className="mt-2 flex items-center justify-between">
            <Round onClick={() => setBalls(yarn.id, yarn.balls - 0.5)} label="수량 줄이기">
              <MinusIcon className="h-4 w-4" />
            </Round>
            <p className="text-center text-[20px] font-bold">{formatBalls(yarn.balls)} 볼 남음</p>
            <Round onClick={() => setBalls(yarn.id, yarn.balls + 0.5)} label="수량 늘리기" pink>
              <PlusIcon className="h-4 w-4" />
            </Round>
          </div>
        </section>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Spec icon={<ClockIcon />} value={yarn.material} label="소재" />
          <Spec icon={<ClockIcon />} value={yarn.weight} label="무게" />
          <Spec icon={<ClockIcon />} value={yarn.length} label="길이" />
          <Spec icon={<ClockIcon />} value={yarn.needle} label="권장 바늘" />
        </div>
        <section className="mt-3 rounded-lg border border-[#f0f0f0] px-4 py-3">
          <p className="text-[12px] text-[#999]">보관 위치</p>
          <p className="flex items-center gap-1 font-bold"><PinIcon /> {yarn.place}</p>
        </section>
        <section className="memo-lines mt-3 rounded-lg border border-[#f0f0f0] border-l-4 border-l-blush px-4 py-3">
          <p className="text-[12px] text-[#999]">메모</p>
          <p className="whitespace-pre-wrap text-[14px] leading-7">{yarn.memo}</p>
        </section>
        <ShopCard name={yarn.shop} url={yarn.shopUrl} />
      </div>
    </div>
  );
}

export function NeedleScreen({ id }: { id: string }) {
  const { data, goTab } = useApp();
  const needle = data.needles.find((item) => item.id === id);
  if (!needle) return <p className="px-6 py-16 text-center text-[14px]">바늘을 찾지 못했어요.</p>;
  return (
    <div className="pb-10">
      <div className="mt-1">
        <UnderlineTabs
          value="needles"
          options={[
            { id: "projects", label: "프로젝트" },
            { id: "done", label: "완성작" },
            { id: "yarn", label: "실 창고" },
            { id: "needles", label: "바늘 창고" },
          ]}
          onChange={(tab) => goTab("bag", tab)}
        />
      </div>
      <div className="px-5 pt-4">
        <div className="relative mx-auto w-52">
          <img src={needle.image} alt="" className="aspect-square w-full rounded-lg object-cover object-center" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[12px] shadow-card">
            {needle.brandLine}
          </span>
        </div>
        <h2 className="mt-4 text-center text-[20px] font-bold">{needle.name}</h2>
        <p className="text-center text-[12px] text-[#999]">{needle.lot}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Spec icon={<SizeIcon />} value={needle.size} label="사이즈" />
          <Spec icon={<MaterialIcon />} value={needle.material} label="소재" />
          <Spec icon={<KindIcon />} value={needle.kind} label="종류" />
          <Spec icon={<CableIcon />} value={needle.cable} label="케이블" />
        </div>
        <section className="mt-3 rounded-lg border border-[#f0f0f0] px-4 py-3">
          <p className="text-[12px] text-[#999]">보관 위치</p>
          <p className="flex items-center gap-1 font-bold"><PinIcon /> {needle.place}</p>
        </section>
        <section className="memo-lines mt-3 rounded-lg border border-[#f0f0f0] border-l-4 border-l-blush px-4 py-3">
          <p className="text-[12px] text-[#999]">메모</p>
          <p className="whitespace-pre-wrap text-[14px] leading-7">{needle.memo}</p>
        </section>
        <ShopCard name={needle.shop} url={needle.shopUrl} />
      </div>
    </div>
  );
}

function YarnBallGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-16 w-16" aria-hidden>
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#1c1c1c" strokeWidth="1.4" />
      <path d="M8 9.5c2.2 1.2 5.8 1.2 8 0M8.4 12.2c2.1 1.1 5.1 1.1 7.2 0M9.2 15c1.6.7 3.8.7 5.4 0" fill="none" stroke="#1c1c1c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      {children}
    </svg>
  );
}

function SizeIcon() {
  return (
    <LineIcon>
      <path d="M4 8h16v8H4z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8v3.2M12 8v4.4M16 8v3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </LineIcon>
  );
}

function MaterialIcon() {
  return (
    <LineIcon>
      <path d="M12 4.5l6 3.2v6.6l-6 3.2-6-3.2V7.7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11.3V17.5M12 11.3L6.2 8.2M12 11.3l5.8-3.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </LineIcon>
  );
}

function KindIcon() {
  return (
    <LineIcon>
      <path d="M8 5.5c0 2.2 1.2 3.4 1.2 5.2S8 13.4 8 16.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 5.5c0 2.2 1.2 3.4 1.2 5.2s-1.2 3.5-1.2 6.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.6 5.5h2.8M13.1 5.5h2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </LineIcon>
  );
}

function CableIcon() {
  return (
    <LineIcon>
      <path d="M5 8c4 0 4 8 8 8s4-8 6-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="8" r="1.3" fill="currentColor" />
      <circle cx="19" cy="8" r="1.3" fill="currentColor" />
    </LineIcon>
  );
}

function Spec({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-[#f0f0f0] px-3 py-3">
      <p className="text-[16px]">{icon}</p>
      <p className="mt-1 text-[14px] font-bold">{value}</p>
      <p className="text-[12px] text-[#999]">{label}</p>
    </div>
  );
}

function ShopCard({ name, url }: { name: string; url: string }) {
  const { openSheet } = useApp();
  const showNotice = () =>
    openSheet({
      kind: "info",
      title: "추가 구매",
      body: "아직 상점 페이지로는 연결되지 않아요.",
    });
  return (
    <section className="mt-3 flex items-center justify-between rounded-lg border border-[#f0f0f0] px-4 py-3">
      <span>
        <span className="block text-[12px] text-[#999]">상점</span>
        <span className="font-bold">{name}</span>
        <span className="block text-[12px] text-[#888]">{url.replace(/^https?:\/\//, "")}</span>
      </span>
      <button type="button" onClick={showNotice} className="rounded-full bg-ink px-3 py-2 text-[12px] font-semibold text-white">
        추가 구매
      </button>
    </section>
  );
}

function Round({
  children,
  onClick,
  label,
  pink,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  pink?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={pink ? "grid h-10 w-10 place-items-center rounded-full bg-blush text-xl text-white" : "grid h-10 w-10 place-items-center rounded-full bg-[#f2f2f2] text-xl"}
    >
      {children}
    </button>
  );
}

function formatBalls(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
