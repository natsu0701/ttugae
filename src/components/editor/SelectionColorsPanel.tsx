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
    <div>
      <p className="mb-1 font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
        {t("editor.usedColors")}
      </p>
      <p className="mb-3 font-rounded text-[10px] font-normal text-gray-500">
        {t("editor.usedColorsHint")}
      </p>

      {usedYarns.length === 0 ? (
        <p className="font-rounded text-xs font-normal text-gray-500">
          {t("editor.usedColorsEmpty")}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {usedYarns.map((yarn) => (
            <div key={yarn.id} className="flex flex-col items-center">
              <ColorChipMenu
                yarn={yarn}
                variant="compact"
                isActive={activeColorId === yarn.id}
                onSelect={() => onSelectColor(yarn.id)}
                onChangeColor={onChangeColor}
                onDeleteFromCanvas={onDeleteFromCanvas}
              />
              <span className="mt-1 w-full truncate text-center font-sans text-[9px] font-normal text-gray-600">
                {yarn.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
