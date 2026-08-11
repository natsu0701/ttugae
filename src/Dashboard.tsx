import Button from "./components/ui/Button.tsx";

export type StoredPattern = {
  id: string;
  title: string;
  updatedAt: number;
  gridSize: number;
  grid: { colorId: string; stitchId: string }[][];
};

const COLOR_MAP: Record<string, string> = {
  coral: "#FC5F53",
  black: "#374151",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  cream: "#FFFFFF",
  pink: "#FC5F53",
};

type DashboardProps = {
  patterns: StoredPattern[];
  onBack: () => void;
  onCreateNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function PatternThumb({ pattern }: { pattern: StoredPattern }) {
  const size = Math.min(10, pattern.gridSize);
  const cells = pattern.grid.slice(0, size).map((r) => r.slice(0, size));

  return (
    <div className="rounded-xl bg-gray-100 p-2" aria-hidden>
      <div
        className="grid gap-px overflow-hidden rounded-lg bg-gray-200"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="h-3 w-3"
              style={{ backgroundColor: COLOR_MAP[cell.colorId] ?? "#FFFFFF" }}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default function Dashboard({
  patterns,
  onBack,
  onCreateNew,
  onOpen,
  onDelete,
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-white px-6 py-10 font-sans text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4 px-0 py-1 text-sm">
              ← 홈으로
            </Button>
            <p className="font-sans text-sm font-semibold text-coral">My Patterns</p>
            <h1 className="mt-1 font-sans text-3xl font-bold text-gray-900">내 도안 보관함</h1>
            <p className="mt-2 font-rounded text-sm text-gray-600">
              저장한 도안을 다시 열고, 새로운 도안을 시작해요.
            </p>
          </div>
          <Button variant="primary" onClick={onCreateNew} className="px-6 py-3">
            새 도안 만들기
          </Button>
        </div>

        {patterns.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-8 text-center">
            <p className="font-sans text-xl font-bold text-gray-900">아직 저장된 도안이 없어요</p>
            <p className="mt-2 font-rounded text-sm text-gray-600">
              ‘새 도안 만들기’로 첫 도안을 시작해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {patterns
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-gray-50 p-5 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-sans text-xl font-bold text-gray-900">
                        {p.title}
                      </p>
                      <p className="mt-1 font-rounded text-xs text-gray-500">
                        마지막 수정: {formatDate(p.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="rounded-full bg-gray-100 px-3 py-1.5 font-sans text-xs font-medium text-gray-600 transition-colors hover:bg-coral hover:text-white"
                      aria-label="도안 삭제"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="mt-4">
                    <PatternThumb pattern={p} />
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => onOpen(p.id)}
                    className="mt-4 py-2.5"
                  >
                    열기 →
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
