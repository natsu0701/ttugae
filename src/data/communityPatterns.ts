export type CommunityCategory = "all" | "best" | "qa" | "showcase";

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
  category: Exclude<CommunityCategory, "all" | "qa">;
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
};

export function finishedImageUrl(filename: string) {
  if (
    filename.startsWith("blob:") ||
    filename.startsWith("data:") ||
    filename.startsWith("http")
  ) {
    return filename;
  }
  return `/images/${encodeURI(filename)}`;
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
    finishedImage: "그림1_완성작_체리키링.PNG",
    finishedCaption:
      "사용 실: 코튼 4합, 바늘 3.0mm. 키링 고리 부분만 조심하면 하루 만에 끝나요!",
    finishedDetail: {
      yarn: "코튼 4합 (빨강·초록)",
      needle: "3.0mm",
      duration: "약 4시간",
      review:
        "키링 고리 코 부분만 짧은 뜨기로 촘촘하게 마무리했어요. 선물용으로 3개 더 떴습니다🍒",
    },
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
    aiPredictedImage: "그림4_AI예상_스웨터.PNG",
    finishedImage: "그림2_완성작_무지개스카프.PNG",
    finishedCaption:
      "사용 실: 메리노 울 100%, 바늘: 4.5mm. 뜨는 데 2주 걸렸어요!",
    finishedDetail: {
      yarn: "메리노 울 100% (파스텔 6색)",
      needle: "4.5mm",
      duration: "2주",
      review:
        "색 변경 구간에서 코 수 맞추기가 조금 헷갈렸는데, 완성하니 너무 뿌듯해요. 길이는 목에 두른 뒤 원하는 만큼 더 뜨면 됩니다😊",
    },
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
    finishedImage: "그림3_완성작_곰돌이인형.PNG",
    finishedCaption: "솜 충전 후 몸통과 머리를 코묶음으로 연결했습니다.",
    finishedDetail: {
      yarn: "알파카 울 베이지·브라운",
      needle: "4.0mm",
      duration: "10일",
      review:
        "눈 단추는 바느질로 고정했어요. 솜은 적당히만 넣어야 귀여운 실루엣이 나옵니다. 아이 선물로 최고!",
    },
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
    finishedImage: "그림4_완성작_겨울털모자.PNG",
    finishedCaption: "귀 덮개는 안뜨기, 챙은 겉뜨기만 사용했어요.",
    finishedDetail: {
      yarn: "알파카 실 2합 (차콜)",
      needle: "5.0mm",
      duration: "3일",
      review:
        "귀 덮개 부분은 안뜨기로 촘촘하게, 챙은 겉뜨기만 사용했어요. 겨울 내내 잘 쓰고 있습니다!",
    },
    grid: [
      [false, true, true, true, true, true, true, false],
      [true, true, false, false, false, false, true, true],
      [true, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, true],
      [true, true, false, false, false, false, true, true],
      [false, true, true, true, true, true, true, false],
    ],
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
    finishedImage: "그림5_완성작_하트코스터.PNG",
    finishedCaption: "코스터 4장 세트로 떠서 친구들에게 나눠줬어요♥",
    finishedDetail: {
      yarn: "면 실 3합 (코랄·화이트)",
      needle: "3.5mm",
      duration: "1일",
      review:
        "테이블 위에 올려두니 너무 귀엽네요. 하트 모양은 도안 그대로 따라 하면 실패 없어요!",
    },
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
    finishedImage: "그림1_완성작_베이지색가디건.PNG",
    finishedCaption:
      "사용 실: 메리노 울 100%, 바늘: 4.5mm. 뜨는 데 2주 걸렸어요!",
    finishedDetail: {
      yarn: "메리노 울 100% (베이지)",
      needle: "4.5mm",
      duration: "2주",
      review:
        "소매 부분 코줄임이 헷갈렸는데 뜨니 코칭 덕분에 완성했네요😊 몸판은 여유 있게, 소매는 14단 더 늘리면 길이감이 딱 좋아요.",
    },
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
];

export const COMMUNITY_TABS: { id: CommunityCategory }[] = [
  { id: "all" },
  { id: "best" },
  { id: "qa" },
  { id: "showcase" },
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
