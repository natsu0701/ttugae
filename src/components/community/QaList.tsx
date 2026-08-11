import { useTranslation } from "react-i18next";
import type { QaPost } from "../../data/qaPosts.ts";

type QaListProps = {
  posts: QaPost[];
  onSelect: (postId: string) => void;
};

export default function QaList({ posts, onSelect }: QaListProps) {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-12 text-center">
        <p className="font-sans text-xl font-bold text-gray-900">
          {t("community.qaEmptyTitle")}
        </p>
        <p className="mt-2 font-sans text-sm font-normal text-gray-500">
          {t("community.qaEmptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li key={post.id}>
          <button
            type="button"
            onClick={() => onSelect(post.id)}
            className="w-full rounded-2xl bg-gray-50 p-5 text-left transition-colors duration-200 hover:bg-gray-100"
          >
            <h3 className="font-sans text-lg font-bold text-gray-900">{post.title}</h3>
            <p className="mt-2 line-clamp-2 font-sans text-sm font-normal leading-relaxed text-gray-600">
              {post.excerpt}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs font-normal text-gray-500">
              <span>@{post.author}</span>
              <span>{post.createdAt}</span>
              <span className="text-coral">
                {t("community.commentCount", { count: post.commentCount })}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
