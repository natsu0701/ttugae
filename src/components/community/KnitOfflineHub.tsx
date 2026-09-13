import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarFillIcon,
  ChatFillIcon,
  CheckFillIcon,
  ChevronRightFillIcon,
  CompassFillIcon,
  FileTextFillIcon,
  HeartFillIcon,
  PinFillIcon,
  QrFillIcon,
  SpinnerFillIcon,
} from "../icons/FillIcons.tsx";
import {
  issueTicket,
  toggleReservedMeetup,
  type OfflineTicket,
} from "../../utils/offlineActivityStorage.ts";
import { writeHubPatternPayload } from "../../utils/workspaceGridStorage.ts";
import { qrModules } from "../../utils/qrPattern.ts";
import { loc } from "../../utils/i18nContent.ts";
import type { TFunction } from "i18next";
import {
  HUB_MEETUPS,
  withReservationState,
  type HubMeetup,
} from "../../data/hubMeetups.ts";

type OfflineEvent = {
  id: string;
  title: string;
  type: "popup" | "exhibition" | "class";
  typeLabel: string;
  date: string;
  location: string;
  latLng: [number, number];
  description: string;
  featuredYarn: string;
  featuredNeedle: string;
};

type HubPatternPayload = {
  title: string;
  needleType: string;
  needleSize: string;
  yarnName: string;
  totalStitches: number;
  totalRows: number;
  gridCells: { x: number; y: number; hexColor: string; stitchSymbol: string }[];
};

type OfflineReview = {
  id: string;
  author: string;
  rating: number;
  eventTitle: string;
  content: string;
  hasPattern: boolean;
  attachedPatternName: string;
  attachedPatternDesc: string;
  attachedPatternData?: HubPatternPayload;
};

type LeafletMarker = {
  on: (event: string, handler: () => void) => void;
};

type LeafletMap = {
  setView: (latLng: [number, number], zoom?: number) => LeafletMap;
  flyTo: (
    latLng: [number, number],
    zoom?: number,
    options?: { animate?: boolean; duration?: number },
  ) => LeafletMap;
  zoomIn: () => void;
  zoomOut: () => void;
  remove: () => void;
  invalidateSize: () => void;
};

type LeafletNS = {
  map: (
    el: HTMLElement,
    options: { zoomControl: boolean; attributionControl: boolean },
  ) => LeafletMap;
  tileLayer: (url: string, options: { maxZoom: number }) => { addTo: (map: LeafletMap) => void };
  divIcon: (options: {
    html: string;
    className: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }) => unknown;
  marker: (
    latLng: [number, number],
    options: { icon: unknown },
  ) => LeafletMarker & { addTo: (map: LeafletMap) => LeafletMarker };
};

declare global {
  interface Window {
    L?: LeafletNS;
  }
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const SEOUL_CENTER: [number, number] = [37.538, 126.96];

const CORAL_PIN_HTML = `
  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px">
    <span style="position:absolute;width:28px;height:28px;border-radius:9999px;background:rgba(252,95,83,0.22)"></span>
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path fill="#FC5F53" d="M12 2.4c3.5 0 6.4 2.7 6.4 6.1 0 4.6-6.4 13.1-6.4 13.1S5.6 13.1 5.6 8.5C5.6 5.1 8.5 2.4 12 2.4zm0 4a2.3 2.3 0 100 4.6 2.3 2.3 0 000-4.6z"/>
    </svg>
  </div>
`;

const OFFLINE_EVENTS_DATA: OfflineEvent[] = [
  {
    id: "event_hongdae",
    title: "뜨개러투게더 캡스톤 부스 및 굿즈 팝업",
    type: "popup",
    typeLabel: "브랜드 팝업",
    date: "2026.08.20 - 2026.08.24",
    location: "서울시 마포구 와우산로 홍대 아틀리에 2층",
    latLng: [37.556, 126.924],
    description: "뜨니 오프라인 마스코트 굿즈 판매 및 실물 편물 AR 도안 인식 스캔 체험전",
    featuredYarn: "낙양모사 시그니처 울",
    featuredNeedle: "대바늘 5.0mm",
  },
  {
    id: "event_garosu",
    title: "안개 구름 모헤어 가을 기획전",
    type: "exhibition",
    typeLabel: "오프라인 기획전",
    date: "2026.09.02 - 2026.09.10",
    location: "서울시 강남구 신사동 가로수길 갤러리 메종",
    latLng: [37.521, 127.023],
    description: "프리미엄 모헤어 실 브랜드와 뜨개더의 독점 컬러 배색 팔레트 실물 쇼케이스",
    featuredYarn: "안개 구름 모헤어",
    featuredNeedle: "대바늘 3.5mm",
  },
  {
    id: "event_mangwon",
    title: "왕초보 코바늘 매직링 1일 격파 클래스",
    type: "class",
    typeLabel: "원데이 클래스",
    date: "2026.08.28",
    location: "서울시 마포구 망원 쉼터 뜨개 카페",
    latLng: [37.555, 126.901],
    description: "도안 까막눈 탈출 프로젝트. 매직링 꼬임 코 해석 및 손땀 보정 1:1 클리닉",
    featuredYarn: "포근 오가닉 코튼",
    featuredNeedle: "코바늘 4호",
  },
];

const OFFLINE_REVIEWS: OfflineReview[] = [
  {
    id: "review_1",
    author: "김해피",
    rating: 5,
    eventTitle: "뜨개러투게더 캡스톤 부스 및 굿즈 팝업",
    content:
      "홍대 아틀리에 팝업에서 실물 가디건을 스캔해 보니 도안 기호로 바로 분석되고, 현장에서 산 낙양모사 울에 맞춘 변환 도안을 공유합니다.",
    hasPattern: true,
    attachedPatternName: "완성! 베이지 가디건",
    attachedPatternDesc: "후기에 붙은 격자 도안을 에디터로 그대로 가져갈 수 있어요",
    attachedPatternData: {
      title: "완성! 베이지 가디건",
      needleType: "knitting",
      needleSize: "5.0mm",
      yarnName: "낙양모사 시그니처 울",
      totalStitches: 24,
      totalRows: 20,
      gridCells: [
        { x: 0, y: 0, hexColor: "#E8DDD0", stitchSymbol: "겉" },
        { x: 1, y: 0, hexColor: "#E8DDD0", stitchSymbol: "겉" },
        { x: 2, y: 0, hexColor: "#FFFBF7", stitchSymbol: "안" },
      ],
    },
  },
  {
    id: "review_2",
    author: "김미래",
    rating: 4,
    eventTitle: "안개 구름 모헤어 콜라보 가을 기획전",
    content:
      "가로수길 가을 기획전에서 모헤어 패키지를 받고, 웹 에디터로 불러와 리믹스하기 좋은 레이스 숄 도안을 남깁니다.",
    hasPattern: true,
    attachedPatternName: "가을 스페셜 모헤어 숄",
    attachedPatternDesc: "현장에서 한땀 한땀 뜬 기획전 특전 모헤어 도안을 에디터에 그대로 옮겨서 리믹스하세요",
    attachedPatternData: {
      title: "가을 스페셜 모헤어 숄",
      needleType: "knitting",
      needleSize: "3.5mm",
      yarnName: "안개 구름 모헤어",
      totalStitches: 32,
      totalRows: 40,
      gridCells: [
        { x: 0, y: 0, hexColor: "#FF8A9B", stitchSymbol: "늘" },
        { x: 1, y: 0, hexColor: "#FF8A9B", stitchSymbol: "줄" },
      ],
    },
  },
];

function eventTypeKey(type: OfflineEvent["type"]) {
  if (type === "popup") return "offline.typePopup";
  if (type === "exhibition") return "offline.typeExhibition";
  return "offline.typeClass";
}

function localizedEvent(t: TFunction, ev: OfflineEvent): OfflineEvent {
  const base = `content.events.${ev.id}`;
  return {
    ...ev,
    title: loc(t, `${base}.title`, ev.title),
    location: loc(t, `${base}.location`, ev.location),
    description: loc(t, `${base}.description`, ev.description),
    featuredYarn: loc(t, `${base}.yarn`, ev.featuredYarn),
    featuredNeedle: loc(t, `${base}.needle`, ev.featuredNeedle),
    typeLabel: t(eventTypeKey(ev.type)),
  };
}

function localizedMeetup(t: TFunction, meet: HubMeetup): HubMeetup {
  const base = `content.meetups.${meet.id}`;
  return {
    ...meet,
    title: loc(t, `${base}.title`, meet.title),
    region: loc(t, `${base}.region`, meet.region),
    date: loc(t, `${base}.date`, meet.date),
    requiredNeedle: loc(t, `${base}.needle`, meet.requiredNeedle),
    requiredYarn: loc(t, `${base}.yarn`, meet.requiredYarn),
  };
}

function localizedReview(t: TFunction, rev: OfflineReview): OfflineReview {
  const base = `content.reviews.${rev.id}`;
  return {
    ...rev,
    eventTitle: loc(t, `${base}.eventTitle`, rev.eventTitle),
    content: loc(t, `${base}.content`, rev.content),
    attachedPatternName: loc(t, `${base}.patternName`, rev.attachedPatternName),
    attachedPatternDesc: loc(t, `${base}.patternDesc`, rev.attachedPatternDesc),
  };
}

function loadLeafletFromCdn(): Promise<LeafletNS> {
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    const cssId = "leaflet-css-cdn";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js-cdn";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    const onReady = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet failed to load"));
    };

    if (existing) {
      if (window.L) {
        onReady();
        return;
      }
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("Leaflet script error")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = LEAFLET_JS;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", () => reject(new Error("Leaflet script error")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

type KnitOfflineHubProps = {
  onGoEditor?: () => void;
};

function KnitOfflineHub({ onGoEditor }: KnitOfflineHubProps) {
  const { t } = useTranslation();
  const [selectedEventId, setSelectedEventId] = useState("event_hongdae");
  const [meetups, setMeetups] = useState<HubMeetup[]>(() => withReservationState(HUB_MEETUPS));
  const [activeTab, setActiveTab] = useState<"map" | "meetup" | "reviews">("map");
  const [activeModalTicket, setActiveModalTicket] = useState<OfflineEvent | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<OfflineTicket | null>(null);
  const [clonedSuccessMsg, setClonedSuccessName] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(() => Boolean(window.L));
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});

  useEffect(() => {
    setMeetups(withReservationState(HUB_MEETUPS));
  }, []);

  useEffect(() => {
    if (activeTab !== "map") return;
    let cancelled = false;
    loadLeafletFromCdn()
      .then(() => {
        if (!cancelled) setLeafletLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLeafletLoaded(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    if (!leafletLoaded || activeTab !== "map" || !mapContainerRef.current || !window.L) return;
    const L = window.L;
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(SEOUL_CENTER, 12);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = {};

    const pinIcon = L.divIcon({
      html: CORAL_PIN_HTML,
      className: "custom-leaflet-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    OFFLINE_EVENTS_DATA.forEach((event) => {
      const marker = L.marker(event.latLng, { icon: pinIcon }).addTo(map);
      marker.on("click", () => setSelectedEventId(event.id));
      markersRef.current[event.id] = marker;
    });

    const active = OFFLINE_EVENTS_DATA.find((event) => event.id === selectedEventId);
    if (active) map.setView(active.latLng, 14);
    window.setTimeout(() => map.invalidateSize(), 80);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, [leafletLoaded, activeTab]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const active = OFFLINE_EVENTS_DATA.find((event) => event.id === selectedEventId);
    if (!map || !active) return;
    map.flyTo(active.latLng, 15, { animate: true, duration: 1.05 });
  }, [selectedEventId]);

  const selectedEventRaw =
    OFFLINE_EVENTS_DATA.find((event) => event.id === selectedEventId) ?? OFFLINE_EVENTS_DATA[0];
  const selectedEvent = localizedEvent(t, selectedEventRaw);

  const qrCells = useMemo(
    () => qrModules(issuedTicket?.payload || issuedTicket?.ticketCode || selectedEvent.id),
    [issuedTicket, selectedEvent.id],
  );

  const handleZoom = (direction: "in" | "out") => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (direction === "in") map.zoomIn();
    else map.zoomOut();
  };

  const handleCompass = () => {
    mapInstanceRef.current?.flyTo(SEOUL_CENTER, 12, { animate: true, duration: 0.85 });
  };

  const handleToggleJoinMeetup = (meetupId: string) => {
    const target = meetups.find((item) => item.id === meetupId);
    if (!target) return;
    if (!target.isJoined && target.currentMembers >= target.maxCapacity) return;
    toggleReservedMeetup(meetupId, !target.isJoined);
    setMeetups(withReservationState(HUB_MEETUPS));
  };

  const handleForkPattern = (review: OfflineReview) => {
    if (!review.attachedPatternData) return;
    writeHubPatternPayload(review.attachedPatternData);
    setClonedSuccessName(review.attachedPatternName);
    window.setTimeout(() => setClonedSuccessName(null), 4000);
  };

  const handleIssueTicket = (event: OfflineEvent) => {
    setSelectedEventId(event.id);
    const ticket = issueTicket(event.id, [event.featuredYarn, event.featuredNeedle]);
    setIssuedTicket(ticket);
    setActiveModalTicket(event);
  };

  return (
    <div className="w-full select-none rounded-xl border border-stone-200/50 bg-[#FFFBF7] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.015)] md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-6 border-b border-stone-200/40 pb-6 md:flex-row md:items-center">
        <div>
          <span className="rounded-full bg-coral/10 px-3.5 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-coral">
            Offline Connection
          </span>
          <h3 className="mt-2 font-sans text-xl font-black tracking-tight text-stone-900">
            {t("offline.title")}
          </h3>
          <p className="mt-1 break-keep font-seoyun text-sm font-normal text-stone-500">
            {t("offline.subtitle")}
          </p>
        </div>
        <div className="flex rounded-2xl bg-stone-100 p-1">
          {(
            [
              ["map", "offline.tabMap"],
              ["meetup", "offline.tabMeetup"],
              ["reviews", "offline.tabReviews"],
            ] as const
          ).map(([id, labelKey]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-xl px-4 py-2 font-sans text-xs font-bold transition-all ${
                activeTab === id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[560px]">
        {activeTab === "map" ? (
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <div className="flex h-auto w-full flex-col space-y-4 lg:col-span-8 lg:h-[560px]">
              <span className="block font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
                {t("offline.mapLabel")}
              </span>
              <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-xl bg-[#ECE6DC] shadow-inner">
                <div ref={mapContainerRef} className="absolute inset-0 z-10 h-full w-full" />
                {!leafletLoaded ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-3 bg-stone-50">
                    <SpinnerFillIcon className="h-8 w-8 animate-spin text-coral" />
                    <span className="font-sans text-xs font-bold tracking-wide text-stone-400">
                      {t("offline.mapLoading")}
                    </span>
                  </div>
                ) : null}
                <div className="absolute left-4 right-4 top-4 z-20">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                    <PinFillIcon className="h-4 w-4 text-coral" />
                    <input
                      type="text"
                      readOnly
                      placeholder={t("offline.mapSearchPh")}
                      className="w-full border-none bg-transparent font-sans text-[11px] font-medium text-stone-700 outline-none"
                    />
                  </div>
                </div>
                <div className="absolute bottom-16 right-4 z-20 flex flex-col gap-1.5">
                  <div className="overflow-hidden rounded-xl bg-white shadow-md">
                    <button
                      type="button"
                      onClick={() => handleZoom("in")}
                      className="flex h-9 w-9 items-center justify-center border-b border-stone-100 font-sans text-base font-bold text-stone-600 hover:bg-stone-50"
                      title={t("offline.zoomIn")}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleZoom("out")}
                      className="flex h-9 w-9 items-center justify-center font-sans text-base font-bold text-stone-600 hover:bg-stone-50"
                      title={t("offline.zoomOut")}
                    >
                      -
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompass}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-500 shadow-md hover:text-coral"
                    title={t("offline.compass")}
                  >
                    <CompassFillIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-4 z-20 rounded-lg bg-stone-900/60 px-2.5 py-1 font-sans text-[10px] tracking-tight text-stone-200">
                  {t("offline.mapHint")}
                </div>
              </div>
            </div>

            <div className="flex h-auto w-full flex-col space-y-4 lg:col-span-4 lg:h-[560px]">
              <span className="block font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
                {t("offline.detailLabel")}
              </span>
              <div className="flex flex-1 flex-col justify-between overflow-y-auto rounded-xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {OFFLINE_EVENTS_DATA.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEventId(event.id)}
                        className={`rounded-full px-2.5 py-1 font-sans text-[10px] font-bold ${
                          selectedEventId === event.id
                            ? "bg-coral text-white"
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {t(eventTypeKey(event.type))}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2 pt-1">
                    <h4 className="break-keep font-sans text-base font-black leading-snug text-stone-900">
                      {selectedEvent.title}
                    </h4>
                    <p className="break-keep border-b border-stone-100 pb-2 font-seoyun text-xs leading-relaxed text-stone-500">
                      {selectedEvent.description}
                    </p>
                  </div>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4">
                      <CalendarFillIcon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                      <div className="font-sans">
                        <span className="block text-[9px] font-bold uppercase text-stone-400">{t("offline.dateLabel")}</span>
                        <span className="text-xs font-semibold text-stone-700">{selectedEvent.date}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4">
                      <PinFillIcon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                      <div className="min-w-0 font-sans">
                        <span className="block text-[9px] font-bold uppercase text-stone-400">{t("offline.placeLabel")}</span>
                        <span className="break-all text-xs font-semibold leading-normal text-stone-700">
                          {selectedEvent.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-4 border-t border-stone-100 pt-4">
                  <div className="space-y-1.5 font-sans text-xs text-stone-500">
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-400">{t("offline.yarnMatch")}</span>
                      <strong className="whitespace-normal break-all text-right text-stone-700">
                        {selectedEvent.featuredYarn}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-400">{t("offline.needleMatch")}</span>
                      <strong className="text-stone-700">{selectedEvent.featuredNeedle}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleIssueTicket(selectedEvent)}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-coral text-xs font-bold text-white shadow-[0_4px_12px_rgba(252,95,83,0.15)] transition-all hover:bg-coral/90"
                  >
                    <QrFillIcon className="h-4 w-4" />
                    <span>{t("offline.ticket")}</span>
                  </button>
                </div>
              </div>
              <div className="break-keep rounded-2xl bg-stone-50/60 p-4 font-seoyun text-[10px] leading-relaxed text-stone-500">
                {t("offline.passHint")}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "meetup" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
                {t("offline.meetupLabel")}
              </span>
              <span className="font-sans text-xs text-stone-400">{t("offline.meetupRegion")}</span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meetups.map((meetRaw) => {
                const meet = localizedMeetup(t, meetRaw);
                const isFull = meet.currentMembers >= meet.maxCapacity;
                const percent = Math.min(
                  100,
                  Math.round((meet.currentMembers / meet.maxCapacity) * 100),
                );
                return (
                  <div
                    key={meet.id}
                    className={`relative flex flex-col justify-between rounded-2xl bg-white p-5 transition-all duration-300 ${
                      meet.isJoined ? "ring-1 ring-coral/20 shadow-sm" : "hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-2">
                      <span className="inline-block rounded bg-stone-100 px-2 py-0.5 font-sans text-[10px] font-bold text-stone-400">
                        {meet.region}
                      </span>
                      <h4 className="min-h-[40px] break-keep font-sans text-sm font-bold leading-snug text-stone-900">
                        {meet.title}
                      </h4>
                    </div>
                    <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-3 font-sans text-xs text-stone-500">
                      <div className="flex justify-between gap-2">
                        <span className="text-[10px] text-stone-400">{t("offline.needleNeeded")}</span>
                        <span className="font-semibold text-stone-700">{meet.requiredNeedle}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[10px] text-stone-400">{t("offline.yarnRecommended")}</span>
                        <span className="whitespace-normal break-all text-right font-semibold leading-normal text-stone-700">
                          {meet.requiredYarn}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[10px] text-stone-400">{t("offline.meetupCycle")}</span>
                        <span className="font-semibold text-stone-700">{meet.date}</span>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between font-sans text-[10px] font-bold text-stone-400">
                        <span>
                          {t("offline.capacity", {
                            current: meet.currentMembers,
                            max: meet.maxCapacity,
                          })}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            meet.isJoined ? "bg-coral" : "bg-stone-500"
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isFull && !meet.isJoined}
                      onClick={() => handleToggleJoinMeetup(meet.id)}
                      className={`mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl font-sans text-xs font-bold transition-colors ${
                        meet.isJoined
                          ? "bg-coral/10 text-coral hover:bg-coral/15"
                          : isFull
                            ? "cursor-not-allowed bg-stone-100 text-stone-400"
                            : "bg-stone-900 text-stone-100 hover:bg-stone-800"
                      }`}
                    >
                      {meet.isJoined ? (
                        <>
                          <CheckFillIcon className="h-3.5 w-3.5" />
                          <span>{t("offline.cancelJoin")}</span>
                        </>
                      ) : isFull ? (
                        <span>{t("offline.closed")}</span>
                      ) : (
                        <span>{isFull ? t("offline.full") : t("offline.join")}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === "reviews" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
                {t("offline.reviewLabel")}
              </span>
              <span className="font-sans text-xs text-stone-400">
                {t("offline.reviewCount", { count: OFFLINE_REVIEWS.length })}
              </span>
            </div>
            {clonedSuccessMsg ? (
                <div
                  className="fade-in flex flex-col items-start justify-between gap-3 rounded-xl bg-stone-900 px-5 py-3 text-stone-100 shadow-lg sm:flex-row sm:items-center"
                >
                  <span className="whitespace-normal break-all font-sans text-xs font-bold leading-normal">
                    {t("offline.cloneDone", { name: clonedSuccessMsg })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onGoEditor?.()}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-coral/10 px-3 py-1.5 font-sans text-[11px] font-black text-coral transition-colors hover:bg-coral/20"
                  >
                    <span>{t("offline.goNow")}</span>
                    <ChevronRightFillIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            <div className="mx-auto flex w-full flex-col gap-6">
              {OFFLINE_REVIEWS.map((revRaw) => {
                const rev = localizedReview(t, revRaw);
                return (
                <div
                  key={rev.id}
                  className="relative flex h-auto flex-col justify-between overflow-hidden rounded-xl bg-white p-6 transition-shadow hover:shadow-md md:p-8"
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-block whitespace-normal break-all rounded bg-coral/5 px-2.5 py-0.5 font-sans text-[10px] font-bold leading-normal text-coral">
                          {rev.eventTitle}
                        </span>
                        <h5 className="mt-1 font-sans text-xs font-bold text-stone-400">
                          {t("offline.author", { name: rev.author })}
                        </h5>
                      </div>
                      <div className="flex shrink-0 gap-0.5" aria-label={t("common.rating", { n: rev.rating })}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <span
                            key={index}
                            className={`h-2 w-2 rounded-full ${
                              index < rev.rating ? "bg-coral" : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="whitespace-normal break-words font-seoyun text-sm font-normal leading-relaxed text-stone-600">
                      {rev.content}
                    </p>
                    {rev.hasPattern ? (
                      <div className="flex w-full flex-col justify-between gap-5 rounded-2xl bg-stone-50 p-5 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
                            <FileTextFillIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block font-sans text-[9px] font-bold uppercase tracking-wide text-stone-400">
                              {t("offline.patternAttach")}
                            </span>
                            <span className="mt-0.5 block whitespace-normal break-all font-sans text-sm font-black leading-snug text-stone-900">
                              {rev.attachedPatternName}
                            </span>
                            <span className="mt-1 block whitespace-normal break-all font-seoyun text-xs font-normal leading-normal text-stone-500">
                              {rev.attachedPatternDesc}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleForkPattern(rev)}
                          className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-stone-950 px-5 py-3 font-sans text-[11px] font-bold text-stone-100 transition-all hover:bg-stone-800 md:w-auto"
                        >
                          <span>{t("offline.cloneEditor")}</span>
                          <ChevronRightFillIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-5 flex items-center gap-4 border-t border-stone-100 pt-4 font-sans text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <HeartFillIcon className="h-3.5 w-3.5" />
                      <span>4</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatFillIcon className="h-3.5 w-3.5" />
                      <span>2</span>
                    </span>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {activeModalTicket ? (
          <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setActiveModalTicket(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              aria-label={t("common.close")}
            />
            <div
              className="relative z-10 w-full max-w-sm space-y-6 rounded-xl bg-white p-6 text-center shadow-[0_30px_70px_rgba(0,0,0,0.15)]"
            >
              <div className="space-y-1.5">
                <span className="rounded-full bg-coral/10 px-3.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest text-coral">
                  Mobile Entrance Pass
                </span>
                <h4 className="font-sans text-base font-black leading-snug text-stone-900">
                  {t("offline.ticketTitle")}
                </h4>
                <p className="mx-auto max-w-[240px] break-keep font-seoyun text-xs text-stone-400">
                  {t("offline.ticketBody")}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-[#FFFBF7] p-4">
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white p-3 shadow-inner">
                  <svg viewBox="0 0 29 29" className="h-full w-full text-stone-900" shapeRendering="crispEdges" aria-hidden>
                    {qrCells.map((row, y) =>
                      row.map((on, x) =>
                        on ? (
                          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
                        ) : null,
                      ),
                    )}
                  </svg>
                </div>
                <div className="font-sans text-xs leading-relaxed text-stone-600">
                  <span className="block font-black text-stone-900">
                    {localizedEvent(t, activeModalTicket).title}
                  </span>
                  <span className="mt-1 block break-all font-sans text-[10px] text-stone-400">
                    {issuedTicket?.ticketCode ?? "TTEU-PASS-2026"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalTicket(null)}
                className="h-11 w-full rounded-xl bg-stone-950 font-sans text-xs font-bold text-white transition-colors hover:bg-stone-800"
              >
                {t("offline.ticketClose")}
              </button>
            </div>
          </div>
        ) : null}
    </div>
  );
}

export default memo(KnitOfflineHub);
