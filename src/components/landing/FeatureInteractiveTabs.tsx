import { memo, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SafePublicImage from "./SafePublicImage.tsx";
import { FEATURE_TABS } from "./featureTabsData.tsx";

const PANEL_EASE = [0.16, 1, 0.3, 1] as const;

function FeatureInteractiveTabs() {
  const [activeId, setActiveId] = useState(FEATURE_TABS[0].id);

  const active = useMemo(
    () => FEATURE_TABS.find((item) => item.id === activeId) ?? FEATURE_TABS[0],
    [activeId],
  );

  const selectTab = useCallback((id: string) => setActiveId(id), []);

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
      <div className="flex w-full items-center justify-center lg:col-span-7">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[32px] border border-stone-200/40 bg-stone-100/60 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.015)]">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/5 blur-3xl" />

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
                className="h-auto max-h-full w-auto max-w-full rounded-2xl object-contain"
                fallbackLabel={active.imagePath}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-5">
        <div className="flex min-h-[140px] flex-col justify-center rounded-3xl border border-stone-100 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.01)]">
          <span className="text-[11px] font-black uppercase tracking-wider text-coral">
            {active.subtitle}
          </span>
          <h3 className="mt-1 font-sans text-lg font-bold text-stone-900">{active.title}</h3>
          <p className="mt-2 break-keep font-sans text-xs font-light leading-relaxed text-stone-500">
            {active.description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FEATURE_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`group relative flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
                  isActive
                    ? "border-coral bg-white text-stone-900 shadow-[0_10px_25px_rgba(252,95,83,0.06)] ring-1 ring-coral/20"
                    : "border-stone-100 bg-white text-stone-500 shadow-sm hover:border-stone-300 hover:text-stone-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isActive
                        ? "border-coral/20 bg-coral/10 text-coral"
                        : "border-stone-200/50 bg-stone-50 text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-600"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
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

                <ArrowRight
                  size={15}
                  className={`transition-all duration-300 ${
                    isActive
                      ? "translate-x-0 text-coral opacity-100"
                      : "-translate-x-2 text-stone-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(FeatureInteractiveTabs);
