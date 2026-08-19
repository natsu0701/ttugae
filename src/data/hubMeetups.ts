import { loadReservedMeetupIds } from "../utils/offlineActivityStorage.ts";

export type HubMeetup = {
  id: string;
  title: string;
  region: string;
  date: string;
  requiredNeedle: string;
  requiredYarn: string;
  maxCapacity: number;
  currentMembers: number;
  isJoined: boolean;
};

export const HUB_MEETUPS: HubMeetup[] = [
  {
    id: "meetup_mangwon",
    title: "망원동 북카페 대바늘 가디건 소소한 수다 모임",
    region: "서울시 마포구 망원동",
    date: "매주 토요일 오후 2시",
    requiredNeedle: "대바늘 5.0mm",
    requiredYarn: "낙양모사 시그니처 울",
    maxCapacity: 6,
    currentMembers: 4,
    isJoined: false,
  },
  {
    id: "meetup_gangnam",
    title: "강남역 모여서 뜨는 인스타 크롭 가디건 번개",
    region: "서울시 강남구 역삼동",
    date: "2026.08.22 오후 7시",
    requiredNeedle: "대바늘 4.5mm",
    requiredYarn: "뽀송 메리노울",
    maxCapacity: 4,
    currentMembers: 3,
    isJoined: false,
  },
  {
    id: "meetup_hongdae",
    title: "홍대 코바늘 자수 소품 및 입문 티코스터 모임",
    region: "서울시 마포구 서교동",
    date: "매주 목요일 오전 11시",
    requiredNeedle: "코바늘 5호",
    requiredYarn: "포근 오가닉 코튼",
    maxCapacity: 8,
    currentMembers: 2,
    isJoined: false,
  },
];

export function withReservationState(list: HubMeetup[]): HubMeetup[] {
  const reserved = new Set(loadReservedMeetupIds());
  return list.map((meetup) => {
    const isJoined = reserved.has(meetup.id);
    return {
      ...meetup,
      isJoined,
      currentMembers: Math.min(
        meetup.maxCapacity,
        meetup.currentMembers + (isJoined ? 1 : 0),
      ),
    };
  });
}

export function loadHubReservedMeetups(): HubMeetup[] {
  return withReservationState(HUB_MEETUPS).filter((meetup) => meetup.isJoined);
}
