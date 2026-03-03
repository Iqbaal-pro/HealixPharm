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

export default function SearchFilters({ onSearch }: Props) {
  const [filters, setFilters] = useState<ISearchFilters>({
    specialization: "", hospital: "", date: "", doctorName: "",
  });
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const set = (key: keyof ISearchFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="card p-6">
      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-5">
        Find a Doctor
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Specialization */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Specialization</label>
          <select
            value={filters.specialization}
            onChange={(e) => set("specialization", e.target.value)}
            className="input-base appearance-none cursor-pointer"
          >
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Hospital */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Hospital</label>
          <select
            value={filters.hospital}
            onChange={(e) => set("hospital", e.target.value)}
            className="input-base appearance-none cursor-pointer"
          >
            <option value="">All Hospitals</option>
            {HOSPITALS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date picker */}
      <div className="relative mb-4" ref={calRef}>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          Preferred Date
        </label>
        <button
          onClick={() => setShowCal((v) => !v)}
          className="input-base flex items-center justify-between w-full text-left"
        >
          <span className={filters.date ? "text-slate-100" : "text-slate-500"}>
            {filters.date ? `📅 ${formatDate(filters.date)}` : "📅 Select a date"}
          </span>
          <span className="text-slate-500 text-xs">{showCal ? "▲" : "▼"}</span>
        </button>
        {showCal && (
          <div className="absolute z-50 top-full mt-2 left-0">
            <Calendar
              selected={filters.date}
              onSelect={(d) => { set("date", d); setShowCal(false); }}
            />
          </div>
        )}
      </div>

      {/* Doctor name */}
      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-xs font-semibold text-slate-400">Doctor Name</label>
        <input
          type="text"
          placeholder="e.g. Dr. Perera..."
          value={filters.doctorName}
          onChange={(e) => set("doctorName", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(filters)}
          className="input-base"
        />
      </div>

      <Button size="lg" className="w-full" onClick={() => onSearch(filters)}>
        Search Doctors
      </Button>
    </div>
  );
}