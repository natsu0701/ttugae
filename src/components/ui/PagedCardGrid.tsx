import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeftFillIcon,
  ChevronRightFillIcon,
} from "../icons/FillIcons.tsx";

export const CARD_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

export const CARD_PAGE_ROWS = 10;
export const CARD_PAGE_COLS = 4;
export const CARD_PAGE_SIZE = CARD_PAGE_ROWS * CARD_PAGE_COLS;

export function pageCountForCards(total: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / CARD_PAGE_SIZE));
}

function visiblePageNumbers(page: number, pageCount: number): number[] {
  if (pageCount <= 12) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const windowSize = 9;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(pageCount, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function PaginationBar({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (next: number) => void;
}) {
  const { t } = useTranslation();
  if (pageCount <= 1) return null;
  const numbers = visiblePageNumbers(page, pageCount);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label={t("common.pagination")}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("community.prevPage")}
      >
        <ChevronLeftFillIcon className="h-4 w-4" />
      </button>
      {numbers[0] > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className="flex h-9 min-w-9 items-center justify-center rounded-full bg-gray-100 px-3 font-sans text-base font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            1
          </button>
          {numbers[0] > 2 ? (
            <span className="px-1 font-sans text-base text-gray-400">...</span>
          ) : null}
        </>
      ) : null}
      {numbers.map((n) => {
        const active = n === page;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={active ? "page" : undefined}
            aria-label={t("common.pageN", { n })}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 font-sans text-base font-medium transition-colors ${
              active
                ? "bg-coral text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {n}
          </button>
        );
      })}
      {numbers[numbers.length - 1] < pageCount ? (
        <>
          {numbers[numbers.length - 1] < pageCount - 1 ? (
            <span className="px-1 font-sans text-base text-gray-400">...</span>
          ) : null}
          <button
            type="button"
            onClick={() => onChange(pageCount)}
            className="flex h-9 min-w-9 items-center justify-center rounded-full bg-gray-100 px-3 font-sans text-base font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            {pageCount}
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("community.nextPage")}
      >
        <ChevronRightFillIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

type PagedCardGridProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  resetKey?: string | number;
  className?: string;
};

export default function PagedCardGrid<T>({
  items,
  getKey,
  renderItem,
  resetKey,
  className = CARD_GRID_CLASS,
}: PagedCardGridProps<T>) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const pageCount = pageCountForCards(items.length);
  const current = Math.min(page, pageCount);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    setPage((n) => Math.min(n, pageCount));
  }, [pageCount]);

  const pageItems = useMemo(() => {
    const start = (current - 1) * CARD_PAGE_SIZE;
    return items.slice(start, start + CARD_PAGE_SIZE);
  }, [current, items]);

  const goTo = (next: number) => {
    const clamped = Math.min(pageCount, Math.max(1, next));
    setPage(clamped);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className={className}>
        {pageItems.map((item, i) => (
          <div key={getKey(item)} className="min-w-0 h-full">
            {renderItem(item, (current - 1) * CARD_PAGE_SIZE + i)}
          </div>
        ))}
      </div>
      {items.length > CARD_PAGE_SIZE ? (
        <PaginationBar page={current} pageCount={pageCount} onChange={goTo} />
      ) : null}
    </div>
  );
}
