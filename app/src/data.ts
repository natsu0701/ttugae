import type {
  Counter,
  GaugeRecord,
  Needle,
  NewsItem,
  Pattern,
  Product,
  Project,
  Question,
  ShortClip,
  Work,
  Yarn,
} from "./types.ts";

export const media = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const cardigan = media("media/cardigan.jpg");
const yarnPink = media("media/yarn-pink.jpg");
const needles = media("media/needles.jpg");
const swatchPink = media("media/swatch-pink.jpg");
const swatchGray = media("media/swatch-gray.jpg");
const swatchRose = media("media/swatch-rose.jpg");
const sweater = media("media/pattern-sweater.jpg");
const socks = media("media/proj-socks.jpg");
const bag = media("media/proj-bag.jpg");
const cream = media("media/proj-cream.jpg");
const linen = media("media/swatch-linen.jpg");
const woolSwatch = media("media/swatch-wool.jpg");
const etiNeedle = media("media/needle-eti.jpg");
const woodNeedle = media("media/needle-wood.jpg");

export const YARN_CATEGORIES = ["코튼", "린넨", "울", "폴리에스터", "나일론"] as const;
export const NEEDLE_CATEGORIES = ["대바늘", "코바늘", "특수바늘", "기타"] as const;

export const FAQ = [
  {
    q: "이 앱은 어떻게 사용하나요?",
    a: "홈에서 오늘의 뜨개를 이어서 시작하고, 뜨개가방에서 프로젝트·실·바늘을 관리해요. 게이지와 행/코 카운터는 뜨개 도구에서 열 수 있어요.",
  },
  {
    q: "행/코가 무엇인가요?",
    a: "코는 바늘에 걸려 있는 뜨개코 하나이고, 단은 그 코를 한 줄 왕복하거나 한 바퀴 돌린 줄이에요. 카운터로 지금 몇 단 몇 코인지 남겨 두세요.",
  },
  {
    q: "게이지가 무엇인가요?",
    a: "같은 실과 바늘로 10cm 안에 몇 코, 몇 단이 들어가는지예요. 세탁 전후가 달라지면 옷 치수도 달라지니 둘 다 적어두면 좋아요.",
  },
  {
    q: "뜨개 내비는 어떻게 사용하나요?",
    a: "프로젝트의 뜨개내비를 열면 지금 할 단계만 순서대로 보여 줘요. 끝난 단계는 체크하고, 다음 단계로 넘어가면 돼요.",
  },
  {
    q: "도안을 어떻게 만드나요?",
    a: "홈의 뜨개에디터에서 코 칸에 색을 찍어 스케치할 수 있어요. 완성된 웹 작업실의 도안 편집과는 따로 두는 앱 화면이에요.",
  },
];

export function seedProjects(): Project[] {
  const diary = [
    {
      title: "뜨개코 시작!",
      body: "3-2-1 순으로 김뜨개님 튜토리얼 참고",
      date: "2026.08.23",
    },
    {
      title: "소매를 완성했다~!",
      body: "3-2-1 순으로 김뜨개님 튜토리얼 참고",
      date: "2026.08.23",
    },
  ];
  return [
    {
      id: "p1",
      title: "벤쿠버 가디건",
      progress: 23,
      started: "2026.01.01",
      elapsed: 0,
      running: false,
      category: "울",
      image: cardigan,
      ago: "10시간 전",
      patternId: "pt1",
      parts: [
        { id: "sleeve", name: "왼쪽 팔", count: 23, done: false, ago: "10시간 전" },
        { id: "body", name: "몸통", count: null, done: true, ago: "10시간 전" },
      ],
      diary,
    },
    {
      id: "p2",
      title: "크림 풀오버",
      progress: 41,
      started: "2026.02.02",
      elapsed: 5400,
      running: false,
      category: "울",
      image: sweater,
      ago: "1일 전",
      patternId: "pt1",
      parts: [
        { id: "yoke", name: "요크", count: 18, done: false, ago: "1일 전" },
        { id: "hem", name: "밑단", count: null, done: false, ago: "2일 전" },
      ],
      diary,
    },
    {
      id: "p3",
      title: "레이스 양말",
      progress: 12,
      started: "2026.03.11",
      elapsed: 900,
      running: false,
      category: "코튼",
      image: socks,
      ago: "3일 전",
      patternId: "pt1",
      parts: [{ id: "cuff", name: "목", count: 8, done: false, ago: "3일 전" }],
      diary,
    },
    {
      id: "p4",
      title: "버튼 미니백",
      progress: 67,
      started: "2025.12.20",
      elapsed: 12000,
      running: false,
      category: "코튼",
      image: bag,
      ago: "5시간 전",
      patternId: "pt1",
      parts: [{ id: "body", name: "몸통", count: 40, done: false, ago: "5시간 전" }],
      diary,
    },
    {
      id: "p5",
      title: "포근 목도리",
      progress: 8,
      started: "2026.04.01",
      elapsed: 300,
      running: false,
      category: "린넨",
      image: cream,
      ago: "10시간 전",
      patternId: "pt1",
      parts: [{ id: "edge", name: "가장자리", count: 6, done: false, ago: "10시간 전" }],
      diary,
    },
    {
      id: "p6",
      title: "노란 비니",
      progress: 55,
      started: "2026.01.18",
      elapsed: 3600,
      running: false,
      category: "울",
      image: media("media/pop-beanie.jpg"),
      ago: "어제",
      patternId: "pt1",
      parts: [{ id: "crown", name: "정수리", count: 12, done: true, ago: "어제" }],
      diary,
    },
  ];
}

export function seedYarns(): Yarn[] {
  return [
    {
      id: "y1",
      name: "KKU Cotton",
      brandLine: "Black #01 · #000000",
      code: "Black #01 · #000000",
      thickness: "3mm",
      balls: 2.5,
      material: "cotton 100%",
      weight: "50g",
      length: "110m",
      needle: "3.0 - 3.5mm",
      place: "바구니 A-1",
      memo: "여름 가디건용. 세탁 후 줄어드니 게이지를 한 번 더 확인.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      category: "코튼",
      lot: "Lot 118",
      colorName: "블랙",
      image: swatchPink,
      recent: true,
      linkedProject: "벤쿠버 가디건",
    },
    {
      id: "y2",
      name: "링구사 수면사",
      brandLine: "Black #01 · #000000",
      code: "Black #01 · #000000",
      thickness: "3mm",
      balls: 2.5,
      material: "wool 70% acrylic 30%",
      weight: "40g",
      length: "95m",
      needle: "3.0mm",
      place: "서랍 B-2",
      memo: "수면사용. 보풀이 적어요.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      category: "울",
      lot: "Lot 077",
      colorName: "차콜",
      image: swatchGray,
      recent: true,
    },
    {
      id: "y3",
      name: "KKU Cotton",
      brandLine: "Rose #04 · #e7b7b2",
      code: "Rose #04 · #e7b7b2",
      thickness: "3mm",
      balls: 1.5,
      material: "cotton 100%",
      weight: "50g",
      length: "110m",
      needle: "3.0 - 3.5mm",
      place: "바구니 A-1",
      memo: "배색용으로 조금만 남았어요.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      category: "코튼",
      lot: "Lot 119",
      colorName: "로즈",
      image: swatchRose,
      recent: true,
      linkedProject: "버튼 미니백",
    },
    {
      id: "y4",
      name: "낙양모사 시그니처 울",
      brandLine: "베이비 핑크",
      code: "Pink #12 · #f3b6c0",
      thickness: "4.5mm",
      balls: 3.5,
      material: "wool 100%",
      weight: "50g",
      length: "100m",
      needle: "4.0 - 5.0mm",
      place: "바구니 A-1",
      memo: "부드러워서 아기 옷 뜨기에 좋음.\n세탁 주의.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      category: "울",
      lot: "Lot 203",
      colorName: "베이비 핑크",
      image: yarnPink,
      recent: false,
      linkedProject: "크림 풀오버",
    },
    {
      id: "y5",
      name: "리네나 슬럽",
      brandLine: "Sand #02",
      code: "Sand #02 · #e6d3b4",
      thickness: "2.5mm",
      balls: 4,
      material: "linen 100%",
      weight: "40g",
      length: "130m",
      needle: "2.5 - 3.0mm",
      place: "선반 C",
      memo: "여름 탑용. 슬럽이 있어요.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      category: "린넨",
      lot: "Lot 014",
      colorName: "샌드",
      image: linen,
      recent: false,
    },
  ];
}

export function seedNeedles(): Needle[] {
  return [
    {
      id: "n1",
      name: "블럭 바늘",
      category: "대바늘",
      size: "4.5mm",
      material: "목재",
      kind: "조립식 대바늘",
      cable: "0cm",
      place: "바구니 A-1",
      memo: "부드러워서 아기 옷 뜨기에 좋음.\n세탁 주의.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      lot: "Lot 203",
      image: needles,
      recent: true,
      brandLine: "실버",
      meta: "4.5mm · 조립식",
    },
    {
      id: "n2",
      name: "에티모 레드 코바늘",
      category: "코바늘",
      size: "4.0mm",
      material: "알루미늄",
      kind: "코바늘",
      cable: "0cm",
      place: "필통",
      memo: "손잡이가 짧아 휴대가 편해요.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      lot: "Lot 088",
      image: etiNeedle,
      recent: true,
      brandLine: "4/0호(4mm)",
      meta: "3 balls",
    },
    {
      id: "n3",
      name: "자누 고밀도 면사 바늘",
      category: "코바늘",
      size: "5.0mm",
      material: "플라스틱",
      kind: "코바늘",
      cable: "0cm",
      place: "서랍 B-2",
      memo: "두꺼운 가방 뜰 때 사용.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      lot: "Lot 021",
      image: woodNeedle,
      recent: false,
      brandLine: "6/0호(5mm)",
      meta: "1.5 balls",
    },
    {
      id: "n4",
      name: "케이블 대바늘 80cm",
      category: "대바늘",
      size: "3.5mm",
      material: "스틸",
      kind: "줄바늘",
      cable: "80cm",
      place: "바구니 A-1",
      memo: "원형뜨기 풀오버용.",
      shop: "바늘이야기",
      shopUrl: "http://banulstory.kku.ac.kr",
      lot: "Lot 310",
      image: needles,
      recent: true,
      brandLine: "3.5mm / 80cm",
      meta: "줄바늘",
    },
  ];
}

export function seedGauges(): GaugeRecord[] {
  return [
    {
      id: "g1",
      name: "울 3합",
      thickness: "3mm",
      yarnName: "매기",
      before: "30단 × 28코",
      after: "30단 × 28코",
      image: woolSwatch,
      projectId: "p1",
      needle: "대바늘 3mm",
      pattern: "벤쿠버 가디건",
    },
  ];
}

export function seedCounters(): Counter[] {
  return [
    {
      id: "c1",
      name: "12카운터",
      projectId: "p1",
      rows: [
        { id: "rows", label: "현재 단수", value: 0 },
        { id: "sts", label: "현재 코수", value: 0 },
      ],
    },
    {
      id: "c2",
      name: "8카운터",
      projectId: null,
      rows: [
        { id: "rows", label: "현재 단수", value: 8 },
        { id: "sts", label: "현재 코수", value: 0 },
      ],
    },
    {
      id: "c3",
      name: "20행 12코",
      projectId: "p3",
      rows: [
        { id: "rows", label: "현재 단수", value: 20 },
        { id: "sts", label: "현재 코수", value: 12 },
      ],
    },
  ];
}

export const PATTERNS: Pattern[] = [
  {
    id: "pt1",
    title: "원형뜨기 풀오버 스웨터",
    needles: "3.75mm / 3.25mm",
    summary: "둥근 목과 요크 무늬로 부드러운 분위기로 변하는 탑다운 풀오버.",
    tags: ["#요크무늬", "#탑다운"],
    image: sweater,
    price: "12,000원",
    seller: "김뜨개",
  },
  {
    id: "pt2",
    title: "그라니 스퀘어 가디건",
    needles: "4.5mm",
    summary: "모티브 23개를 이어 소매와 몸통을 만드는 가디건.",
    tags: ["#모티브", "#가디건"],
    image: cardigan,
    price: "15,000원",
    seller: "이현수",
  },
];

export const WORKS: Work[] = [
  { id: "w1", author: "김뜨개", title: "가을마음 가디건", likes: 123, image: media("media/pop-brown.jpg") },
  { id: "w2", author: "이은주", title: "분홍 스웨터", likes: 456, image: media("media/pop-pink.jpg") },
  { id: "w3", author: "이현수", title: "핑크 장갑", likes: 789, image: media("media/pop-mittens.jpg") },
  { id: "w4", author: "김미니", title: "노란 비니", likes: 123, image: media("media/pop-beanie.jpg") },
  { id: "w5", author: "가민", title: "도톰 담요!", likes: 456, image: media("media/pop-blanket.jpg") },
  { id: "w6", author: "이현수", title: "포근 겨울 양말", likes: 789, image: media("media/pop-sock.jpg") },
];

export const NEWS: NewsItem[] = [
  {
    id: "nw1",
    title: "겨울 실이 들어왔어요",
    body: "울 3합과 모헤어를 먼저 풀어 두었어요. 게이지 스와치를 같이 올리면 치수 실수를 줄일 수 있어요.",
    image: media("media/news-yarn.jpg"),
  },
  {
    id: "nw2",
    title: "손끝에서 시작하는 기록",
    body: "뜬 시간과 단수를 남겨 두면 다음 소매를 맞추기 쉬워요. 프로젝트 타이머와 카운터를 같이 써 보세요.",
    image: media("media/news-hands.jpg"),
  },
  {
    id: "nw3",
    title: "배색 도안 스케치",
    body: "코 칸에 색을 찍어 두면 모티프 순서를 잊지 않아요. 앱 스케치는 웹 작업실과 따로 저장돼요.",
    image: media("media/news-knit.jpg"),
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "m1",
    title: "원형뜨기 풀오버 도안",
    seller: "김뜨개",
    price: "12,000원",
    kind: "도안",
    image: sweater,
    blurb: "탑다운 요크, 미터법 치수표가 포함되어 있어요.",
  },
  {
    id: "m2",
    title: "낙양모사 시그니처 울",
    seller: "바늘이야기",
    price: "6,500원",
    kind: "실",
    image: yarnPink,
    blurb: "Lot 203 · wool 100% · 권장 바늘 4.0–5.0mm",
  },
  {
    id: "m3",
    title: "조립식 대바늘 세트",
    seller: "바늘이야기",
    price: "18,000원",
    kind: "바늘",
    image: needles,
    blurb: "4.5mm 블럭 바늘. 케이블은 따로 끼워요.",
  },
  {
    id: "m4",
    title: "게이지 읽는 저녁 클래스",
    seller: "이현수",
    price: "25,000원",
    kind: "클래스",
    image: cardigan,
    blurb: "세탁 전후 게이지를 재고 치수로 바꾸는 한 시간.",
  },
];

export const SHORTS: ShortClip[] = [
  { id: "s1", title: "포인트 컬러로 완성하는 겨울 룩", author: "명훈명훈", length: "01:22", image: media("media/pop-mittens.jpg") },
  { id: "s2", title: "셀럽들의 공항 패션 스타일 분석", author: "앗딱", length: "01:22", image: media("media/news-yarn.jpg") },
  { id: "s3", title: "신규 브랜드 탐방: 떠오르는 디자이너들", author: "차투리", length: "01:22", image: sweater },
  { id: "s4", title: "겨울 필수 아이템, 따뜻한 코트", author: "노을빛", length: "01:22", image: media("media/coat.jpg") },
  { id: "s5", title: "KOREADB 2025 뉴 컬렉션", author: "푸른바다", length: "01:22", image: media("media/pop-pink.jpg") },
];

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "소매 게이지가 몸통보다 촘촘해요",
    body: "같은 실인데 소매만 코가 작아요. 바늘을 한 치수 올려야 할까요?",
    author: "하늘바다",
    answers: 4,
  },
  {
    id: "q2",
    title: "세탁 후 단이 줄었어요",
    body: "30단이 28단이 됐어요. 다음 작품은 세탁 후 게이지로 계산하면 될까요?",
    author: "모카모카",
    answers: 6,
  },
  {
    id: "q3",
    title: "모티브 이음선이 튀어나와요",
    body: "그라니 스퀘어를 이어뜨면 솔기가 도톰해져요. 어떤 이음을 쓰나요?",
    author: "실꾸미기 팀",
    answers: 3,
  },
];

export const KINGS = [
  { name: "김뜨개", crown: "#f0c14a", works: 13, rows: 223, sts: 1023 },
  { name: "이현수", crown: "#c9c9c9", works: 13, rows: 223, sts: 1023 },
  { name: "김미니", crown: "#f3b4b0", works: 13, rows: 223, sts: 1023 },
];

export const NAVI_STEPS = [
  "코 120개로 사슬을 시작해요",
  "고무단을 8단 떠요",
  "몸통 무늬를 23단까지 올려요",
  "왼쪽 소매를 이어서 떠요",
  "시보리로 마감하고 실을 정리해요",
];

export const NOTIFICATIONS = [
  { title: "벤쿠버 가디건", body: "어제 몸통까지 떠 두었어요. 오늘은 왼쪽 팔 23단부터예요." },
  { title: "게이지", body: "10cm에 20코, 목표 60cm면 120코예요. 저장해 둘까요?" },
  { title: "이번 달 뜨개왕", body: "김뜨개, 이현수, 김미니의 기록이 올라왔어요." },
];

export const REVIEWS = [
  {
    name: "하늘바다",
    stars: 5,
    body: "색감이 예쁘고 결이 고르게 보여서 초보인데도 실패가 적었어요.",
    comments: 15,
  },
  {
    name: "모카모카",
    stars: 4,
    body: "여름용이라고 해서 샀는데 형태가 잘 잡혔어요. 세탁망은 꼭 써요.",
    comments: 15,
  },
];

export const CODEX_POSTS = [
  {
    team: "실꾸미기 팀",
    body: "이 실로 가디건 뜨면 무게감이 적어서 착용감이 좋아요.",
    tags: ["#가디건", "#겨울옷"],
    likes: 123,
    image: cardigan,
  },
  {
    team: "손끝의 기록",
    body: "권장 바늘을 맞추니 게이지가 딱 맞았어요.",
    tags: ["#스피릿"],
    likes: 123,
    image: sweater,
  },
];

export function formatClock(total: number) {
  const safe = Math.max(0, Math.floor(total));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function ballsLabel(balls: number) {
  return Number.isInteger(balls) ? `${balls} balls` : `${balls} balls`;
}
