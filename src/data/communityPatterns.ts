import type { EditorCell } from "../utils/patternGrid.ts";
import type { NeedleSpec } from "./knittingMetadataLibrary.ts";
import { assetUrl } from "../utils/appPath.ts";

function solidKnitGrid(rows: number, cols: number, colorId: string): EditorCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ colorId, stitchId: "knit" })),
  );
}

function filledBoolGrid(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => true));
}

export type CommunityCategory = "all" | "best" | "qa" | "showcase" | "offline";

export type FinishedDetail = {
  yarn: string;
  needle: string;
  duration: string;
  review: string;
};

export type CommunityPattern = {
  id: string;
  title: string;
  author: string;
  likes: number;
  scraps: number;
  category: Exclude<CommunityCategory, "all" | "qa" | "offline">;
  gridCols: number;
  gridRows: number;
  grid: boolean[][];
  finishedImage: string;
  finishedCaption: string;
  finishedDetail: FinishedDetail;
  publishedAt: string;
  /** 첨부 도안이 있으면 미니 캔버스, 없으면 AI 예상 이미지 */
  hasAttachedPattern: boolean;
  aiPredictedImage?: string;
  /** 에디터와 동일한 격자(색·기호). 없으면 썸네일에서 복원 */
  editorGrid?: EditorCell[][];
  colorMap?: Record<string, string>;
  needle?: NeedleSpec;
};

export function finishedImageUrl(filename: string) {
  if (
    filename.startsWith("blob:") ||
    filename.startsWith("data:") ||
    filename.startsWith("http")
  ) {
    return filename;
  }
  return assetUrl(`/images/${encodeURI(filename)}`);
}

export const COMMUNITY_PATTERNS: CommunityPattern[] = [
  {
    id: "cp-1",
    title: "초보자용 체리 키링",
    author: "뜨개하는수진",
    likes: 128,
    scraps: 42,
    category: "best",
    gridCols: 15,
    gridRows: 15,
    publishedAt: "2026.05.12",
    hasAttachedPattern: true,
    finishedImage: "completed_cherry.jpg",
    finishedCaption:
      "사용 실: 코튼 4합, 바늘 3.0mm. 키링 고리 부분만 조심하면 하루 만에 끝나요!",
    finishedDetail: {
      yarn: "코튼 4합 (빨강·초록)",
      needle: "코바늘 3호",
      duration: "약 4시간",
      review:
        "키링 고리 코 부분만 짧은 뜨기로 촘촘하게 마무리했어요. 선물용으로 3개 더 떴습니다.",
    },
    needle: { needleType: "crochet", needleSize: "3호", needleDetail: "standard" },
    grid: [
      [false, false, true, true, true, true, false, false],
      [false, true, true, false, false, true, true, false],
      [true, true, false, false, false, false, true, true],
      [true, true, false, false, false, false, true, true],
      [true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, false, false],
      [false, false, false, true, true, false, false, false],
    ],
  },
  {
    id: "cp-2",
    title: "파스텔 무지개 스카프",
    author: "yarn_lover",
    likes: 256,
    scraps: 89,
    category: "best",
    gridCols: 30,
    gridRows: 40,
    publishedAt: "2026.05.08",
    hasAttachedPattern: false,
    aiPredictedImage: "completed_muffler_rainbow.jpg",
    finishedImage: "completed_muffler_rainbow.jpg",
    finishedCaption:
      "사용 실: 메리노 울 100%, 바늘: 4.5mm. 뜨는 데 2주 걸렸어요!",
    finishedDetail: {
      yarn: "메리노 울 100% (파스텔 6색)",
      needle: "대바늘 4.5mm",
      duration: "2주",
      review:
        "색 변경 구간에서 코 수 맞추기가 조금 헷갈렸는데, 완성하니 너무 뿌듯해요. 길이는 목에 두른 뒤 원하는 만큼 더 뜨면 됩니다.",
    },
    needle: { needleType: "knitting", needleSize: "4.5mm", needleDetail: "circular" },
    grid: [
      [true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, false, false],
      [false, false, false, true, true, false, false, false],
      [false, false, false, true, true, false, false, false],
      [false, false, true, true, true, true, false, false],
      [false, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true],
    ],
  },
  {
    id: "cp-3",
    title: "곰돌이 인형 몸통 도안",
    author: "teddy_knit",
    likes: 94,
    scraps: 31,
    category: "showcase",
    gridCols: 30,
    gridRows: 40,
    publishedAt: "2026.05.15",
    hasAttachedPattern: true,
    finishedImage: "completed_bear.jpg",
    finishedCaption: "솜 충전 후 몸통과 머리를 코묶음으로 연결했습니다.",
    finishedDetail: {
      yarn: "알파카 울 베이지·브라운",
      needle: "코바늘 4호",
      duration: "10일",
      review:
        "눈 단추는 바느질로 고정했어요. 솜은 적당히만 넣어야 귀여운 실루엣이 나옵니다. 아이 선물로 최고!",
    },
    needle: { needleType: "crochet", needleSize: "4호", needleDetail: "standard" },
    grid: [
      [false, false, true, true, true, true, false, false],
      [false, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true],
      [true, true, false, true, true, false, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [false, true, true, false, false, true, true, false],
      [false, false, true, true, true, true, false, false],
    ],
  },
  {
    id: "cp-4",
    title: "겨울 털모자 기본형",
    author: "뜨니친구",
    likes: 67,
    scraps: 18,
    category: "best",
    gridCols: 20,
    gridRows: 20,
    publishedAt: "2026.04.28",
    hasAttachedPattern: true,
    finishedImage: "completed_beenie_grey.jpg",
    finishedCaption: "사용 실: 그레이(아크릴), 대바늘 5.0mm 줄바늘. 20×20 겉뜨기만으로 뜬 기본형이에요.",
    finishedDetail: {
      yarn: "그레이(아크릴)",
      needle: "대바늘 5.0mm",
      duration: "3일",
      review:
        "겉뜨기만 이어서 뜨는 기본형이라 초보도 따라 하기 쉬워요. 줄바늘로 원통으로 뜨면 이음선이 없습니다.",
    },
    needle: { needleType: "knitting", needleSize: "5.0mm", needleDetail: "circular" },
    editorGrid: solidKnitGrid(20, 20, "gray"),
    grid: filledBoolGrid(20, 20),
  },
  {
    id: "cp-5",
    title: "미니 하트 코스터",
    author: "heart_stitch",
    likes: 312,
    scraps: 120,
    category: "best",
    gridCols: 12,
    gridRows: 12,
    publishedAt: "2026.05.02",
    hasAttachedPattern: true,
    finishedImage: "completed_heart.png",
    finishedCaption: "코스터 4장 세트로 떠서 친구들에게 나눠줬어요.",
    finishedDetail: {
      yarn: "면 실 3합 (코랄·화이트)",
      needle: "코바늘 4호",
      duration: "1일",
      review:
        "테이블 위에 올려두니 너무 귀엽네요. 하트 모양은 도안 그대로 따라 하면 실패 없어요!",
    },
    needle: { needleType: "crochet", needleSize: "4호", needleDetail: "standard" },
    grid: [
      [false, true, true, false, false, true, true, false],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, false, false],
      [false, false, false, true, true, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
    ],
  },
  {
    id: "cp-6",
    title: "완성! 베이지 가디건",
    author: "완성작자랑",
    likes: 445,
    scraps: 156,
    category: "showcase",
    gridCols: 50,
    gridRows: 50,
    publishedAt: "2026.05.18",
    hasAttachedPattern: true,
    finishedImage: "completed_Beige cardigan.jpg",
    finishedCaption:
      "사용 실: 메리노 울 100%, 바늘: 4.5mm. 뜨는 데 2주 걸렸어요!",
    finishedDetail: {
      yarn: "메리노 울 100% (베이지)",
      needle: "대바늘 4.5mm",
      duration: "2주",
      review:
        "소매 부분 코줄임이 헷갈렸는데 뜨니 코칭 덕분에 완성했네요. 몸판은 여유 있게, 소매는 14단 더 늘리면 길이감이 딱 좋아요.",
    },
    needle: { needleType: "knitting", needleSize: "4.5mm", needleDetail: "circular" },
    grid: [
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, false, true, true, false, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, false, false, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
    ],
  },
  {
    id: "cp-7",
    title: "포근한 화이트 장갑",
    author: "손끝뜨개",
    likes: 148,
    scraps: 51,
    category: "best",
    gridCols: 16,
    gridRows: 20,
    publishedAt: "2026.05.20",
    hasAttachedPattern: true,
    finishedImage: "completed_gloves_white.jpg",
    finishedCaption:
      "사용 실: 메리노 울 화이트, 장갑바늘 3.5mm. 손등만 겉뜨기로 단순하게 떴어요.",
    finishedDetail: {
      yarn: "메리노 울 100% (화이트)",
      needle: "대바늘 3.5mm",
      duration: "4일",
      review:
        "손가락 가르기만 천천히 하면 초보도 따라 하기 쉬워요. 손목 리브는 2코 겉·2코 안으로 탄탄하게 잡아 주세요.",
    },
    needle: { needleType: "knitting", needleSize: "3.5mm", needleDetail: "dpn" },
    grid: [
      [false, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true],
      [true, true, false, true, true, false, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, false, false],
    ],
  },
  {
    id: "cp-8",
    title: "분홍 별 코스터",
    author: "star_table",
    likes: 203,
    scraps: 88,
    category: "best",
    gridCols: 12,
    gridRows: 12,
    publishedAt: "2026.05.22",
    hasAttachedPattern: true,
    finishedImage: "completed_star.jpg",
    finishedCaption:
      "사용 실: 코튼 3합 핑크, 코바늘 4호. 코스터 한 장에 저녁 한 끼 분량이에요.",
    finishedDetail: {
      yarn: "면 실 3합 (핑크)",
      needle: "코바늘 4호",
      duration: "3시간",
      review:
        "별 꼭짓점은 짧은 뜨기로 모서리를 잡아 주면 모양이 또렷해져요. 하트 코스터와 세트로 두면 식탁이 화사합니다.",
    },
    needle: { needleType: "crochet", needleSize: "4호", needleDetail: "standard" },
    grid: [
      [false, false, false, true, false, false, false, false],
      [false, false, true, true, true, false, false, false],
      [true, true, true, true, true, true, true, false],
      [false, true, true, true, true, true, false, false],
      [false, false, true, true, true, false, false, false],
      [false, true, true, false, true, true, false, false],
      [true, true, false, false, false, true, true, false],
      [false, false, false, false, false, false, false, false],
    ],
  },
  {
    id: "cp-9",
    title: "포근한 분홍 양말",
    author: "sock_lane",
    likes: 176,
    scraps: 64,
    category: "showcase",
    gridCols: 18,
    gridRows: 28,
    publishedAt: "2026.05.24",
    hasAttachedPattern: true,
    finishedImage: "completed_socks.jpg",
    finishedCaption:
      "사용 실: 양말 전용 울 핑크, 장갑바늘 2.5mm. 뒤꿈치는 짧은 줄기로 돌려 떴어요.",
    finishedDetail: {
      yarn: "양말용 울 (핑크)",
      needle: "대바늘 2.5mm",
      duration: "5일",
      review:
        "발등 게이지만 맞춰 두면 길이 조절이 쉽습니다. 한 짝 뜨고 나서 코 수를 적어 두면 짝이 안 맞을 일이 없어요.",
    },
    needle: { needleType: "knitting", needleSize: "2.5mm", needleDetail: "dpn" },
    grid: [
      [false, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, false, false, false, false, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true],
      [false, true, true, true, true, true, true, false],
      [false, false, true, true, true, true, false, false],
    ],
  },
  {
    id: "cp-10",
    title: "노란 비니 모자",
    author: "sunny_knit",
    likes: 221,
    scraps: 79,
    category: "showcase",
    gridCols: 20,
    gridRows: 20,
    publishedAt: "2026.05.26",
    hasAttachedPattern: true,
    finishedImage: "completed_beenie_yellow.jpg",
    finishedCaption:
      "사용 실: 벌키 아크릴 옐로, 줄바늘 5.5mm. 회색 비니와 같은 기본형이에요.",
    finishedDetail: {
      yarn: "벌키 아크릴 (옐로)",
      needle: "대바늘 5.5mm",
      duration: "2일",
      review:
        "회색 기본형에서 색만 바꿨어요. 챙 리브를 8단 정도 두면 말림이 예쁩니다. 꼭대기 모아 뜨기만 천천히 하면 됩니다.",
    },
    needle: { needleType: "knitting", needleSize: "5.5mm", needleDetail: "circular" },
    grid: [
      [false, true, true, true, true, true, true, false],
      [true, true, false, false, false, false, true, true],
      [true, false, false, false, false, false, false, true],
      [true, false, false, true, true, false, false, true],
      [true, false, false, true, true, false, false, true],
      [true, false, false, false, false, false, false, true],
      [true, true, false, false, false, false, true, true],
      [false, true, true, true, true, true, true, false],
    ],
  },
];

export const COMMUNITY_TABS: { id: CommunityCategory }[] = [
  { id: "all" },
  { id: "best" },
  { id: "qa" },
  { id: "showcase" },
  { id: "offline" },
];

export function getCommunityPattern(id: string) {
  try {
    const raw = localStorage.getItem("ttugae.community.shared.v1");
    if (raw) {
      const shared = JSON.parse(raw) as CommunityPattern[];
      const found = shared.find((p) => p.id === id);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return COMMUNITY_PATTERNS.find((p) => p.id === id);
}
