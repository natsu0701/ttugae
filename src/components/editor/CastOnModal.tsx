import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";

type CastOnModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (cols: number, rows: number) => void;
};

export default function CastOnModal({ open, onClose, onApply }: CastOnModalProps) {
  const { t } = useTranslation();
  const [w, setW] = useState("24");
  const [h, setH] = useState("28");

  const handleApply = () => {
    const cols = parseInt(w, 10);
    const rows = parseInt(h, 10);
    if (Number.isFinite(cols) && Number.isFinite(rows)) {
      onApply(cols, rows);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6 pointer-events-auto"
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
              {t("editor.castOn.title")}
            </h2>
            <p className="mt-2 font-rounded text-sm font-normal text-gray-600">
              {t("editor.castOn.description")}
            </p>

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
                {t("editor.castOn.createCanvas")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
