import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { iconTip } from "../../utils/iconTip.ts";

const SIDEBAR_PRESET = {
  left: { min: 176, max: 360, width: 200 },
  right: { min: 240, max: 560, width: 320 },
} as const;

type EditorResizableSidebarProps = {
  side: "left" | "right";
  children: ReactNode;
  asideRef?: MutableRefObject<HTMLElement | null>;
};

function dispatchCanvasResize() {
  window.dispatchEvent(new Event("resize"));
}

export default function EditorResizableSidebar({
  side,
  children,
  asideRef,
}: EditorResizableSidebarProps) {
  const { t } = useTranslation();
  const preset = SIDEBAR_PRESET[side];
  const [sidebarWidth, setSidebarWidth] = useState<number>(preset.width);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startWidth: sidebarWidth,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarWidth],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = side === "left" ? e.clientX - drag.startX : drag.startX - e.clientX;
      const next = drag.startWidth + delta;
      setSidebarWidth(Math.min(preset.max, Math.max(preset.min, next)));
    };

    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      dispatchCanvasResize();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [preset.max, preset.min, side]);

  return (
    <div className="relative flex h-full max-h-[calc(100vh-4rem)] shrink-0 flex-col">
      <div
        role="separator"
        aria-orientation="vertical"
        {...iconTip(t("editor.sidebarResize"), side === "left" ? "right" : "above")}
        onMouseDown={onMouseDown}
        className={`absolute top-0 z-20 h-full w-1.5 cursor-col-resize hover:bg-coral/50 ${
          side === "left" ? "right-0" : "left-0"
        }`}
      />

      <aside
        ref={(el) => {
          if (asideRef) asideRef.current = el;
        }}
        className={`relative h-full overflow-hidden bg-white ${
          side === "left" ? "border-r border-stone-200" : "border-l border-stone-200"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div
          className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          {children}
        </div>
      </aside>
    </div>
  );
}
