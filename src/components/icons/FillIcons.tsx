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
