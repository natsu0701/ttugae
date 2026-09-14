import { memo } from "react";

const CORAL = "#FC5F53";
const HIGHLIGHT_CELLS = new Set([0, 1, 8, 9, 16, 24, 32, 40, 48]);
const PALETTE = [CORAL, "#374151", "#FFFFFF"] as const;
const TOOL_SYMBOLS = ["—", "∪", "○"] as const;

function EditorMockup() {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <div className="mb-4 flex items-center gap-2 pb-3">
        <span className="h-3 w-3 rounded-full bg-coral" />
        <span className="h-3 w-3 rounded-full bg-gray-200" />
        <span className="h-3 w-3 rounded-full bg-gray-400" />
        <span className="ml-2 font-sans text-sm font-normal text-gray-500">
          Pattern Editor
        </span>
      </div>
      <div className="grid grid-cols-8 gap-1 rounded-xl bg-gray-100 p-3">
        {Array.from({ length: 64 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-md"
            style={{
              backgroundColor: HIGHLIGHT_CELLS.has(i) ? CORAL : "#FFFFFF",
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {PALETTE.map((c) => (
            <div
              key={c}
              className="h-8 w-8 rounded-xl"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          {TOOL_SYMBOLS.map((s) => (
            <span
              key={s}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white font-sans text-base font-normal text-gray-600"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(EditorMockup);
