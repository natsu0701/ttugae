import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  clearOverlayVideo,
  isOverlayVideoFile,
  loadOverlayVideo,
  saveOverlayVideo,
} from "../../utils/arOverlayVideo.ts";
import { PUBLIC_AR_URL } from "../../utils/appPath.ts";
import BackButton from "../ui/BackButton.tsx";

export type ArOverlayNaviProps = {
  onExit: () => void;
};

type CameraStatus = "starting" | "live" | "blocked" | "missing" | "insecure" | "unsupported";

const DEFAULT_OPACITY = 1;

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

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

export default function ArOverlayNavi({ onExit }: ArOverlayNaviProps) {
  const { t } = useTranslation();
  const cameraRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayUrlRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OPACITY);
  const [overlayName, setOverlayName] = useState<string | null>(null);
  const [hasOverlay, setHasOverlay] = useState(false);
  const [overlayPaused, setOverlayPaused] = useState(false);
  const [overlayError, setOverlayError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekingRef = useRef(false);

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

  const attachOverlay = useCallback(async (file: File) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (overlayUrlRef.current) {
      URL.revokeObjectURL(overlayUrlRef.current);
      overlayUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    overlayUrlRef.current = url;
    prepareOverlayVideo(overlay);
    overlay.src = url;
    try {
      await overlay.play();
      setOverlayPaused(false);
      setOverlayError(null);
    } catch {
      setOverlayPaused(true);
    }
    setPlayhead(0);
    setDuration(Number.isFinite(overlay.duration) ? overlay.duration : 0);
    setHasOverlay(true);
    setOverlayName(file.name);
  }, []);

  const applyOverlayFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      if (!isOverlayVideoFile(file)) {
        setOverlayError(t("ar.videoTypeError"));
        return;
      }
      try {
        await saveOverlayVideo(file);
      } catch {
        // still play even if storage is full
      }
      await attachOverlay(file);
    },
    [attachOverlay, t],
  );

  useEffect(() => {
    let cancelled = false;
    void loadOverlayVideo().then((stored) => {
      if (cancelled || !stored) return;
      const file = new File([stored.blob], stored.name || "overlay.webm", {
        type: stored.type || stored.blob.type || "video/webm",
      });
      void attachOverlay(file);
    });
    return () => {
      cancelled = true;
      if (overlayUrlRef.current) {
        URL.revokeObjectURL(overlayUrlRef.current);
        overlayUrlRef.current = null;
      }
    };
  }, [attachOverlay]);

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    void applyOverlayFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void applyOverlayFile(event.dataTransfer.files?.[0]);
  };

  const removeOverlay = useCallback(async () => {
    const overlay = overlayRef.current;
    overlay?.pause();
    overlay?.removeAttribute("src");
    overlay?.load();
    if (overlayUrlRef.current) {
      URL.revokeObjectURL(overlayUrlRef.current);
      overlayUrlRef.current = null;
    }
    setHasOverlay(false);
    setOverlayName(null);
    setOverlayPaused(false);
    setOverlayError(null);
    setPlayhead(0);
    setDuration(0);
    await clearOverlayVideo();
  }, []);

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

  useEffect(() => {
    const video = overlayRef.current;
    if (!video || !hasOverlay) return;

    const sync = () => {
      const nextDuration = Number.isFinite(video.duration) ? video.duration : 0;
      setDuration(nextDuration);
      if (!seekingRef.current) {
        setPlayhead(Number.isFinite(video.currentTime) ? video.currentTime : 0);
      }
    };

    video.addEventListener("timeupdate", sync);
    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("durationchange", sync);
    video.addEventListener("seeked", sync);
    sync();
    return () => {
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("loadedmetadata", sync);
      video.removeEventListener("durationchange", sync);
      video.removeEventListener("seeked", sync);
    };
  }, [hasOverlay]);

  const seekTo = useCallback((next: number) => {
    const video = overlayRef.current;
    const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const clamped = Math.min(Math.max(next, 0), max);
    setPlayhead(clamped);
    if (video && Number.isFinite(clamped)) video.currentTime = clamped;
  }, [duration]);

  const onSeekInput = (event: ChangeEvent<HTMLInputElement>) => {
    seekingRef.current = true;
    seekTo(Number(event.target.value));
  };

  const onSeekEnd = () => {
    seekingRef.current = false;
    const video = overlayRef.current;
    if (video && Number.isFinite(video.currentTime)) setPlayhead(video.currentTime);
  };

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

  return (
    <div
      className="fixed inset-0 z-[90] h-[100dvh] w-full overflow-hidden bg-black text-white"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
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
        style={{ opacity: overlayOpacity, mixBlendMode: "normal" }}
        muted
        loop
        playsInline
        autoPlay
        disablePictureInPicture
        controls={false}
        aria-hidden={!hasOverlay}
        aria-label={t("ar.overlayLabel")}
      />

      {dragging ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-4 border-dashed border-coral bg-black/40">
          <p className="font-sans text-lg font-semibold text-white">{t("ar.dropHint")}</p>
        </div>
      ) : null}

      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <BackButton onClick={onExit} tone="dark" className="text-white hover:bg-white/10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-base font-semibold text-white">{t("ar.title")}</p>
          <p className="truncate font-sans text-sm text-white/70">
            {overlayName ?? t("ar.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copyIpadLink()}
          className="shrink-0 rounded-xl bg-white/15 px-3 py-2 font-sans text-sm font-semibold text-white hover:bg-white hover:text-gray-900"
        >
          {linkCopied ? t("ar.linkCopied") : t("ar.copyLink")}
        </button>
      </header>

      {cameraStatus !== "live" ? (
        <div className="absolute inset-x-0 top-24 z-10 mx-auto max-w-md px-6 text-center">
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

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        {overlayError ? (
          <p className="mb-3 font-sans text-sm text-coral">{overlayError}</p>
        ) : null}
        {hasOverlay ? (
          <div className="mb-4">
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
              }}
              onPointerUp={onSeekEnd}
              onPointerCancel={onSeekEnd}
              onTouchEnd={onSeekEnd}
              className="ar-seek-slider w-full"
              style={{
                ["--progress" as string]: `${duration > 0 ? (playhead / duration) * 100 : 0}%`,
              }}
              aria-valuemin={0}
              aria-valuemax={duration > 0 ? duration : 0}
              aria-valuenow={playhead}
              aria-label={t("ar.seek")}
            />
            <div className="mt-1 flex items-center justify-between font-sans text-sm tabular-nums text-white/90">
              <span>{formatClock(playhead)}</span>
              <span>{formatClock(duration)}</span>
            </div>
          </div>
        ) : null}
        <label className="block">
          <div className="mb-2 flex items-center justify-between font-sans text-sm text-white/80">
            <span>{t("ar.opacity")}</span>
            <span>{Math.round(overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(overlayOpacity * 100)}
            onChange={(event) => setOverlayOpacity(Number(event.target.value) / 100)}
            className="ar-opacity-slider w-full"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(overlayOpacity * 100)}
            aria-label={t("ar.opacity")}
          />
          <div className="mt-1 flex justify-between font-sans text-sm text-white/55">
            <span>{t("ar.opacityFaint")}</span>
            <span>{t("ar.opacitySolid")}</span>
          </div>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/webm,video/mp4,video/quicktime,video/*"
          className="hidden"
          onChange={onPickFile}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-coral px-5 py-3 font-sans text-base font-bold text-white hover:bg-white hover:text-gray-900"
          >
            {hasOverlay ? t("ar.replaceVideo") : t("ar.addVideo")}
          </button>
          {hasOverlay ? (
            <>
              <button
                type="button"
                onClick={() => void toggleOverlayPlayback()}
                className="rounded-xl bg-white/15 px-5 py-3 font-sans text-base font-semibold text-white hover:bg-white hover:text-gray-900"
              >
                {overlayPaused ? t("ar.playVideo") : t("ar.pauseVideo")}
              </button>
              <button
                type="button"
                onClick={() => void removeOverlay()}
                className="rounded-xl bg-white/15 px-5 py-3 font-sans text-base font-semibold text-white hover:bg-white hover:text-gray-900"
              >
                {t("ar.removeVideo")}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
