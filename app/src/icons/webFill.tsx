type IconProps = { className?: string; filled?: boolean };

const CORAL = "#FC5F53";
const HEART_RED = "#E11D2E";

export function HeartFillIcon({ className = "h-5 w-5", filled = false }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="translate(0 -0.9)">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={filled ? HEART_RED : "currentColor"}
        />
      </g>
    </svg>
  );
}

export function SettingsFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="translate(0 -1.45)">
        <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="currentColor" />
        <path
          d="M19.4 13a7.9 7.9 0 01.1 1 7.9 7.9 0 01-.1 1l2 1.5-2 3.5-2.4-1a8.2 8.2 0 01-1.7 1l-.4 2.6H9l-.4-2.6a8.2 8.2 0 01-1.7-1l-2.4 1-2-3.5 2-1.5a7.9 7.9 0 01-.1-1 7.9 7.9 0 01.1-1L2.6 10.5l2-3.5 2.4 1a8.2 8.2 0 011.7-1L9.1 4.3h5.8l.4 2.6a8.2 8.2 0 011.7 1l2.4-1 2 3.5-2 1.5z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export function FilterFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4.2 5.2A1.2 1.2 0 015.2 4.5h13.6a1.2 1.2 0 01.95 1.94l-5.35 6.2v5.16a1.2 1.2 0 01-.52 1l-3.2 2.2a1.2 1.2 0 01-1.88-1v-7.36L4.25 6.44A1.2 1.2 0 014.2 5.2z"
        fill="currentColor"
        transform="translate(0 -0.86)"
      />
    </svg>
  );
}

export function BookmarkFillIcon({ className = "h-5 w-5", filled = false }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 3h12a2 2 0 012 2v16l-8-4.5L4 21V5a2 2 0 012-2z" fill={filled ? CORAL : "currentColor"} />
    </svg>
  );
}

export function UserFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4.5" fill="currentColor" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" fill="currentColor" />
    </svg>
  );
}

export function CommunityFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="8" cy="9" r="3" fill="currentColor" />
      <circle cx="16" cy="9" r="3" fill="currentColor" />
      <path d="M3 19c0-2.8 2.2-5 5-5h8c2.8 0 5 2.2 5 5" fill="currentColor" />
    </svg>
  );
}

export function BagFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M8.2 7.2V6.1A3.8 3.8 0 0112 2.3a3.8 3.8 0 013.8 3.8v1.1h2.4A1.8 1.8 0 0120 9v10.2A2.5 2.5 0 0117.5 21.7h-11A2.5 2.5 0 014 19.2V9a1.8 1.8 0 011.8-1.8h2.4zm2.2-1.1c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v1.1h-3.2V6.1z"
      />
    </svg>
  );
}

export function ClockFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 3.2a8.8 8.8 0 100 17.6 8.8 8.8 0 000-17.6zM12 6a1.1 1.1 0 011.1 1.1v4.4l3 1.8a1.1 1.1 0 11-1.1 1.9l-3.6-2.2A1.1 1.1 0 0110.9 12V7.1A1.1 1.1 0 0112 6z"
      />
    </svg>
  );
}

export function ChatFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4.5 6.2A3.7 3.7 0 018.2 2.5h7.6A3.7 3.7 0 0119.5 6.2v6.2a3.7 3.7 0 01-3.7 3.7h-5.4L6 19.6a1.1 1.1 0 01-1.5-1V6.2z"
        fill="currentColor"
        transform="translate(0 0.91)"
      />
    </svg>
  );
}

export function FileTextFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="3.5" fill="currentColor" />
      <rect x="8" y="8" width="8" height="1.8" rx="0.9" fill="white" />
      <rect x="8" y="12" width="8" height="1.8" rx="0.9" fill="white" />
      <rect x="8" y="16" width="5.2" height="1.8" rx="0.9" fill="white" />
    </svg>
  );
}

export function ChevronFillIcon({ className = "h-3 w-3", up = false }: IconProps & { up?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${up ? "rotate-180" : ""}`} aria-hidden>
      <path
        d="M6.2 9.2a1.2 1.2 0 011.7 0L12 13.3l4.1-4.1a1.2 1.2 0 111.7 1.7l-5 5a1.2 1.2 0 01-1.7 0l-5-5a1.2 1.2 0 010-1.7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronLeftFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M14.8 6.2a1.2 1.2 0 010 1.7L10.7 12l4.1 4.1a1.2 1.2 0 11-1.7 1.7l-5-5a1.2 1.2 0 010-1.7l5-5a1.2 1.2 0 011.7 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronRightFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M9.2 6.2a1.2 1.2 0 011.7 0l5 5a1.2 1.2 0 010 1.7l-5 5a1.2 1.2 0 11-1.7-1.7L13.3 12 9.2 7.9a1.2 1.2 0 010-1.7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PlusFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M10.6 4.4h2.8v6.2h6.2v2.8h-6.2v6.2h-2.8v-6.2H4.4v-2.8h6.2V4.4z" />
    </svg>
  );
}

export function MinusFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M4.4 10.6h15.2v2.8H4.4z" />
    </svg>
  );
}

export function CloseFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="rotate(45 12 12)">
        <path fill="currentColor" d="M10.6 4.4h2.8v6.2h6.2v2.8h-6.2v6.2h-2.8v-6.2H4.4v-2.8h6.2V4.4z" />
      </g>
    </svg>
  );
}

export function PencilFillIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M16.7 3.6a2.2 2.2 0 013.1 0l.6.6a2.2 2.2 0 010 3.1L9.2 18.5 4 20l1.5-5.2L16.7 3.6z" />
    </svg>
  );
}

export function PlayFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M8 5.4c0-.8.9-1.3 1.6-.9l10 6.6a1 1 0 010 1.8l-10 6.6A1 1 0 018 18.6V5.4z" />
    </svg>
  );
}

export function PauseFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="currentColor" />
      <rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="currentColor" />
    </svg>
  );
}

export function CheckFillIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M9.3 16.8L4.6 12.1l1.7-1.7 3 3 8.4-8.4 1.7 1.7-10.1 10.1z" fill="currentColor" transform="translate(0 1.1)" />
    </svg>
  );
}

export function SparkleFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M12 2.4l2.1 6.4 6.5 2.2-6.5 2.1L12 21.6l-2.1-6.5-6.5-2.1 6.5-2.2L12 2.4z" />
    </svg>
  );
}

export function SearchFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.4 3.6a6.8 6.8 0 014.86 11.58l4.16 4.16a1.35 1.35 0 01-1.91 1.91l-4.16-4.16A6.8 6.8 0 1110.4 3.6zm0 2.5a4.3 4.3 0 100 8.6 4.3 4.3 0 000-8.6z"
        transform="translate(0 -0.62)"
      />
    </svg>
  );
}

export function BellFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 3.1a1.15 1.15 0 011.15 1.02A5.7 5.7 0 0118.2 9.7v3.1l1.35 2.3a1.2 1.2 0 01-1.03 1.8H5.48a1.2 1.2 0 01-1.03-1.8L5.8 12.8V9.7a5.7 5.7 0 015.05-5.58A1.15 1.15 0 0112 3.1zM9.35 18.5a2.65 2.65 0 005.3 0h-5.3z"
      />
    </svg>
  );
}

export function TrashFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M9 3.4h6l.7 1.6H20v2.1H4V5h4.3L9 3.4zM6.3 8.4h11.4l-.7 10.8a2.1 2.1 0 01-2.1 2H9.1a2.1 2.1 0 01-2.1-2L6.3 8.4z"
      />
    </svg>
  );
}
