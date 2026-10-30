import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { AR_PLAYLIST, formatClock, playlistVideoUrl } from "../../data/arPlaylist.ts";
import { PUBLIC_AR_URL } from "../../utils/appPath.ts";
import {
  CheckFillIcon,
  CollapseFillIcon,
  CopyFillIcon,
  ExpandFillIcon,
  PauseFillIcon,
  PlayFillIcon,
} from "../icons/FillIcons.tsx";
import BackButton from "../ui/BackButton.tsx";
import { iconTip } from "../../utils/iconTip.ts";

export type ArOverlayNaviProps = {
  onExit: () => void;
};

type CameraStatus = "starting" | "live" | "blocked" | "missing" | "insecure" | "unsupported";

const PLAYBACK_RATES = [0.2, 0.5, 1, 1.5, 2] as const;
type PlaybackRate = (typeof PLAYBACK_RATES)[number];

function formatPlaybackRate(rate: number): string {
  const matched = PLAYBACK_RATES.find((item) => Math.abs(item - rate) < 0.001) ?? rate;
  return `${matched}X`;
}

function nextPlaybackRate(rate: number): PlaybackRate {
  const index = PLAYBACK_RATES.findIndex((item) => Math.abs(item - rate) < 0.001);
  return PLAYBACK_RATES[(index < 0 ? 0 : index + 1) % PLAYBACK_RATES.length];
}

function isWideLayout(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitRequestFullScreen?: () => Promise<void> | void;
};

function cameraErrorStatus(error: unknown): CameraStatus {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name?: string }).name)
      : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "blocked";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "missing";
  return "missing";
}

function prepareOverlayVideo(video: HTMLVideoElement) {
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.autoplay = true;
}

function fullscreenElement(): Element | null {
  const doc = document as FsDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function enterFullscreen(el: HTMLElement) {
  const node = el as FsElement;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }
  await node.webkitRequestFullscreen?.();
  await node.webkitRequestFullScreen?.();
}

async function exitFullscreen() {
  const doc = document as FsDocument;
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  await doc.webkitExitFullscreen?.();
}

export default function ArOverlayNavi({ onExit }: ArOverlayNaviProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const seekingRef = useRef(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayPaused, setOverlayPaused] = useState(false);
  const [overlayError, setOverlayError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [playlistOpen, setPlaylistOpen] = useState(isWideLayout);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [wideLayout, setWideLayout] = useState(isWideLayout);

  const activeItem = AR_PLAYLIST[activeIndex] ?? null;
  const hasOverlay = Boolean(activeItem);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = cameraRef.current;
    if (video) video.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.isSecureContext) {
      setCameraStatus("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      return;
    }

    stopStream();
    setCameraStatus("starting");

    const video = cameraRef.current;
    if (video) {
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }

      streamRef.current = stream;
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch {
          // iPad Safari may wait for a tap; the retry button covers that.
        }
      }
      setCameraStatus("live");
    } catch (error) {
      stopStream();
      setCameraStatus(cameraErrorStatus(error));
    }
  }, [stopStream]);

  useEffect(() => {
    void startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(fullscreenElement()));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWideLayout(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const loaders = AR_PLAYLIST.map((item) => {
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.src = playlistVideoUrl(item);
      const onMeta = () => {
        const next = Number.isFinite(probe.duration) ? probe.duration : 0;
        if (next > 0) {
          setDurations((prev) => (prev[item.id] === next ? prev : { ...prev, [item.id]: next }));
        }
      };
      probe.addEventListener("loadedmetadata", onMeta);
      return { probe, onMeta };
    });
    return () => {
      loaders.forEach(({ probe, onMeta }) => {
        probe.removeEventListener("loadedmetadata", onMeta);
        probe.removeAttribute("src");
        probe.load();
      });
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !activeItem) return;
    prepareOverlayVideo(overlay);
    overlay.src = playlistVideoUrl(activeItem);
    setPlayhead(0);
    setDuration(0);
    setOverlayError(null);
    void overlay
      .play()
      .then(() => setOverlayPaused(false))
      .catch(() => setOverlayPaused(true));
  }, [activeItem]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (overlay) overlay.playbackRate = playbackRate;
  }, [playbackRate, activeItem]);

  useEffect(() => {
    const video = overlayRef.current;
    if (!video || !hasOverlay) return;

    const sync = () => {
      const nextDuration = Number.isFinite(video.duration) ? video.duration : 0;
      setDuration(nextDuration);
      if (activeItem && nextDuration > 0) {
        setDurations((prev) =>
          prev[activeItem.id] === nextDuration ? prev : { ...prev, [activeItem.id]: nextDuration },
        );
      }
      if (!seekingRef.current) {
        setPlayhead(Number.isFinite(video.currentTime) ? video.currentTime : 0);
      }
    };
    const onError = () => setOverlayError(t("ar.videoLoadError"));
    const applyRate = () => {
      video.playbackRate = playbackRate;
      sync();
    };

    video.addEventListener("timeupdate", sync);
    video.addEventListener("loadedmetadata", applyRate);
    video.addEventListener("durationchange", applyRate);
    video.addEventListener("ratechange", sync);
    video.addEventListener("seeked", sync);
    video.addEventListener("error", onError);
    video.playbackRate = playbackRate;
    sync();
    return () => {
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("loadedmetadata", applyRate);
      video.removeEventListener("durationchange", applyRate);
      video.removeEventListener("ratechange", sync);
      video.removeEventListener("seeked", sync);
      video.removeEventListener("error", onError);
    };
  }, [activeItem, hasOverlay, playbackRate, t]);

  const seekTo = useCallback(
    (next: number) => {
      const video = overlayRef.current;
      const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
      const clamped = Math.min(Math.max(next, 0), max);
      setPlayhead(clamped);
      if (video && Number.isFinite(clamped)) video.currentTime = clamped;
    },
    [duration],
  );

  const onSeekInput = (event: ChangeEvent<HTMLInputElement>) => {
    seekingRef.current = true;
    setScrubbing(true);
    seekTo(Number(event.target.value));
  };

  const onSeekEnd = () => {
    seekingRef.current = false;
    setScrubbing(false);
    const video = overlayRef.current;
    if (video && Number.isFinite(video.currentTime)) setPlayhead(video.currentTime);
  };

  const progressPct = duration > 0 ? Math.min(100, (playhead / duration) * 100) : 0;

  const toggleOverlayPlayback = useCallback(async () => {
    const overlay = overlayRef.current;
    if (!overlay || !hasOverlay) return;
    if (overlay.paused) {
      try {
        await overlay.play();
        setOverlayPaused(false);
      } catch {
        setOverlayPaused(true);
      }
      return;
    }
    overlay.pause();
    setOverlayPaused(true);
  }, [hasOverlay]);

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((current) => {
      const next = nextPlaybackRate(current);
      const overlay = overlayRef.current;
      if (overlay) overlay.playbackRate = next;
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current;
    if (!root) return;
    try {
      if (fullscreenElement()) await exitFullscreen();
      else await enterFullscreen(root);
    } catch {
      // iPad Safari may ignore fullscreen without a fresh gesture
    }
  }, []);

  const copyIpadLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_AR_URL);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt(t("ar.copyLink"), PUBLIC_AR_URL);
    }
  }, [t]);

  const cameraMessage =
    cameraStatus === "insecure"
      ? t("ar.cameraInsecure")
      : cameraStatus === "unsupported"
        ? t("ar.cameraUnsupported")
        : cameraStatus === "blocked"
          ? t("ar.cameraBlocked")
          : cameraStatus === "missing"
            ? t("ar.cameraMissing")
            : cameraStatus === "starting"
              ? t("ar.cameraStarting")
              : "";

  const playlistList = (
    <ul className="ar-playlist h-full overflow-y-auto">
      {AR_PLAYLIST.length === 0 ? (
        <li className="px-4 py-3 font-sans text-sm text-white/70">{t("ar.playlistEmpty")}</li>
      ) : (
        AR_PLAYLIST.map((item, index) => {
          const current = index === activeIndex;
          const itemDuration = durations[item.id];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left font-sans ${
                  current ? "bg-white/15" : "hover:bg-white/10"
                }`}
                aria-current={current ? "true" : undefined}
              >
                <span
                  className={`w-6 shrink-0 text-center text-sm tabular-nums ${
                    current ? "text-coral" : "text-white/55"
                  }`}
                >
                  {current && !overlayPaused ? <PlayingBars /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${current ? "font-semibold text-white" : "text-white/90"}`}>
                    {item.title}
                  </span>
                  {current ? (
                    <span className="block text-sm text-coral">{t("ar.playingNow")}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-white/60">
                  {itemDuration ? formatClock(itemDuration) : "--:--"}
                </span>
              </button>
            </li>
          );
        })
      )}
    </ul>
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[90] h-[100dvh] w-full overflow-hidden bg-black text-white"
    >
      <video
        ref={cameraRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        aria-label={t("ar.cameraLabel")}
      />
      {cameraStatus !== "live" ? (
        <div className="absolute inset-0 z-0 bg-stone-950" aria-hidden />
      ) : null}

      <video
        ref={overlayRef}
        className={`pointer-events-none absolute inset-0 z-[1] h-full w-full bg-transparent object-contain ${
          hasOverlay ? "visible" : "invisible"
        }`}
        muted
        loop
        playsInline
        autoPlay
        disablePictureInPicture
        controls={false}
        aria-hidden={!hasOverlay}
        aria-label={t("ar.overlayLabel")}
      />

      <header className={`absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pb-6 ${wideLayout && playlistOpen ? "lg:pr-[min(22rem,34vw)]" : ""}`}>
        <BackButton onClick={onExit} tone="dark" className="text-white hover:bg-white/10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-base font-semibold text-white">{t("ar.title")}</p>
          <p className="truncate font-sans text-sm text-white/70">
            {activeItem?.title ?? t("ar.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copyIpadLink()}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-white/55 hover:text-white"
          {...iconTip(linkCopied ? t("ar.linkCopied") : t("ar.copyLink"), "below")}
        >
          {linkCopied ? <CheckFillIcon className="h-5 w-5" /> : <CopyFillIcon className="h-5 w-5" />}
        </button>
      </header>

      {cameraStatus !== "live" ? (
        <div className={`absolute inset-x-0 top-24 z-10 mx-auto max-w-md px-6 text-center ${wideLayout && playlistOpen ? "lg:mr-[min(22rem,34vw)]" : ""}`}>
          <p className="font-sans text-base text-white/90">{cameraMessage}</p>
          {cameraStatus !== "starting" ? (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="pointer-events-auto mt-4 rounded-xl bg-coral px-5 py-2.5 font-sans text-base font-semibold text-white hover:bg-white hover:text-gray-900"
            >
              {t("ar.enableCamera")}
            </button>
          ) : null}
        </div>
      ) : null}

      {wideLayout && playlistOpen ? (
        <aside className="absolute bottom-[5.75rem] right-3 top-[4.75rem] z-10 hidden w-[min(20rem,32vw)] overflow-hidden rounded-xl border border-white/10 bg-black/65 backdrop-blur-sm lg:block">
          {playlistList}
        </aside>
      ) : null}

      <div className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 sm:px-4 ${wideLayout && playlistOpen ? "lg:pr-[min(22rem,34vw)]" : ""}`}>
        {overlayError ? (
          <p className="mb-3 font-sans text-sm text-coral">{overlayError}</p>
        ) : null}

        {hasOverlay ? (
          <div className="relative mb-1">
            {scrubbing ? (
              <div
                className="ar-seek-tooltip pointer-events-none absolute -top-8 z-10 -translate-x-1/2 rounded bg-black/90 px-2 py-1 font-sans text-sm tabular-nums text-white"
                style={{ left: `${progressPct}%` }}
              >
                {formatClock(playhead)}
              </div>
            ) : null}
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 1}
              step={0.05}
              value={Math.min(playhead, duration > 0 ? duration : 1)}
              disabled={duration <= 0}
              onChange={onSeekInput}
              onPointerDown={() => {
                seekingRef.current = true;
                setScrubbing(true);
              }}
              onPointerUp={onSeekEnd}
              onPointerCancel={onSeekEnd}
              onTouchEnd={onSeekEnd}
              className="ar-seek-slider w-full"
              style={{
                ["--progress" as string]: `${progressPct}%`,
              }}
              aria-valuemin={0}
              aria-valuemax={duration > 0 ? duration : 0}
              aria-valuenow={playhead}
              aria-valuetext={`${formatClock(playhead)} / ${formatClock(duration)}`}
              aria-label={t("ar.seek")}
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void toggleOverlayPlayback()}
            disabled={!hasOverlay}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 disabled:opacity-40"
            {...iconTip(overlayPaused ? t("ar.playVideo") : t("ar.pauseVideo"))}
          >
            {overlayPaused ? <PlayFillIcon className="h-5 w-5" /> : <PauseFillIcon className="h-5 w-5" />}
          </button>
          {hasOverlay ? (
            <p className="shrink-0 font-sans text-sm tabular-nums text-white" aria-live="off">
              {formatClock(playhead)}
              <span className="text-white/55"> / {formatClock(duration)}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            disabled={!hasOverlay}
            className="h-11 shrink-0 rounded-full bg-white/15 px-3 font-sans text-sm font-semibold tabular-nums text-white hover:bg-white hover:text-gray-900 disabled:opacity-40"
            {...iconTip(t("ar.playbackRate", { rate: formatPlaybackRate(playbackRate) }))}
          >
            {formatPlaybackRate(playbackRate)}
          </button>
          <button
            type="button"
            onClick={() => setPlaylistOpen((open) => !open)}
            className="min-w-0 flex-1 rounded-xl bg-white/15 px-3 py-2 text-left hover:bg-white/25 sm:px-4 sm:py-2.5"
            aria-expanded={playlistOpen}
          >
            <p className="truncate font-sans text-sm font-semibold text-white">
              {t("ar.playlist")} · {AR_PLAYLIST.length}
            </p>
            <p className="truncate font-sans text-sm text-white/70">
              {activeItem
                ? t("ar.nowPlaying", { n: activeIndex + 1, title: activeItem.title })
                : t("ar.playlistEmpty")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white hover:text-gray-900"
            {...iconTip(isFullscreen ? t("ar.exitFullscreen") : t("ar.fullscreen"))}
          >
            {isFullscreen ? <CollapseFillIcon className="h-5 w-5" /> : <ExpandFillIcon className="h-5 w-5" />}
          </button>
        </div>

        {!wideLayout && playlistOpen ? (
          <div className="mt-3 max-h-[min(40vh,16rem)] overflow-hidden rounded-xl bg-black/55 lg:hidden">
            {playlistList}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PlayingBars() {
  return (
    <span className="ar-playing-bars mx-auto flex h-3.5 w-3.5 items-end justify-between" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}
