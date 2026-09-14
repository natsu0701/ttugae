import { useTranslation } from "react-i18next";
import type { EditorYarn } from "../../types/editorYarn.ts";
import ColorChipMenu from "./ColorChipMenu.tsx";

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
    <div className="rounded-2xl border border-stone-600/80 bg-stone-700 p-3">
      <p className="mb-0.5 font-sans text-sm font-normal uppercase tracking-[0.14em] text-stone-400">
        Selection Colors
      </p>
      <p className="mb-3 font-seoyun text-sm font-normal text-stone-500">
        {t("editor.usedColorsHint")}
      </p>

      {usedYarns.length === 0 ? (
        <p className="font-seoyun text-sm font-normal text-stone-500">
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
