import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { showsTabBar, useApp } from "./store.tsx";

export function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function StatusBar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-6 text-[12px] font-semibold tracking-wide">
      <span>9:41</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </span>
    </div>
  );
}

export function TopBar({
  title,
  back,
  right,
  light,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
  light?: boolean;
}) {
  const { back: goBack } = useApp();
  return (
    <div className={cx("sticky top-0 z-20 flex h-12 items-center px-2", light ? "bg-transparent" : "bg-white/95 backdrop-blur")}>
      <div className="w-14">
        {back ? (
          <button type="button" aria-label="뒤로" onClick={goBack} className="grid h-10 w-10 place-items-center rounded-full">
            <ChevronLeft />
          </button>
        ) : null}
      </div>
      <h1 className="flex-1 truncate text-center text-[17px] font-bold">{title}</h1>
      <div className="flex w-14 justify-end">{right}</div>
    </div>
  );
}

export function PinkButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blush text-[15px] font-semibold text-white disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BlackButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        "flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "h-12 w-full rounded-full border border-[#ececec] bg-white px-4 text-[15px] outline-none placeholder:text-[#b0b0b0]",
        className,
      )}
    />
  );
}

export function ProgressRing({ value, size = 46 }: { value: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="#fff" stroke="#f3e1e1" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f29c9b"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fontSize={size < 42 ? 11 : 13}
        fontWeight={700}
        fill="#171717"
      >
        {value}
      </text>
    </svg>
  );
}

export function Mascot({
  className = "h-28 w-28",
  mood = "wave",
}: {
  className?: string;
  mood?: "wave" | "knit" | "cheer";
}) {
  return (
    <svg viewBox="0 0 160 180" className={className} aria-hidden>
      <ellipse cx="80" cy="168" rx="28" ry="6" fill="#000" opacity="0.08" />
      <g transform={mood === "knit" ? "translate(0,4)" : undefined}>
        <line x1="58" y1="28" x2="92" y2="8" stroke="#e2b07a" strokeWidth="6" strokeLinecap="round" />
        <line x1="102" y1="28" x2="68" y2="8" stroke="#c9845a" strokeWidth="6" strokeLinecap="round" />
        <path d="M108 46c8-16 22-10 18 2-6 4-14 2-18-2z" fill="#7dbe72" />
        <path d="M112 42c6 8 2 16-6 14 2-8 0-12 6-14z" fill="#3f8f4e" />
        <circle cx="80" cy="92" r="48" fill="#f4a3a8" />
        <circle cx="80" cy="92" r="48" fill="none" stroke="#e98990" strokeWidth="3" />
        <path d="M48 78c8 10 14 8 18-2" stroke="#e7b4b6" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M70 80c6 8 12 6 14-2" stroke="#e7b4b6" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="64" cy="90" r="3.2" fill="#2b2b2b" />
        <circle cx="96" cy="90" r="3.2" fill="#2b2b2b" />
        <path d="M70 104c6 8 14 8 20 0" stroke="#2b2b2b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {mood === "knit" ? (
          <g>
            <rect x="62" y="128" width="36" height="22" rx="4" fill="#8eb7d6" />
            <path d="M62 134h36M62 142h36M70 128v22M86 128v22" stroke="#fff" strokeWidth="1.4" />
            <circle cx="118" cy="150" r="8" fill="#7eb6e0" />
          </g>
        ) : (
          <g>
            <path d={mood === "cheer" ? "M28 110c-16 8-18 28 2 30 8-14 8-22-2-30z" : "M30 108c-18 2-16 26 4 24 6-12 4-20-4-24z"} fill="#f4a3a8" />
            <path d="M128 104c18-6 24 16 8 24-8-8-10-16-8-24z" fill="#f4a3a8" />
            <ellipse cx="62" cy="156" rx="8" ry="5" fill="#f4a3a8" />
            <ellipse cx="98" cy="156" rx="8" ry="5" fill="#f4a3a8" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function Wordmark({ className = "w-56" }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}logo.png`} alt="뜨개러투게더" className={className} />;
}

export function TabBar() {
  const { route, goTab } = useApp();
  const items = [
    { id: "home" as const, label: "홈", icon: <YarnIcon /> },
    { id: "bag" as const, label: "뜨개가방", icon: <BagIcon /> },
    { id: "lounge" as const, label: "뜨개 라운지", icon: <ChairIcon /> },
    { id: "my" as const, label: "마이페이지", icon: <PersonIcon /> },
  ];
  return (
    <nav className="relative z-30 grid shrink-0 grid-cols-4 border-t border-[#f2f2f2] bg-white px-1 pb-2 pt-1 shadow-nav">
      {items.map((item) => {
        const active = route.name === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => goTab(item.id)}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px]"
          >
            <span
              className={cx(
                "grid h-9 w-9 place-items-center rounded-full",
                active && "-mt-4 bg-white shadow-card ring-1 ring-[#f3f3f3]",
              )}
            >
              {item.icon}
            </span>
            <span className={active ? "font-bold" : "text-[#8d8d8d]"}>{item.label}</span>
            <span className={cx("mt-0.5 h-1 w-8 rounded-full", active ? "bg-ink" : "bg-transparent")} />
          </button>
        );
      })}
    </nav>
  );
}

export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute bottom-24 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-blush text-3xl font-light text-white shadow-card"
    >
      +
    </button>
  );
}

export function InfoButton({ title, body }: { title: string; body: string }) {
  const { openSheet } = useApp();
  return (
    <button
      type="button"
      aria-label={`${title} 안내`}
      onClick={() => openSheet({ kind: "info", title, body })}
      className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[12px] font-bold text-white"
    >
      i
    </button>
  );
}

export function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 rounded-full bg-[#f3f3f3] p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cx(
            "h-10 rounded-full text-[14px] font-semibold",
            value === option.id ? "bg-ink text-white" : "text-[#9a9a9a]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function UnderlineTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto px-4">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cx(
              "shrink-0 border-b-2 pb-2 text-[15px]",
              active ? "border-ink font-bold" : "border-transparent text-[#b0b0b0]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SheetHost() {
  const { sheet, closeSheet, sort, setSort } = useApp();
  if (!sheet) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/30" onClick={closeSheet}>
      <div
        className="w-full rounded-t-3xl bg-white px-5 pb-8 pt-4"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e6e6e6]" />
        {sheet.kind === "info" ? (
          <>
            <h2 className="text-[17px] font-bold">{sheet.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#666]">{sheet.body}</p>
          </>
        ) : null}
        {sheet.kind === "filter" ? (
          <>
            <h2 className="text-[17px] font-bold">정렬</h2>
            <div className="mt-3 grid gap-2">
              {(
                [
                  ["recent", "최근 사용"],
                  ["name", "이름"],
                  ["amount", sheet.scope === "yarn" ? "남은 양" : "굵기"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSort(id);
                    closeSheet();
                  }}
                  className={cx(
                    "h-11 rounded-2xl border px-4 text-left text-[14px]",
                    sort === id ? "border-blush bg-blush-soft font-semibold" : "border-[#eee]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {sheet.kind === "camera" ? <CameraSheet /> : null}
        <button type="button" onClick={closeSheet} className="mt-4 h-11 w-full rounded-full bg-[#f6f6f6] text-[14px] font-semibold">
          닫기
        </button>
      </div>
    </div>
  );
}

function CameraSheet() {
  const { setCalc, closeSheet, notify } = useApp();
  return (
    <>
      <h2 className="text-[17px] font-bold">스와치에서 코 읽기</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
        사진 속 10cm 눈금을 세는 자리예요. 프로토타입에서는 예시 스와치의 20코를 가져와요.
      </p>
      <button
        type="button"
        className="mt-4 h-11 w-full rounded-full bg-ink text-[14px] font-semibold text-white"
        onClick={() => {
          setCalc({ sts: "20" });
          closeSheet();
          notify("스와치에서 20코를 읽었어요");
        }}
      >
        예시로 20코 넣기
      </button>
    </>
  );
}

export function ToastHost() {
  const { toast, route } = useApp();
  if (!toast) return null;
  return (
    <div
      className={cx(
        "pointer-events-none absolute left-4 right-4 z-50 rounded-2xl bg-ink px-4 py-3 text-center text-[13px] text-white",
        showsTabBar(route) ? "bottom-24" : "bottom-6",
      )}
    >
      {toast}
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <rect x="0" y="7" width="3" height="5" rx="0.5" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="0.5" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 4.5c3.6-3.2 9.4-3.2 13 0" />
      <path d="M3.2 7c2.4-2 6.2-2 8.6 0" />
      <path d="M5.6 9.2c1.1-.9 2.7-.9 3.8 0" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12">
      <rect x="0.7" y="0.7" width="21" height="10.6" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.2" y="2.2" width="16" height="7.6" rx="1" fill="currentColor" />
      <rect x="22.4" y="3.6" width="1.8" height="4.8" rx="0.6" fill="currentColor" />
    </svg>
  );
}
export function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 5 L7 11 L13 17" />
    </svg>
  );
}
export function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 4l5 5-5 5" />
    </svg>
  );
}
function YarnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M7 8c2 2 6 2 8 0M6.5 12c2.2 1.4 6.6 1.4 9 0M8 15.2c1.6.8 4.4.8 6 0" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h10l-1 10H7L6 8z" />
      <path d="M8.5 8V6.5a2.5 2.5 0 0 1 5 0V8" />
    </svg>
  );
}
function ChairIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 11h14" />
      <path d="M6 11V7.2A2.2 2.2 0 0 1 8.2 5h5.6A2.2 2.2 0 0 1 16 7.2V11" />
      <path d="M5 11v3.5h12V11" />
      <path d="M7 14.5V18M15 14.5V18" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="8" r="3" />
      <path d="M5.5 17.5c1.2-2.4 3-3.5 5.5-3.5s4.3 1.1 5.5 3.5" />
    </svg>
  );
}
export function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={filled ? "#f29c9b" : "none"} stroke={filled ? "#f29c9b" : "currentColor"} strokeWidth="1.6">
      <path d="M10 16s-6-3.6-6-7.2C4 6.4 5.8 5 7.6 5c1.1 0 2 .5 2.4 1.3C10.4 5.5 11.3 5 12.4 5 14.2 5 16 6.4 16 8.8 16 12.4 10 16 10 16z" />
    </svg>
  );
}
export function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="5" />
      <path d="M12 12l3 3" />
    </svg>
  );
}
export function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M6 4.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}
export function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <rect x="4.5" y="4" width="3" height="10" rx="0.6" />
      <rect x="10.5" y="4" width="3" height="10" rx="0.6" />
    </svg>
  );
}
export function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="2.2" />
      <path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M13.8 4.2l-1.4 1.4M5.6 12.4l-1.4 1.4" />
    </svg>
  );
}
