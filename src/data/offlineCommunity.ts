import type { EditorCell } from "../utils/patternGrid.ts";
import type { NeedleSpec } from "./knittingMetadataLibrary.ts";

export type OfflineEvent = {
  id: string;
  title: string;
  area: string;
  neighborhood: string;
  address: string;
  dateLabel: string;
  hours: string;
  host: string;
  summary: string;
  goods: string[];
  patternIds: string[];
  x: number;
  y: number;
};

export type KnittingMeetup = {
  meetupId: string;
  title: string;
  region: string;
  requiredNeedle: string;
  requiredYarn: string;
  maxCapacity: number;
  currentMembers: number;
  memberIds: string[];
  place?: string;
  datetime?: string;
  prep?: string;
  custom?: boolean;
  hostHandle?: string;
};

export type AttachedPatternData = {
  id: string;
  title: string;
  gridCols: number;
  gridRows: number;
  gridCells: EditorCell[][];
  colorMap?: Record<string, string>;
  needle?: NeedleSpec;
};

export type EventReview = {
  id: string;
  eventId: string;
  author: string;
  body: string;
  photoUrl?: string;
  createdAt: number;
  attachedPatternData?: AttachedPatternData;
};

export const DEFAULT_ACTIVITY_AREA = "마포";
export const DEFAULT_ACTIVITY_REGION = "서울시 마포구 망원동";

export const ACTIVITY_AREAS = ["마포", "서대문", "성동", "강남"] as const;

export const AREA_REGION_PREFIX: Record<string, string> = {
  마포: "서울시 마포구",
  서대문: "서울시 서대문구",
  성동: "서울시 성동구",
  강남: "서울시 강남구",
};

export type ParsedRegion = {
  area: string;
  gu: string;
  dong: string;
  raw: string;
};

const GU_TO_AREA: Record<string, string> = {
  마포구: "마포",
  서대문구: "서대문",
  성동구: "성동",
  강남구: "강남",
};

export function parseActivityRegion(raw: string): ParsedRegion {
  const text = raw.trim() || DEFAULT_ACTIVITY_REGION;
  const gu = text.match(/([가-힣]+구)/)?.[1] ?? "";
  const dong = text.match(/([가-힣]+동)/)?.[1] ?? "";
  const fromGu = GU_TO_AREA[gu];
  const fromArea = ACTIVITY_AREAS.find((area) => text.includes(area));
  return {
    area: fromGu ?? fromArea ?? DEFAULT_ACTIVITY_AREA,
    gu,
    dong,
    raw: text,
  };
}

export const OFFLINE_EVENTS: OfflineEvent[] = [
  {
    id: "ev-hongdae",
    title: "홍대 앞 뜨개 졸작 부스",
    area: "마포",
    neighborhood: "홍대",
    address: "서울 마포구 와우산로 94, 홍익대 앞 광장",
    dateLabel: "2026.08.21 - 08.23",
    hours: "11:00 - 19:00",
    host: "홍익대 섬유미술 전공",
    summary: "졸업 작품으로 뜬 가디건, 키링, 도안 카드가 한자리에 모입니다.",
    goods: ["체리 키링", "미니 하트 코스터 도안", "손뜨개 샘플 스와치"],
    patternIds: ["cp-1", "cp-5"],
    x: 26,
    y: 38,
  },
  {
    id: "ev-hapjeong",
    title: "합정 손뜨개 플리마켓",
    area: "마포",
    neighborhood: "합정",
    address: "서울 마포구 양화로 45, 합정역 인근 카페 거리",
    dateLabel: "2026.08.22",
    hours: "12:00 - 18:00",
    host: "합정 뜨개 연합",
    summary: "개인 공방과 취미 작가들이 실물 굿즈와 인쇄 도안을 나란히 팝니다.",
    goods: ["크롭 가디건", "무지개 머플러", "도안 엽서 세트"],
    patternIds: ["cp-6", "cp-2"],
    x: 22,
    y: 46,
  },
  {
    id: "ev-mangwon",
    title: "망원 공방 오픈 스튜디오",
    area: "마포",
    neighborhood: "망원",
    address: "서울 마포구 포은로 88, 망원동 골목 공방",
    dateLabel: "2026.08.29 - 08.30",
    hours: "13:00 - 20:00",
    host: "망원 실타래 공방",
    summary: "공방 문을 열고 게이지(Gauge) 상담과 소량 원사, 완성작을 함께 보여 줍니다.",
    goods: ["메리노 원사", "베이지 가디건", "게이지(Gauge) 스와치"],
    patternIds: ["cp-6"],
    x: 18,
    y: 52,
  },
  {
    id: "ev-garosu",
    title: "가로수길 브랜드 팝업 굿즈샵",
    area: "강남",
    neighborhood: "가로수길",
    address: "서울 강남구 가로수길 32, 1층 팝업",
    dateLabel: "2026.08.20 - 08.27",
    hours: "11:00 - 21:00",
    host: "니트하우스 서울",
    summary: "시즌 컬러 실과 한정 도안, 완성 니트웨어를 짧게 선보이는 팝업입니다.",
    goods: ["노란 비니", "화이트 장갑", "브랜드 도안 키트"],
    patternIds: ["cp-10", "cp-7"],
    x: 62,
    y: 68,
  },
  {
    id: "ev-seongsu",
    title: "성수 뜨개 브랜드 팝업",
    area: "성동",
    neighborhood: "성수",
    address: "서울 성동구 연무장길 12, 성수 팝업 홀",
    dateLabel: "2026.08.25 - 08.28",
    hours: "12:00 - 20:00",
    host: "루프앤루프",
    summary: "성수 골목에서 열리는 니트 브랜드 쇼룸. 도안과 완성작을 같이 만져 볼 수 있습니다.",
    goods: ["곰돌이 인형", "별 코스터", "양말 키트"],
    patternIds: ["cp-3", "cp-8", "cp-9"],
    x: 72,
    y: 40,
  },
  {
    id: "ev-ewha",
    title: "이대 앞 졸업 부스",
    area: "서대문",
    neighborhood: "이대",
    address: "서울 서대문구 이화여대길 52, 정문 앞 부스",
    dateLabel: "2026.08.24 - 08.26",
    hours: "10:00 - 18:00",
    host: "이화여대 패션디자인",
    summary: "졸업 컬렉션 중 손뜨개 피스를 부스에서 판매하고 도안 카드를 나눠 줍니다.",
    goods: ["회색 비니", "미니 스카프", "도안 카드"],
    patternIds: ["cp-4", "cp-2"],
    x: 34,
    y: 32,
  },
];

export const KNITTING_MEETUPS: KnittingMeetup[] = [
  {
    meetupId: "mt-hapjeong-cardigan",
    title: "합정역 카페에서 크롭 가디건 같이 떠요",
    region: "서울시 마포구 합정동",
    requiredNeedle: "대바늘 5.0mm",
    requiredYarn: "아란 굵기 1볼",
    maxCapacity: 6,
    currentMembers: 3,
    memberIds: [],
    place: "합정역 2번 출구 인근 창가 카페",
    datetime: "8월 23일 오후 2시",
    prep: "대바늘 5mm 보유자만",
  },
  {
    meetupId: "mt-magic-ring",
    title: "코바늘 기초 매직링 타파 모임",
    region: "서울시 마포구 서교동",
    requiredNeedle: "코바늘 3호",
    requiredYarn: "코튼 4합 1볼",
    maxCapacity: 5,
    currentMembers: 2,
    memberIds: [],
    place: "홍대입구 커뮤니티 테이블",
    datetime: "8월 24일 오후 7시",
    prep: "코바늘 3호와 면사 한 볼",
  },
  {
    meetupId: "mt-mangwon-bookcafe",
    title: "망원동 디저트 카페 크롭 가디건 뜨개 모임",
    region: "서울시 마포구 망원동",
    requiredNeedle: "대바늘 4.5mm",
    requiredYarn: "울앤더갱 메리노울 1볼",
    maxCapacity: 4,
    currentMembers: 2,
    memberIds: [],
    place: "망원동 북카페 2층",
    datetime: "8월 30일 오후 3시",
    prep: "메리노울 실장고 소지자 우선",
  },
  {
    meetupId: "mt-garosu-beanie",
    title: "가로수길에서 여름 비니 한 장 끝내기",
    region: "서울시 강남구 신사동",
    requiredNeedle: "대바늘 4.0mm",
    requiredYarn: "코튼 블렌드 1볼",
    maxCapacity: 5,
    currentMembers: 4,
    memberIds: [],
    place: "신사동 니트 카페",
    datetime: "8월 21일 오후 1시",
    prep: "대바늘 4mm, 밝은 원사",
  },
  {
    meetupId: "mt-seongsu-socks",
    title: "성수에서 양말 뒤축만 같이 보기",
    region: "서울시 성동구 성수동",
    requiredNeedle: "대바늘 2.5mm",
    requiredYarn: "핑거링 양말실 1볼",
    maxCapacity: 4,
    currentMembers: 1,
    memberIds: [],
    place: "성수 루프 스튜디오",
    datetime: "8월 26일 저녁 7시",
    prep: "대바늘 2.5mm 또는 서큘러",
  },
];

export const SEED_EVENT_REVIEWS: EventReview[] = [
  {
    id: "rv-1",
    eventId: "ev-hongdae",
    author: "뜨개하는수진",
    body: "졸작 부스에서 체리 키링을 직접 만져 보고 도안 카드까지 받아 왔어요. 현장에서 코 수 설명을 들으니 에디터에 옮기기가 훨씬 수월했습니다.",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "rv-2",
    eventId: "ev-hapjeong",
    author: "합정니터",
    body: "플리마켓에서 산 가디건 실물을 보고 배색 순서를 메모했습니다. 같은 도안을 에디터로 가져와 소매만 조금 늘려 보려고요.",
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export function eventsNearArea(area: string): OfflineEvent[] {
  const parsed = parseActivityRegion(area);
  const key = parsed.area;
  const hit = OFFLINE_EVENTS.filter((event) => event.area === key);
  const rest = OFFLINE_EVENTS.filter((event) => event.area !== key);
  return [...hit, ...rest];
}

export function meetupRegionScore(meetup: KnittingMeetup, region: string): number {
  const want = parseActivityRegion(region);
  const got = parseActivityRegion(meetup.region);
  if (want.dong && got.dong === want.dong) return 0;
  if (want.gu && got.gu === want.gu) return 1;
  if (got.area === want.area) return 2;
  return 3;
}
