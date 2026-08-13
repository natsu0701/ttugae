import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import {
  CHART_PART_LABELS,
  type ChartTargetPart,
} from "../../types/knittingProject.ts";

export type CastOnMode = "replace" | "add";

type CastOnModalProps = {
  open: boolean;
  mode?: CastOnMode;
  onClose: () => void;
  onApply: (cols: number, rows: number) => void;
  onAddChart?: (payload: {
    cols: number;
    rows: number;
    name: string;
    targetPart: ChartTargetPart;
  }) => void;
};

const PARTS = Object.keys(CHART_PART_LABELS) as ChartTargetPart[];

export default function CastOnModal({
  open,
  mode = "replace",
  onClose,
  onApply,
  onAddChart,
}: CastOnModalProps) {
  const { t } = useTranslation();
  const [w, setW] = useState("24");
  const [h, setH] = useState("28");
  const [name, setName] = useState("");
  const [targetPart, setTargetPart] = useState<ChartTargetPart>("body");
  const isAdd = mode === "add";

  const handleApply = () => {
    const cols = parseInt(w, 10);
    const rows = parseInt(h, 10);
    if (!Number.isFinite(cols) || !Number.isFinite(rows)) return;
    if (isAdd && onAddChart) {
      const label = name.trim() || CHART_PART_LABELS[targetPart];
      onAddChart({ cols, rows, name: label, targetPart });
    } else {
      onApply(cols, rows);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal
        >
          <motion.div
            className={`w-full max-w-sm rounded-2xl bg-white p-6 ${softShadow}`}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-sans text-xl font-bold text-gray-900">
              {isAdd ? "서브 도안 만들기" : t("editor.castOn.title")}
            </h2>
            <p className="mt-2 font-rounded text-sm font-normal text-gray-600">
              {isAdd
                ? "새 도안의 코·단 수와 3D 매핑 부위를 정해 주세요."
                : t("editor.castOn.description")}
            </p>

            {isAdd && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-normal text-gray-600">
                    도안 이름
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={CHART_PART_LABELS[targetPart]}
                    className="py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-normal text-gray-600">
                    3D 부위
                  </label>
                  <select
                    value={targetPart}
                    onChange={(e) =>
                      setTargetPart(e.target.value as ChartTargetPart)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-sans text-sm text-gray-800 outline-none focus:border-coral"
                  >
                    {PARTS.map((part) => (
                      <option key={part} value={part}>
                        {CHART_PART_LABELS[part]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block font-sans text-xs font-normal text-gray-600">
                  {t("editor.castOn.widthLabel")}
                </label>
                <Input
                  value={w}
                  onChange={(e) => setW(e.target.value)}
                  inputMode="numeric"
                  placeholder="W"
                  className="py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block font-sans text-xs font-normal text-gray-600">
                  {t("editor.castOn.heightLabel")}
                </label>
                <Input
                  value={h}
                  onChange={(e) => setH(e.target.value)}
                  inputMode="numeric"
                  placeholder="H"
                  className="py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 py-2.5">
                {t("editor.castOn.cancel")}
              </Button>
              <Button type="button" onClick={handleApply} className="flex-1 py-2.5">
                {isAdd ? "도안 추가" : t("editor.castOn.createCanvas")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
