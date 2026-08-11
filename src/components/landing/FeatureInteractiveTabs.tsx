import { memo, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import {
  softShadow,
  tabButtonClass,
  tabButtonCompactBase,
} from "../ui/tabButtonStyles.ts";
import SafePublicImage from "./SafePublicImage.tsx";
import { FEATURE_TABS } from "./featureTabsData.tsx";

const PANEL_TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

function FeatureInteractiveTabs() {
  const [activeId, setActiveId] = useState(FEATURE_TABS[0].id);

  const active = useMemo(
    () => FEATURE_TABS.find((f) => f.id === activeId) ?? FEATURE_TABS[0],
    [activeId],
  );

  const selectTab = useCallback((id: string) => setActiveId(id), []);

  return (
    <div className="grid gap-8 lg:grid-cols-10 lg:gap-10">
      <div
        className={`min-h-[360px] rounded-2xl bg-white p-6 md:p-10 lg:col-span-6 ${softShadow}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={PANEL_TRANSITION}
            className="flex flex-col gap-6"
          >
            {active.id === "ai-chat" ? (
              <div className="relative flex min-h-[240px] flex-col items-center justify-center gap-6 rounded-2xl bg-gray-50 p-6">
                <img
                  src={TTEUNI_IMAGES.feature}
                  alt="뜨니 AI 챗봇"
                  className="h-40 w-40 object-contain md:h-48 md:w-48"
                />
                <SafePublicImage
                  src={`/${encodeURI(active.image)}`}
                  alt={active.title}
                  className="h-auto max-h-[min(480px,55vh)] w-full rounded-2xl object-contain"
                  fallbackLabel={`public/${active.image}`}
                />
              </div>
            ) : (
              <SafePublicImage
                src={`/${encodeURI(active.image)}`}
                alt={active.title}
                className="h-auto max-h-[min(480px,55vh)] w-full rounded-2xl object-contain"
                fallbackLabel={`public/${active.image}`}
              />
            )}
            <div>
              <h3 className="font-sans text-2xl font-bold text-gray-900 md:text-3xl">
                {active.title}
              </h3>
              <p className="mt-4 font-rounded text-base font-normal leading-relaxed text-gray-700 md:text-lg">
                {active.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center gap-2 lg:col-span-4">
        {FEATURE_TABS.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`flex w-full items-center gap-2.5 text-left ${tabButtonCompactBase} ${
                isActive ? tabButtonClass(true) : tabButtonClass(false)
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-50 text-gray-700"
                }`}
              >
                {tab.icon}
              </span>
              <span className="truncate font-sans text-sm font-bold">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FeatureInteractiveTabs);
