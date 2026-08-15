import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ACHIEVEMENT_BADGES,
  getAchievementBadge,
  type AchievementBadgeId,
} from "../../data/achievementBadges.ts";
import {
  CheckFillIcon,
  ChevronFillIcon,
  LockFillIcon,
} from "../icons/FillIcons.tsx";
import type { BadgeUnlockMap } from "../mypage/achievementStats.ts";
import {
  loadEquippedBadgeId,
  saveEquippedBadgeId,
} from "../../utils/equippedBadgeStorage.ts";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

const DEFAULT_UNLOCKS: BadgeUnlockMap = {
  badge1: { unlocked: true },
  badge2: { unlocked: true },
  badge3: { unlocked: true },
  badge4: { unlocked: true },
  badge5: { unlocked: false, progressText: "2 / 3 완료" },
  badge6: { unlocked: true },
  badge7: { unlocked: false, progressText: "4 / 5 완료" },
  badge8: { unlocked: true },
  badge9: { unlocked: false, progressText: "6 / 10 완료" },
  badge10: { unlocked: false, progressText: "0 / 1 완료" },
  badge11: { unlocked: false, progressText: "12,450 / 30,000코" },
};

export type ProfileBadgeCustomizerProps = {
  nickname?: string;
  handle?: string;
  subtitle?: string;
  avatarUrl?: string;
  unlocks?: BadgeUnlockMap;
  onPickAvatar?: () => void;
};

const BADGE_TILE = "h-16 w-16";

function isUnlocked(unlocks: BadgeUnlockMap, id: AchievementBadgeId): boolean {
  return Boolean(unlocks[id]?.unlocked);
}

function ProfileBadgeCustomizer({
  nickname = "뜨개러",
  handle = "뜨개러",
  subtitle = "포근한 솜털 뜨개러 (Level 3)",
  avatarUrl,
  unlocks = DEFAULT_UNLOCKS,
  onPickAvatar,
}: ProfileBadgeCustomizerProps) {
  const [equippedBadgeId, setEquippedBadgeId] = useState<string | null>(() =>
    loadEquippedBadgeId() ?? "badge1",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const openBadgePicker = () => setIsDropdownOpen((open) => !open);

  const displayHandle = `@${handle.replace(/^@/, "")}`;

  return (
    <div className="relative flex w-full flex-col items-center" ref={dropdownRef}>
      <div className="relative mb-8 h-28 w-28 select-none">
        <button
          type="button"
          onClick={onPickAvatar}
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 transition-colors hover:border-coral"
          aria-label="프로필 이미지 변경"
        >
          <img src={displayAvatar} alt="" className="h-full w-full object-cover" />
        </button>

        <AnimatePresence mode="wait">
          {equippedBadge ? (
            <motion.button
              key={equippedBadge.id}
              type="button"
              initial={{ scale: 0, rotate: -35 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 35 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={(e) => {
                e.stopPropagation();
                openBadgePicker();
              }}
              className={`absolute -bottom-2 -right-2 z-10 flex ${BADGE_TILE} items-center justify-center rounded-full border border-stone-100 bg-white p-1.5 shadow-md`}
              title={equippedBadge.name}
              aria-label="배지 변경"
              aria-expanded={isDropdownOpen}
            >
              <img
                src={equippedBadge.imageSrc}
                alt={equippedBadge.name}
                className="h-full w-full object-contain"
              />
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openBadgePicker();
              }}
              className={`absolute -bottom-2 -right-2 z-10 flex ${BADGE_TILE} items-center justify-center rounded-full border border-dashed border-stone-200 bg-white text-[10px] font-bold text-stone-400 shadow-md`}
              aria-label="배지 변경"
            >
              배지
            </button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-black text-stone-900">{nickname}</span>
        <button
          type="button"
          onClick={openBadgePicker}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200/50 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 transition-colors hover:bg-stone-200/80"
        >
          {equippedBadge ? (
            <span className="text-coral">{equippedBadge.name}</span>
          ) : (
            <span>배지 장착하기</span>
          )}
          <ChevronFillIcon className="h-3 w-3" open={isDropdownOpen} />
        </button>
      </div>
      <p className="mt-1 font-sans text-xs font-medium text-stone-500">{displayHandle}</p>
      <p className="mt-1 font-sans text-[11px] text-stone-400">{subtitle}</p>

      <AnimatePresence>
        {isDropdownOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="scrollbar-thin absolute left-1/2 top-full z-40 mt-4 max-h-[360px] w-80 origin-top -translate-x-1/2 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_15px_45px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-2.5 border-b border-stone-100 pb-2.5 text-center">
              <h4 className="font-sans text-xs font-black tracking-widest text-stone-400">
                나의 업적
              </h4>
            </div>

            <div className="space-y-2">
              {ACHIEVEMENT_BADGES.map((item) => {
                const unlocked = isUnlocked(unlocks, item.id);
                const isEquipped = equippedBadgeId === item.id && unlocked;
                const progressText = unlocks[item.id]?.progressText;

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
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <LockFillIcon className="h-5 w-5 text-stone-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-8">
                      <span className="block truncate font-sans text-xs font-bold text-stone-900">
                        {item.name}
                      </span>
                      <p className="mt-0.5 line-clamp-1 font-sans text-[10px] text-stone-400">
                        {unlocked ? item.description : progressText ?? "잠금 상태"}
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default memo(ProfileBadgeCustomizer);
