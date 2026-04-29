"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type CalendarEvent = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string | null;
  match: {
    offer: {
      title: string;
      location: string;
      company: { companyName: string };
    };
  };
};

const DAYS_HEADER = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function StudentCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []));
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const eventDates = new Set(events.map((e) => e.date));

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(day: number) {
    const dateStr = toDateStr(day);
    const dayDate = new Date(year, month, day);
    const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isPast) return;

    setSelectedDate(dateStr);
    setSheet(true);
  }

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
        <h1 className="font-heading text-xl" style={{ color: "#393E41" }}>Calendrier</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2">
            <ChevronLeft size={22} style={{ color: "#393E41" }} />
          </button>
          <h2 className="font-heading text-lg" style={{ color: "#393E41" }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2">
            <ChevronRight size={22} style={{ color: "#393E41" }} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_HEADER.map((d, i) => (
            <div key={i} className="text-center text-xs font-sans py-1" style={{ color: "#9ca3af" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = toDateStr(day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const hasEvent = eventDates.has(dateStr);

            return (
              <div
                key={day}
                onClick={() => !isPast && handleDayClick(day)}
                className="flex flex-col items-center justify-center py-1.5 gap-0.5 cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans"
                  style={
                    isToday
                      ? { backgroundColor: "#FD8F03", color: "white", fontWeight: 700 }
                      : isPast
                      ? { color: "#d1d5db", opacity: 0.4 }
                      : { color: "#393E41" }
                  }
                >
                  {day}
                </div>
                {hasEvent && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2292A4" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base" style={{ color: "#393E41" }}>
                {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <button onClick={() => setSheet(false)}>
                <X size={20} style={{ color: "#9ca3af" }} />
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="space-y-3">
                <p className="font-sans font-light text-sm text-gray-400">Aucune mission ce jour.</p>
                <button
                  className="w-full py-3 rounded-xl text-white font-heading text-sm"
                  style={{ backgroundColor: "#FD8F03" }}
                >
                  Marquer comme disponible
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl p-4 border" style={{ borderColor: "#e2e3d8", backgroundColor: "#F6F7EB" }}>
                    <p className="font-heading text-sm" style={{ color: "#393E41" }}>{ev.match.offer.company.companyName}</p>
                    <p className="font-sans font-light text-sm mt-0.5" style={{ color: "#6b7280" }}>{ev.match.offer.title}</p>
                    <p className="font-sans font-light text-xs mt-1" style={{ color: "#9ca3af" }}>
                      {ev.startTime} – {ev.endTime} · {ev.match.offer.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
