import { getPatternThumbnail } from "../../data/patternThumbnails.ts";

type MiniPatternCanvasProps = {
  patternId: string;
  label?: string;
  className?: string;
};

export default function MiniPatternCanvas({
  patternId,
  label,
  className = "",
}: MiniPatternCanvasProps) {
  const cells = getPatternThumbnail(patternId);
  const cols = cells[0]?.length ?? 12;

  return (
    <div className={`rounded-2xl bg-gray-50 p-4 ${className}`}>
      {label && (
        <p className="mb-3 font-sans text-sm font-normal text-gray-500">{label}</p>
      )}
      <div
        className="grid gap-px overflow-hidden rounded-xl bg-gray-200 p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((hex, c) => (
            <div
              key={`${r}-${c}`}
              className="aspect-square min-h-[8px] min-w-[8px]"
              style={{ backgroundColor: hex }}
            />
          )),
        )}
      </div>
    </div>
  );
}
