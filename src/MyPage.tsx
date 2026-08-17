import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PatternCard from "./components/community/PatternCard.tsx";
import MyPatternsPanel from "./components/mypage/MyPatternsPanel.tsx";
import MyMeetupsPanel from "./components/mypage/MyMeetupsPanel.tsx";
import FinishedWorksGallery from "./components/mypage/FinishedWorksGallery.tsx";
import SettingsPanel from "./components/mypage/SettingsPanel.tsx";
import ProfileBadgeCustomizer from "./components/ui/ProfileBadgeCustomizer.tsx";
import SmoothInput from "./components/ui/SmoothInput.tsx";
import KnitAchievementDashboard from "./components/mypage/KnitAchievementDashboard.tsx";
import StatsDetailPanel from "./components/mypage/StatsDetailPanel.tsx";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import {
  buildBadgeUnlocks,
  computeAchievementStats,
} from "./components/mypage/achievementStats.ts";
import { useCommunityActions } from "./context/CommunityActionsContext.tsx";
import { getCommunityPattern } from "./data/communityPatterns.ts";
import type { StoredPattern } from "./Dashboard.tsx";
import type { CommunityPattern } from "./data/communityPatterns.ts";
import {
  DEFAULT_HANDLE,
  DEFAULT_NICKNAME,
  clearProfileAvatar,
  loadProfile,
  saveProfileAvatar,
} from "./utils/profileStorage.ts";
import {
  loadGaugeProfile,
  saveGaugeProfile,
} from "./utils/personalizationStorage.ts";
import {
  loadActivityRegion,
  saveActivityArea,
  saveActivityRegion,
} from "./utils/offlineActivityStorage.ts";
import { ACTIVITY_AREAS, parseActivityRegion } from "./data/offlineCommunity.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";
import { tabButtonBase, tabButtonClass } from "./components/ui/tabButtonStyles.ts";
import {
  ProfileFillIcon,
  PatternsFillIcon,
  ImageFillIcon,
  HeartFillIcon,
  BookmarkFillIcon,
  StatsFillIcon,
  SettingsFillIcon,
  DashboardFillIcon,
  PinFillIcon,
  AccountFillIcon,
  UserPlusFillIcon,
  LogoutFillIcon,
  WithdrawFillIcon,
} from "./components/icons/FillIcons.tsx";

export type MyPageTab =
  | "profile"
  | "summary"
  | "meetups"
  | "patterns"
  | "finished"
  | "liked"
  | "saved"
  | "stats"
  | "settings";

const NAV_TABS: { id: MyPageTab; Icon: typeof ProfileFillIcon; label: string }[] = [
  { id: "profile", Icon: ProfileFillIcon, label: "내 정보" },
  { id: "summary", Icon: DashboardFillIcon, label: "활동 요약" },
  { id: "meetups", Icon: PinFillIcon, label: "내가 예약한 뜨개 모임" },
  { id: "patterns", Icon: PatternsFillIcon, label: "내 도안" },
  { id: "finished", Icon: ImageFillIcon, label: "완성작" },
  { id: "liked", Icon: HeartFillIcon, label: "좋아요" },
  { id: "saved", Icon: BookmarkFillIcon, label: "저장" },
  { id: "stats", Icon: StatsFillIcon, label: "상세 통계" },
  { id: "settings", Icon: SettingsFillIcon, label: "환경 설정" },
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
        <p className="mt-2 font-sans text-sm font-normal text-gray-500">{emptyDesc}</p>
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
  const stored = loadProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(() => stored.avatarUrl);
  const [gauge, setGauge] = useState(loadCompactGauge);
  const [activityRegion, setActivityRegion] = useState(loadActivityRegion);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const achievementStats = useMemo(() => computeAchievementStats(patterns), [patterns]);
  const badgeUnlocks = useMemo(() => buildBadgeUnlocks(achievementStats), [achievementStats]);
  const nickname = stored.nickname || DEFAULT_NICKNAME;
  const handle = stored.handle || DEFAULT_HANDLE;

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    saveProfileAvatar(url);
  };

  const persistGauge = (next: typeof gauge) => {
    saveGaugeProfile(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans text-2xl font-bold text-gray-900">내 정보</h2>
        <p className="mt-1 font-seoyun text-sm font-normal text-stone-500">
          프로필과 손땀 게이지를 관리해요.
        </p>
      </div>

      <div className="rounded-[32px] border border-stone-200/40 bg-white p-6 shadow-[0_8px_30px_rgb(252,95,83,0.02)] md:p-8">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatarChange(e.target.files?.[0])}
        />
        <ProfileBadgeCustomizer
          nickname={nickname}
          handle={handle}
          subtitle="포근한 솜털 뜨개러 (Level 3)"
          avatarUrl={avatarUrl}
          unlocks={badgeUnlocks}
          onPickAvatar={() => avatarInputRef.current?.click()}
          onResetAvatar={() => {
            setAvatarUrl(undefined);
            clearProfileAvatar();
          }}
        />

        <div className="mt-8 space-y-3 border-t border-stone-100 pt-6">
          <div>
            <h3 className="font-sans text-sm font-bold text-gray-900">활동 지역</h3>
            <p className="mt-1 font-seoyun text-xs font-normal text-gray-500">
              구/동 단위로 저장하면 라운지 지도와 소모임 피드가 거주지 근처부터 정렬됩니다.
            </p>
          </div>
          <SmoothInput
            label="구 / 동"
            value={activityRegion}
            onChange={(e) => {
              setActivityRegion(e.target.value);
              saveActivityRegion(e.target.value);
            }}
            placeholder="서울시 마포구 망원동"
          />
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_AREAS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  saveActivityArea(item);
                  setActivityRegion(loadActivityRegion());
                }}
                className={`${tabButtonBase} ${tabButtonClass(parseActivityRegion(activityRegion).area === item)}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-stone-100 pt-6">
          <div>
            <h3 className="font-sans text-sm font-bold text-gray-900">내 게이지</h3>
            <p className="mt-1 font-seoyun text-xs font-normal text-gray-500">
              10x10cm 편물의 세탁 전후 코·단 수를 저장하면 에디터 시작 코 수에 연동됩니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <SmoothInput
              label="세탁 전 코"
              value={gauge.beforeSts}
              onChange={(e) => {
                const next = { ...gauge, beforeSts: e.target.value };
                setGauge(next);
                persistGauge(next);
              }}
              inputMode="numeric"
              className="h-9 rounded-lg px-3 py-1.5 text-xs"
            />
            <SmoothInput
              label="세탁 전 단"
              value={gauge.beforeRows}
              onChange={(e) => {
                const next = { ...gauge, beforeRows: e.target.value };
                setGauge(next);
                persistGauge(next);
              }}
              inputMode="numeric"
              className="h-9 rounded-lg px-3 py-1.5 text-xs"
            />
            <SmoothInput
              label="세탁 후 코"
              value={gauge.afterSts}
              onChange={(e) => {
                const next = { ...gauge, afterSts: e.target.value };
                setGauge(next);
                persistGauge(next);
              }}
              inputMode="numeric"
              className="h-9 rounded-lg px-3 py-1.5 text-xs"
            />
            <SmoothInput
              label="세탁 후 단"
              value={gauge.afterRows}
              onChange={(e) => {
                const next = { ...gauge, afterRows: e.target.value };
                setGauge(next);
                persistGauge(next);
              }}
              inputMode="numeric"
              className="h-9 rounded-lg px-3 py-1.5 text-xs"
            />
          </div>
        </div>
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
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-sm font-normal text-stone-700 transition-colors hover:bg-white";

  return (
    <div className="mt-2 md:w-full">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-left font-sans text-sm font-normal md:w-full ${tabButtonBase} ${tabButtonClass(open)}`}
        aria-expanded={open}
      >
        <AccountFillIcon className="h-5 w-5 shrink-0" />
        {t("mypage.account.section")}
      </button>
      {open ? (
        <div className="mt-2 space-y-0.5 rounded-2xl bg-stone-50 p-1.5">
          <button type="button" onClick={onAddAccount} className={itemClass}>
            <UserPlusFillIcon className="h-5 w-5 shrink-0" />
            {t("mypage.account.addAccount")}
          </button>
          <button type="button" onClick={onLogout} className={itemClass}>
            <LogoutFillIcon className="h-5 w-5 shrink-0" />
            {t("mypage.account.logout")}
          </button>
          <button
            type="button"
            onClick={onWithdraw}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-sm font-normal text-coral transition-colors hover:bg-white"
          >
            <WithdrawFillIcon className="h-5 w-5 shrink-0" />
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
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const [accountOpen, setAccountOpen] = useState(false);
  const { likedPatternIds, savedPatternIds } = useCommunityActions();
  const achievementStats = useMemo(() => computeAchievementStats(patterns), [patterns]);

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
      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <WelcomeBanner
          chip="MY PAGE"
          title={t("mypage.title")}
          subtitle={t("mypage.subtitle")}
          image={TTEUNI_IMAGES.feature}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:flex-row md:px-8">
        <div className="flex shrink-0 flex-col md:w-56">
          <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
            {NAV_TABS.map(({ id, Icon, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-left font-sans text-sm font-normal md:w-full ${tabButtonBase} ${tabButtonClass(active)}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="hidden md:block">{accountMenu}</div>
        </div>

        <main className="min-w-0 flex-1">
          {activeTab === "profile" ? <ProfileInfoPanel patterns={patterns} /> : null}

          {activeTab === "summary" ? (
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
            />
          ) : null}

          {activeTab === "meetups" ? <MyMeetupsPanel /> : null}

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

          {activeTab === "stats" ? (
            <StatsDetailPanel
              patterns={patterns}
              likedCount={likedPatternIds.length}
              savedCount={savedPatternIds.length}
            />
          ) : null}

          {activeTab === "settings" ? <SettingsPanel /> : null}

          <div className="mt-10 md:hidden">{accountMenu}</div>
        </main>
      </div>
    </div>
  );
}
