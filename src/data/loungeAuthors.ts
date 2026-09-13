import { COMMUNITY_PATTERNS, type CommunityPattern } from "./communityPatterns.ts";
import { currentUserAvatar, currentUserHandle, currentUserNickname } from "../utils/identity.ts";
import { loadProfile } from "../utils/profileStorage.ts";

export type LoungeAuthor = {
  handle: string;
  nickname: string;
  bio: string;
  avatarUrl?: string;
};

const AUTHOR_DIRECTORY: LoungeAuthor[] = [
  { handle: "sujin", nickname: "뜨개하는수진", bio: "키링과 소품을 즐겨 뜨는 입문 코치" },
  { handle: "yarnlover", nickname: "yarn_lover", bio: "색감 실험과 머플러 도안을 기록합니다" },
  { handle: "teddyknit", nickname: "teddy_knit", bio: "인형 뜨개와 입체 코 연구" },
  { handle: "tteunifriend", nickname: "뜨니친구", bio: "비니와 겨울 소품 전문" },
  { handle: "heartstitch", nickname: "heart_stitch", bio: "하트 코스터와 미니 소품" },
  { handle: "showoff", nickname: "완성작자랑", bio: "완성작 사진과 후기를 남깁니다" },
  { handle: "fingertip", nickname: "손끝뜨개", bio: "장갑과 손목 리브를 연구합니다" },
  { handle: "startable", nickname: "star_table", bio: "테이블 소품과 별 코스터" },
  { handle: "socklane", nickname: "sock_lane", bio: "양말 뒤꿈치와 발등 코 수 기록" },
  { handle: "sunnyknit", nickname: "sunny_knit", bio: "봄 색감 비니와 가벼운 실" },
];

const NICKNAME_TO_HANDLE = Object.fromEntries(
  AUTHOR_DIRECTORY.map((author) => [author.nickname, author.handle]),
);

export function handleFromAuthor(author: string): string {
  const raw = author.replace(/^@/, "").trim();
  if (!raw || raw === "나") return currentUserHandle();
  if (NICKNAME_TO_HANDLE[raw]) return NICKNAME_TO_HANDLE[raw];
  if (/^[A-Za-z]+$/.test(raw)) return raw.toLowerCase();
  return raw.toLowerCase().replace(/[^a-z]/g, "") || "author";
}

export function findLoungeAuthor(handleOrName: string): LoungeAuthor | null {
  const key = handleOrName.replace(/^@/, "").trim().toLowerCase();
  if (!key) return null;
  if (key === currentUserHandle().toLowerCase() || key === "나") {
    const profile = loadProfile();
    return {
      handle: currentUserHandle(),
      nickname: currentUserNickname(),
      bio: "내 뜨개라운지 프로필",
      avatarUrl: currentUserAvatar() ?? profile.avatarUrl,
    };
  }
  return (
    AUTHOR_DIRECTORY.find(
      (author) =>
        author.handle.toLowerCase() === key ||
        author.nickname.toLowerCase() === key,
    ) ?? null
  );
}

export function searchLoungeAuthors(query: string): LoungeAuthor[] {
  const q = query.trim().toLowerCase();
  if (!q) return AUTHOR_DIRECTORY;
  return AUTHOR_DIRECTORY.filter(
    (author) =>
      author.handle.toLowerCase().includes(q) ||
      author.nickname.toLowerCase().includes(q),
  );
}

export function patternsByAuthorHandle(
  handle: string,
  extra: CommunityPattern[] = [],
): CommunityPattern[] {
  const author = findLoungeAuthor(handle);
  const names = new Set(
    [handle, author?.handle, author?.nickname, handle === currentUserHandle() ? "나" : ""]
      .filter(Boolean)
      .map((value) => value!.toLowerCase()),
  );
  return [...extra, ...COMMUNITY_PATTERNS].filter((pattern) =>
    names.has(pattern.author.replace(/^@/, "").toLowerCase()) ||
    names.has(handleFromAuthor(pattern.author)),
  );
}

export function allLoungeAuthors(): LoungeAuthor[] {
  return AUTHOR_DIRECTORY;
}
