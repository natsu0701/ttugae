import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import { tteuniFaqCards } from "../../data/tteuniFaqData.ts";
import { assetUrl } from "../../utils/appPath.ts";
import { loadYarnInventory } from "../../utils/personalizationStorage.ts";
import { resolveTteuniChatReply } from "../../utils/tteuniChatSearch.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import { ChatFillIcon, CloseFillIcon } from "../icons/FillIcons.tsx";

type ChatMessage = {
  id: string;
  role: "user" | "tteuni";
  text: string;
};

type TteuniChatWidgetProps = {
  open: boolean;
  onClose: () => void;
};

const LOADING_SOURCES = [
  TTEUNI_IMAGES.loading,
  assetUrl("/images/tteuni_loading_state.svg"),
  TTEUNI_IMAGES.chatProfile,
];

const CARD_COPY: Record<string, { title: string; prompt: string }> = {
  gauge: { title: "chat.cardGaugeTitle", prompt: "chat.cardGaugePrompt" },
  purl: { title: "chat.cardPurlTitle", prompt: "chat.cardPurlPrompt" },
  yarn: { title: "chat.cardYarnTitle", prompt: "chat.cardYarnPrompt" },
  preview: { title: "chat.cardPreviewTitle", prompt: "chat.cardPreviewPrompt" },
};

function TteuniChatWidget({ open, onClose }: TteuniChatWidgetProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSrcIndex, setLoadingSrcIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, isSearching]);

  const ask = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current) return;
      busyRef.current = true;
      setIsSearching(true);
      setInput("");
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);

      const started = Date.now();
      let reply = (await resolveTteuniChatReply(text)).answer;
      const askedInventory = /보관함|재고|내 실|바늘|stash|inventory|yarn|needle|gram|뜨개가방|保管|在庫/.test(
        text,
      );
      if (askedInventory) {
        const stock = loadYarnInventory();
        if (stock.length > 0) {
          const list = stock
            .map((yarn) => {
              const bits = [yarn.name];
              if (yarn.grams) bits.push(`${yarn.grams}g`);
              if (yarn.needle) bits.push(yarn.needle);
              return bits.join(" ");
            })
            .join(", ");
          reply = `${reply}\n\n${t("editor.tteuniInventory", { list })}`;
        } else {
          reply = `${reply}\n\n${t("editor.tteuniInventoryEmpty")}`;
        }
      }

      const wait = Math.max(0, 720 - (Date.now() - started));
      await new Promise((resolve) => window.setTimeout(resolve, wait));
      setMessages((prev) => [...prev, { id: `t-${Date.now()}`, role: "tteuni", text: reply }]);
      setIsSearching(false);
      busyRef.current = false;
    },
    [t],
  );

  const submit = () => {
    void ask(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  if (!open) return null;

  const cards = tteuniFaqCards.map((card) => {
    const copy = CARD_COPY[card.id];
    return {
      ...card,
      title: copy ? t(copy.title) : card.title,
      prompt: copy ? t(copy.prompt) : card.prompt,
    };
  });

  return (
    <div className="fixed bottom-24 right-5 z-[70] flex w-[min(100vw-2.5rem,24rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
      <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
        <img src={TTEUNI_IMAGES.chatProfile} alt="" className="h-8 w-8 object-contain" />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-base font-bold text-stone-900">{t("chat.widgetTitle")}</p>
          <p className="font-sans text-sm text-stone-500">{t("chat.widgetHint")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && !isSearching ? (
          <div className="flex gap-2">
            <ChatFillIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <p className="font-seoyun text-base leading-relaxed text-stone-600">{t("chat.startHint")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-base leading-relaxed ${
                  msg.role === "user" ? "bg-coral text-white" : "bg-stone-100 text-stone-800"
                }`}
              >
                <p className="whitespace-pre-wrap font-seoyun">{msg.text}</p>
              </div>
            </div>
          ))
        )}

        {isSearching ? (
          <div className="flex items-center gap-3 rounded-2xl bg-stone-50 px-3 py-3" role="status">
            <img
              src={LOADING_SOURCES[loadingSrcIndex]}
              alt=""
              className="tteuni-loading-mascot animate-bounce h-12 w-12 object-contain"
              onError={() => {
                setLoadingSrcIndex((index) => Math.min(index + 1, LOADING_SOURCES.length - 1));
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-seoyun text-sm leading-relaxed text-stone-600 md:text-base">
                {t("chat.loading")}
              </p>
              <span className="mt-1 inline-flex items-center gap-1" aria-hidden>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral/70 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-coral/80" />
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral/50 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-coral/70" />
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-stone-100 p-3">
        <div className="mb-3 grid grid-cols-2 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              disabled={isSearching}
              onClick={() => {
                setInput(card.prompt);
                void ask(card.prompt);
              }}
              className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-2 text-left transition-colors hover:border-coral hover:bg-white disabled:opacity-60"
            >
              <span className="block font-sans text-xs font-bold leading-snug text-stone-800 md:text-sm">
                {card.title}
              </span>
              <span className="mt-1 block font-seoyun text-xs leading-snug text-stone-500">
                {card.prompt}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <SmoothInput
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("chat.placeholder")}
            className="min-w-0 flex-1 rounded-xl border-stone-200 px-3 py-2 text-base"
            disabled={isSearching}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isSearching}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white hover:bg-black disabled:opacity-60"
            aria-label={t("common.send")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.28 1.28L5.7 12 2.12 19.12a1 1 0 001.28 1.28z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TteuniChatWidget);
