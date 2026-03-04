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
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const fmt = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      className="animate-scale-in"
      style={{
        background: "rgba(8, 18, 40, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: 16,
        padding: 20,
        width: 280,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          style={{
            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(56,189,248,0.15)",
            background: "rgba(14,165,233,0.08)", color: "#38bdf8",
            cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,165,233,0.18)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,165,233,0.08)")}
        >‹</button>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{
            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(56,189,248,0.15)",
            background: "rgba(14,165,233,0.08)", color: "#38bdf8",
            cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,165,233,0.18)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,165,233,0.08)")}
        >›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#475569", fontWeight: 600, padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const past = isPast(day);
          const sel  = selected === fmt(day);
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => onSelect(fmt(day))}
              style={{
                height: 32,
                borderRadius: 8,
                border: sel ? "1px solid rgba(14,165,233,0.6)" : "1px solid transparent",
                background: sel
                  ? "linear-gradient(135deg, #0ea5e9, #38bdf8)"
                  : "transparent",
                color: sel ? "#fff" : past ? "#1e293b" : "#cbd5e1",
                fontSize: 12,
                fontWeight: sel ? 700 : 400,
                cursor: past ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                boxShadow: sel ? "0 0 12px rgba(14,165,233,0.4)" : "none",
              }}
              onMouseEnter={e => {
                if (!past && !sel) {
                  e.currentTarget.style.background = "rgba(14,165,233,0.1)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!past && !sel) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}