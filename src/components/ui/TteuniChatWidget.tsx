import { memo, useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import { tteuniFaqCards } from "../../data/tteuniFaqData.ts";
import { assetUrl } from "../../utils/appPath.ts";
import { loadYarnInventory } from "../../utils/personalizationStorage.ts";
import { resolveTteuniChatReply, type TteuniChatImage } from "../../utils/tteuniChatSearch.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import { CameraFillIcon, ChatFillIcon, CloseFillIcon } from "../icons/FillIcons.tsx";

type AttachedImage = TteuniChatImage & { name: string };

type ChatMessage = {
  id: string;
  role: "user" | "tteuni";
  text: string;
  imageUrl?: string;
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

const ACCEPT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_BYTES = 8 * 1024 * 1024;

function isAllowedImage(file: File) {
  if (ACCEPT_TYPES.has(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function TteuniChatWidget({ open, onClose }: TteuniChatWidgetProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attached, setAttached] = useState<AttachedImage | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingSrcIndex, setLoadingSrcIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const attachedRef = useRef<AttachedImage | null>(null);

  useEffect(() => {
    attachedRef.current = attached;
  }, [attached]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, isSearching]);

  const clearAttached = useCallback(() => {
    setAttached(null);
    attachedRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const onPickFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isAllowedImage(file) || file.size > MAX_BYTES) return;
    const dataUrl = await readDataUrl(file);
    if (!dataUrl.startsWith("data:image")) return;
    const next: AttachedImage = {
      name: file.name,
      mime: file.type || "image/jpeg",
      dataUrl,
    };
    attachedRef.current = next;
    setAttached(next);
  };

  const ask = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      const shot = attachedRef.current;
      if ((!text && !shot) || busyRef.current) return;
      busyRef.current = true;
      setIsSearching(true);
      setLoadingPhoto(Boolean(shot));
      setInput("");
      setAttached(null);
      attachedRef.current = null;
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: "user",
          text: text || t("chat.photoCaption"),
          imageUrl: shot?.dataUrl,
        },
      ]);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const started = Date.now();
      let reply = (await resolveTteuniChatReply(text, shot)).answer;
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

      const wait = Math.max(400, 1600 - (Date.now() - started));
      await new Promise((resolve) => window.setTimeout(resolve, wait));
      setMessages((prev) => [...prev, { id: `t-${Date.now()}`, role: "tteuni", text: reply }]);
      setIsSearching(false);
      setLoadingPhoto(false);
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
    <div className="fixed bottom-[5.75rem] right-6 z-50 flex h-[520px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg sm:h-[600px] max-h-[calc(100dvh-7.5rem)]">
      <div className="flex items-center gap-2 border-b border-stone-200 bg-[#FFFBF7] px-4 py-3">
        <img src={TTEUNI_IMAGES.chatProfile} alt="" className="h-8 w-8 object-contain" />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-base font-bold text-stone-900">{t("chat.widgetTitle")}</p>
          <p className="font-sans text-sm text-stone-500">{t("chat.widgetHint")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-white hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-white px-4 py-3">
        {messages.length === 0 && !isSearching ? (
          <div className="flex gap-2">
            <ChatFillIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <p className="font-seoyun text-base leading-relaxed text-stone-600">{t("chat.startHint")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] overflow-hidden rounded-2xl text-base leading-relaxed ${
                  msg.role === "user" ? "bg-coral text-white" : "border border-stone-200 bg-[#FFFBF7] text-stone-800"
                }`}
              >
                {msg.imageUrl ? (
                  <img
                    src={msg.imageUrl}
                    alt=""
                    className="max-h-40 w-full object-cover"
                  />
                ) : null}
                {msg.text ? (
                  <p className="whitespace-pre-wrap px-3 py-2 font-seoyun">{msg.text}</p>
                ) : null}
              </div>
            </div>
          ))
        )}

        {isSearching ? (
          <div className="flex justify-start">
            <div
              className="flex max-w-[85%] items-center gap-3 rounded-2xl border border-stone-200 bg-[#FFFBF7] px-3 py-3"
              role="status"
              data-testid="tteuni-loading"
            >
              <img
                src={LOADING_SOURCES[loadingSrcIndex]}
                alt=""
                className="tteuni-loading-mascot animate-bounce h-12 w-12 shrink-0 object-contain"
                onError={() => {
                  setLoadingSrcIndex((index) => Math.min(index + 1, LOADING_SOURCES.length - 1));
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-seoyun text-sm leading-relaxed text-stone-600 md:text-base">
                  {loadingPhoto ? t("chat.photoLoading") : t("chat.loading")}
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
          </div>
        ) : null}
      </div>

      <div className="border-t border-stone-200 bg-[#FFFBF7] p-3">
        {attached ? (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <img src={attached.dataUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={clearAttached}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900/70 text-white hover:bg-coral"
                aria-label={t("chat.attachRemove")}
              >
                <CloseFillIcon className="h-3 w-3" />
              </button>
            </div>
            <p className="min-w-0 truncate font-sans text-xs text-stone-500">{attached.name}</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={(event) => {
              void onPickFile(event);
            }}
          />
          <button
            type="button"
            disabled={isSearching}
            onClick={() => fileRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-coral hover:text-coral disabled:opacity-60"
            aria-label={t("chat.attach")}
          >
            <CameraFillIcon className="h-5 w-5" />
          </button>
          <SmoothInput
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("chat.placeholder")}
            className="min-w-0 flex-1 rounded-2xl border-stone-200 bg-white px-3 py-2 text-base"
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

        <div className="mt-3 grid grid-cols-2 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              disabled={isSearching}
              onClick={() => {
                setInput(card.prompt);
                void ask(card.prompt);
              }}
              className="tteuni-faq-card flex h-full min-h-[4.5rem] flex-col rounded-2xl border border-stone-200 bg-white px-2.5 py-2 text-left transition-colors hover:border-coral hover:bg-white disabled:opacity-60"
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
      </div>
    </div>
  );
}

export default memo(TteuniChatWidget);
