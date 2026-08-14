import { useTranslation } from "react-i18next";
import type { EditorYarn } from "../../types/editorYarn.ts";
import ColorChipMenu from "./ColorChipMenu.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";

type SelectionColorsPanelProps = {
  usedYarns: EditorYarn[];
  activeColorId: string;
  onSelectColor: (id: string) => void;
  onChangeColor: (colorId: string, hex: string) => void;
  onDeleteFromCanvas: (colorId: string) => void;
};

export default function SelectionColorsPanel({
  usedYarns,
  activeColorId,
  onSelectColor,
  onChangeColor,
  onDeleteFromCanvas,
}: SelectionColorsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className={`rounded-2xl bg-white/80 p-3 ${softShadow}`}>
      <p className="mb-0.5 font-sans text-[11px] font-normal uppercase tracking-[0.14em] text-gray-500">
        Selection Colors
      </p>
      <p className="mb-3 font-rounded text-[10px] font-normal text-gray-500">
        {t("editor.usedColorsHint")}
      </p>

      {usedYarns.length === 0 ? (
        <p className="font-rounded text-xs font-normal text-gray-400">
          {t("editor.usedColorsEmpty")}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {usedYarns.map((yarn) => (
            <ColorChipMenu
              key={yarn.id}
              yarn={yarn}
              variant="selection"
              isActive={activeColorId === yarn.id}
              onSelect={() => onSelectColor(yarn.id)}
              onChangeColor={onChangeColor}
              onDeleteFromCanvas={onDeleteFromCanvas}
            />
          ))}
        </div>
      )}
    </div>
  );
}
