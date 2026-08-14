import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Check,
  Heart,
  Lock,
  MessageSquare,
  Share2,
  User,
} from "lucide-react";
import {
  ACHIEVEMENT_BADGES,
  getAchievementBadge,
  type AchievementBadge,
} from "../../data/achievementBadges.ts";
import {
  loadEquippedBadgeId,
  saveEquippedBadgeId,
} from "../../utils/equippedBadgeStorage.ts";

type BadgeUnlockMap = Partial<Record<AchievementBadge["id"], boolean>>;

const DEFAULT_UNLOCKED: BadgeUnlockMap = {
  first_stitch: true,
  frogger_conqueror: true,
  gauge_genius: true,
  color_collector: false,
  lounge_pioneer: true,
  tteuni_soulmate: false,
};

const DISPLAY_NAME = "다영";

function ProfileBadgeCustomizer() {
  const [equippedBadgeId, setEquippedBadgeId] = useState<string | null>(() =>
    loadEquippedBadgeId() ?? "first_stitch",
  );

  const equippedBadge = getAchievementBadge(equippedBadgeId);
  const unlockedCount = ACHIEVEMENT_BADGES.filter((badge) => DEFAULT_UNLOCKED[badge.id]).length;

  useEffect(() => {
    saveEquippedBadgeId(equippedBadgeId);
  }, [equippedBadgeId]);

  const handleEquipBadge = (id: string) => {
    if (!DEFAULT_UNLOCKED[id as AchievementBadge["id"]]) return;
    setEquippedBadgeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full select-none rounded-[32px] border border-stone-200/50 bg-[#FFFBF7] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.015)] md:p-8">
      <div className="mb-8 border-b border-stone-200/40 pb-6">
        <span className="rounded-full bg-coral/10 px-3.5 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-coral">
          Profile Customization
        </span>
        <h3 className="mt-2 font-sans text-xl font-black tracking-tight text-stone-900">
          메달 장착 프로필 커스터마이징
        </h3>
        <p className="mt-1 break-keep font-sans text-xs font-light text-stone-500">
          획득한 업적 배지를 클릭해 프로필 훈장으로 장착해 보세요. 커뮤니티 라운지에서 닉네임 우측에 노출됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
            <div
              className={`absolute left-0 right-0 top-0 h-1.5 transition-all duration-500 ${
                equippedBadge ? "bg-coral" : "bg-stone-200"
              }`}
            />

            <div className="relative mx-auto mb-4 mt-4 h-28 w-28">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-stone-100 bg-stone-50">
                <User size={48} className="text-stone-300" />
              </div>
              <AnimatePresence mode="wait">
                {equippedBadge ? (
                  <motion.div
                    key={equippedBadge.id}
                    initial={{ scale: 0, rotate: -35 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 35 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`absolute -bottom-1 -right-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white shadow-md ${equippedBadge.bgColor}`}
                    title={equippedBadge.name}
                  >
                    {(() => {
                      const Icon = equippedBadge.icon;
                      return <Icon className={`h-5 w-5 ${equippedBadge.color}`} />;
                    })()}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <h4 className="font-sans text-base font-bold text-stone-900">{DISPLAY_NAME}</h4>
                <AnimatePresence>
                  {equippedBadge ? (
                    <motion.span
                      key={equippedBadge.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="rounded border border-coral/10 bg-coral/5 px-2 py-0.5 font-sans text-[9px] font-bold tracking-tight text-coral"
                    >
                      {equippedBadge.name}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
              <p className="font-sans text-xs text-stone-400">포근한 솜털 뜨개러 (Level 3)</p>
            </div>

            <div className="mt-6 flex justify-around border-t border-stone-100 pt-4 text-center font-sans text-xs font-light text-stone-500">
              <div>
                <span className="block font-bold text-stone-800">
                  {unlockedCount} / {ACHIEVEMENT_BADGES.length}
                </span>
                <span>획득 배지</span>
              </div>
              <div className="border-r border-stone-100" />
              <div>
                <span className="block font-bold text-stone-800">
                  {equippedBadge ? "착용 중" : "미착용"}
                </span>
                <span className="text-[10px] text-stone-400">
                  {equippedBadge ? equippedBadge.name : "배지를 선택해 주세요"}
                </span>
              </div>
            </div>
          </div>

          <div className="break-keep rounded-2xl border border-stone-200/40 bg-stone-50/60 p-4 font-sans text-xs leading-relaxed text-stone-500">
            업적 배지는 창작 노력이 깃든 자산입니다. 한 단 한 단 완성하여 코수를 확보할수록 더 많은 프로필 메달이 잠금 해제됩니다.
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
            나의 업적 배지 아카이빙 진열장
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ACHIEVEMENT_BADGES.map((item) => {
              const Icon = item.icon;
              const isUnlocked = Boolean(DEFAULT_UNLOCKED[item.id]);
              const isEquipped = equippedBadgeId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => handleEquipBadge(item.id)}
                  className={`group relative flex items-start gap-3.5 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                    isUnlocked
                      ? isEquipped
                        ? "border-coral bg-white shadow-sm ring-1 ring-coral/20"
                        : "border-stone-100 bg-white hover:border-stone-300 hover:shadow-sm"
                      : "cursor-not-allowed border-stone-200/50 bg-stone-100/40 opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isUnlocked
                        ? isEquipped
                          ? `${item.bgColor} border-coral/30 ${item.color}`
                          : "border-stone-200/60 bg-stone-50 text-stone-500"
                        : "border-stone-200/50 bg-stone-200/40 text-stone-400"
                    }`}
                  >
                    {isUnlocked ? <Icon size={18} strokeWidth={2} /> : <Lock size={15} strokeWidth={2} />}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <span className="block truncate font-sans text-xs font-bold text-stone-900">
                      {item.name}
                    </span>
                    <p className="mt-1 break-keep font-sans text-[10px] leading-normal text-stone-400">
                      {item.description}
                    </p>
                  </div>
                  {isUnlocked && isEquipped ? (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white shadow-[0_2px_8px_rgba(252,95,83,0.3)]">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-stone-200/40 pt-8">
        <h4 className="mb-5 font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
          실시간 커뮤니티 라운지 글쓰기 시뮬레이션 미리보기
        </h4>
        <div className="max-w-xl rounded-2xl border border-stone-100 bg-stone-50/50 p-5">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-stone-100 bg-stone-200">
                <User size={18} className="text-stone-400" />
              </div>
              {equippedBadge ? (
                <div
                  className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 scale-90 items-center justify-center rounded-full border border-white ${equippedBadge.bgColor}`}
                >
                  {(() => {
                    const Icon = equippedBadge.icon;
                    return <Icon className={`h-2.5 w-2.5 ${equippedBadge.color}`} />;
                  })()}
                </div>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-xs font-black text-stone-900">{DISPLAY_NAME}</span>
                <AnimatePresence mode="wait">
                  {equippedBadge ? (
                    <motion.div
                      key={equippedBadge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`inline-flex items-center gap-1 rounded-full border border-coral/10 px-2 py-0.5 font-sans text-[9px] font-bold leading-none text-coral ${equippedBadge.bgColor}`}
                    >
                      {(() => {
                        const Icon = equippedBadge.icon;
                        return <Icon className="h-2.5 w-2.5" />;
                      })()}
                      <span>{equippedBadge.name}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <p className="mt-0.5 font-sans text-[10px] text-stone-400">방금 전 작성</p>
            </div>
            <span className="text-stone-400">
              <Share2 size={15} />
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <h5 className="font-sans text-sm font-extrabold text-stone-900">
              가을용 체리 가디건 도안 완성작 등록해 보았어요!
            </h5>
            <p className="break-keep font-sans text-xs font-light leading-relaxed text-stone-500">
              가디건의 대바늘 줄임코와 늘림코 배색을 완료했습니다. 완성작 이미지에 마우스를 올리면 2D 도안 위로 실물 편물이 부드럽게 매핑됩니다.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-4 border-t border-stone-100 pt-3.5 font-sans text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Heart size={14} />
              12
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark size={14} />
              8
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProfileBadgeCustomizer);
