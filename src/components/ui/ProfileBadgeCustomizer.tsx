import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ACHIEVEMENT_BADGES,
  getAchievementBadge,
  type AchievementBadgeId,
} from "../../data/achievementBadges.ts";
import {
  CheckFillIcon,
  ChevronFillIcon,
  ImageFillIcon,
  LockFillIcon,
  ProfileFillIcon,
} from "../icons/FillIcons.tsx";
import type { BadgeUnlockMap } from "../mypage/achievementStats.ts";
import {
  loadEquippedBadgeId,
  saveEquippedBadgeId,
} from "../../utils/equippedBadgeStorage.ts";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import i18n from "../../i18n.ts";
import { badgeDesc, badgeName } from "../../utils/i18nContent.ts";

function defaultUnlocks(): BadgeUnlockMap {
  const done = i18n.t("common.done");
  const sts = i18n.t("common.sts");
  const progressOf = (current: string | number, goal: string | number, unit: string) =>
    i18n.t("common.progressOf", { current, goal, unit });
  return {
    badge1: { unlocked: true },
    badge2: { unlocked: true },
    badge3: { unlocked: true },
    badge4: { unlocked: true },
    badge5: { unlocked: false, progressText: progressOf(2, 3, done) },
    badge6: { unlocked: true },
    badge7: { unlocked: false, progressText: progressOf(4, 5, done) },
    badge8: { unlocked: true },
    badge9: { unlocked: false, progressText: progressOf(6, 10, done) },
    badge10: { unlocked: false, progressText: progressOf(0, 1, done) },
    badge11: { unlocked: false, progressText: progressOf("12,450", "30,000", sts) },
  };
}

export type ProfileBadgeCustomizerProps = {
  nickname?: string;
  handle?: string;
  subtitle?: string;
  avatarUrl?: string;
  unlocks?: BadgeUnlockMap;
  onPickAvatar?: () => void;
  onResetAvatar?: () => void;
};

const BADGE_TILE = "h-16 w-16";

function isUnlocked(unlocks: BadgeUnlockMap, id: AchievementBadgeId): boolean {
  return Boolean(unlocks[id]?.unlocked);
}

function ProfileBadgeCustomizer({
  nickname,
  handle,
  subtitle,
  avatarUrl,
  unlocks: unlocksProp,
  onPickAvatar,
  onResetAvatar,
}: ProfileBadgeCustomizerProps) {
  const { t } = useTranslation();
  const unlocks = unlocksProp ?? defaultUnlocks();
  const displaySubtitle = subtitle ?? t("mypage.profile.levelTitle");
  const [equippedBadgeId, setEquippedBadgeId] = useState<string | null>(() =>
    loadEquippedBadgeId() ?? "badge1",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayAvatar = avatarUrl || TTEUNI_IMAGES.chatProfile;

  const equippedBadge = useMemo(() => {
    const badge = getAchievementBadge(equippedBadgeId);
    if (!badge) return null;
    return isUnlocked(unlocks, badge.id) ? badge : null;
  }, [equippedBadgeId, unlocks]);

  useEffect(() => {
    if (equippedBadgeId && !equippedBadge) {
      setEquippedBadgeId(null);
      return;
    }
    saveEquippedBadgeId(equippedBadgeId);
  }, [equippedBadgeId, equippedBadge]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEquipBadge = (id: AchievementBadgeId) => {
    if (!isUnlocked(unlocks, id)) return;
    setEquippedBadgeId((prev) => (prev === id ? null : id));
    setIsDropdownOpen(false);
  };

  const openBadgePicker = () => {
    setIsAvatarMenuOpen(false);
    setIsDropdownOpen((open) => !open);
  };

  const openAvatarMenu = () => {
    setIsDropdownOpen(false);
    setIsAvatarMenuOpen((open) => !open);
  };

  const displayHandle = `@${(handle ?? "").replace(/^@/, "")}`;

  return (
    <div className="relative flex w-full flex-col items-center" ref={dropdownRef}>
      <div className="relative mb-8 h-28 w-28 select-none">
        <button
          type="button"
          onClick={openAvatarMenu}
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 transition-colors hover:border-coral"
          aria-label={t("mypage.profile.changeAvatar")}
          aria-expanded={isAvatarMenuOpen}
        >
          <img
            src={displayAvatar}
            alt=""
            className={
              avatarUrl
                ? "h-full w-full object-cover"
                : "h-[78%] w-[78%] object-contain"
            }
          />
        </button>

        {isAvatarMenuOpen ? (
            <div
              className="fade-in absolute left-1/2 top-[calc(100%+20px)] z-40 w-48 origin-top -translate-x-1/2 rounded-xl border border-stone-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
            >
              <button
                type="button"
                onClick={() => {
                  setIsAvatarMenuOpen(false);
                  onPickAvatar?.();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50"
              >
                <ImageFillIcon className="h-4 w-4 shrink-0 text-stone-500" />
                {t("common.photoChange")}
              </button>
              <button
                type="button"
                disabled={!avatarUrl}
                onClick={() => {
                  if (!avatarUrl) return;
                  setIsAvatarMenuOpen(false);
                  onResetAvatar?.();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ProfileFillIcon className="h-4 w-4 shrink-0 text-stone-500" />
                {t("common.photoDefault")}
              </button>
            </div>
          ) : null}

        {equippedBadge ? (
            <button
              key={equippedBadge.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openBadgePicker();
              }}
              className={`absolute -bottom-2 -right-2 z-10 flex ${BADGE_TILE} items-center justify-center rounded-full border border-stone-100 bg-white p-1.5 shadow-md`}
              title={badgeName(t, equippedBadge.id, equippedBadge.name)}
              aria-label={t("common.changeBadge")}
              aria-expanded={isDropdownOpen}
            >
              <img
                src={equippedBadge.imageSrc}
                alt={badgeName(t, equippedBadge.id, equippedBadge.name)}
                className="h-full w-full object-contain"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openBadgePicker();
              }}
              className={`absolute -bottom-2 -right-2 z-10 flex ${BADGE_TILE} items-center justify-center rounded-full border border-dashed border-stone-200 bg-white text-[10px] font-bold text-stone-400 shadow-md`}
              aria-label={t("common.changeBadge")}
            >
              {t("common.badge")}
            </button>
          )}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-black text-stone-900">{nickname}</span>
        <button
          type="button"
          onClick={openBadgePicker}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200/50 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 transition-colors hover:bg-stone-200/80"
        >
          {equippedBadge ? (
            <span className="text-coral">{badgeName(t, equippedBadge.id, equippedBadge.name)}</span>
          ) : (
            <span>{t("common.equipBadge")}</span>
          )}
          <ChevronFillIcon className="h-3 w-3" open={isDropdownOpen} />
        </button>
      </div>
      <p className="mt-1 font-sans text-xs font-medium text-stone-500">{displayHandle}</p>
      <p className="mt-1 font-sans text-[11px] text-stone-400">{displaySubtitle}</p>

      {isDropdownOpen ? (
          <div
            className="fade-in scrollbar-thin absolute left-1/2 top-full z-40 mt-4 max-h-[360px] w-80 origin-top -translate-x-1/2 overflow-y-auto rounded-xl border border-stone-200 bg-white p-4 shadow-[0_15px_45px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-2.5 border-b border-stone-100 pb-2.5 text-center">
              <h4 className="font-sans text-xs font-black tracking-widest text-stone-400">
                {t("common.myAchievements")}
              </h4>
            </div>

            <div className="space-y-2">
              {ACHIEVEMENT_BADGES.map((item) => {
                const unlocked = isUnlocked(unlocks, item.id);
                const isEquipped = equippedBadgeId === item.id && unlocked;
                const progressText = unlocks[item.id]?.progressText;
                const name = badgeName(t, item.id, item.name);
                const desc = badgeDesc(t, item.id, item.description);

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => handleEquipBadge(item.id)}
                    className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      unlocked
                        ? isEquipped
                          ? "border-coral/50 bg-stone-50 shadow-sm"
                          : "border-stone-100 bg-white hover:border-stone-200"
                        : "cursor-not-allowed border-stone-100 bg-stone-50/50 opacity-50"
                    }`}
                  >
                    <div className={`flex ${BADGE_TILE} shrink-0 items-center justify-center rounded-xl bg-stone-100 p-1.5`}>
                      {unlocked ? (
                        <img
                          src={item.imageSrc}
                          alt={name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <LockFillIcon className="h-5 w-5 text-stone-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-8">
                      <span className="block truncate font-sans text-xs font-bold text-stone-900">
                        {name}
                      </span>
                      <p className="mt-0.5 line-clamp-1 font-sans text-[10px] text-stone-400">
                        {unlocked ? desc : progressText ?? t("common.locked")}
                      </p>
                    </div>

                    {unlocked && isEquipped ? (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-coral">
                        <CheckFillIcon className="h-4 w-4" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
    </div>
  );
}

export default memo(ProfileBadgeCustomizer);
