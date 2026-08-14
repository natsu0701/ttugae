import { useMemo, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import Button from "./components/ui/Button.tsx";
import Input from "./components/ui/Input.tsx";
import PatternCard from "./components/community/PatternCard.tsx";
import MyPatternsPanel from "./components/mypage/MyPatternsPanel.tsx";
import FinishedWorksGallery from "./components/mypage/FinishedWorksGallery.tsx";
import SettingsPanel from "./components/mypage/SettingsPanel.tsx";
import ProfileStatsSummary from "./components/mypage/ProfileStatsSummary.tsx";
import StatsDetailPanel from "./components/mypage/StatsDetailPanel.tsx";
import { useCommunityActions } from "./context/CommunityActionsContext.tsx";
import { tabButtonBase, tabButtonClass } from "./components/ui/tabButtonStyles.ts";
import { getCommunityPattern } from "./data/communityPatterns.ts";
import type { StoredPattern } from "./Dashboard.tsx";
import type { CommunityPattern } from "./data/communityPatterns.ts";
import { loadProfile, saveProfileAvatar } from "./utils/profileStorage.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import {
  ProfileFillIcon,
  PatternsFillIcon,
  ImageFillIcon,
  HeartFillIcon,
  BookmarkFillIcon,
  StatsFillIcon,
  SettingsFillIcon,
} from "./components/icons/FillIcons.tsx";

export type MyPageTab =
  | "profile"
  | "patterns"
  | "finished"
  | "liked"
  | "saved"
  | "stats"
  | "settings";

const TAB_IDS: { id: MyPageTab; Icon: FC<{ className?: string }> }[] = [
  { id: "profile", Icon: ProfileFillIcon },
  { id: "patterns", Icon: PatternsFillIcon },
  { id: "finished", Icon: ImageFillIcon },
  { id: "liked", Icon: HeartFillIcon },
  { id: "saved", Icon: BookmarkFillIcon },
  { id: "stats", Icon: StatsFillIcon },
  { id: "settings", Icon: SettingsFillIcon },
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
          viewMode="pattern"
          onImport={onImport}
          showImportOverlay
        />
      ))}
    </div>
  );
}

function AccountActions({
  onLogout,
  onAddAccount,
  className = "",
}: {
  onLogout: () => void;
  onAddAccount: () => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Button type="button" onClick={onAddAccount} className="w-full px-4 py-2.5 text-sm">
        {t("mypage.account.addAccount")}
      </Button>
      <Button type="button" onClick={onLogout} className="w-full px-4 py-2.5 text-sm">
        {t("mypage.account.logout")}
      </Button>
    </div>
  );
}

function ProfilePanel({
  onLogout,
  onAddAccount,
  patternCount,
  heartCount,
  finishedCount,
  savedCount,
}: {
  onLogout: () => void;
  onAddAccount: () => void;
  patternCount: number;
  heartCount: number;
  finishedCount: number;
  savedCount: number;
}) {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState("뜨개러투게더");
  const [email, setEmail] = useState("knitter@example.com");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    () => loadProfile().avatarUrl,
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    saveProfileAvatar(url);
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-sans text-2xl font-bold text-gray-900">
        {t("mypage.profile.title")}
      </h2>
      <p className="mt-1 font-sans text-sm font-normal text-gray-600">
        {t("mypage.profile.subtitle")}
      </p>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-coral">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ProfileFillIcon className="h-12 w-12" />
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatarChange(e.target.files?.[0])}
        />
        <Button
          type="button"
          className="px-4 py-2 text-sm"
          onClick={() => avatarInputRef.current?.click()}
        >
          {t("mypage.profile.changeAvatar")}
        </Button>
      </div>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div>
          <label className="mb-1.5 block font-sans text-sm font-normal text-gray-700">
            {t("mypage.profile.nickname")}
          </label>
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-sm font-normal text-gray-700">
            {t("mypage.profile.email")}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-sm font-normal text-gray-700">
            {t("mypage.profile.newPassword")}
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("mypage.profile.passwordPlaceholder")}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-sm font-normal text-gray-700">
            {t("mypage.profile.confirmPassword")}
          </label>
          <Input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder={t("mypage.profile.confirmPlaceholder")}
          />
        </div>
        <Button type="submit" className="w-fit px-4 py-2">
          {t("mypage.profile.save")}
        </Button>
      </form>

      <ProfileStatsSummary
        patternCount={patternCount}
        heartCount={heartCount}
        finishedCount={finishedCount}
        savedCount={savedCount}
      />

      <div className="mt-10 border-t border-gray-100 pt-8 md:hidden">
        <p className="mb-3 font-sans text-sm font-bold text-gray-900">
          {t("mypage.account.section")}
        </p>
        <AccountActions onLogout={onLogout} onAddAccount={onAddAccount} />
      </div>
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
}: MyPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const { likedPatternIds, savedPatternIds } = useCommunityActions();
  const heartCount = likedPatternIds.length * 24 + 420;

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
            {TAB_IDS.map(({ id, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-left font-sans text-sm font-normal md:w-full ${tabButtonBase} ${tabButtonClass(active)}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {t(`mypage.tabs.${id}`)}
                </button>
              );
            })}
          </nav>

          <AccountActions
            onLogout={onLogout}
            onAddAccount={onAddAccount}
            className="mt-6 hidden md:flex"
          />
        </div>

        <main className="min-w-0 flex-1">
          {activeTab === "profile" && (
            <ProfilePanel
              onLogout={onLogout}
              onAddAccount={onAddAccount}
              patternCount={patterns.length}
              heartCount={heartCount}
              finishedCount={3}
              savedCount={savedPatternIds.length}
            />
          )}
          {activeTab === "patterns" && (
            <MyPatternsPanel
              patterns={patterns}
              onCreateNew={onCreateNew}
              onOpen={onOpenPattern}
              onDelete={onDeletePattern}
            />
          )}
          {activeTab === "finished" && (
            <div>
              <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">
                {t("mypage.finishedTitle")}
              </h2>
              <FinishedWorksGallery onEditPost={onEditCommunityPost} />
            </div>
          )}
          {activeTab === "liked" && (
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
          )}
          {activeTab === "saved" && (
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
          )}
          {activeTab === "stats" && (
            <StatsDetailPanel
              patterns={patterns}
              likedCount={likedPatternIds.length}
              savedCount={savedPatternIds.length}
            />
          )}
          {activeTab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
