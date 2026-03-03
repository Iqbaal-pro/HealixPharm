"use client";
import { useState } from "react";

interface CalendarProps {
  selected: string;
  onSelect: (date: string) => void;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear]   = useState(today.getFullYear());

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isPast = (day: number): boolean => {
    const d = new Date(year, month, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const fmt = (d: number): string =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-72 shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-white">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs text-slate-500 font-semibold py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const past = isPast(day);
          const sel  = selected === fmt(day);
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => onSelect(fmt(day))}
              className={`
                h-8 w-full rounded-lg text-xs font-semibold transition-colors
                ${sel  ? "bg-blue-600 text-white" : ""}
                ${past ? "text-slate-700 cursor-not-allowed" : ""}
                ${!sel && !past ? "text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}