import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import {
  pickRandomPresets,
  type ColorPreset,
} from "../../data/colorPresets.ts";

const REFRESH_SPIN_MS = 500;

type ColorPresetsSectionProps = {
  activePresetId: string | null;
  onApply: (presetId: string, colors: [string, string, string, string]) => void;
};

function presetLabel(
  preset: ColorPreset,
  t: (key: string, options?: { defaultValue?: string }) => string,
) {
  return t(`editor.presetNames.${preset.id}`, { defaultValue: preset.name });
}

export default function ColorPresetsSection({
  activePresetId,
  onApply,
}: ColorPresetsSectionProps) {
  const { t } = useTranslation();
  const [visiblePresets, setVisiblePresets] = useState(() => pickRandomPresets());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listGeneration, setListGeneration] = useState(0);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setVisiblePresets(pickRandomPresets());
    setListGeneration((g) => g + 1);
    window.setTimeout(() => setIsRefreshing(false), REFRESH_SPIN_MS);
  }, []);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
          {t("editor.colorPresetsTitle")}
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-full p-1 text-gray-500 transition-colors duration-200 hover:text-coral disabled:pointer-events-none"
          aria-label={t("editor.colorPresetsRefresh")}
          title={t("editor.colorPresetsRefresh")}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={listGeneration}
            className="flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {visiblePresets.map((preset, index) => {
              const active = activePresetId === preset.id;
              return (
                <motion.button
                  key={`${listGeneration}-${preset.id}`}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  onClick={() => onApply(preset.id, preset.colors)}
                  className={`group flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 ${
                    active
                      ? "bg-coral text-white"
                      : "bg-white text-gray-700 hover:bg-black hover:text-white"
                  }`}
                >
                  <span className="flex shrink-0 gap-0.5">
                    {preset.colors.map((hex, i) => (
                      <span
                        key={`${preset.id}-${i}`}
                        className="h-5 w-5 rounded-full first:rounded-l-full last:rounded-r-full"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </span>
                  <span
                    className={`truncate font-sans text-xs font-normal ${
                      active ? "text-white" : "text-gray-700 group-hover:text-white"
                    }`}
                  >
                    {presetLabel(preset, t)}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-2 font-rounded text-[10px] font-normal text-gray-500">
        {t("editor.colorPresetsHint")}
      </p>
    </div>
  );
}
