import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { KnitCalendarEvent } from "../../utils/knittingLogStorage.ts";

type KnitCalendarProps = {
  events: KnitCalendarEvent[];
};

function KnitCalendar({ events }: KnitCalendarProps) {
  const { t } = useTranslation();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const byDate = useMemo(() => {
    const map = new Map<string, KnitCalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-title text-gray-900">{t("mypage.calendar.title")}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-base hover:bg-stone-100"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            {t("community.prevPage")}
          </button>
          <span className="font-sans text-base font-medium">
            {year}.{String(month + 1).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-base hover:bg-stone-100"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            {t("community.nextPage")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-sans text-sm text-stone-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <div key={`e-${index}`} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hits = byDate.get(key) ?? [];
          return (
            <div
              key={key}
              className={`min-h-16 rounded-lg border p-1 text-left ${
                hits.length ? "border-coral/40 bg-coral/5" : "border-transparent bg-stone-50"
              }`}
            >
              <p className="font-sans text-sm font-medium text-stone-600">{day}</p>
              {hits.slice(0, 2).map((event) => (
                <p key={`${event.kind}-${event.title}`} className="truncate font-sans text-sm text-stone-500">
                  {event.title}
                </p>
              ))}
            </div>
          );
        })}
      </div>
      <ul className="mt-4 space-y-1 font-sans text-sm text-stone-500">
        <li>{t("mypage.calendar.legendFinished")}</li>
        <li>{t("mypage.calendar.legendBadge")}</li>
        <li>{t("mypage.calendar.legendMeetup")}</li>
      </ul>
    </div>
  );
}

export default memo(KnitCalendar);
