const CORAL = "#FC5F53";

type IconProps = {
  className?: string;
  filled?: boolean;
};

export function UserFillIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4.5" fill="currentColor" />
      <path
        d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"
        fill="currentColor"
      />
    </svg>
  );
}

export function ProfileFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="9" r="4" fill="currentColor" />
      <path
        d="M4 20.5c.6-3.2 3.6-5.5 8-5.5s7.4 2.3 8 5.5"
        fill="currentColor"
      />
    </svg>
  );
}

export function PatternsFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

export function ImageFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor" />
      <circle cx="9" cy="11" r="2" fill="white" />
      <path d="M3 16l5-4 4 3 3-2 6 5" fill="white" />
    </svg>
  );
}

export function HeartFillIcon({
  className = "h-5 w-5",
  filled = false,
}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? CORAL : "currentColor"}
      />
    </svg>
  );
}

export function BookmarkFillIcon({
  className = "h-5 w-5",
  filled = false,
}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M6 3h12a2 2 0 012 2v16l-8-4.5L4 21V5a2 2 0 012-2z"
        fill={filled ? CORAL : "currentColor"}
      />
    </svg>
  );
}

export function SettingsFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
        fill="currentColor"
      />
      <path
        d="M19.4 13a7.9 7.9 0 01.1 1 7.9 7.9 0 01-.1 1l2 1.5-2 3.5-2.4-1a8.2 8.2 0 01-1.7 1l-.4 2.6H9l-.4-2.6a8.2 8.2 0 01-1.7-1l-2.4 1-2-3.5 2-1.5a7.9 7.9 0 01-.1-1 7.9 7.9 0 01.1-1L2.6 10.5l2-3.5 2.4 1a8.2 8.2 0 011.7-1L9.1 4.3h5.8l.4 2.6a8.2 8.2 0 011.7 1l2.4-1 2 3.5-2 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FilterFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M4.2 5.2A1.2 1.2 0 015.2 4.5h13.6a1.2 1.2 0 01.95 1.94l-5.35 6.2v5.16a1.2 1.2 0 01-.52 1l-3.2 2.2a1.2 1.2 0 01-1.88-1v-7.36L4.25 6.44A1.2 1.2 0 014.2 5.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StatsFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="12" width="4" height="8" rx="1.5" fill="currentColor" />
      <rect x="10" y="8" width="4" height="12" rx="1.5" fill="currentColor" />
      <rect x="16" y="4" width="4" height="16" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function CommunityFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="8" cy="9" r="3" fill="currentColor" />
      <circle cx="16" cy="9" r="3" fill="currentColor" />
      <path
        d="M3 19c0-2.8 2.2-5 5-5h8c2.8 0 5 2.2 5 5"
        fill="currentColor"
      />
    </svg>
  );
}

export function DashboardFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="currentColor" />
      <rect x="13" y="3" width="8" height="5" rx="2.5" fill="currentColor" />
      <rect x="13" y="10" width="8" height="11" rx="2.5" fill="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="currentColor" />
    </svg>
  );
}

export function UserPlusFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="10" cy="8" r="4" fill="currentColor" />
      <path d="M3.5 19.5c.6-3.2 3.4-5.5 6.5-5.5s5.9 2.3 6.5 5.5" fill="currentColor" />
      <path
        d="M18 8.5h1.5v1.5H21v1.5h-1.5V13H18v-1.5h-1.5V10H18V8.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LogoutFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="4" width="11" height="16" rx="3.5" fill="currentColor" />
      <path
        d="M15.2 11.1h4.4l-1.55-1.55a.95.95 0 011.34-1.34l3.2 3.2a.95.95 0 010 1.34l-3.2 3.2a.95.95 0 11-1.34-1.34L19.6 12.9h-4.4a.95.95 0 010-1.8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AccountFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor" />
      <circle cx="9" cy="12" r="2.4" fill="white" />
      <rect x="13" y="10" width="5.5" height="1.6" rx="0.8" fill="white" />
      <rect x="13" y="13" width="4" height="1.6" rx="0.8" fill="white" />
    </svg>
  );
}

export function WithdrawFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="10" cy="8" r="4" fill="currentColor" />
      <path d="M3.5 19.5c.6-3.2 3.4-5.5 6.5-5.5s5.9 2.3 6.5 5.5" fill="currentColor" />
      <rect x="16" y="7.2" width="6" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function GlobeFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="3.6" ry="9" fill="white" fillOpacity="0.22" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" fill="white" fillOpacity="0.18" />
    </svg>
  );
}

export function CheckFillIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M9.3 16.8L4.6 12.1l1.7-1.7 3 3 8.4-8.4 1.7 1.7-10.1 10.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LockFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor" />
      <path
        d="M8 11V8.2a4 4 0 018 0V11h-2.3V8.5a1.7 1.7 0 10-3.4 0V11H8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronFillIcon({
  className = "h-3 w-3",
  open = false,
}: IconProps & { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
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
      <path
        fill="currentColor"
        d="M10.6 4.4h2.8v6.2h6.2v2.8h-6.2v6.2h-2.8v-6.2H4.4v-2.8h6.2V4.4z"
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

export function FolderFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M3.2 8A3.3 3.3 0 016.5 4.7H10l1.6 2H17.5A3.3 3.3 0 0120.8 10v7.3a3.3 3.3 0 01-3.3 3.3h-11A3.3 3.3 0 013.2 17.3V8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrushFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M14.8 3.4c1.6-.2 3 .8 3.4 2.2.3 1.2-.2 2.4-1.6 3.8-1.6 1.6-4.4 3.2-6.4 4.2l-3.2-3.2c1-2 2.6-4.8 4.2-6.4 1.2-1.2 2.4-1.8 3.6-1.6z"
        fill="currentColor"
      />
      <path
        d="M4.4 14.6c1.8-1.2 3.8-1 5.2.4s1.6 3.4.4 5.2c-.8 1.2-2.6 1.6-4 .8L4 22l.8-2c-.8-1.4-.4-3.2.8-4.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EraserFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M13.6 4.2a2.6 2.6 0 013.7 0l2.5 2.5a2.6 2.6 0 010 3.7L12 18.2H7.4L4.2 15a2.6 2.6 0 010-3.7l9.4-7.1z"
        fill="currentColor"
      />
      <rect x="6" y="19.2" width="14" height="2.2" rx="1.1" fill="currentColor" />
    </svg>
  );
}

export function SelectFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="12" height="12" rx="3" fill="currentColor" opacity="0.35" />
      <path
        d="M12.2 11.4l1.8 8.4 2.2-3.1 3.4-.1-7.4-5.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CopyFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="8" y="8" width="12" height="13" rx="3.2" fill="currentColor" />
      <rect x="4" y="3" width="12" height="13" rx="3.2" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function CloseFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M8.1 6.9a1.3 1.3 0 00-1.8 1.8L10.2 12l-3.9 3.3a1.3 1.3 0 001.8 1.8L12 13.8l3.9 3.3a1.3 1.3 0 001.8-1.8L13.8 12l3.9-3.3a1.3 1.3 0 00-1.8-1.8L12 10.2 8.1 6.9z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RefreshFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 4.2a7.8 7.8 0 106.6 3.7 1.3 1.3 0 10-2.3 1.2A5.2 5.2 0 1112 6.8V8.7L16.4 5.8 12 2.9V4.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RotateFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 3.1a8.9 8.9 0 1 0 8.1 5.3 1.45 1.45 0 0 0-2.7 1.1A6 6 0 1 1 12 6v2.5l5.4-3.5L12 1.5V3.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ZoomInFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.5 17.9a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8ZM11.7 6.4h-2.4v2.9H6.4v2.4h2.9v2.9h2.4v-2.9h2.9v-2.4h-2.9V6.4Z"
      />
      <path
        fill="currentColor"
        d="M15.3 16.1a1.3 1.3 0 0 1 1.8 0l3.2 3.2a1.3 1.3 0 1 1-1.8 1.8l-3.2-3.2a1.3 1.3 0 0 1 0-1.8Z"
      />
    </svg>
  );
}

export function ZoomOutFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10.5 17.9a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8ZM6.4 9.3h8.2v2.4H6.4V9.3Z"
      />
      <path
        fill="currentColor"
        d="M15.3 16.1a1.3 1.3 0 0 1 1.8 0l3.2 3.2a1.3 1.3 0 1 1-1.8 1.8l-3.2-3.2a1.3 1.3 0 0 1 0-1.8Z"
      />
    </svg>
  );
}

export function SpinnerFillIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.2" fill="currentColor" opacity="0.22" />
      <path d="M12 3.8a8.2 8.2 0 018.2 8.2h-3.3A4.9 4.9 0 0012 7.1V3.8z" fill="currentColor" />
    </svg>
  );
}
