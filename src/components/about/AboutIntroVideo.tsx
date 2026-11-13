import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CollapseFillIcon,
  ExpandFillIcon,
  PauseFillIcon,
  PlayFillIcon,
} from "../icons/FillIcons.tsx";
import { ABOUT_INTRO_VIDEO_SRC } from "../../constants/aboutMedia.ts";
import { iconTip } from "../../utils/iconTip.ts";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function fullscreenEl(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export default function AboutIntroVideo() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (video.paused) void video.play();
    else video.pause();
  }, [failed]);

  const seekTo = useCallback((next: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = next;
    setCurrent(next);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage) return;
    const anyStage = stage as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
    const anyDoc = document as Document & {
      webkitExitFullscreen?: () => void;
    };
    const anyVideo = video as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitRequestFullscreen?: () => void;
        })
      | null;

    if (fullscreenEl()) {
      if (document.exitFullscreen) void document.exitFullscreen();
      else anyDoc.webkitExitFullscreen?.();
      return;
    }

    const fallback = () => {
      if (video?.requestFullscreen) {
        void video.requestFullscreen().catch(() => {
          anyVideo?.webkitEnterFullscreen?.();
        });
        return;
      }
      anyVideo?.webkitRequestFullscreen?.();
      anyVideo?.webkitEnterFullscreen?.();
    };

    if (stage.requestFullscreen) {
      void stage.requestFullscreen().catch(fallback);
      return;
    }
    anyStage.webkitRequestFullscreen?.();
    fallback();
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(fullscreenEl()));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);

  return (
    <figure className="w-full">
      <div
        ref={stageRef}
        className="relative mx-auto aspect-video max-h-[min(28rem,calc(100svh-16rem))] w-full overflow-hidden rounded-xl bg-[#FFFBF7] shadow-sm [:fullscreen]:aspect-auto [:fullscreen]:max-h-none [:fullscreen]:flex [:fullscreen]:h-full [:fullscreen]:w-full [:fullscreen]:items-center [:fullscreen]:rounded-none [:fullscreen]:bg-black"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover [:fullscreen]:object-contain"
          src={ABOUT_INTRO_VIDEO_SRC}
          playsInline
          preload="auto"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onError={() => setFailed(true)}
        >
          {t("about.videoFallback")}
        </video>
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-coral text-white shadow-sm">
              <PlayFillIcon className="h-6 w-6 translate-x-0.5" />
            </span>
            <p className="font-sans text-base font-bold text-stone-900">{t("about.videoTitle")}</p>
            <p className="max-w-sm break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500">
              {t("about.videoWaiting")}
            </p>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 bg-black/70 px-3 py-2.5">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-stone-800 shadow-sm"
              onClick={togglePlay}
              {...iconTip(playing ? t("about.videoPause") : t("about.videoPlay"))}
            >
              {playing ? (
                <PauseFillIcon className="h-4 w-4" />
              ) : (
                <PlayFillIcon className="h-4 w-4 translate-x-px" />
              )}
            </button>
            <input
              type="range"
              className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/35 accent-coral"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(current, duration || 0)}
              aria-label={t("about.videoSeek")}
              onChange={(event) => seekTo(Number(event.currentTarget.value))}
            />
            <span className="shrink-0 font-sans text-xs tabular-nums text-white">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-stone-800 shadow-sm"
              onClick={toggleFullscreen}
              aria-pressed={isFullscreen}
              {...iconTip(
                isFullscreen ? t("about.videoExitFullscreen") : t("about.videoFullscreen"),
              )}
            >
              {isFullscreen ? (
                <CollapseFillIcon className="h-4 w-4" />
              ) : (
                <ExpandFillIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-center font-seoyun text-base font-normal text-stone-500">
        {t("about.videoCaption")}
      </figcaption>
    </figure>
  );
}
