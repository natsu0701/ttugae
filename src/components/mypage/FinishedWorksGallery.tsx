import { useEffect, useState } from "react";
import Button from "../ui/Button.tsx";
import type { CommunityPattern } from "../../data/communityPatterns.ts";
import {
  finishedWorkImageUrl,
  type MyFinishedWork,
} from "../../data/myFinishedWorks.ts";
import {
  deleteMyFinishedWork,
  loadMyFinishedWorks,
  MY_FINISHED_UPDATED_EVENT,
} from "../../utils/myFinishedWorksStore.ts";
import { deleteSharedCommunityPattern } from "../../utils/communityShare.ts";
import { getCommunityPattern } from "../../data/communityPatterns.ts";

type FinishedWorksGalleryProps = {
  onEditPost: (pattern: CommunityPattern) => void;
};

function FinishedWorkCard({
  work,
  onEdit,
  onDelete,
  canManage,
}: {
  work: MyFinishedWork;
  onEdit?: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = work.image.startsWith("blob:") || work.image.startsWith("data:")
    ? work.image
    : finishedWorkImageUrl(work.image);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100">
      {failed ? (
        <div className="flex h-48 items-center justify-center bg-gray-100 p-4 text-center">
          <p className="font-sans text-xs font-normal text-gray-500">
            {work.image}
          </p>
        </div>
      ) : (
        <img
          src={src}
          alt={work.title}
          className="h-48 w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-sans text-lg font-bold text-gray-900">{work.title}</h3>
        <p className="mt-1 font-sans text-xs font-normal text-gray-500">
          {work.completedAt}
        </p>
        <p className="mt-3 flex-1 font-sans text-sm font-normal leading-relaxed text-gray-600">
          {work.caption}
        </p>
        {canManage && (
          <div className="mt-4 flex gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="secondary"
                className="flex-1 py-2 text-sm"
                onClick={onEdit}
              >
                수정
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="flex-1 py-2 text-sm text-gray-600"
              onClick={onDelete}
            >
              삭제
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function FinishedWorksGallery({ onEditPost }: FinishedWorksGalleryProps) {
  const [works, setWorks] = useState<MyFinishedWork[]>(() => loadMyFinishedWorks());

  useEffect(() => {
    const refresh = () => setWorks(loadMyFinishedWorks());
    window.addEventListener(MY_FINISHED_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MY_FINISHED_UPDATED_EVENT, refresh);
  }, []);

  const handleDelete = (work: MyFinishedWork) => {
    if (!window.confirm(`"${work.title}" 완성작을 삭제할까요?`)) return;
    deleteMyFinishedWork(work.id);
    if (work.id.startsWith("fw-user-")) {
      const communityId = work.id.replace(/^fw-/, "");
      deleteSharedCommunityPattern(communityId);
    }
    setWorks(loadMyFinishedWorks());
  };

  const handleEdit = (work: MyFinishedWork) => {
    if (!work.id.startsWith("fw-user-")) return;
    const communityId = work.id.replace(/^fw-/, "");
    const pattern = getCommunityPattern(communityId);
    if (pattern) onEditPost(pattern);
  };

  if (works.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-10 text-center">
        <p className="font-sans text-xl font-bold text-gray-900">완성한 작품이 없어요</p>
        <p className="mt-2 font-sans text-sm font-normal text-gray-500">
          에디터에서 도안을 완성하고 사진을 올려 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {works.map((work) => {
        const isUserPost = work.id.startsWith("fw-user-");
        return (
          <FinishedWorkCard
            key={work.id}
            work={work}
            canManage
            onEdit={isUserPost ? () => handleEdit(work) : undefined}
            onDelete={() => handleDelete(work)}
          />
        );
      })}
    </div>
  );
}
