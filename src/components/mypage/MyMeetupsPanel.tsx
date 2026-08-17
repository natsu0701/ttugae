import { useEffect, useMemo, useState } from "react";
import {
  MEETUP_RESERVATION_EVENT,
  OFFLINE_UPDATED_EVENT,
  loadGoodsPortfolio,
  loadJoinedMeetups,
  loadTickets,
  meetupJoinedCount,
} from "../../utils/offlineActivityStorage.ts";
import { loadHubReservedMeetups } from "../community/KnitOfflineHub.tsx";
import { loadCurrentProgressRow } from "../../utils/editorProgressStorage.ts";

export default function MyMeetupsPanel() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(OFFLINE_UPDATED_EVENT, bump);
    window.addEventListener(MEETUP_RESERVATION_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(OFFLINE_UPDATED_EVENT, bump);
      window.removeEventListener(MEETUP_RESERVATION_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const storeMeetups = useMemo(() => loadJoinedMeetups(), [tick]);
  const hubMeetups = useMemo(() => loadHubReservedMeetups(), [tick]);
  const tickets = useMemo(() => loadTickets(), [tick]);
  const portfolio = useMemo(() => loadGoodsPortfolio(), [tick]);
  const progressRow = loadCurrentProgressRow();
  const empty = storeMeetups.length === 0 && hubMeetups.length === 0;

  return (
    <div>
      <h2 className="font-sans text-2xl font-bold text-gray-900">내가 예약한 뜨개 모임</h2>
      <p className="mt-1 font-seoyun text-sm text-stone-500">
        라운지에서 참가한 소모임이 새로고침 없이 여기에 바로 펼쳐집니다.
      </p>
      {tickets.length > 0 ? (
        <div className="mt-6 rounded-[1.75rem] bg-[#FFFBF7] p-5">
          <p className="font-sans text-sm font-bold text-gray-900">현장 참여 증적</p>
          <p className="mt-1 font-seoyun text-xs text-stone-500">
            QR 입장권 {tickets.length}장 · 진행 단 {progressRow ?? 0}단 세션 보존
          </p>
          {portfolio.length > 0 ? (
            <p className="mt-2 font-seoyun text-xs text-stone-500">
              굿즈 포트폴리오: {portfolio.flatMap((item) => item.goods).join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
      {empty ? (
        <div className="mt-6 rounded-2xl bg-gray-50 p-10 text-center">
          <p className="font-sans text-xl font-bold text-gray-900">아직 예약한 모임이 없어요</p>
          <p className="mt-2 font-seoyun text-sm text-gray-500">
            라운지의 오프라인 모임 및 행사 탭에서 참가 신청하기를 눌러 보세요.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {hubMeetups.map((meetup) => {
            const percent = Math.min(
              100,
              Math.round((meetup.currentMembers / meetup.maxCapacity) * 100),
            );
            return (
              <article key={meetup.id} className="rounded-[1.75rem] bg-stone-50 p-5">
                <p className="font-sans text-[11px] font-medium tracking-wide text-stone-400">
                  {meetup.region} · {meetup.date}
                </p>
                <h3 className="mt-1 font-sans text-lg font-bold text-gray-900">{meetup.title}</h3>
                <p className="mt-3 font-sans text-xs font-medium text-stone-700">
                  {meetup.requiredNeedle} · {meetup.requiredYarn}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between font-sans text-[10px] font-bold text-stone-400">
                    <span>
                      신청 정원 {meetup.currentMembers} / {meetup.maxCapacity}명
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full rounded-full bg-coral transition-all duration-500"
                    />
                  </div>
                </div>
              </article>
            );
          })}
          {storeMeetups.map((meetup) => {
            const joined = meetupJoinedCount(meetup);
            return (
              <article key={meetup.meetupId} className="rounded-[1.75rem] bg-stone-50 p-5">
                <p className="font-sans text-[11px] font-medium tracking-wide text-stone-400">
                  {meetup.region}
                  {meetup.datetime ? ` · ${meetup.datetime}` : ""}
                </p>
                <h3 className="mt-1 font-sans text-lg font-bold text-gray-900">{meetup.title}</h3>
                {meetup.place ? (
                  <p className="mt-2 font-seoyun text-sm text-stone-500">{meetup.place}</p>
                ) : null}
                <p className="mt-3 font-sans text-xs font-medium text-stone-700">
                  {meetup.requiredNeedle} · {meetup.requiredYarn}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: meetup.maxCapacity }, (_, index) => (
                      <span
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index < joined ? "bg-coral" : "bg-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-seoyun text-xs text-stone-500">
                    정원 {meetup.maxCapacity}명 중 {joined}명 참여 중
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
