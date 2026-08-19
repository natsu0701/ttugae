import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeftFillIcon,
  ChevronRightFillIcon,
} from "../icons/FillIcons.tsx";
import { getQaCommentCount, type QaPost } from "../../data/qaPosts.ts";
import { localizedQaPost } from "../../utils/i18nContent.ts";

const PAGE_SIZE = 5;

type QaListProps = {
  posts: QaPost[];
  onSelect: (postId: string) => void;
};

export default function QaList({ posts, onSelect }: QaListProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

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

  const pageItems = posts
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((post) => localizedQaPost(t, post));

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {pageItems.map((post) => (
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
                  {t("community.commentCount", { count: getQaCommentCount(post.id) })}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label={t("community.qaPage")}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("community.prevPage")}
          >
            <ChevronLeftFillIcon className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
            const active = n === page;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 font-sans text-sm font-medium transition-colors ${
                  active
                    ? "bg-coral text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("community.nextPage")}
          >
            <ChevronRightFillIcon className="h-4 w-4" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
