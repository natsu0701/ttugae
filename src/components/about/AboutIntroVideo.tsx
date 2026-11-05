import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlayFillIcon } from "../icons/FillIcons.tsx";
import { ABOUT_INTRO_VIDEO_SRC } from "../../constants/aboutMedia.ts";

export default function AboutIntroVideo() {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  return (
    <figure className="w-full">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#FFFBF7] shadow-sm">
        <video
          className={`h-full w-full object-cover ${ready ? "block" : "hidden"}`}
          src={ABOUT_INTRO_VIDEO_SRC}
          controls
          playsInline
          preload="metadata"
          onLoadedData={() => setReady(true)}
          onError={() => setReady(false)}
        >
          {t("about.videoFallback")}
        </video>
        {ready ? null : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-coral text-white shadow-sm">
              <PlayFillIcon className="h-6 w-6 translate-x-0.5" />
            </span>
            <p className="font-sans text-base font-bold text-stone-900">{t("about.videoTitle")}</p>
            <p className="max-w-sm break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500">
              {t("about.videoWaiting")}
            </p>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-center font-seoyun text-base font-normal text-stone-500">
        {t("about.videoCaption")}
      </figcaption>
    </figure>
  );
}
