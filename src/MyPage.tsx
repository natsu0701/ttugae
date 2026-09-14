import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PatternCard from "./components/community/PatternCard.tsx";
import KnitBagPanel from "./components/mypage/KnitBagPanel.tsx";
import MyProjectsPanel from "./components/mypage/MyProjectsPanel.tsx";
import MyPatternsPanel from "./components/mypage/MyPatternsPanel.tsx";
import MyMeetupsPanel from "./components/mypage/MyMeetupsPanel.tsx";
import FinishedWorksGallery from "./components/mypage/FinishedWorksGallery.tsx";
import SettingsPanel from "./components/mypage/SettingsPanel.tsx";
import ProfileBadgeCustomizer from "./components/ui/ProfileBadgeCustomizer.tsx";
import SmoothInput from "./components/ui/SmoothInput.tsx";
import KnitAchievementDashboard from "./components/mypage/KnitAchievementDashboard.tsx";
import GaugeCalculator from "./components/mypage/GaugeCalculator.tsx";
import KnitCalendar from "./components/mypage/KnitCalendar.tsx";
import RegionPicker from "./components/mypage/RegionPicker.tsx";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import Button from "./components/ui/Button.tsx";
import {
  buildBadgeUnlocks,
  computeAchievementStats,
} from "./components/mypage/achievementStats.ts";
import { useCommunityActions } from "./context/CommunityActionsContext.tsx";
import { useUnsavedChanges } from "./context/UnsavedChangesContext.tsx";
import { getCommunityPattern } from "./data/communityPatterns.ts";
import type { StoredPattern } from "./types/storedPattern.ts";
import type { CommunityPattern } from "./data/communityPatterns.ts";
import {
  DEFAULT_HANDLE,
  DEFAULT_NICKNAME,
  clearProfileAvatar,
  loadProfile,
  saveProfileAccount,
  saveProfileAvatar,
} from "./utils/profileStorage.ts";
import { isValidHandle, updateActiveAccount } from "./utils/accountStorage.ts";
import {
  loadGaugeProfile,
  saveGaugeProfile,
} from "./utils/personalizationStorage.ts";
import {
  loadActivityRegion,
  saveActivityRegion,
} from "./utils/offlineActivityStorage.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";
import { tabButtonBase, tabButtonClass } from "./components/ui/tabButtonStyles.ts";
import {
  ProfileFillIcon,
  PatternsFillIcon,
  ImageFillIcon,
  HeartFillIcon,
  BookmarkFillIcon,
  SettingsFillIcon,
  DashboardFillIcon,
  PinFillIcon,
  AccountFillIcon,
  UserPlusFillIcon,
  LogoutFillIcon,
  WithdrawFillIcon,
  PencilFillIcon,
  CompassFillIcon,
  BagFillIcon,
  FolderFillIcon,
} from "./components/icons/FillIcons.tsx";
import {
  FOLLOW_CHANGED_EVENT,
  isFollowing,
  listFollowers,
  listFollowing,
  toggleFollow,
} from "./utils/followStorage.ts";
import { findLoungeAuthor, searchLoungeAuthors } from "./data/loungeAuthors.ts";
import { currentUserHandle } from "./utils/identity.ts";
import { resolveKnitLevel, LEVEL_PERIOD_DAYS } from "./utils/knitLevel.ts";
import { loadKnitCalendarEvents, loadKnitMinutes } from "./utils/knittingLogStorage.ts";
import { getAchievementBadge } from "./data/achievementBadges.ts";
import { loadEquippedBadgeId, saveEquippedBadgeId } from "./utils/equippedBadgeStorage.ts";
import { badgeName } from "./utils/i18nContent.ts";
import { mypagePathForTab, mypageTabFromPath, type MyPageRouteTab } from "./utils/mypageTab.ts";
import { appPath } from "./utils/appPath.ts";

export type MyPageTab =
  | "profile"
  | "summary"
  | "meetups"
  | "bag"
  | "gauge"
  | "projects"
  | "patterns"
  | "finished"
  | "liked"
  | "saved"
  | "settings";

const NAV_TABS: { id: MyPageTab; Icon: typeof ProfileFillIcon; labelKey: string }[] = [
  { id: "profile", Icon: ProfileFillIcon, labelKey: "mypage.tabs.profile" },
  { id: "summary", Icon: DashboardFillIcon, labelKey: "mypage.tabs.summary" },
  { id: "meetups", Icon: PinFillIcon, labelKey: "mypage.tabs.meetups" },
  { id: "bag", Icon: BagFillIcon, labelKey: "mypage.tabs.bag" },
  { id: "gauge", Icon: CompassFillIcon, labelKey: "mypage.tabs.gauge" },
  { id: "projects", Icon: PatternsFillIcon, labelKey: "mypage.tabs.projects" },
  { id: "patterns", Icon: FolderFillIcon, labelKey: "mypage.tabs.patterns" },
  { id: "finished", Icon: ImageFillIcon, labelKey: "mypage.tabs.finished" },
  { id: "liked", Icon: HeartFillIcon, labelKey: "mypage.tabs.liked" },
  { id: "saved", Icon: BookmarkFillIcon, labelKey: "mypage.tabs.saved" },
  { id: "settings", Icon: SettingsFillIcon, labelKey: "mypage.tabs.settings" },
];

type MyPageProps = {
  patterns: StoredPattern[];
  onCreateNew: () => void;
  onOpenPattern: (id: string) => void;
  onDeletePattern: (id: string) => void;
  onEditCommunityPost: (pattern: CommunityPattern) => void;
  onImportCommunity: (pattern: CommunityPattern) => void;
  onLogout: () => void;
  onAddAccount: () => void;
  onDeleteAccount: () => void;
};

function PatternGallery({
  patternIds,
  emptyTitle,
  emptyDesc,
  onImport,
}: {
  patternIds: string[];
  emptyTitle: string;
  emptyDesc: string;
  onImport: (p: CommunityPattern) => void;
}) {
  const items = useMemo(
    () =>
      patternIds
        .map((id) => getCommunityPattern(id))
        .filter((p): p is CommunityPattern => Boolean(p)),
    [patternIds],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-10 text-center">
        <p className="font-sans text-xl font-bold text-gray-900">{emptyTitle}</p>
        <p className="mt-2 font-sans text-base font-normal text-gray-500">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((pattern) => (
        <PatternCard
          key={pattern.id}
          pattern={pattern}
          onImport={onImport}
          showImportOverlay
        />
      ))}
    </div>
  );
}

function loadCompactGauge() {
  const gauge = loadGaugeProfile();
  return {
    beforeSts: gauge?.beforeSts || "24",
    beforeRows: gauge?.beforeRows || "32",
    afterSts: gauge?.afterSts || "",
    afterRows: gauge?.afterRows || "",
  };
}

function ProfileInfoPanel({
  patterns,
}: {
  patterns: StoredPattern[];
}) {
  const { t } = useTranslation();
  const { setDirty, registerSaver } = useUnsavedChanges();
  const stored = loadProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(() => stored.avatarUrl);
  const [nickname, setNickname] = useState(stored.nickname || DEFAULT_NICKNAME);
  const [handle, setHandle] = useState(stored.handle || DEFAULT_HANDLE);
  const [handleError, setHandleError] = useState("");
  const [activityRegion, setActivityRegion] = useState(loadActivityRegion);
  const [isPublic, setIsPublic] = useState(stored.isPublic !== false);
  const [equippedBadgeId, setEquippedBadgeId] = useState<string | null>(() => loadEquippedBadgeId());
  const [followOpen, setFollowOpen] = useState<"following" | "followers" | null>(null);
  const [followQuery, setFollowQuery] = useState("");
  const [socialTick, setSocialTick] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const achievementStats = useMemo(() => computeAchievementStats(patterns), [patterns]);
  const badgeUnlocks = useMemo(() => buildBadgeUnlocks(achievementStats), [achievementStats]);
  const level = resolveKnitLevel(achievementStats.totalStitches);
  const following = useMemo(() => listFollowing(), [socialTick]);
  const followers = useMemo(() => listFollowers(), [socialTick]);
  const equippedBadge = equippedBadgeId ? getAchievementBadge(equippedBadgeId) : null;
  const showEquippedBadge = Boolean(equippedBadge && badgeUnlocks[equippedBadge.id]?.unlocked);

  const markDirty = useCallback(() => setDirty(true), [setDirty]);

  const saveAll = useCallback(() => {
    if (!isValidHandle(handle)) {
      setHandleError(t("mypage.account.handleInvalid"));
      return false;
    }
    setHandleError("");
    saveProfileAccount({ nickname, handle, isPublic, region: activityRegion });
    saveActivityRegion(activityRegion);
    updateActiveAccount({ nickname, handle, avatarUrl });
    if (avatarUrl) saveProfileAvatar(avatarUrl);
    else clearProfileAvatar();
    saveEquippedBadgeId(equippedBadgeId);
    setDirty(false);
    return true;
  }, [activityRegion, avatarUrl, equippedBadgeId, handle, isPublic, nickname, setDirty, t]);

  useEffect(() => {
    registerSaver(saveAll);
    return () => registerSaver(() => undefined);
  }, [registerSaver, saveAll]);

  useEffect(() => {
    const bump = () => setSocialTick((n) => n + 1);
    window.addEventListener(FOLLOW_CHANGED_EVENT, bump);
    return () => window.removeEventListener(FOLLOW_CHANGED_EVENT, bump);
  }, []);

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result ?? ""));
      markDirty();
    };
    reader.readAsDataURL(file);
  };

  const followPeople = useMemo(() => {
    const me = currentUserHandle();
    const ids = followOpen === "following" ? following : followers;
    const listed = ids.map(
      (id) => findLoungeAuthor(id) ?? { handle: id, nickname: id, bio: "" },
    );
    const searched = followQuery.trim() ? searchLoungeAuthors(followQuery) : [];
    const merged = followQuery.trim() ? searched : listed;
    return merged
      .filter((author) => author.handle !== me)
      .filter((item, index, arr) => arr.findIndex((x) => x.handle === item.handle) === index);
  }, [followOpen, followQuery, followers, following]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title text-gray-900">{t("mypage.profile.title")}</h2>
        <p className="mt-1 font-seoyun text-base text-stone-500">{t("mypage.profile.profileHint")}</p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 md:p-8">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatarChange(e.target.files?.[0])}
        />
        <div className="flex flex-col items-center">
          <div className="relative h-28 w-28">
            <img
              src={avatarUrl || TTEUNI_IMAGES.chatProfile}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white shadow"
              aria-label={t("mypage.profile.changeAvatar")}
            >
              <PencilFillIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="font-sans text-lg font-bold leading-7 text-stone-900">{nickname}</span>
            <span className="rounded-full bg-stone-900 px-2.5 py-0.5 font-sans text-sm font-bold text-white">
              Lv.{level.level}
            </span>
            {showEquippedBadge && equippedBadge ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-0.5">
                <img src={equippedBadge.imageSrc} alt="" className="h-5 w-5 object-contain" />
                <span className="font-sans text-sm font-bold text-stone-700">
                  {badgeName(t, equippedBadge.id, equippedBadge.name)}
                </span>
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 font-sans text-base leading-5 text-stone-500">@{handle}</p>
          <p className="mt-1 font-sans text-sm leading-5 text-stone-400">{level.title}</p>
          <div className="mt-4 w-full max-w-xl rounded-lg bg-stone-50 p-4 text-left">
            <p className="font-sans text-sm font-bold text-stone-700">{t("mypage.level.guideTitle")}</p>
            <ul className="mt-2 space-y-1 font-sans text-sm text-stone-500">
              <li>{t("mypage.level.criteria")}</li>
              <li>{t("mypage.level.period", { days: LEVEL_PERIOD_DAYS })}</li>
              <li>{t("mypage.level.score", { score: level.score.toLocaleString() })}</li>
              <li>
                {level.nextScore
                  ? t("mypage.level.next", { remaining: level.remaining.toLocaleString() })
                  : t("mypage.level.max")}
              </li>
            </ul>
          </div>
          <div className="mt-4 flex gap-4 text-base">
            <button type="button" className="hover:text-coral" onClick={() => setFollowOpen("following")}>
              {t("mypage.follow.followingCount", { count: following.length })}
            </button>
            <button type="button" className="hover:text-coral" onClick={() => setFollowOpen("followers")}>
              {t("mypage.follow.followerCount", { count: followers.length })}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <SmoothInput
            label={t("mypage.profile.nickname")}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              markDirty();
            }}
          />
          <SmoothInput
            label={t("mypage.account.handle")}
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              setHandleError(isValidHandle(e.target.value) ? "" : t("mypage.account.handleInvalid"));
              markDirty();
            }}
          />
        </div>
        {handleError ? <p className="mt-2 text-sm text-coral">{handleError}</p> : null}

        <div className="mt-8">
          <h3 className="font-sans text-base font-bold">{t("mypage.profile.regionTitle")}</h3>
          <p className="mt-1 font-seoyun text-sm text-stone-500">{t("mypage.profile.regionHint")}</p>
          <div className="mt-3">
            <RegionPicker
              value={activityRegion}
              onChange={(next) => {
                setActivityRegion(next);
                markDirty();
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg bg-stone-50 px-4 py-3">
          <div>
            <p className="font-sans text-base leading-5 text-stone-800">
              {isPublic ? t("mypage.profile.publicOn") : t("mypage.profile.publicOff")}
            </p>
            <p className="mt-1 font-sans text-sm leading-4 text-stone-400">
              {t("mypage.profile.publicHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => {
              setIsPublic((value) => !value);
              markDirty();
            }}
            className={`relative h-6 w-11 shrink-0 rounded-full ${isPublic ? "bg-coral" : "bg-stone-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${
                isPublic ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" className="px-5 py-2.5 text-base" onClick={saveAll}>
            {t("mypage.profile.save")}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6 md:p-8">
        <h3 className="text-title">{t("mypage.badgeVault")}</h3>
        <p className="mt-2 font-sans text-base leading-6 text-stone-500">{t("mypage.badgeVaultHint")}</p>
        <div className="mt-5">
          <ProfileBadgeCustomizer
            unlocks={badgeUnlocks}
            equippedBadgeId={equippedBadgeId}
            onEquip={(id) => {
              setEquippedBadgeId(id);
              markDirty();
            }}
          />
        </div>
      </div>

      {followOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-stone-900/30" onClick={() => setFollowOpen(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="font-sans text-base font-bold">
              {followOpen === "following" ? t("mypage.follow.following") : t("mypage.follow.followers")}
            </h3>
            <input
              value={followQuery}
              onChange={(e) => setFollowQuery(e.target.value)}
              placeholder={t("mypage.follow.searchPh")}
              className="mt-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-base"
            />
            <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
              {followPeople.length === 0 ? (
                <li className="px-1 py-6 text-center text-base text-stone-400">{t("mypage.follow.empty")}</li>
              ) : (
                followPeople.map((author) => {
                  const followingThem = isFollowing(author.handle);
                  return (
                    <li
                      key={author.handle}
                      className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2 text-base"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium leading-5">{author.nickname}</p>
                        <p className="truncate text-sm leading-4 text-stone-400">@{author.handle}</p>
                      </div>
                      <button
                        type="button"
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                          followingThem ? "bg-stone-200 text-stone-600" : "bg-coral text-white"
                        }`}
                        onClick={() => toggleFollow(author.handle)}
                      >
                        {followingThem ? t("mypage.follow.unfollow") : t("mypage.follow.follow")}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GaugeTab() {
  const { t } = useTranslation();
  const { setDirty, registerSaver } = useUnsavedChanges();
  const [gauge, setGauge] = useState(loadCompactGauge);

  const saveGauge = useCallback(() => {
    saveGaugeProfile(gauge);
    setDirty(false);
  }, [gauge, setDirty]);

  useEffect(() => {
    registerSaver(saveGauge);
    return () => registerSaver(() => undefined);
  }, [registerSaver, saveGauge]);

  return (
    <div>
      <GaugeCalculator
        gauge={gauge}
        onChange={(next) => {
          setGauge(next);
          setDirty(true);
        }}
      />
      <div className="mt-4 flex justify-end">
        <Button type="button" className="px-5 py-2.5 text-base" onClick={saveGauge}>
          {t("mypage.profile.save")}
        </Button>
      </div>
    </div>
  );
}

function AccountMenu({
  open,
  onToggle,
  onAddAccount,
  onLogout,
  onWithdraw,
}: {
  open: boolean;
  onToggle: () => void;
  onAddAccount: () => void;
  onLogout: () => void;
  onWithdraw: () => void;
}) {
  const { t } = useTranslation();
  const itemClass =
    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-sans text-base font-normal text-stone-700 hover:bg-stone-50";

  return (
    <div className="relative mt-2 md:w-full">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-left font-sans text-base font-normal md:w-full ${tabButtonBase} ${tabButtonClass(open)}`}
        aria-expanded={open}
      >
        <AccountFillIcon className="h-5 w-5 shrink-0" />
        {t("mypage.account.section")}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-52 rounded-xl border border-stone-200 bg-white py-1 shadow-md md:left-full md:top-0 md:ml-3 md:mt-0">
          <button type="button" onClick={onAddAccount} className={itemClass}>
            <UserPlusFillIcon className="h-4 w-4 shrink-0" />
            {t("mypage.account.addAccount")}
          </button>
          <button type="button" onClick={onLogout} className={itemClass}>
            <LogoutFillIcon className="h-4 w-4 shrink-0" />
            {t("mypage.account.logout")}
          </button>
          <button
            type="button"
            onClick={onWithdraw}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-sans text-base font-normal text-coral hover:bg-stone-50"
          >
            <WithdrawFillIcon className="h-4 w-4 shrink-0" />
            {t("mypage.account.withdraw")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function MyPage({
  patterns,
  onCreateNew,
  onOpenPattern,
  onDeletePattern,
  onEditCommunityPost,
  onImportCommunity,
  onLogout,
  onAddAccount,
  onDeleteAccount,
}: MyPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MyPageTab>(
    () => mypageTabFromPath(window.location.pathname),
  );
  const [accountOpen, setAccountOpen] = useState(false);
  const { likedPatternIds, savedPatternIds } = useCommunityActions();
  const { requestLeave } = useUnsavedChanges();
  const achievementStats = useMemo(() => computeAchievementStats(patterns), [patterns]);

  const selectTab = (id: MyPageTab) => {
    if (id === activeTab) return;
    requestLeave(() => {
      setActiveTab(id);
      window.history.replaceState({}, "", appPath(mypagePathForTab(id as MyPageRouteTab)));
    });
  };

  useEffect(() => {
    const onPop = () => setActiveTab(mypageTabFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleWithdraw = () => {
    const ok = window.confirm(t("mypage.account.withdrawConfirm"));
    if (ok) onDeleteAccount();
  };

  const accountMenu = (
    <AccountMenu
      open={accountOpen}
      onToggle={() => setAccountOpen((open) => !open)}
      onAddAccount={onAddAccount}
      onLogout={onLogout}
      onWithdraw={handleWithdraw}
    />
  );

  return (
    <div className="pb-16">
      <div className="page-shell pt-8">
        <WelcomeBanner
          chip="MY PAGE"
          title={t("mypage.title")}
          subtitle={t("mypage.subtitle")}
          image={TTEUNI_IMAGES.feature}
        />
      </div>

      <div className="page-shell flex flex-col gap-8 py-8 md:flex-row">
        <div className="flex shrink-0 flex-col md:w-56">
          <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
            {NAV_TABS.map(({ id, Icon, labelKey }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectTab(id)}
                  className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-left font-sans text-base font-normal md:w-full ${tabButtonBase} ${tabButtonClass(active)}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {t(labelKey)}
                </button>
              );
            })}
          </nav>
          <div className="hidden md:block">{accountMenu}</div>
        </div>

        <main className="min-w-0 flex-1">
          {activeTab === "profile" ? <ProfileInfoPanel patterns={patterns} /> : null}

          {activeTab === "summary" ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-sans text-2xl font-bold text-gray-900">{t("mypage.tabs.summary")}</h2>
                <p className="mt-1 font-sans text-base text-gray-600">{t("mypage.profile.statsHint")}</p>
              </div>
              <KnitAchievementDashboard
                totalStitches={achievementStats.totalStitches}
                completedProjects={achievementStats.completedProjects}
                activeStreak={achievementStats.activeStreak}
                hasPackagedPattern={achievementStats.hasPackagedPattern}
                gaugeConversions={achievementStats.gaugeConversions}
                colorPaletteUses={achievementStats.colorPaletteUses}
                hasSharedLoungePost={achievementStats.hasSharedLoungePost}
                tteuniChats={achievementStats.tteuniChats}
                activeProjectCount={achievementStats.activeProjectCount}
                yarnInventoryCount={achievementStats.yarnInventoryCount}
                marketplaceDownloads={achievementStats.marketplaceDownloads}
                finishedCount={achievementStats.finishedCount}
                hasOfflineCheckin={achievementStats.hasOfflineCheckin}
                offlineCheckins={achievementStats.offlineCheckins}
                currentProgressRow={achievementStats.currentProgressRow}
                knitMinutes={loadKnitMinutes(patterns)}
                likedCount={likedPatternIds.length}
                savedCount={savedPatternIds.length}
                patternCount={patterns.length}
                patterns={patterns}
              />
              <KnitCalendar events={loadKnitCalendarEvents(patterns)} />
            </div>
          ) : null}

          {activeTab === "gauge" ? <GaugeTab /> : null}

          {activeTab === "bag" ? <KnitBagPanel /> : null}

          {activeTab === "meetups" ? <MyMeetupsPanel /> : null}

          {activeTab === "projects" ? (
            <MyProjectsPanel
              patterns={patterns}
              onCreateNew={onCreateNew}
              onOpen={onOpenPattern}
              onDelete={onDeletePattern}
            />
          ) : null}

          {activeTab === "patterns" ? (
            <MyPatternsPanel
              patterns={patterns}
              onCreateNew={onCreateNew}
              onOpen={onOpenPattern}
              onDelete={onDeletePattern}
            />
          ) : null}

          {activeTab === "finished" ? (
            <div>
              <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">
                {t("mypage.finishedTitle")}
              </h2>
              <FinishedWorksGallery onEditPost={onEditCommunityPost} />
            </div>
          ) : null}

          {activeTab === "liked" ? (
            <div>
              <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">
                {t("mypage.likedTitle")}
              </h2>
              <PatternGallery
                patternIds={likedPatternIds}
                emptyTitle={t("mypage.likedEmptyTitle")}
                emptyDesc={t("mypage.likedEmptyDesc")}
                onImport={onImportCommunity}
              />
            </div>
          ) : null}

          {activeTab === "saved" ? (
            <div>
              <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">
                {t("mypage.savedTitle")}
              </h2>
              <PatternGallery
                patternIds={savedPatternIds}
                emptyTitle={t("mypage.savedEmptyTitle")}
                emptyDesc={t("mypage.savedEmptyDesc")}
                onImport={onImportCommunity}
              />
            </div>
          ) : null}

          {activeTab === "settings" ? <SettingsPanel /> : null}

          <div className="mt-10 md:hidden">{accountMenu}</div>
        </main>
      </div>
    </div>
  );
}
