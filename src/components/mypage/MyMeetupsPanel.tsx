import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MEETUP_RESERVATION_EVENT,
  OFFLINE_UPDATED_EVENT,
  loadGoodsPortfolio,
  loadJoinedMeetups,
  loadTickets,
  meetupJoinedCount,
} from "../../utils/offlineActivityStorage.ts";
import { loadHubReservedMeetups } from "../../data/hubMeetups.ts";
import { loadCurrentProgressRow } from "../../utils/editorProgressStorage.ts";
import { loc } from "../../utils/i18nContent.ts";

export default function MyMeetupsPanel() {
  const { t } = useTranslation();
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
      <h2 className="font-sans text-2xl font-bold text-gray-900">{t("mypage.meetupsTitle")}</h2>
      <p className="mt-1 font-seoyun text-sm text-stone-500">
        {t("mypage.meetupsSubtitle")}
      </p>
      {tickets.length > 0 ? (
        <div className="mt-6 rounded-[1.75rem] bg-[#FFFBF7] p-5">
          <p className="font-sans text-sm font-bold text-gray-900">{t("mypage.meetupsTickets")}</p>
          <p className="mt-1 font-seoyun text-xs text-stone-500">
            {t("mypage.meetupsTicketMeta", { count: tickets.length, row: progressRow ?? 0 })}
          </p>
          {portfolio.length > 0 ? (
            <p className="mt-2 font-seoyun text-xs text-stone-500">
              {t("mypage.meetupsGoods", { list: portfolio.flatMap((item) => item.goods).join(", ") })}
            </p>
          ) : null}
        </div>
      ) : null}
      {empty ? (
        <div className="mt-6 rounded-2xl bg-gray-50 p-10 text-center">
          <p className="font-sans text-xl font-bold text-gray-900">{t("mypage.meetupsEmptyTitle")}</p>
          <p className="mt-2 font-seoyun text-sm text-gray-500">
            {t("mypage.meetupsEmptyDesc")}
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
                  {loc(t, `content.meetups.${meetup.id}.region`, meetup.region)} ·{" "}
                  {loc(t, `content.meetups.${meetup.id}.date`, meetup.date)}
                </p>
                <h3 className="mt-1 font-sans text-lg font-bold text-gray-900">
                  {loc(t, `content.meetups.${meetup.id}.title`, meetup.title)}
                </h3>
                <p className="mt-3 font-sans text-xs font-medium text-stone-700">
                  {loc(t, `content.meetups.${meetup.id}.needle`, meetup.requiredNeedle)} ·{" "}
                  {loc(t, `content.meetups.${meetup.id}.yarn`, meetup.requiredYarn)}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between font-sans text-[10px] font-bold text-stone-400">
                    <span>
                      {t("mypage.meetupsCapacity", {
                        current: meetup.currentMembers,
                        max: meetup.maxCapacity,
                      })}
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
                  {loc(t, `content.meetups.${meetup.meetupId}.region`, meetup.region)}
                  {meetup.datetime
                    ? ` · ${loc(t, `content.meetups.${meetup.meetupId}.date`, meetup.datetime)}`
                    : ""}
                </p>
                <h3 className="mt-1 font-sans text-lg font-bold text-gray-900">
                  {loc(t, `content.meetups.${meetup.meetupId}.title`, meetup.title)}
                </h3>
                {meetup.place ? (
                  <p className="mt-2 font-seoyun text-sm text-stone-500">
                    {loc(t, `content.meetups.${meetup.meetupId}.place`, meetup.place)}
                  </p>
                ) : null}
                <p className="mt-3 font-sans text-xs font-medium text-stone-700">
                  {loc(t, `content.meetups.${meetup.meetupId}.needle`, meetup.requiredNeedle)} ·{" "}
                  {loc(t, `content.meetups.${meetup.meetupId}.yarn`, meetup.requiredYarn)}
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
                    {t("mypage.meetupsJoined", { max: meetup.maxCapacity, joined })}
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
