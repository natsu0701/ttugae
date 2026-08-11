import { gridToThumbnailHex } from "../../utils/communityShare.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";

type PatternThumbnailPreviewProps = {
  grid: EditorCell[][];
  colorMap: Record<string, string>;
  photoUrl?: string;
  title?: string;
};

export default function PatternThumbnailPreview({
  grid,
  colorMap,
  photoUrl,
  title,
}: PatternThumbnailPreviewProps) {
  const cells = gridToThumbnailHex(grid, colorMap, 14);

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-50">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={title ? `${title} 완성작` : "완성작 미리보기"}
          className="h-52 w-full object-cover"
        />
      ) : (
        <div className="p-4">
          <p className="mb-3 font-sans text-xs font-normal text-gray-500">
            도안 미리보기
          </p>
          <div
            className="mx-auto grid max-w-xs gap-px rounded-xl bg-gray-200 p-1"
            style={{
              gridTemplateColumns: `repeat(${cells[0]?.length ?? 1}, minmax(0, 1fr))`,
            }}
          >
            {cells.flatMap((row, r) =>
              row.map((hex, c) => (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: hex }}
                />
              )),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
