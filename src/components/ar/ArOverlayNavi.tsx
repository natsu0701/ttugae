import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  AR_PLAYLIST,
  canPlayWebmVp9Alpha,
  formatClock,
  playlistClipDuration,
  playlistFallbackUrl,
  playlistVideoUrl,
} from "../../data/arPlaylist.ts";
import { PUBLIC_AR_URL } from "../../utils/appPath.ts";
import {
  CheckFillIcon,
  ChevronRightFillIcon,
  CollapseFillIcon,
  CopyFillIcon,
  ExpandFillIcon,
  EyeFillIcon,
  EyeOffFillIcon,
  PauseFillIcon,
  PlayFillIcon,
  PlaylistFillIcon,
  RepeatLoopFillIcon,
  RepeatNextFillIcon,
  RepeatOnceFillIcon,
} from "../icons/FillIcons.tsx";
import BackButton from "../ui/BackButton.tsx";
import { iconTip } from "../../utils/iconTip.ts";

export type ArOverlayNaviProps = {
  onExit: () => void;
};

type CameraStatus = "starting" | "live" | "blocked" | "missing" | "insecure" | "unsupported";

const PLAYBACK_RATES = [0.2, 0.5, 1, 1.5, 2] as const;
type PlaybackRate = (typeof PLAYBACK_RATES)[number];

const REPEAT_MODES = ["once", "loop", "next"] as const;
type RepeatMode = (typeof REPEAT_MODES)[number];

function formatPlaybackRate(rate: number): string {
  const matched = PLAYBACK_RATES.find((item) => Math.abs(item - rate) < 0.001) ?? rate;
  return `${matched}X`;
}

function nextPlaybackRate(rate: number): PlaybackRate {
  const index = PLAYBACK_RATES.findIndex((item) => Math.abs(item - rate) < 0.001);
  return PLAYBACK_RATES[(index < 0 ? 0 : index + 1) % PLAYBACK_RATES.length];
}

function nextRepeatMode(mode: RepeatMode): RepeatMode {
  return REPEAT_MODES[(REPEAT_MODES.indexOf(mode) + 1) % REPEAT_MODES.length];
}

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void;
  webkitRequestFullScreen?: (options?: FullscreenOptions) => Promise<void> | void;
};

const FS_OPTIONS: FullscreenOptions = { navigationUI: "hide" };

const CONTROL_BTN =
  "flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center";

function cameraErrorStatus(error: unknown): CameraStatus {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name?: string }).name)
      : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "blocked";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "missing";
  return "missing";
}

function prefersRearCamera(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iP(ad|hone|od)/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

async function openCameraStream(): Promise<MediaStream> {
  const rear = prefersRearCamera();
  const attempts: MediaStreamConstraints[] = rear
    ? [
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        { audio: false, video: { facingMode: { ideal: "user" } } },
        { audio: false, video: true },
      ]
    : [
        { audio: false, video: true },
        { audio: false, video: { facingMode: { ideal: "user" } } },
      ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
      const name =
        error && typeof error === "object" && "name" in error
          ? String((error as { name?: string }).name)
          : "";
      if (name === "NotAllowedError" || name === "SecurityError") throw error;
    }
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === "videoinput" && device.deviceId);
  for (const camera of cameras) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: { exact: camera.deviceId } },
      });
    } catch (error) {
      lastError = error;
      const name =
        error && typeof error === "object" && "name" in error
          ? String((error as { name?: string }).name)
          : "";
      if (name === "NotAllowedError" || name === "SecurityError") throw error;
    }
  }

  throw lastError ?? new DOMException("No camera", "NotFoundError");
}

function prepareOverlayVideo(video: HTMLVideoElement) {
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = true;
  video.playsInline = true;
  video.loop = false;
  video.autoplay = true;
}

function syncOverlayCanvasSize(canvas: HTMLCanvasElement) {
  const host = canvas.parentElement;
  const cssW = Math.max(1, host?.clientWidth || window.innerWidth);
  const cssH = Math.max(1, host?.clientHeight || window.innerHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextW = Math.floor(cssW * dpr);
  const nextH = Math.floor(cssH * dpr);
  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW;
    canvas.height = nextH;
  }
}

function drawCoverBottom(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
) {
  const dstW = ctx.canvas.width;
  const dstH = ctx.canvas.height;
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) return;
  const scale = Math.max(dstW / srcW, dstH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const dx = (dstW - drawW) / 2;
  const dy = dstH - drawH;
  ctx.clearRect(0, 0, dstW, dstH);
  ctx.drawImage(source, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
}

function readDeviceAngle(): 0 | 90 | 180 | 270 {
  const so = window.screen?.orientation;
  if (so && Number.isFinite(so.angle)) {
    const angle = ((Math.round(so.angle / 90) * 90) % 360 + 360) % 360;
    if (angle === 90 || angle === 180 || angle === 270) return angle;
    return 0;
  }
  const legacy = (window as Window & { orientation?: number }).orientation;
  if (legacy === 90) return 90;
  if (legacy === -90) return 270;
  if (legacy === 180 || legacy === -180) return 180;
  return 0;
}

function unlockScreenOrientation() {
  try {
    window.screen?.orientation?.unlock?.();
  } catch {
    // iOS Safari throws when orientation lock is unavailable.
  }
}

function layoutArStage(root: HTMLDivElement) {
  const vv = window.visualViewport;
  const vw = Math.max(1, vv?.width ?? window.innerWidth);
  const vh = Math.max(1, vv?.height ?? window.innerHeight);
  const offsetTop = vv?.offsetTop ?? 0;
  const offsetLeft = vv?.offsetLeft ?? 0;
  const angle = readDeviceAngle();
  const pageLandscape = vw >= vh;
  const deviceLandscape = angle === 90 || angle === 270;

  root.style.right = "auto";
  root.style.bottom = "auto";
  root.style.transformOrigin = "center center";

  if (deviceLandscape && !pageLandscape) {
    const rotate = angle === 270 ? -90 : 90;
    root.style.width = `${vh}px`;
    root.style.height = `${vw}px`;
    root.style.left = `${offsetLeft + (vw - vh) / 2}px`;
    root.style.top = `${offsetTop + (vh - vw) / 2}px`;
    root.style.transform = `rotate(${rotate}deg)`;
    return;
  }

  if (angle === 180 && !pageLandscape) {
    root.style.width = `${vw}px`;
    root.style.height = `${vh}px`;
    root.style.left = `${offsetLeft}px`;
    root.style.top = `${offsetTop}px`;
    root.style.transform = "rotate(180deg)";
    return;
  }

  root.style.width = `${vw}px`;
  root.style.height = `${vh}px`;
  root.style.left = `${offsetLeft}px`;
  root.style.top = `${offsetTop}px`;
  root.style.transform = "none";
}

function fullscreenElement(): Element | null {
  const doc = document as FsDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function nativeFullscreenAvailable(): boolean {
  const doc = document as FsDocument;
  if (typeof document.fullscreenEnabled === "boolean") return document.fullscreenEnabled;
  if (typeof doc.webkitFullscreenEnabled === "boolean") return doc.webkitFullscreenEnabled;
  const probe = document.documentElement as FsElement;
  return typeof probe.requestFullscreen === "function" || typeof probe.webkitRequestFullscreen === "function";
}

function requestNativeFullscreen(el: HTMLElement): Promise<boolean> {
  const node = el as FsElement;
  const html = document.documentElement as FsElement;
  const invoke = (target: FsElement): Promise<boolean> | null => {
    const fn =
      (typeof target.requestFullscreen === "function" && target.requestFullscreen) ||
      (typeof target.webkitRequestFullscreen === "function" && target.webkitRequestFullscreen) ||
      (typeof target.webkitRequestFullScreen === "function" && target.webkitRequestFullScreen) ||
      null;
    if (!fn) return null;
    try {
      let result: Promise<void> | void;
      try {
        result = fn.call(target, FS_OPTIONS);
      } catch {
        result = fn.call(target);
      }
      return Promise.resolve(result)
        .then(() => Boolean(fullscreenElement()))
        .catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  };
  return invoke(node) ?? invoke(html) ?? Promise.resolve(false);
}

async function exitNativeFullscreen() {
  if (!fullscreenElement()) return;
  const doc = document as FsDocument;
  try {
    if (typeof document.exitFullscreen === "function") {
      await document.exitFullscreen();
      return;
    }
  } catch {
    // fall through to webkit
  }
  try {
    await doc.webkitExitFullscreen?.();
  } catch {
    // iPhone Safari has no element fullscreen; CSS immersive still closes
  }
}

export default function ArOverlayNavi({ onExit }: ArOverlayNaviProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const seekingRef = useRef(false);
  const endedHandledRef = useRef(false);
  const imageClockRef = useRef({ origin: 0, startedAt: 0 });
  const playheadRef = useRef(0);
  const durationRef = useRef(0);
  const repeatModeRef = useRef<RepeatMode>("loop");
  const activeIndexRef = useRef(0);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayPaused, setOverlayPaused] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("loop");
  const [imgEpoch, setImgEpoch] = useState(0);
  const [overlayError, setOverlayError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [overlayOn, setOverlayOn] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [opacityScrubbing, setOpacityScrubbing] = useState(false);
  const chromeTimerRef = useRef<number | null>(null);
  const lastOpacityRef = useRef(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playlistPanelRef = useRef<HTMLElement>(null);
  const [webmOk] = useState(() => canPlayWebmVp9Alpha());

  const activeItem = AR_PLAYLIST[activeIndex] ?? null;
  const hasOverlay = Boolean(activeItem);
  const useImageFallback = Boolean(activeItem?.fallbackSrc) && !webmOk;
  const fallbackUrl = activeItem ? playlistFallbackUrl(activeItem) : null;
  const isFullscreen = nativeFullscreen || cssFullscreen;

  useEffect(() => {
    playheadRef.current = playhead;
  }, [playhead]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

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
      const stream = await openCameraStream();
      streamRef.current = stream;
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch {
          // Autoplay can wait for a tap; the preview still attaches.
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
    const onFs = () => {
      const native = Boolean(fullscreenElement());
      setNativeFullscreen(native);
      if (native) setCssFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const timers: number[] = [];
    const syncViewport = () => {
      if (!root) return;
      layoutArStage(root);
    };
    const syncAfterTurn = () => {
      syncViewport();
      timers.push(window.setTimeout(syncViewport, 60));
      timers.push(window.setTimeout(syncViewport, 280));
    };

    unlockScreenOrientation();
    syncViewport();
    window.visualViewport?.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncAfterTurn);
    window.screen?.orientation?.addEventListener?.("change", syncAfterTurn);
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      window.visualViewport?.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncAfterTurn);
      window.screen?.orientation?.removeEventListener?.("change", syncAfterTurn);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (!cssFullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCssFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cssFullscreen]);

  const revealChrome = useCallback((hold = false) => {
    setChromeVisible(true);
    if (chromeTimerRef.current) {
      window.clearTimeout(chromeTimerRef.current);
      chromeTimerRef.current = null;
    }
    if (hold || !isFullscreen) return;
    chromeTimerRef.current = window.setTimeout(() => {
      setChromeVisible(false);
      chromeTimerRef.current = null;
    }, 2600);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      setChromeVisible(true);
      if (chromeTimerRef.current) {
        window.clearTimeout(chromeTimerRef.current);
        chromeTimerRef.current = null;
      }
      return;
    }
    revealChrome(playlistOpen || scrubbing || opacityScrubbing);
    return () => {
      if (chromeTimerRef.current) {
        window.clearTimeout(chromeTimerRef.current);
        chromeTimerRef.current = null;
      }
    };
  }, [isFullscreen, playlistOpen, scrubbing, opacityScrubbing, revealChrome]);

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

  const restartClipClock = useCallback(() => {
    imageClockRef.current.origin = 0;
    imageClockRef.current.startedAt = performance.now();
    playheadRef.current = 0;
    setPlayhead(0);
    setImgEpoch((n) => n + 1);
  }, []);

  const handleOverlayEnded = useCallback(() => {
    if (endedHandledRef.current) return;
    endedHandledRef.current = true;
    const mode = repeatModeRef.current;
    const video = overlayRef.current;

    if (mode === "loop") {
      if (video) {
        video.currentTime = 0;
        void video.play().then(() => setOverlayPaused(false)).catch(() => setOverlayPaused(true));
      } else {
        setOverlayPaused(false);
      }
      restartClipClock();
      return;
    }

    if (mode === "next") {
      const current = activeIndexRef.current;
      const next = AR_PLAYLIST.length === 0 ? current : (current + 1) % AR_PLAYLIST.length;
      if (next === current) {
        restartClipClock();
        if (video) {
          video.currentTime = 0;
          void video.play().then(() => setOverlayPaused(false)).catch(() => setOverlayPaused(true));
        } else {
          setOverlayPaused(false);
        }
        return;
      }
      setActiveIndex(next);
      return;
    }

    const max = durationRef.current;
    playheadRef.current = max;
    imageClockRef.current.origin = max;
    setPlayhead(max);
    setOverlayPaused(true);
    if (video) video.pause();
  }, [restartClipClock]);

  useEffect(() => {
    if (!activeItem) return;
    endedHandledRef.current = false;
    const clipDuration = playlistClipDuration(activeItem);
    restartClipClock();
    setDuration(clipDuration);
    setOverlayPaused(false);
    setOverlayError(null);
    setDurations((prev) => (prev[activeItem.id] === clipDuration ? prev : { ...prev, [activeItem.id]: clipDuration }));
    if (useImageFallback) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    prepareOverlayVideo(overlay);
    overlay.src = playlistVideoUrl(activeItem);
    overlay.loop = false;
    void overlay
      .play()
      .then(() => setOverlayPaused(false))
      .catch(() => setOverlayPaused(true));
  }, [activeItem, restartClipClock, useImageFallback]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (overlay) overlay.playbackRate = playbackRate;
  }, [playbackRate, activeItem]);

  useEffect(() => {
    const video = overlayRef.current;
    if (!video || !hasOverlay) return;

    const sync = () => {
      const nextDuration = Number.isFinite(video.duration) ? video.duration : 0;
      if (nextDuration > 0) {
        setDuration(nextDuration);
        if (activeItem) {
          setDurations((prev) =>
            prev[activeItem.id] === nextDuration ? prev : { ...prev, [activeItem.id]: nextDuration },
          );
        }
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

    const onEnded = () => handleOverlayEnded();

    video.addEventListener("timeupdate", sync);
    video.addEventListener("loadedmetadata", applyRate);
    video.addEventListener("durationchange", applyRate);
    video.addEventListener("ratechange", sync);
    video.addEventListener("seeked", sync);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.playbackRate = playbackRate;
    video.loop = false;
    sync();
    return () => {
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("loadedmetadata", applyRate);
      video.removeEventListener("durationchange", applyRate);
      video.removeEventListener("ratechange", sync);
      video.removeEventListener("seeked", sync);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [activeItem, handleOverlayEnded, hasOverlay, playbackRate, t]);

  useEffect(() => {
    if (!useImageFallback || overlayPaused) return;
    imageClockRef.current.origin = playheadRef.current;
    imageClockRef.current.startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (seekingRef.current) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      const { origin, startedAt } = imageClockRef.current;
      const elapsed = ((now - startedAt) / 1000) * playbackRate;
      const next = origin + elapsed;
      const max = durationRef.current;
      if (max > 0 && next < max - 0.2) endedHandledRef.current = false;
      if (max > 0 && next >= max) {
        handleOverlayEnded();
        return;
      }
      playheadRef.current = next;
      setPlayhead(next);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [handleOverlayEnded, overlayPaused, playbackRate, useImageFallback, activeItem, imgEpoch]);

  useEffect(() => {
    if (useImageFallback) return;
    const video = overlayRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let frame = 0;
    const publishPlayhead = (time: number) => {
      if (seekingRef.current || !Number.isFinite(time)) return;
      if (Math.abs(time - playheadRef.current) < 0.04) return;
      playheadRef.current = time;
      setPlayhead(time);
    };
    const draw = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width > 0 && height > 0) {
        syncOverlayCanvasSize(canvas);
        drawCoverBottom(ctx, video, width, height);
      }
      const time = video.currentTime;
      const max = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : durationRef.current;
      if (max > 0 && time < max - 0.2) endedHandledRef.current = false;
      if (!video.paused && max > 0 && (video.ended || time >= max - 0.04)) {
        handleOverlayEnded();
      } else {
        publishPlayhead(time);
      }
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [activeItem, handleOverlayEnded, useImageFallback]);

  const seekTo = useCallback(
    (next: number) => {
      const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
      const clamped = Math.min(Math.max(next, 0), max);
      endedHandledRef.current = clamped >= max - 0.04;
      playheadRef.current = clamped;
      imageClockRef.current.origin = clamped;
      imageClockRef.current.startedAt = performance.now();
      setPlayhead(clamped);
      if (useImageFallback) {
        if (clamped <= 0.05) setImgEpoch((n) => n + 1);
        return;
      }
      const video = overlayRef.current;
      if (video && Number.isFinite(clamped)) video.currentTime = clamped;
    },
    [duration, useImageFallback],
  );

  const onSeekInput = (event: ChangeEvent<HTMLInputElement>) => {
    seekingRef.current = true;
    setScrubbing(true);
    seekTo(Number(event.target.value));
  };

  const onSeekEnd = () => {
    seekingRef.current = false;
    setScrubbing(false);
    if (useImageFallback) {
      imageClockRef.current.origin = playheadRef.current;
      imageClockRef.current.startedAt = performance.now();
      return;
    }
    const video = overlayRef.current;
    if (video && Number.isFinite(video.currentTime)) {
      playheadRef.current = video.currentTime;
      setPlayhead(video.currentTime);
    }
  };

  const progressPct = duration > 0 ? Math.min(100, (playhead / duration) * 100) : 0;

  const toggleOverlayPlayback = useCallback(async () => {
    if (!hasOverlay) return;
    const nearEnd = durationRef.current > 0 && playheadRef.current >= durationRef.current - 0.05;

    if (useImageFallback) {
      if (overlayPaused) {
        if (nearEnd) restartClipClock();
        else {
          imageClockRef.current.origin = playheadRef.current;
          imageClockRef.current.startedAt = performance.now();
        }
        setOverlayPaused(false);
        return;
      }
      imageClockRef.current.origin = playheadRef.current;
      setOverlayPaused(true);
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;
    if (overlay.paused) {
      try {
        if (overlay.ended || nearEnd) overlay.currentTime = 0;
        await overlay.play();
        setOverlayPaused(false);
      } catch {
        setOverlayPaused(true);
      }
      return;
    }
    overlay.pause();
    setOverlayPaused(true);
  }, [hasOverlay, overlayPaused, restartClipClock, useImageFallback]);

  const overlayVisible = hasOverlay && overlayOn && overlayOpacity > 0;
  const overlayAlpha = overlayVisible ? overlayOpacity / 100 : 0;

  const toggleOverlayVisible = useCallback(() => {
    setOverlayOn((on) => {
      if (on) {
        if (overlayOpacity > 0) lastOpacityRef.current = overlayOpacity;
        return false;
      }
      if (overlayOpacity <= 0) setOverlayOpacity(lastOpacityRef.current || 50);
      return true;
    });
  }, [overlayOpacity]);

  const onOpacityInput = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(100, Math.max(0, Number(event.target.value)));
    setOpacityScrubbing(true);
    setOverlayOpacity(next);
    setOverlayOn(next > 0);
  };

  const onOpacityStart = () => {
    setOpacityScrubbing(true);
    if (overlayOpacity > 0) lastOpacityRef.current = overlayOpacity;
  };

  const onOpacityEnd = () => {
    setOpacityScrubbing(false);
    if (overlayOpacity > 0) lastOpacityRef.current = overlayOpacity;
  };

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((current) => {
      const next = nextPlaybackRate(current);
      const overlay = overlayRef.current;
      if (overlay) overlay.playbackRate = next;
      imageClockRef.current.origin = playheadRef.current;
      imageClockRef.current.startedAt = performance.now();
      return next;
    });
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((current) => nextRepeatMode(current));
  }, []);

  const closePlaylist = useCallback(() => setPlaylistOpen(false), []);

  useEffect(() => {
    if (!playlistOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (playlistPanelRef.current?.contains(target)) return;
      if (target.closest("[data-ar-playlist-toggle]")) return;
      setPlaylistOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [playlistOpen]);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    if (fullscreenElement() || cssFullscreen) {
      void exitNativeFullscreen();
      setCssFullscreen(false);
      return;
    }

    setPlaylistOpen(false);
    if (!nativeFullscreenAvailable()) {
      setCssFullscreen(true);
      return;
    }
    const fallback = window.setTimeout(() => {
      if (!fullscreenElement()) setCssFullscreen(true);
    }, 350);
    void requestNativeFullscreen(root).then((ok) => {
      window.clearTimeout(fallback);
      if (!ok && !fullscreenElement()) setCssFullscreen(true);
    });
  }, [cssFullscreen]);

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
    <ul className="ar-playlist min-h-0 flex-1 overflow-y-auto">
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
                className={`flex min-h-11 w-full touch-manipulation items-center gap-3 px-3 py-2.5 text-left font-sans ${
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
                    {t(item.titleKey)}
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
      id="main-content"
      tabIndex={-1}
      className="fixed inset-0 z-[90] h-[100dvh] w-full overflow-hidden bg-black text-white"
      data-ar-fullscreen={isFullscreen ? "true" : "false"}
    >
      <video
        ref={cameraRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
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

      <div
        className={`ar-overlay-film ${hasOverlay ? "visible" : "invisible"}`}
        style={{ opacity: overlayAlpha }}
      >
        {useImageFallback && fallbackUrl ? (
          <img
            key={`${activeItem?.id ?? "overlay"}-${imgEpoch}`}
            src={fallbackUrl}
            alt={t("ar.overlayLabel")}
            aria-hidden={!overlayVisible}
          />
        ) : (
          <>
            <video
              ref={overlayRef}
              className="ar-overlay-decode"
              muted
              playsInline
              autoPlay
              disablePictureInPicture
              controls={false}
              aria-hidden
            />
            <canvas ref={canvasRef} aria-hidden={!overlayVisible} aria-label={t("ar.overlayLabel")} />
          </>
        )}
      </div>

      {isFullscreen ? (
        <button
          type="button"
          className="absolute inset-0 z-[2] cursor-default"
          tabIndex={-1}
          aria-hidden
          onClick={() => setChromeVisible((visible) => !visible)}
        />
      ) : null}

      <header className={`ar-chrome pointer-events-auto absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pb-6 ${chromeVisible ? "" : "ar-chrome-hidden"}`}>
        <BackButton onClick={onExit} tone="dark" className="!h-11 !w-11 text-white hover:bg-white/10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-base font-semibold text-white">{t("ar.title")}</p>
          <p className="truncate font-sans text-sm text-white/70">
            {activeItem ? t(activeItem.titleKey) : t("ar.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copyIpadLink()}
          className={`${CONTROL_BTN} text-white hover:bg-white/10 ${isFullscreen ? "hidden sm:flex" : "flex"}`}
          {...iconTip(linkCopied ? t("ar.linkCopied") : t("ar.copyLink"), "below")}
        >
          {linkCopied ? <CheckFillIcon className="h-5 w-5" /> : <CopyFillIcon className="h-5 w-5" />}
        </button>
      </header>

      {isFullscreen && !chromeVisible ? (
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`${CONTROL_BTN} pointer-events-auto absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 rounded-full bg-black/55 text-white hover:bg-white hover:text-gray-900`}
          {...iconTip(t("ar.exitFullscreen"), "below")}
        >
          <CollapseFillIcon className="h-6 w-6" />
        </button>
      ) : null}

      {cameraStatus !== "live" ? (
        <div className={`ar-chrome pointer-events-auto absolute inset-x-0 top-24 z-10 mx-auto max-w-md px-6 text-center ${chromeVisible ? "" : "ar-chrome-hidden"}`}>
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

      {playlistOpen ? (
        <aside
          ref={playlistPanelRef}
          className={`ar-chrome ar-playlist-panel ${chromeVisible ? "" : "ar-chrome-hidden"}`}
        >
          <div className="flex h-11 shrink-0 items-center justify-end border-b border-white/10 px-1">
            <button
              type="button"
              onClick={closePlaylist}
              className={`${CONTROL_BTN} rounded-full text-white hover:bg-white hover:text-gray-900`}
              {...iconTip(t("ar.playlistCollapse"))}
            >
              <ChevronRightFillIcon className="h-6 w-6" />
            </button>
          </div>
          {playlistList}
        </aside>
      ) : null}

      <div className={`ar-chrome pointer-events-auto absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-3 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-8 sm:px-4 ${chromeVisible ? "" : "ar-chrome-hidden"}`}>
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

        <div className="mb-2 flex h-11 items-center gap-1 rounded-xl bg-white/10 px-1">
          <button
            type="button"
            onClick={toggleOverlayVisible}
            disabled={!hasOverlay}
            className={`${CONTROL_BTN} rounded-full disabled:opacity-40 ${
              overlayVisible ? "bg-white text-gray-900" : "text-white hover:bg-white/15"
            }`}
            aria-pressed={overlayVisible}
            {...iconTip(overlayVisible ? t("ar.overlayHide") : t("ar.overlayShow"))}
          >
            {overlayVisible ? <EyeFillIcon className="h-6 w-6" /> : <EyeOffFillIcon className="h-6 w-6" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={overlayVisible ? overlayOpacity : 0}
            disabled={!hasOverlay}
            onChange={onOpacityInput}
            onPointerDown={onOpacityStart}
            onPointerUp={onOpacityEnd}
            onPointerCancel={onOpacityEnd}
            onTouchEnd={onOpacityEnd}
            className="ar-opacity-slider min-w-0 flex-1"
            style={{
              ["--progress" as string]: `${overlayVisible ? overlayOpacity : 0}%`,
            }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={overlayVisible ? overlayOpacity : 0}
            aria-label={t("ar.overlayOpacity", { percent: overlayVisible ? overlayOpacity : 0 })}
          />
          <span className="w-12 shrink-0 pr-1.5 text-right font-sans text-sm tabular-nums text-white/90">
            {overlayVisible ? `${overlayOpacity}%` : t("ar.overlayOff")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => void toggleOverlayPlayback()}
            disabled={!hasOverlay}
            className={`${CONTROL_BTN} rounded-full bg-white text-gray-900 disabled:opacity-40`}
            {...iconTip(overlayPaused ? t("ar.playVideo") : t("ar.pauseVideo"))}
          >
            {overlayPaused ? <PlayFillIcon className="h-6 w-6" /> : <PauseFillIcon className="h-6 w-6" />}
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
            className="h-11 min-w-[2.75rem] shrink-0 touch-manipulation rounded-xl bg-white/15 px-2.5 font-sans text-sm font-semibold tabular-nums text-white hover:bg-white hover:text-gray-900 disabled:opacity-40 sm:px-3"
            {...iconTip(t("ar.playbackRate", { rate: formatPlaybackRate(playbackRate) }))}
          >
            {formatPlaybackRate(playbackRate)}
          </button>
          <button
            type="button"
            data-ar-playlist-toggle
            onClick={() => setPlaylistOpen((open) => !open)}
            className="hidden min-w-0 flex-1 touch-manipulation items-center rounded-xl bg-white/15 px-4 text-left hover:bg-white/25 sm:flex sm:h-11"
            aria-expanded={playlistOpen}
          >
            <span className="truncate font-sans text-sm font-semibold text-white">
              {t("ar.playlist")} · {AR_PLAYLIST.length}
              {activeItem ? ` · ${t(activeItem.titleKey)}` : ""}
            </span>
          </button>
          <button
            type="button"
            data-ar-playlist-toggle
            onClick={() => setPlaylistOpen((open) => !open)}
            className={`${CONTROL_BTN} rounded-full bg-white/15 text-white hover:bg-white hover:text-gray-900 sm:hidden`}
            aria-expanded={playlistOpen}
            {...iconTip(t("ar.playlist"))}
          >
            <PlaylistFillIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={cycleRepeatMode}
            disabled={!hasOverlay}
            className={`${CONTROL_BTN} ml-auto rounded-full hover:bg-white hover:text-gray-900 disabled:opacity-40 ${
              repeatMode === "once" ? "bg-white/15 text-white" : "bg-white text-gray-900"
            }`}
            {...iconTip(
              repeatMode === "once"
                ? t("ar.repeatOnce")
                : repeatMode === "loop"
                  ? t("ar.repeatLoop")
                  : t("ar.repeatNext"),
            )}
          >
            {repeatMode === "once" ? (
              <RepeatOnceFillIcon className="h-6 w-6" />
            ) : repeatMode === "loop" ? (
              <RepeatLoopFillIcon className="h-6 w-6" />
            ) : (
              <RepeatNextFillIcon className="h-6 w-6" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`${CONTROL_BTN} relative z-20 rounded-full hover:bg-white hover:text-gray-900 ${
              isFullscreen ? "bg-white text-gray-900" : "bg-white/15 text-white"
            }`}
            aria-pressed={isFullscreen}
            {...iconTip(isFullscreen ? t("ar.exitFullscreen") : t("ar.fullscreen"))}
          >
            {isFullscreen ? <CollapseFillIcon className="h-6 w-6" /> : <ExpandFillIcon className="h-6 w-6" />}
          </button>
        </div>
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
