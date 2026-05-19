"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMatches } from "@/lib/storage";
import type { Match } from "@/lib/storage";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

function getEventDates(matches: Match[]): Set<string> {
  const s = new Set<string>();
  matches.filter((m) => m.status === "ACCEPTE").forEach((m) => s.add(m.appliedAt.slice(0, 10)));
  return s;
}

export function StudentCalendarWidget() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setMatches(getMatches());
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
  const eventDates = getEventDates(matches);

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedMatches = matches.filter(
    (m) => m.appliedAt.slice(0, 10) === selectedDate && m.status === "ACCEPTE"
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 border-l border-gray-200 bg-white h-full flex-shrink-0 overflow-y-auto">
      <div className="px-5 py-6 border-b border-gray-100">
        <h2 className="font-heading text-base" style={{ color: "#393E41" }}>
          Agenda
        </h2>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={15} style={{ color: "#393E41" }} />
          </button>
          <span className="font-sans text-sm font-medium" style={{ color: "#393E41" }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronRight size={15} style={{ color: "#393E41" }} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-sans py-0.5" style={{ color: "#6b7280" }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = toDateStr(day);
            const isToday =
              day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isPast =
              new Date(year, month, day) <
              new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const hasEvent = eventDates.has(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="flex flex-col items-center justify-center py-0.5 gap-0.5 cursor-pointer"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans"
                  style={
                    isToday
                      ? { backgroundColor: "#FD8F03", color: "white", fontWeight: 700 }
                      : isSelected
                      ? { backgroundColor: "#e0f5f8", color: "#2292A4", fontWeight: 600 }
                      : isPast
                      ? { color: "#6b7280" }
                      : { color: "#393E41" }
                  }
                >
                  {day}
                </div>
                {hasEvent && (
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#2292A4" }} />
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="font-sans text-xs font-medium mb-2" style={{ color: "#9ca3af" }}>
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            {selectedMatches.length === 0 ? (
              <p className="font-sans text-xs" style={{ color: "#9ca3af" }}>
                Aucune mission ce jour
              </p>
            ) : (
              <div className="space-y-2">
                {selectedMatches.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg p-3 border"
                    style={{ borderColor: "#c7eaf0", backgroundColor: "rgba(34,146,164,0.06)" }}
                  >
                    <p className="font-heading text-xs" style={{ color: "#393E41" }}>
                      {m.companyName}
                    </p>
                    <p className="font-sans text-xs font-light mt-0.5" style={{ color: "#6b7280" }}>
                      {m.offerTitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
