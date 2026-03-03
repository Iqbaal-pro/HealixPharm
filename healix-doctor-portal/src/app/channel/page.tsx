"use client";
import { useState } from "react";
import { Doctor, SearchFilters as ISearchFilters } from "../../types";
import { DOCTORS } from "../../data/mockData";
import SearchFilters from "../../components/doctors/SearchFilters";
import DoctorCard from "../../components/doctors/DoctorCard";
import DoctorDetail from "../../components/doctors/DoctorDetail";
import BookingForm from "../../components/booking/BookingForm";

type Step = "search" | "detail" | "book";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "search", label: "Search" },
  { key: "detail", label: "Select Time" },
  { key: "book",   label: "Patient Details" },
];

export default function ChannelPage() {
  const [step, setStep]                     = useState<Step>("search");
  const [results, setResults]               = useState<Doctor[]>([]);
  const [searched, setSearched]             = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot]     = useState("");

  const handleSearch = (filters: ISearchFilters) => {
    let list = [...DOCTORS];
    if (filters.specialization)
      list = list.filter((d) => d.specialization === filters.specialization);
    if (filters.hospital)
      list = list.filter((d) => d.hospital === filters.hospital);
    if (filters.doctorName)
      list = list.filter((d) =>
        d.name.toLowerCase().includes(filters.doctorName.toLowerCase())
      );
    setResults(list);
    setSearched(true);
  };

  const handleChannel = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot("");
    setStep("detail");
  };

  const currentStepIndex = STEP_LABELS.findIndex((s) => s.key === step);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((s, i) => {
          const done   = i < currentStepIndex;
          const active = s.key === step;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center
                            text-xs font-bold transition-colors
                  ${active ? "bg-blue-600 text-white ring-2 ring-blue-400/40" : ""}
                  ${done   ? "bg-blue-800 text-blue-300" : ""}
                  ${!active && !done ? "bg-slate-800 text-slate-500" : ""}
                `}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-semibold ${
                active ? "text-blue-400" : "text-slate-500"
              }`}>
                {s.label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <span className="text-slate-700 mx-1">›</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Step — Search */}
      {step === "search" && (
        <div className="space-y-5">
          <div className="card p-6 bg-gradient-to-br from-blue-950/80 to-slate-900">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
              HealixPharm
            </p>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              Book a Doctor Appointment
            </h1>
            <p className="text-slate-400 text-sm">
              Search by specialization, date, name or hospital. Instant WhatsApp confirmation.
            </p>
          </div>

          <SearchFilters onSearch={handleSearch} />

          {searched && (
            <div>
              <p className="text-sm text-slate-500 mb-3">
                {results.length > 0
                  ? `${results.length} doctor(s) found`
                  : "No doctors found — try adjusting your filters"}
              </p>
              <div className="space-y-3">
                {results.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} onChannel={handleChannel} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step — Detail */}
      {step === "detail" && selectedDoctor && (
        <DoctorDetail
          doctor={selectedDoctor}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onBook={() => setStep("book")}
          onBack={() => { setStep("search"); setSelectedSlot(""); }}
        />
      )}

      {/* Step — Book */}
      {step === "book" && selectedDoctor && selectedSlot && (
        <BookingForm
          doctor={selectedDoctor}
          slot={selectedSlot}
          onBack={() => setStep("detail")}
        />
      )}
    </div>
  );
}