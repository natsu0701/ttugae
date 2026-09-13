import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SafePublicImage from "./SafePublicImage.tsx";
import { ChevronFillIcon } from "../icons/FillIcons.tsx";
import { FEATURE_TABS } from "./featureTabsData.tsx";

const TAB_COPY: Record<string, { title: string; sub: string; desc: string }> = {
  editor: {
    title: "landing.tabEditorTitle",
    sub: "landing.tabEditorSub",
    desc: "landing.tabEditorDesc",
  },
  chatbot: {
    title: "landing.tabChatTitle",
    sub: "landing.tabChatSub",
    desc: "landing.tabChatDesc",
  },
  converter: {
    title: "landing.tabConvertTitle",
    sub: "landing.tabConvertSub",
    desc: "landing.tabConvertDesc",
  },
  community: {
    title: "landing.tabCommunityTitle",
    sub: "landing.tabCommunitySub",
    desc: "landing.tabCommunityDesc",
  },
};

function FeatureInteractiveTabs() {
  const { t } = useTranslation();
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
          <div key={active.id} className="relative z-10 flex h-full w-full items-center justify-center fade-in">
            <SafePublicImage
              src={encodeURI(active.imagePath)}
              alt={t(TAB_COPY[active.id]?.title ?? "landing.tabEditorTitle")}
              className="h-auto max-h-full w-auto max-w-full rounded-xl object-contain"
              fallbackLabel={active.imagePath}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:col-span-5">
        {FEATURE_TABS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={`group w-full overflow-hidden rounded-xl border p-4 text-left transition-colors duration-200 ${
                isActive
                  ? "border-coral bg-white text-stone-900 shadow-[0_10px_25px_rgba(252,95,83,0.06)] ring-1 ring-coral/20"
                  : "border-stone-100 bg-white text-stone-500 shadow-sm hover:border-stone-300 hover:text-stone-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={`h-6 w-6 shrink-0 transition-colors ${
                      isActive ? "text-coral" : "text-stone-400 group-hover:text-stone-600"
                    }`}
                  />
                  <div className="min-w-0">
                    <span
                      className={`block font-sans text-sm font-bold transition-colors ${
                        isActive ? "text-stone-900" : "text-stone-600 group-hover:text-stone-900"
                      }`}
                    >
                      {t(TAB_COPY[item.id]?.title ?? item.title)}
                    </span>
                    <span className="mt-0.5 block font-sans text-[10px] font-light text-stone-400">
                      {t(TAB_COPY[item.id]?.sub ?? item.subtitle)}
                    </span>
                  </div>
                </div>
                <ChevronFillIcon
                  className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-coral" : "text-stone-300"}`}
                  open={isActive}
                />
              </div>

              <div className={`accordion-panel ${isActive ? "is-open" : ""}`}>
                <div className="accordion-panel-inner">
                  <p className="mt-3 break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500">
                    {t(TAB_COPY[item.id]?.desc ?? item.description)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FeatureInteractiveTabs);
