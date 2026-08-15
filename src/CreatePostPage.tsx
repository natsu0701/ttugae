import { useEffect, useRef, useState, type FormEvent } from "react";
import { FolderFillIcon } from "./components/icons/FillIcons.tsx";
import LandingFooter from "./components/landing/LandingFooter.tsx";
import Button from "./components/ui/Button.tsx";
import SmoothInput from "./components/ui/SmoothInput.tsx";
import Textarea from "./components/ui/Textarea.tsx";
import PatternThumbnailPreview from "./components/create-post/PatternThumbnailPreview.tsx";
import LoadMyPatternModal from "./components/create-post/LoadMyPatternModal.tsx";
import { softShadow } from "./components/ui/tabButtonStyles.ts";
import type { StoredPattern } from "./Dashboard.tsx";
import {
  clearShareDraft,
  loadShareDraft,
  saveShareDraft,
  type ShareDraftPayload,
} from "./utils/shareDraft.ts";
import { shareDraftFromStoredPattern } from "./utils/createShareDraft.ts";
import { formatNeedleBadge } from "./data/knittingMetadataLibrary.ts";
import {
  getSharedCommunityPattern,
  publishPatternToCommunity,
} from "./utils/communityShare.ts";
import { upsertMyFinishedWork } from "./utils/myFinishedWorksStore.ts";

function formatTodayLocal() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export const COMMUNITY_TAB_EVENT = "ttugae:community-tab";

type CreatePostPageProps = {
  savedPatterns: StoredPattern[];
  onCancel: () => void;
  onPublished: () => void;
  onSavePattern: (pattern: ShareDraftPayload["pattern"]) => void;
};

function applyDraftToForm(
  loaded: ShareDraftPayload,
  setters: {
    setDraft: (d: ShareDraftPayload) => void;
    setTitle: (t: string) => void;
    setYarnNeedle: (y: string) => void;
    setReview: (r: string) => void;
    setPhotoUrl: (p: string | undefined) => void;
  },
) {
  setters.setDraft(loaded);
  setters.setTitle(loaded.pattern.title);
  const yarnLine = loaded.yarns
    .map((y) => `${y.brand} ${y.label} (${y.fiberType})`)
    .join(", ");
  const needleLine = loaded.pattern.needle
    ? formatNeedleBadge(loaded.pattern.needle)
    : "";
  setters.setYarnNeedle([yarnLine, needleLine].filter(Boolean).join(" · "));
  setters.setPhotoUrl(loaded.finishedPhotoDataUrl);

  if (loaded.editCommunityId) {
    const post = getSharedCommunityPattern(loaded.editCommunityId);
    if (post) {
      setters.setTitle(post.title);
      setters.setYarnNeedle(post.finishedDetail.yarn);
      setters.setReview(post.finishedDetail.review);
      if (
        post.finishedImage.startsWith("blob:") ||
        post.finishedImage.startsWith("data:")
      ) {
        setters.setPhotoUrl(post.finishedImage);
      }
    }
  }
}

export default function CreatePostPage({
  savedPatterns,
  onCancel,
  onPublished,
  onSavePattern,
}: CreatePostPageProps) {
  const [draft, setDraft] = useState<ShareDraftPayload | null>(() => loadShareDraft());
  const [title, setTitle] = useState("");
  const [yarnNeedle, setYarnNeedle] = useState("");
  const [review, setReview] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [patternModalOpen, setPatternModalOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadShareDraft();
    if (!loaded) return;
    applyDraftToForm(loaded, {
      setDraft,
      setTitle,
      setYarnNeedle,
      setReview,
      setPhotoUrl,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const handleSelectPattern = (pattern: StoredPattern) => {
    const next = shareDraftFromStoredPattern(pattern);
    const merged: ShareDraftPayload = {
      ...next,
      finishedPhotoDataUrl: photoUrl,
      editCommunityId: draft?.editCommunityId,
    };
    saveShareDraft(merged);
    applyDraftToForm(merged, {
      setDraft,
      setTitle,
      setYarnNeedle,
      setReview,
      setPhotoUrl,
    });
  };

  const handlePhotoChange = (file: File | undefined) => {
    if (!file) return;
    if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    onSavePattern(draft.pattern);

    const communityId = draft.editCommunityId ?? `user-${draft.pattern.id}`;
    const published = publishPatternToCommunity({
      id: draft.pattern.id,
      title: draft.pattern.title,
      grid: draft.pattern.grid,
      gridRows: draft.gridRows,
      gridCols: draft.gridCols,
      colorMap: draft.colorMap,
      yarns: draft.yarns,
      needle: draft.pattern.needle,
      existingCommunityId: draft.editCommunityId,
      meta: {
        title,
        yarnNeedle,
        review,
        finishedPhotoDataUrl: photoUrl,
      },
    });

    upsertMyFinishedWork({
      id: `fw-${communityId}`,
      title: title.trim() || published.title,
      image: photoUrl ?? published.finishedImage,
      caption: review || published.finishedCaption,
      completedAt: formatTodayLocal(),
    });

    clearShareDraft();
    window.dispatchEvent(
      new CustomEvent(COMMUNITY_TAB_EVENT, { detail: { tab: "showcase" as const } }),
    );
    onPublished();
  };

  if (!draft) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-center text-sm text-gray-600">
            첨부할 도안이 없습니다. 저장된 도안을 불러오거나 돌아가 주세요.
          </p>
          <Button
            type="button"
            variant="primary"
            className="px-6 py-3"
            onClick={() => setPatternModalOpen(true)}
          >
            <FolderFillIcon className="mr-2 inline h-4 w-4" />
            내 도안 불러오기
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-coral"
          >
            ← 돌아가기
          </button>
        </div>
        <LoadMyPatternModal
          open={patternModalOpen}
          patterns={savedPatterns}
          onClose={() => setPatternModalOpen(false)}
          onSelect={handleSelectPattern}
        />
        <LandingFooter />
      </div>
    );
  }

  const isEdit = Boolean(draft.editCommunityId);

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">
      <header className={`relative z-20 bg-gray-50 px-5 py-4 md:px-8 ${softShadow}`}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="font-sans text-sm font-normal text-gray-600 transition-colors hover:text-coral"
          >
            ← 돌아가기
          </button>
          <h1 className="font-sans text-lg font-bold text-gray-900">
            {isEdit ? "게시물 수정" : "게시물 작성"}
          </h1>
          <span className="w-16" aria-hidden />
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-8 px-5 py-8 md:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-sm font-normal text-gray-600">첨부 도안</p>
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2 text-sm"
            onClick={() => setPatternModalOpen(true)}
          >
            <FolderFillIcon className="mr-1.5 inline h-4 w-4" />
            내 도안 불러오기
          </Button>
        </div>

        <PatternThumbnailPreview
          grid={draft.pattern.grid}
          colorMap={draft.colorMap}
          photoUrl={photoUrl}
          title={title}
        />

        <div>
          <p className="mb-2 font-sans text-sm font-normal text-gray-600">
            완성작 사진 (선택)
          </p>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoChange(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2 text-sm"
            onClick={() => photoInputRef.current?.click()}
          >
            사진 올리기
          </Button>
        </div>

        <SmoothInput
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 베이지 가디건 완성!"
          className="border-stone-200"
          required
        />

        <SmoothInput
          label="사용 실 / 바늘 정보"
          value={yarnNeedle}
          onChange={(e) => setYarnNeedle(e.target.value)}
          placeholder="예: 메리노 울 100%, 코바늘 4.5mm"
          className="border-stone-200"
        />

        <Textarea
          label="내용 (후기)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="뜨면서 느낀 점, 팁, 소요 시간 등을 적어 주세요."
        />

        <Button type="submit" variant="primary" fullWidth className="py-4 text-base">
          업로드
        </Button>
      </form>

      <LoadMyPatternModal
        open={patternModalOpen}
        patterns={savedPatterns}
        onClose={() => setPatternModalOpen(false)}
        onSelect={handleSelectPattern}
      />
      <LandingFooter />
    </div>
  );
}
