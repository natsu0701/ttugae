import { lazy, Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import type { EditorYarn } from "../../types/editorYarn.ts";
import { softShadow, tabButtonClass } from "../ui/tabButtonStyles.ts";

// three.js 번들(수백 KB)은 3D 탭을 처음 열 때만 로드되도록 코드 스플리팅
const KnitItemPreview3D = lazy(() => import("./KnitItemPreview3D.tsx"));

function Preview3DFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100">
      <p className="font-sans text-xs font-normal text-gray-500">
        3D 뷰어 로딩 중…
      </p>
    </div>
  );
}

type PreviewViewMode = "2d" | "3d";

const DEFAULT_IMAGE = "/images/그림4_AI예상_스웨터.PNG";

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2.5 py-1.5 font-sans text-xs font-normal text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      {label}
    </span>
  );
}

function ZoomInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M10 4a6 6 0 104.47 10.03l4.25 4.24a1.5 1.5 0 002.12-2.12l-4.24-4.25A6 6 0 0010 4zm0 2.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
      <path d="M11 8.25h-2v3.5H5.75v2H9v3.5h2v-3.5h3.5v-2H11z" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M10 4a6 6 0 104.47 10.03l4.25 4.24a1.5 1.5 0 002.12-2.12l-4.24-4.25A6 6 0 0010 4zm0 2.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
      <path d="M7 11.25h6v2H7z" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M4 8V4h4V6H6v2H4zm0 8h2v2h2v2H4v-4zm12 4h2v-2h2v-4h-2v2h-2v4zm4-12V4h-4v2h2v2h2zM9 9h6v6H9V9z" />
    </svg>
  );
}

type AiPreviewNavigatorProps = {
  imageSrc?: string;
  /** AI 렌더링용 실 질감·종류 메타 */
  yarnMeta?: EditorYarn[];
};

export default function AiPreviewNavigator({
  imageSrc = DEFAULT_IMAGE,
  yarnMeta = [],
}: AiPreviewNavigatorProps) {
  const { t } = useTranslation();
  const metaHint = useMemo(() => {
    if (yarnMeta.length === 0) return null;
    const fibers = [...new Set(yarnMeta.map((y) => y.fiberType))];
    const textures = [...new Set(yarnMeta.map((y) => y.texture))];
    return `${fibers.join(" · ")} (${textures.join(", ")})`;
  }, [yarnMeta]);
  const [viewMode, setViewMode] = useState<PreviewViewMode>("2d");
  const [zoom, setZoom] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const viewToggleClass = (active: boolean) =>
    `rounded-full px-2.5 py-0.5 font-sans text-[11px] font-normal transition-colors duration-200 ${
      active ? "bg-coral text-white" : "bg-white text-gray-600 hover:bg-black hover:text-white"
    }`;

  const clampZoom = (z: number) => Math.min(3, Math.max(0.5, z));

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = "ai-preview.png";
    a.click();
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>${t("editor.aiPreviewShareTitle")}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh"><img src="${imageSrc}" style="max-width:100%"/></body></html>`,
    );
    w.document.close();
    w.onload = () => w.print();
  };

  const handleShare = async () => {
    const url = window.location.origin + imageSrc;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("editor.aiPreviewShareTitle"), url });
        return;
      }
    } catch {
      // ignore
    }
    await navigator.clipboard.writeText(url);
    alert(t("editor.linkCopied"));
  };

  const navButtonClass = `group relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 transition-colors duration-200 hover:bg-black hover:text-white ${softShadow}`;

  const modalActionClass = `rounded-full bg-white px-4 py-2 font-sans text-sm font-normal text-gray-700 transition-colors duration-200 hover:bg-black hover:text-white ${softShadow}`;

  return (
    <>
      <div className="rounded-2xl bg-white p-4">
        <p className="mb-1 font-sans text-sm font-bold text-gray-900">
          {t("editor.aiPreviewTitle")}
        </p>
        {metaHint && (
          <p className="mb-3 font-rounded text-[11px] font-normal leading-snug text-gray-500">
            {metaHint}
          </p>
        )}
        {!metaHint && <div className="mb-3" />}

        <div className="mb-2 flex justify-end">
          <div
            className="inline-flex gap-0.5 rounded-full bg-gray-100 p-0.5"
            role="group"
            aria-label={t("editor.previewViewMode")}
          >
            <button
              type="button"
              className={viewToggleClass(viewMode === "2d")}
              onClick={() => setViewMode("2d")}
            >
              2D
            </button>
            <button
              type="button"
              className={viewToggleClass(viewMode === "3d")}
              onClick={() => setViewMode("3d")}
            >
              3D
            </button>
          </div>
        </div>

        <div
          className={`relative rounded-xl ${
            viewMode === "3d"
              ? "min-h-[420px] bg-white"
              : "h-36 overflow-hidden bg-gray-100"
          }`}
        >
          {imgFailed ? (
            <div className="flex h-full items-center justify-center p-3 text-center">
              <p className="font-sans text-xs font-normal text-gray-500">
                public/images/그림4_AI예상_스웨터.PNG
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "2d" ? (
                <motion.div
                  key="2d"
                  className="flex h-full w-full items-center justify-center overflow-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={imageSrc}
                    alt={t("editor.aiPreviewAlt")}
                    className="max-h-none max-w-none select-none"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                    draggable={false}
                    onError={() => setImgFailed(true)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="3d"
                  className="h-full w-full"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Suspense fallback={<Preview3DFallback />}>
                    <KnitItemPreview3D />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className={`mt-3 flex justify-center gap-2 ${viewMode === "3d" ? "pointer-events-none opacity-40" : ""}`}>
          <button
            type="button"
            className={navButtonClass}
            disabled={viewMode === "3d"}
            onClick={() => setZoom((z) => clampZoom(z + 0.25))}
            aria-label={t("editor.zoomIn")}
          >
            <Tooltip label={t("editor.zoomIn")} />
            <ZoomInIcon />
          </button>
          <button
            type="button"
            className={navButtonClass}
            disabled={viewMode === "3d"}
            onClick={() => setZoom((z) => clampZoom(z - 0.25))}
            aria-label={t("editor.zoomOut")}
          >
            <Tooltip label={t("editor.zoomOut")} />
            <ZoomOutIcon />
          </button>
          <button
            type="button"
            className={navButtonClass}
            disabled={viewMode === "3d"}
            onClick={() => {
              setZoom(1);
              setModalOpen(true);
            }}
            aria-label={t("editor.fitView")}
          >
            <Tooltip label={t("editor.fitView")} />
            <FitIcon />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="relative max-h-[90vh] max-w-4xl rounded-2xl bg-white p-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`absolute right-4 top-4 rounded-full px-3 py-1.5 font-sans text-sm ${tabButtonClass(false)}`}
              >
                {t("editor.close")}
              </button>
              {!imgFailed && (
                <img
                  src={imageSrc}
                  alt={t("editor.aiPreviewTitle")}
                  className="max-h-[75vh] w-full rounded-xl object-contain"
                />
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className={modalActionClass} onClick={handleDownload}>
                  {t("editor.download")}
                </button>
                <button type="button" className={modalActionClass} onClick={handlePrint}>
                  {t("editor.print")}
                </button>
                <button type="button" className={modalActionClass} onClick={handleShare}>
                  {t("editor.share")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
