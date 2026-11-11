import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import {
  BagFillIcon,
  CameraFillIcon,
  CheckFillIcon,
  ChevronLeftFillIcon,
  ChevronRightFillIcon,
  ClockFillIcon,
  CloseFillIcon,
  FolderFillIcon,
  HeartFillIcon,
  ImageFillIcon,
  LockFillIcon,
  PauseFillIcon,
  PinFillIcon,
  PlayFillIcon,
  SettingsFillIcon,
  SparkleFillIcon,
  UserFillIcon,
} from "./icons/FillIcons.tsx";
import { showsTabBar, useApp } from "./store.tsx";

export function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
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
    <div className={cx("sticky top-0 z-20 flex h-12 items-center px-2", light ? "bg-transparent" : "bg-white")}>
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
}: {
  className?: string;
  mood?: "wave" | "knit" | "cheer";
}) {
  return <img src={`${import.meta.env.BASE_URL}tteuni.svg`} alt="" className={cx("object-contain", className)} />;
}

export function Wordmark({ className = "w-56" }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}logo.png`} alt="뜨개러투게더" className={className} />;
}

export function TabBar() {
  const { route, goTab } = useApp();
  const items = [
    { id: "home" as const, label: "홈", icon: <YarnIcon /> },
    { id: "bag" as const, label: "뜨개가방", icon: <BagFillIcon className="h-5 w-5" /> },
    { id: "lounge" as const, label: "뜨개 라운지", icon: <ChairIcon /> },
    { id: "my" as const, label: "마이페이지", icon: <UserFillIcon className="h-5 w-5" /> },
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

export function ChevronLeft() {
  return <ChevronLeftFillIcon className="h-5 w-5" />;
}
export function ChevronRight() {
  return <ChevronRightFillIcon className="h-4 w-4" />;
}
function YarnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M7 8c2 2 6 2 8 0M6.5 12c2.2 1.4 6.6 1.4 9 0M8 15.2c1.6.8 4.4.8 6 0" />
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
export function HeartIcon({ filled }: { filled?: boolean }) {
  return <HeartFillIcon filled={filled} className="h-5 w-5" />;
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
  return <PlayFillIcon className="h-5 w-5" />;
}
export function PauseIcon() {
  return <PauseFillIcon className="h-5 w-5" />;
}
export function GearIcon() {
  return <SettingsFillIcon className="h-5 w-5" />;
}

export function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0" style={{ width: size, height: size }}>
      <CloseFillIcon className="h-full w-full" />
    </span>
  );
}

export function FolderIcon() {
  return <FolderFillIcon className="h-7 w-7" />;
}

export function PlayBadge() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <circle cx="14" cy="14" r="12" fill="#fff" />
      <path d="M12 9.2v9.6l8-4.8-8-4.8z" fill="#f29c9b" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="4" width="14" height="10" rx="2" />
      <path d="M3 6l6 4 6-4" />
    </svg>
  );
}

export function LockIcon() {
  return <LockFillIcon className="h-4 w-4" />;
}

export function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 5.5h10" />
      <path d="M7 5.2V4h4v1.2" />
      <path d="M6 5.5l.6 8.2h4.8L12 5.5" />
    </svg>
  );
}

export function CameraIcon() {
  return <CameraFillIcon className="h-5 w-5" />;
}

export function PinIcon() {
  return <PinFillIcon className="h-3.5 w-3.5" />;
}

export function CrownIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill={color} aria-hidden>
      <path d="M2 13.5 1 3.2l5.2 4.2L11 1.5l4.8 5.9L21 3.2 20 13.5H2z" />
    </svg>
  );
}

export function CheckIcon() {
  return <CheckFillIcon className="h-3.5 w-3.5" />;
}

export function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M8.2 2.4 11.6 5.8 5 12.4H1.6V9L8.2 2.4z" />
    </svg>
  );
}

export function YarnBallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="7" cy="7" r="4.6" />
      <path d="M4.2 5.2c1.6 1.2 3.9 1.2 5.6 0M4 8.2c1.5.8 4.5.8 6 0" />
    </svg>
  );
}

export function ImagePlusIcon() {
  return <ImageFillIcon className="h-5 w-5" />;
}

export function SparkIcon() {
  return <SparkleFillIcon className="h-3.5 w-3.5" />;
}

export function ChevronDown({ up = false }: { up?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={up ? "rotate-180" : undefined} aria-hidden>
      <path d="M3.5 6.2 8 10.4l4.5-4.2" />
    </svg>
  );
}

export function NaviIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 6.2V3.2h3M15.5 6.2V3.2h-3M2.5 11.8v3h3M15.5 11.8v3h-3" />
      <circle cx="9" cy="9" r="2.1" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  );
}

export function ClockIcon() {
  return <ClockFillIcon className="h-5 w-5" />;
}

export function RowsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="4" width="16" height="14" rx="2" />
      <path d="M3 9h16M3 14h16" />
    </svg>
  );
}

export function FlowerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <g fill="#ffe56a">
        <circle cx="11" cy="6" r="3" />
        <circle cx="16" cy="9.2" r="3" />
        <circle cx="14.2" cy="14.6" r="3" />
        <circle cx="7.8" cy="14.6" r="3" />
        <circle cx="6" cy="9.2" r="3" />
      </g>
      <circle cx="11" cy="11" r="2" fill="#f29c9b" />
    </svg>
  );
}
