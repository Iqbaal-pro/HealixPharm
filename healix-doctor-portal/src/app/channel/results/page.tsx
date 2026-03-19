"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { fetchDoctors } from "../../../lib/api";
import { Doctor } from "../../../types";
import DoctorCard from "../../../components/doctors/DoctorCard";
import DoctorDetail from "../../../components/doctors/DoctorDetail";
import BookingForm from "../../../components/booking/BookingForm";

type Step = "results" | "detail" | "book";

function SkeletonCard() {
  return (
    <div className="glass" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(148,163,184,0.06)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.06) 50%, transparent 100%)", animation: "shimmer 1.5s infinite" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 14, borderRadius: 6, width: "55%", background: "rgba(148,163,184,0.06)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.08) 50%, transparent 100%)", animation: "shimmer 1.5s infinite" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[80, 100].map(w => (
            <div key={w} style={{ height: 20, borderRadius: 99, width: w, background: "rgba(148,163,184,0.05)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.08) 50%, transparent 100%)", animation: "shimmer 1.5s infinite" }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: 80, height: 32, borderRadius: 10, background: "rgba(148,163,184,0.05)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.08) 50%, transparent 100%)", animation: "shimmer 1.5s infinite" }} />
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <p style={{ color: "#f87171", fontSize: 14, margin: 0 }}>{message}</p>
      <button onClick={onRetry} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>Retry</button>
    </div>
  );
}

function EmptyState({ filters, onReset }: {
  filters: { spec: string; hospital: string; name: string };
  onReset: () => void;
}) {
  const applied = [
    filters.spec     && { label: "Specialization", value: filters.spec     },
    filters.hospital && { label: "Hospital",        value: filters.hospital },
    filters.name     && { label: "Name",            value: filters.name     },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="glass animate-fade-up" style={{ padding: "48px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px", background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🔍</div>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#f1f5f9", marginBottom: 8 }}>No doctors found</h3>
      <p style={{ color: "#475569", fontSize: 14, maxWidth: 320, margin: "0 auto 24px", lineHeight: 1.7 }}>
        We couldn't find any doctors matching your search. Try adjusting your filters.
      </p>
      {applied.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>You searched for</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {applied.map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", fontSize: 12 }}>
                <span style={{ color: "#475569" }}>{f.label}:</span>
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: "rgba(6,13,26,0.5)", border: "1px solid rgba(148,163,184,0.07)", borderRadius: 12, padding: "16px 20px", maxWidth: 340, margin: "0 auto 28px", textAlign: "left" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Try these instead</p>
        {["Remove the hospital filter", "Search by doctor name only", "Try a broader specialization", "Clear all filters to see all doctors"].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "#475569" }}>
            <span style={{ color: "#334155", fontSize: 10 }}>→</span>
            {s}
          </div>
        ))}
      </div>
      <button onClick={onReset} className="btn-glow" style={{ padding: "11px 32px", fontSize: 14 }}>Clear Filters & Try Again</button>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const spec     = searchParams.get("spec")     ?? "";
  const hospital = searchParams.get("hospital") ?? "";
  const name     = searchParams.get("name")     ?? "";

  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState("");
  const [results, setResults]                   = useState<Doctor[]>([]);
  const [step, setStep]                         = useState<Step>("results");
  const [selectedDoctor, setSelectedDoctor]     = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot]         = useState("");
  const [selectedSlotId, setSelectedSlotId]     = useState<number | null>(null);
  const [selectedDate, setSelectedDate]         = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");

  const loadDoctors = () => {
    setLoading(true);
    setError("");
    fetchDoctors({ spec, hospital, name })
      .then(setResults)
      .catch(e => setError(e.message || "Could not load doctors. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDoctors(); }, [spec, hospital, name]);

  const handleChannel = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot("");
    setSelectedSlotId(null);
    setSelectedDate("");
    setSelectedHospital(doctor.hospital);
    setStep("detail");
  };

  const stepIndex  = { results: 0, detail: 1, book: 2 }[step];
  const stepLabels = ["Results", "Select Time", "Book"];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
        <button
          onClick={() =>
            step === "results" ? router.push("/channel") :
            step === "detail"  ? setStep("results") :
            setStep("detail")
          }
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", color: "#94a3b8", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(148,163,184,0.1)"; e.currentTarget.style.color = "#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.06)"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {step === "results" ? "New Search" : step === "detail" ? "Back to Results" : "Back to Slots"}
        </button>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {stepLabels.map((label, i) => {
            const done   = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 99, background: active ? "rgba(99,102,241,0.1)" : "transparent", border: active ? "1px solid rgba(99,102,241,0.22)" : "1px solid transparent", transition: "all 0.2s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: active ? "linear-gradient(135deg, #38bdf8, #818cf8)" : done ? "rgba(56,189,248,0.15)" : "rgba(148,163,184,0.08)", color: active ? "#fff" : done ? "#38bdf8" : "#334155", flexShrink: 0 }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#a78bfa" : done ? "#475569" : "#2d3f55" }}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{ width: 24, height: 1, background: done ? "rgba(56,189,248,0.2)" : "rgba(148,163,184,0.08)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {step === "results" && (
        <div>
          <div className="animate-fade-up" style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
            {loading ? (
              <div style={{ height: 20, width: 160, borderRadius: 6, background: "rgba(148,163,184,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.08), transparent)", animation: "shimmer 1.5s infinite" }} />
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#f1f5f9" }}>
                  {results.length > 0 ? `${results.length} Doctor${results.length !== 1 ? "s" : ""} Found` : "No Results"}
                </h2>
                {(spec || hospital || name) && (
                  <span style={{ color: "#334155", fontSize: 13 }}>{[spec, hospital, name].filter(Boolean).join(" · ")}</span>
                )}
              </>
            )}
          </div>

          {error && <ErrorBanner message={error} onRetry={loadDoctors} />}

          {loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <EmptyState filters={{ spec, hospital, name }} onReset={() => router.push("/channel")} />
          )}

          {!loading && !error && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((doc, i) => (
                <div key={doc.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                  <DoctorCard doctor={doc} onChannel={handleChannel} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail */}
      {step === "detail" && selectedDoctor && (
        <DoctorDetail
          doctor={selectedDoctor}
          selectedSlot={selectedSlot}
          selectedSlotId={selectedSlotId}
          selectedDate={selectedDate}
          onSelectSlot={(time, id, date) => {
            setSelectedSlot(time);
            setSelectedSlotId(id);
            setSelectedDate(date);
          }}
          selectedHospital={selectedHospital}
          onSelectHospital={setSelectedHospital}
          onBook={() => setStep("book")}
          onBack={() => setStep("results")}
        />
      )}

      {/* Book */}
      {step === "book" && selectedDoctor && selectedSlot && selectedSlotId !== null && (
        <BookingForm
          doctor={selectedDoctor}
          slot={selectedSlot}
          slotId={selectedSlotId!}
          date={selectedDate}
          hospital={selectedHospital || selectedDoctor.hospital}
          onBack={() => setStep("detail")}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "#475569", fontSize: 13 }}>Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}