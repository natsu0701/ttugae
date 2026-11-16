import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type ProfileStatsHeaderProps = {
  avatar: ReactNode;
  posts: number;
  followers: number;
  following: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
};

function Stat({
  value,
  label,
  onClick,
}: {
  value: number;
  label: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="block font-sans text-2xl font-semibold tabular-nums leading-none text-stone-900">
        {value.toLocaleString()}
      </span>
      <span className="mt-1.5 block font-sans text-sm font-normal text-stone-500">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="min-w-[4.5rem] text-center hover:opacity-70" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className="min-w-[4.5rem] text-center">{content}</div>;
}

export default function ProfileStatsHeader({
  avatar,
  posts,
  followers,
  following,
  onFollowersClick,
  onFollowingClick,
}: ProfileStatsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-8 sm:gap-12">
      <div className="shrink-0">{avatar}</div>
      <div className="flex min-w-0 flex-1 justify-around">
        <Stat value={posts} label={t("profileStats.posts")} />
        <Stat value={followers} label={t("profileStats.followers")} onClick={onFollowersClick} />
        <Stat value={following} label={t("profileStats.following")} onClick={onFollowingClick} />
      </div>
    </div>
  );
}
