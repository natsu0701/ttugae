import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpFillIcon, ChatFillIcon } from "../icons/FillIcons.tsx";
import TteuniChatWidget from "./TteuniChatWidget.tsx";

function FloatingDock() {
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowTop(window.scrollY > 240);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleChat = useCallback(() => {
    setChatOpen((open) => !open);
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed bottom-5 right-5 z-[65] flex flex-col items-end gap-2">
        {showTop ? (
          <button
            type="button"
            onClick={scrollTop}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-md hover:border-coral hover:text-coral"
            aria-label={t("chat.scrollTop")}
          >
            <ArrowUpFillIcon className="h-5 w-5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={toggleChat}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-coral text-white shadow-md hover:bg-black"
          aria-label={t("chat.open")}
          aria-expanded={chatOpen}
        >
          <ChatFillIcon className="h-5 w-5" />
        </button>
      </div>
      <TteuniChatWidget open={chatOpen} onClose={closeChat} />
    </>
  );
}

export default memo(FloatingDock);
