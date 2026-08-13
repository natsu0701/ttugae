import { motion } from "framer-motion";

/** 전문 공방 매칭 내추럴 컬러 팔레트 (베이스 / 기호·포인트1 / 포인트2) */
export type WorkshopPalette = {
  id: string;
  emoji: string;
  name: string;
  sub: string;
  colors: [string, string, string];
};

const WORKSHOP_PALETTES: WorkshopPalette[] = [
  {
    id: "cherry-blossom",
    emoji: "🍒",
    name: "체리 버블검",
    sub: "Cherry Blossom",
    colors: ["#F7F5F0", "#FC5F53", "#88C399"],
  },
  {
    id: "nordic-jacquard",
    emoji: "❄️",
    name: "노르딕 자카드",
    sub: "Nordic Jacquard",
    colors: ["#E8DDD0", "#5C4A42", "#F4A4B8"],
  },
  {
    id: "classic-forest",
    emoji: "🌿",
    name: "클래식 빈티지 포레스트",
    sub: "Classic Forest",
    colors: ["#FFFBF7", "#3A5F43", "#D94B40"],
  },
];

type WorkshopPalettePanelProps = {
  activePaletteId: string | null;
  /** 팔레트 클릭 시 에디터 실 색상 3종을 원터치로 매핑 */
  onSelectPalette: (paletteId: string, colors: [string, string, string]) => void;
};

export default function WorkshopPalettePanel({
  activePaletteId,
  onSelectPalette,
}: WorkshopPalettePanelProps) {
  return (
    <div className="mt-6 rounded-2xl bg-stone-50/90 p-4">
      <p className="mb-3 flex items-center gap-1.5 font-sans text-xs font-normal tracking-wide text-gray-700">
        <span aria-hidden>🧶</span>
        공방 추천 팔레트
      </p>

      <div className="flex flex-col gap-1">
        {WORKSHOP_PALETTES.map((palette) => {
          const active = activePaletteId === palette.id;
          return (
            <motion.button
              key={palette.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectPalette(palette.id, palette.colors)}
              aria-pressed={active}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                active
                  ? "bg-coral/10 ring-1 ring-coral/40"
                  : "hover:bg-stone-100 hover:ring-1 hover:ring-coral/25"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-sans text-[11px] font-normal text-gray-800">
                  {palette.emoji} {palette.name}
                </span>
                <span className="block truncate font-sans text-[9px] font-normal uppercase tracking-wide text-gray-400">
                  {palette.sub}
                </span>
              </span>

              {/* 실 색상 칩 3개가 오손도손 겹치는 자수 캡슐 */}
              <span className="flex shrink-0 -space-x-1.5">
                {palette.colors.map((hex) => (
                  <span
                    key={hex}
                    className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: hex }}
                    aria-hidden
                  />
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
