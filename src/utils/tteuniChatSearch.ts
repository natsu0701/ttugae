import { tteuniFaqData, type TteuniFaqItem } from "../data/tteuniFaqData.ts";

export type TteuniChatImage = {
  mime: string;
  dataUrl: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s.,!?~'"“”‘’()[\]{}]/g, "")
    .trim();
}

function tokenScore(query: string, keyword: string) {
  const q = normalize(query);
  const k = normalize(keyword);
  if (!q || !k) return 0;
  if (q === k) return 12;
  if (q.includes(k)) return 8;
  if (k.length >= 2 && q.length >= 2 && k.includes(q)) return 8;
  return 0;
}

function queryParts(raw: string) {
  const parts = raw
    .split(/[\s.,!?~'"“”‘’()[\]{}/\\|&+]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
  return [raw, ...parts];
}

export function matchTteuniFaq(query: string): TteuniFaqItem | null {
  const raw = query.trim();
  if (!raw) return null;
  const qn = normalize(raw);
  const parts = queryParts(raw);

  let best: { item: TteuniFaqItem; score: number } | null = null;
  for (const item of tteuniFaqData) {
    let score = 0;
    for (const keyword of item.keywords) {
      for (const part of parts) {
        score = Math.max(score, tokenScore(part, keyword));
      }
    }
    const questionN = normalize(item.question);
    const answerN = normalize(item.answer);
    if (qn.length >= 2 && (questionN.includes(qn) || qn.includes(questionN))) score += 4;
    if (qn.length >= 4 && answerN.includes(qn)) score += 2;
    if (score > 0 && (!best || score > best.score || (score === best.score && item.id < best.item.id))) {
      best = { item, score };
    }
  }

  if (!best || best.score < 8) return null;
  return best.item;
}

type GeminiPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
};
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

function dataUrlToInline(dataUrl: string) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime_type: match[1], data: match[2] };
}

async function fetchGeminiReply(query: string, image?: TteuniChatImage | null): Promise<string | null> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) return null;

  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" +
    `?key=${encodeURIComponent(key)}`;

  const prompt = image
    ? "너는 뜨개 도우미 뜨니야. 한국어로 짧고 친절하게 답해. 이모티콘은 쓰지 마. 첨부된 편물이나 도안 사진을 보고 코, 장력, 실, 바늘 관점에서 조언해.\n질문: " +
      (query.trim() || "이 사진을 분석해 줘.")
    : "너는 뜨개 도우미 뜨니야. 한국어로 짧고 친절하게 답해. 이모티콘은 쓰지 마.\n질문: " + query;

  const parts: GeminiPart[] = [{ text: prompt }];
  if (image) {
    const inline = dataUrlToInline(image.dataUrl);
    if (inline) {
      parts.push({
        inline_data: {
          mime_type: image.mime || inline.mime_type,
          data: inline.data,
        },
      });
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  return text || null;
}

export function getTteuniMockFallback(query: string) {
  return (
    `FAQ에서 "${query}"와 바로 맞는 항목은 아직 없어요. ` +
    "겉뜨기, 게이지(Gauge), 푸르시오, 탑다운, 매직링 같은 키워드로 다시 물어보시면 더 정확히 찾아 드릴게요."
  );
}

export function getTteuniPhotoMock() {
  return "올려 주신 편물/도안 사진을 살펴봤어요. 코 간격과 장력이 고른 편입니다. 게이지(Gauge)나 궁금한 코를 알려 주시면 더 맞춰 드릴게요.";
}

export async function resolveTteuniChatReply(
  query: string,
  image?: TteuniChatImage | null,
): Promise<{
  answer: string;
  source: "faq" | "gemini" | "mock";
}> {
  const matched = matchTteuniFaq(query);
  if (matched) {
    return { answer: matched.answer, source: "faq" };
  }

  try {
    const gemini = await fetchGeminiReply(query, image);
    if (gemini) return { answer: gemini, source: "gemini" };
  } catch {
    /* 목업 폴백 */
  }

  if (image) {
    return { answer: getTteuniPhotoMock(), source: "mock" };
  }

  return { answer: getTteuniMockFallback(query), source: "mock" };
}
