"use client";
import { useState, useRef, useEffect } from "react";
import { SearchFilters as ISearchFilters } from "../../types";
import { SPECIALIZATIONS, HOSPITALS } from "../../data/mockData";
import { formatDate } from "../../lib/utils";
import Calendar from "../ui/Calendar";
import Button from "../ui/Button";

interface Props {
  onSearch: (filters: ISearchFilters) => void;
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(14, 28, 54, 0.8)",
  border: "1px solid rgba(56, 189, 248, 0.15)",
  borderRadius: 12,
  padding: "10px 16px",
  color: "#f1f5f9",
  fontSize: 14,
  fontFamily: "DM Sans, sans-serif",
  outline: "none",
  cursor: "pointer",
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#64748b",
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  marginBottom: 8,
  display: "block",
};

export default function SearchFilters({ onSearch }: Props) {
  const [filters, setFilters] = useState<ISearchFilters>({
    specialization: "", hospital: "", date: "", doctorName: "",
  });
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node))
        setShowCal(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const set = (key: keyof ISearchFilters, value: string) =>
    setFilters(f => ({ ...f, [key]: value }));

  return (
    <div
      className="glass animate-fade-up-2"
      style={{ padding: 28 }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 22 }}>
        ✦ Search Filters
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Specialization */}
        <div>
          <label style={labelStyle}>Specialization</label>
          <div style={{ position: "relative" }}>
            <select
              value={filters.specialization}
              onChange={e => set("specialization", e.target.value)}
              style={selectStyle}
              onFocus={e => {
                e.target.style.borderColor = "rgba(14,165,233,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(56,189,248,0.15)";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="" style={{ background: "#0f172a" }}>All Specializations</option>
              {SPECIALIZATIONS.map(s => (
                <option key={s} value={s} style={{ background: "#0f172a" }}>{s}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none", fontSize: 10 }}>▼</span>
          </div>
        </div>

        {/* Hospital */}
        <div>
          <label style={labelStyle}>Hospital</label>
          <div style={{ position: "relative" }}>
            <select
              value={filters.hospital}
              onChange={e => set("hospital", e.target.value)}
              style={selectStyle}
              onFocus={e => {
                e.target.style.borderColor = "rgba(14,165,233,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(56,189,248,0.15)";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="" style={{ background: "#0f172a" }}>All Hospitals</option>
              {HOSPITALS.map(h => (
                <option key={h} value={h} style={{ background: "#0f172a" }}>{h}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none", fontSize: 10 }}>▼</span>
          </div>
        </div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: 16, position: "relative" }} ref={calRef}>
        <label style={labelStyle}>Preferred Date</label>
        <button
          onClick={() => setShowCal(v => !v)}
          style={{
            ...selectStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span style={{ color: filters.date ? "#f1f5f9" : "#475569" }}>
            {filters.date ? `📅  ${formatDate(filters.date)}` : "  Select a date"}
          </span>
          <span style={{ color: "#475569", fontSize: 10 }}>{showCal ? "▲" : "▼"}</span>
        </button>
        {showCal && (
          <div style={{ position: "absolute", zIndex: 100, top: "calc(100% + 8px)", left: 0 }}>
            <Calendar selected={filters.date} onSelect={d => { set("date", d); setShowCal(false); }} />
          </div>
        )}
      </div>

      {/* Doctor name */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Doctor Name</label>
        <input
          type="text"
          placeholder="e.g. Dr. Perera..."
          value={filters.doctorName}
          onChange={e => set("doctorName", e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch(filters)}
          className="input-glow"
        />
      </div>

      <Button size="lg" style={{ width: "100%" }} onClick={() => onSearch(filters)}>
        Search Doctors
      </Button>
    </div>
  );
}