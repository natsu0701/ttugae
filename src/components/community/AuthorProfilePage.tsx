import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import BackButton from "../ui/BackButton.tsx";
import Button from "../ui/Button.tsx";
import PatternCard from "./PatternCard.tsx";
import ProfileStatsHeader from "../ui/ProfileStatsHeader.tsx";
import { resolveLoungeAuthor, patternsByAuthorHandle } from "../../data/loungeAuthors.ts";
import { loadSharedCommunityPatterns } from "../../utils/communityShare.ts";
import { isFollowing, listFollowers, listFollowing, toggleFollow } from "../../utils/followStorage.ts";
import { currentUserHandle } from "../../utils/identity.ts";
import type { CommunityPattern } from "../../data/communityPatterns.ts";
import { loadProfile } from "../../utils/profileStorage.ts";
import AuthorAvatar from "./AuthorAvatar.tsx";

type AuthorProfilePageProps = {
  handle: string;
  onBack: () => void;
  onImportToEditor: (pattern: CommunityPattern) => void;
  onOpenFinished: (pattern: CommunityPattern) => void;
};

export default function AuthorProfilePage({
  handle,
  onBack,
  onImportToEditor,
  onOpenFinished,
}: AuthorProfilePageProps) {
  const { t } = useTranslation();
  const author = resolveLoungeAuthor(handle);
  const [tick, setTick] = useState(0);
  const patterns = useMemo(
    () => patternsByAuthorHandle(handle, loadSharedCommunityPatterns()),
    [handle, tick],
  );
  const resolvedHandle = author?.handle ?? handle;
  const mine = currentUserHandle().toLowerCase() === resolvedHandle.toLowerCase();
  const following = isFollowing(resolvedHandle);
  void tick;

  if (!author.handle) {
    return (
      <div className="page-shell py-8">
        <BackButton onClick={onBack} />
        <p className="mt-6 text-body text-stone-500">{t("community.authorMissing")}</p>
      </div>
    );
  }

  return (
    <div className="page-shell pb-16 pt-4">
      <BackButton onClick={onBack} />
      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <ProfileStatsHeader
          avatar={<AuthorAvatar author={author.handle || handle} className="h-28 w-28" />}
          posts={patterns.length}
          followers={listFollowers(resolvedHandle).length}
          following={listFollowing(resolvedHandle).length}
        />
        <div className="mt-5">
          <h1 className="text-title font-sans font-bold text-gray-900">{author.nickname}</h1>
          <p className="mt-1 font-sans text-base text-stone-500">@{author.handle}</p>
          {author.bio ? <p className="mt-2 text-body text-stone-600">{author.bio}</p> : null}
          {!mine ? (
            <Button
              type="button"
              className="mt-4 px-4 py-2 text-base"
              onClick={() => {
                toggleFollow(resolvedHandle);
                setTick((n) => n + 1);
              }}
            >
              {following ? t("community.unfollow") : t("community.follow")}
            </Button>
          ) : null}
        </div>
        {mine && loadProfile().isPublic === false ? (
          <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 font-sans text-sm leading-5 text-stone-500">
            {t("mypage.profile.publicOff")} — {t("mypage.profile.publicHint")}
          </p>
        ) : null}
      </section>
      <section className="mt-8">
        <h2 className="text-title font-sans font-bold text-gray-900">{t("community.authorWorks")}</h2>
        {patterns.length === 0 ? (
          <p className="mt-4 text-body text-stone-500">{t("community.authorEmpty")}</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onImport={onImportToEditor}
                onOpenFinished={onOpenFinished}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
