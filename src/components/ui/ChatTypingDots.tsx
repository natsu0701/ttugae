import { memo } from "react";

type ChatTypingDotsProps = {
  tone?: "light" | "dark";
};

function ChatTypingDots({ tone = "light" }: ChatTypingDotsProps) {
  const fill = tone === "dark" ? "bg-stone-300" : "bg-stone-400";
  return (
    <span className="inline-flex h-4 items-center gap-1" aria-hidden>
      <span className={`chat-typing-dot h-1.5 w-1.5 rounded-full ${fill}`} />
      <span className={`chat-typing-dot h-1.5 w-1.5 rounded-full ${fill}`} />
      <span className={`chat-typing-dot h-1.5 w-1.5 rounded-full ${fill}`} />
    </span>
  );
}

export default memo(ChatTypingDots);
