import { useTranslation } from "react-i18next";
import { editorChromeBtn, editorChromeBtnActive } from "../ui/tabButtonStyles.ts";

/** 전문 공방 매칭 내추럴 컬러 팔레트 (베이스 / 기호·포인트1 / 포인트2) */
export type WorkshopPalette = {
  id: string;
  name: string;
  sub: string;
  colors: [string, string, string];
};

const WORKSHOP_PALETTES: WorkshopPalette[] = [
  {
    id: "cherry-blossom",
    name: "체리 버블검",
    sub: "Cherry Blossom",
    colors: ["#F7F5F0", "#FC5F53", "#88C399"],
  },
  {
    id: "nordic-jacquard",
    name: "노르딕 자카드",
    sub: "Nordic Jacquard",
    colors: ["#E8DDD0", "#5C4A42", "#F4A4B8"],
  },
  {
    id: "classic-forest",
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
  const { t } = useTranslation();
  const paletteTitle = (id: string, fallback: string) => {
    if (id === "cherry-blossom") return t("editor.paletteCherry");
    if (id === "nordic-jacquard") return t("editor.paletteNordic");
    if (id === "classic-forest") return t("editor.paletteForest");
    return fallback;
  };
  return (
    <div className="mt-6 rounded-2xl border border-stone-600/80 bg-stone-700 p-4">
      <p className="mb-3 font-sans text-xs font-normal tracking-wide text-stone-300">
        {t("editor.workshopTitle")}
      </p>

      <div className="flex flex-col gap-1.5">
        {WORKSHOP_PALETTES.map((palette) => {
          const active = activePaletteId === palette.id;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => onSelectPalette(palette.id, palette.colors)}
              aria-pressed={active}
              className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left ${
                active ? editorChromeBtnActive : editorChromeBtn
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-sans text-[11px] font-normal text-inherit">
                  {paletteTitle(palette.id, palette.name)}
                </span>
                <span
                  className={`block truncate font-sans text-[9px] font-normal uppercase tracking-wide ${
                    active ? "text-white/80" : "text-stone-400"
                  }`}
                >
                  {palette.sub}
                </span>
              </span>

              <span className="flex shrink-0 -space-x-1.5">
                {palette.colors.map((hex) => (
                  <span
                    key={hex}
                    className="h-5 w-5 rounded-full border border-stone-800/80"
                    style={{ backgroundColor: hex }}
                    aria-hidden
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
