import { memo, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SafePublicImage from "./SafePublicImage.tsx";
import { ChevronFillIcon } from "../icons/FillIcons.tsx";
import { FEATURE_TABS } from "./featureTabsData.tsx";

const PANEL_EASE = [0.16, 1, 0.3, 1] as const;
const ACCORDION_SPRING = { type: "spring" as const, stiffness: 360, damping: 24, mass: 0.75 };

function FeatureInteractiveTabs() {
  const [activeId, setActiveId] = useState(FEATURE_TABS[0].id);

  const active = useMemo(
    () => FEATURE_TABS.find((item) => item.id === activeId) ?? FEATURE_TABS[0],
    [activeId],
  );

  const selectTab = useCallback((id: string) => setActiveId(id), []);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="flex w-full items-center justify-center lg:sticky lg:top-28 lg:col-span-7">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.35, ease: PANEL_EASE }}
              className="relative z-10 flex h-full w-full items-center justify-center"
            >
              <SafePublicImage
                src={encodeURI(active.imagePath)}
                alt={active.title}
                className="h-auto max-h-full w-auto max-w-full rounded-[2.75rem] object-contain"
                fallbackLabel={active.imagePath}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:col-span-5">
        {FEATURE_TABS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              layout
              onClick={() => selectTab(item.id)}
              transition={ACCORDION_SPRING}
              className={`group w-full overflow-hidden rounded-2xl border p-4 text-left ${
                isActive
                  ? "border-coral bg-white text-stone-900 shadow-[0_10px_25px_rgba(252,95,83,0.06)] ring-1 ring-coral/20"
                  : "border-stone-100 bg-white text-stone-500 shadow-sm hover:border-stone-300 hover:text-stone-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={`h-6 w-6 shrink-0 ${
                      isActive ? "text-coral" : "text-stone-400 group-hover:text-stone-600"
                    }`}
                  />
                  <div className="min-w-0">
                    <span
                      className={`block font-sans text-sm font-bold transition-colors ${
                        isActive ? "text-stone-900" : "text-stone-600 group-hover:text-stone-900"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="mt-0.5 block font-sans text-[10px] font-light text-stone-400">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronFillIcon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-coral" : "text-stone-300"}`}
                  open={isActive}
                />
              </div>

              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.div
                    key={`${item.id}-desc`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={ACCORDION_SPRING}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500">
                      {item.description}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FeatureInteractiveTabs);
