"use client";
import { useState, useRef, useEffect } from "react";
import { SearchFilters as ISearchFilters } from "../../types";
import { fetchFilterOptions } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import Calendar from "../ui/Calendar";
import Button from "../ui/Button";

interface Props {
  onSearch: (filters: ISearchFilters) => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#64748b",
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  marginBottom: 8,
  display: "block",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(14, 28, 54, 0.8)",
  border: "1px solid rgba(56, 189, 248, 0.15)",
  borderRadius: 12,
  padding: "10px 16px",
  color: "#f1f5f9",
  fontSize: 14,
  fontFamily: "DM Sans, sans-serif",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function SearchFilters({ onSearch }: Props) {
  const [filters, setFilters] = useState<ISearchFilters>({
    specialization: "", hospital: "", date: "", doctorName: "",
  });
  const [showCal, setShowCal]           = useState(false);
  const [showSpecMenu, setShowSpecMenu] = useState(false);
  const [showHospMenu, setShowHospMenu] = useState(false);
  const calRef  = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const hospRef = useRef<HTMLDivElement>(null);

  const [specializations, setSpecializations] = useState<string[]>([]);
  const [hospitals, setHospitals]             = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading]   = useState(true);

  useEffect(() => {
    fetchFilterOptions()
      .then(({ specializations, hospitals }) => {
        setSpecializations(specializations);
        setHospitals(hospitals);
      })
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current  && !calRef.current.contains(e.target as Node))  setShowCal(false);
      if (specRef.current && !specRef.current.contains(e.target as Node)) setShowSpecMenu(false);
      if (hospRef.current && !hospRef.current.contains(e.target as Node)) setShowHospMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const set = (key: keyof ISearchFilters, value: string) =>
    setFilters(f => ({ ...f, [key]: value }));

  const menuStyle: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
    background: "#0d1f38", border: "1px solid rgba(56,189,248,0.2)",
    borderRadius: 12, zIndex: 200, maxHeight: 220, overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  const optStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 16px", fontSize: 14, color: active ? "#38bdf8" : "#cbd5e1",
    background: active ? "rgba(56,189,248,0.08)" : "transparent",
    cursor: "pointer", transition: "background 0.15s",
  });

  const triggerStyle = (open: boolean): React.CSSProperties => ({
    ...inputBase,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    cursor: "pointer",
    borderColor: open ? "rgba(14,165,233,0.5)" : "rgba(56,189,248,0.15)",
    boxShadow: open ? "0 0 0 3px rgba(14,165,233,0.1)" : "none",
    opacity: optionsLoading ? 0.5 : 1,
  });

  return (
    <div className="glass animate-fade-up-2" style={{ padding: 28 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 22 }}>
        ✦ Search Filters
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Specialization custom dropdown */}
        <div>
          <label style={labelStyle}>Specialization</label>
          <div style={{ position: "relative" }} ref={specRef}>
            <button
              onClick={() => { if (!optionsLoading) { setShowSpecMenu(v => !v); setShowHospMenu(false); }}}
              style={triggerStyle(showSpecMenu)}
            >
              <span style={{ color: filters.specialization ? "#f1f5f9" : "#475569" }}>
                {optionsLoading ? "Loading..." : filters.specialization || "All Specializations"}
              </span>
              <span style={{ color: "#475569", fontSize: 10 }}>{showSpecMenu ? "▲" : "▼"}</span>
            </button>
            {showSpecMenu && (
              <div style={menuStyle}>
                {[{ label: "All Specializations", value: "" }, ...specializations.map(s => ({ label: s, value: s }))].map(opt => (
                  <div
                    key={opt.value}
                    style={optStyle(filters.specialization === opt.value)}
                    onClick={() => { set("specialization", opt.value); setShowSpecMenu(false); }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = filters.specialization === opt.value ? "rgba(56,189,248,0.08)" : "transparent")}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hospital custom dropdown */}
        <div>
          <label style={labelStyle}>Hospital</label>
          <div style={{ position: "relative" }} ref={hospRef}>
            <button
              onClick={() => { if (!optionsLoading) { setShowHospMenu(v => !v); setShowSpecMenu(false); }}}
              style={triggerStyle(showHospMenu)}
            >
              <span style={{ color: filters.hospital ? "#f1f5f9" : "#475569" }}>
                {optionsLoading ? "Loading..." : filters.hospital || "All Hospitals"}
              </span>
              <span style={{ color: "#475569", fontSize: 10 }}>{showHospMenu ? "▲" : "▼"}</span>
            </button>
            {showHospMenu && (
              <div style={menuStyle}>
                {[{ label: "All Hospitals", value: "" }, ...hospitals.map(h => ({ label: h, value: h }))].map(opt => (
                  <div
                    key={opt.value}
                    style={optStyle(filters.hospital === opt.value)}
                    onClick={() => { set("hospital", opt.value); setShowHospMenu(false); }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = filters.hospital === opt.value ? "rgba(56,189,248,0.08)" : "transparent")}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: 16, position: "relative" }} ref={calRef}>
        <label style={labelStyle}>Preferred Date</label>
        <button
          onClick={() => { setShowCal(v => !v); setShowSpecMenu(false); setShowHospMenu(false); }}
          style={triggerStyle(showCal)}
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