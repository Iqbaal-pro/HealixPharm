"use client";
import { useState, useEffect } from "react";
import {
  getPendingPrescriptions, createPrescription, issueMedicine,
  getAllPrescriptions,
  type PendingPrescription, type PrescriptionResponse,
  type PrescriptionRecord, type IssueResponse,
} from "../routes/prescriptionRoutes";
import {
  getPendingReminders, sendOneTimeReminder, markContinuous,
  processReminders, type PendingReminder,
} from "../routes/reminderRoutes";
import { searchMedicines, type MedResult } from "../routes/orderRoutes";

type MainTab       = "queue" | "history" | "reminders";
type QueueStep     = "list"  | "save"    | "issue";
type HistoryFilter = "all"   | "active"  | "completed";
type Meals         = "before" | "after"  | "with" | "";

// ── Per-medicine row ───────────────────────────────────────────────────────────
interface MedRow {
  medicine_id:    number | null;
  medicine_name:  string;
  dose_per_day:   string;
  quantity_given: string;
  meals:          Meals;
  meal_times:     string[];   // one HH:MM per dose, length === dose_per_day
  is_continuous:  boolean;
}

interface SessionRecord {
  seq: number; prescription_id: number; medicine_id: number;
  quantity: number; remaining_stock: number; medicine_name: string; time: string;
}

const TODAY     = new Date().toISOString().split("T")[0];
const EMPTY_MED: MedRow = {
  medicine_id: null, medicine_name: "", dose_per_day: "1",
  quantity_given: "", meals: "", meal_times: ["08:00"], is_continuous: false,
};

const PRESET_TIMES: Record<number, string[]> = {
  1: ["08:00"],
  2: ["08:00", "20:00"],
  3: ["08:00", "13:00", "19:00"],
  4: ["07:00", "12:00", "17:00", "21:00"],
};
function defaultTimes(n: number): string[] {
  if (PRESET_TIMES[n]) return [...PRESET_TIMES[n]];
  const base = 7 * 60, interval = Math.floor((24 * 60) / n);
  return Array.from({ length: n }, (_, i) => {
    const m = (base + i * interval) % (24 * 60);
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });
}

export default function PrescriptionPage() {
  const [tab,  setTab]  = useState<MainTab>("queue");
  const [step, setStep] = useState<QueueStep>("list");

  const [pending,     setPending]     = useState<PendingPrescription[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError,   setListError]   = useState("");
  const [selected,    setSelected]    = useState<PendingPrescription | null>(null);

  // Save form
  const [patientId, setPatientId] = useState("");
  const [staffId,   setStaffId]   = useState("");
  const [startDate, setStartDate] = useState(TODAY);
  const [medicines, setMedicines] = useState<MedRow[]>([{ ...EMPTY_MED }]);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedRxs,  setSavedRxs] = useState<PrescriptionResponse[]>([]);

  // Medicine search — one slot per medicine row
  const [medSearch,  setMedSearch]  = useState<string[]>([""]);
  const [medResults, setMedResults] = useState<MedResult[][]>([[]])
  const [medFocused, setMedFocused] = useState<number | null>(null);

  // Issue
  const [issuing,      setIssuing]      = useState(false);
  const [issueError,   setIssueError]   = useState("");
  const [issueResults, setIssueResults] = useState<(IssueResponse & { medicine_name: string })[]>([]);

  const [session, setSession] = useState<SessionRecord[]>([]);
  const [counter, setCounter] = useState(1);

  // History
  const [historyFilter,  setHistoryFilter]  = useState<HistoryFilter>("all");
  const [historyRecords, setHistoryRecords] = useState<PrescriptionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError,   setHistoryError]   = useState("");
  const [search,         setSearch]         = useState("");
  const [expanded,       setExpanded]       = useState<number | null>(null);

  // Reminders
  const [reminders,        setReminders]        = useState<PendingReminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [reminderMsg,      setReminderMsg]      = useState("");
  const [reminderActionId, setReminderActionId] = useState<number | null>(null);
  const [processingAll,    setProcessingAll]    = useState(false);
  const [rxSearch,         setRxSearch]         = useState("");

  useEffect(() => { fetchPending(); }, []);
  useEffect(() => { if (tab === "history")   fetchHistory(historyFilter); }, [tab, historyFilter]);
  useEffect(() => { if (tab === "reminders") fetchReminders();            }, [tab]);

  // ── Reminder handlers ──────────────────────────────────────────────────────
  const fetchReminders = async () => {
    setRemindersLoading(true); setReminderMsg("");
    try { setReminders(await getPendingReminders()); }
    catch { setReminders([]); }
    finally { setRemindersLoading(false); }
  };
  const handleSendOneTime = async (prescriptionId: number) => {
    setReminderActionId(prescriptionId); setReminderMsg("");
    try {
      const res = await sendOneTimeReminder(prescriptionId);
      setReminderMsg(`✓ Reminder sent to ${res.patient ?? "patient"} for ${res.medicine ?? "medicine"}.`);
      fetchReminders();
    } catch (e: unknown) { setReminderMsg(e instanceof Error ? e.message : "Failed to send reminder"); }
    finally { setReminderActionId(null); }
  };
  const handleMarkContinuous = async (prescriptionId: number, current: boolean) => {
    setReminderActionId(prescriptionId); setReminderMsg("");
    try {
      await markContinuous(prescriptionId, !current);
      setReminderMsg(`✓ Prescription #${prescriptionId} marked as ${!current ? "continuous" : "not continuous"}.`);
      fetchHistory(historyFilter);
    } catch (e: unknown) { setReminderMsg(e instanceof Error ? e.message : "Failed to update"); }
    finally { setReminderActionId(null); }
  };
  const handleProcessAll = async () => {
    setProcessingAll(true); setReminderMsg("");
    try { const res = await processReminders(); setReminderMsg(`✓ ${res.message}`); fetchReminders(); }
    catch (e: unknown) { setReminderMsg(e instanceof Error ? e.message : "Failed"); }
    finally { setProcessingAll(false); }
  };

  // ── Data fetches ───────────────────────────────────────────────────────────
  const fetchPending = async () => {
    setLoadingList(true); setListError("");
    try { setPending(await getPendingPrescriptions()); }
    catch { setPending([]); setListError("⚠ GET /prescriptions/pending not yet implemented — use manual entry."); }
    finally { setLoadingList(false); }
  };
  const fetchHistory = async (f: HistoryFilter) => {
    setHistoryLoading(true); setHistoryError("");
    try { setHistoryRecords(await getAllPrescriptions(f === "completed" ? true : f === "active" ? false : undefined)); }
    catch (e: unknown) { setHistoryError(e instanceof Error ? e.message : "Failed to load prescriptions"); }
    finally { setHistoryLoading(false); }
  };

  // ── Medicine row helpers ───────────────────────────────────────────────────
  const updateMed = (idx: number, patch: Partial<MedRow>) =>
    setMedicines(ms => ms.map((m, i) => i === idx ? { ...m, ...patch } : m));

  const addMed = () => {
    setMedicines(ms  => [...ms,  { ...EMPTY_MED }]);
    setMedSearch(s   => [...s,   ""]);
    setMedResults(r  => [...r,   []]);
  };
  const removeMed = (idx: number) => {
    setMedicines(ms  => ms.filter((_, i) => i !== idx));
    setMedSearch(s   => s.filter((_, i)  => i !== idx));
    setMedResults(r  => r.filter((_, i)  => i !== idx));
  };

  // When dose count changes, resize meal_times to match, preserving existing values
  const handleDoseChange = (idx: number, val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    const existing = medicines[idx].meal_times;
    let updated: string[];
    if (n <= existing.length) {
      updated = existing.slice(0, n);
    } else {
      const defaults = defaultTimes(n);
      updated = [...existing, ...defaults.slice(existing.length, n)];
    }
    updateMed(idx, { dose_per_day: String(n), meal_times: updated });
  };

  const handleMealTimeChange = (medIdx: number, doseIdx: number, val: string) => {
    const times = [...medicines[medIdx].meal_times];
    times[doseIdx] = val;
    updateMed(medIdx, { meal_times: times });
  };

  // ── Medicine search ────────────────────────────────────────────────────────
  const handleMedSearch = async (q: string, idx: number) => {
    const s = [...medSearch]; s[idx] = q; setMedSearch(s);
    updateMed(idx, { medicine_id: null, medicine_name: q });
    if (q.length < 2) { const r = [...medResults]; r[idx] = []; setMedResults(r); return; }
    try {
      const data = await searchMedicines(q);
      const r = [...medResults]; r[idx] = data; setMedResults(r);
    } catch { /* silent */ }
  };
  const pickMed = (med: MedResult, idx: number) => {
    updateMed(idx, { medicine_id: med.id, medicine_name: med.name });
    const s = [...medSearch]; s[idx] = med.name; setMedSearch(s);
    const r = [...medResults]; r[idx] = []; setMedResults(r);
    setMedFocused(null);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveError("");
    try {
      const rxs: PrescriptionResponse[] = [];
      for (const med of medicines) {
        const rx = await createPrescription({
          patient_id:           Number(patientId),
          uploaded_by_staff_id: Number(staffId),
          medicine_name:        med.medicine_name.trim(),
          dose_per_day:         Number(med.dose_per_day),
          start_date:           startDate,
          quantity_given:       Number(med.quantity_given),
          is_continuous:        med.is_continuous,
          meals:                med.meals || undefined,
          meal_times:           med.meal_times.length ? med.meal_times.join(",") : undefined,
        });
        rxs.push(rx);
      }
      setSavedRxs(rxs);
      setIssueResults([]);
      setStep("issue");
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  // ── Issue ──────────────────────────────────────────────────────────────────
  const handleIssueAll = async () => {
    setIssuing(true); setIssueError("");
    const results: (IssueResponse & { medicine_name: string })[] = [];
    try {
      for (let i = 0; i < savedRxs.length; i++) {
        const rx  = savedRxs[i];
        const med = medicines[i];
        if (!med.medicine_id || !Number(med.quantity_given)) continue;
        const result = await issueMedicine({
          prescription_id: rx.id,
          medicine_id:     med.medicine_id,
          quantity:        Number(med.quantity_given),
        });
        results.push({ ...result, medicine_name: rx.medicine_name });
        setSession(prev => [{
          seq: counter + i, prescription_id: rx.id, medicine_id: med.medicine_id!,
          quantity: Number(med.quantity_given), remaining_stock: result.remaining_stock,
          medicine_name: rx.medicine_name, time: new Date().toLocaleTimeString(),
        }, ...prev]);
      }
      setCounter(c => c + savedRxs.length);
      setIssueResults(results);
    } catch (e: unknown) { setIssueError(e instanceof Error ? e.message : "Failed to issue"); }
    finally { setIssuing(false); }
  };

  const resetQueue = () => {
    setStep("list"); setSelected(null); setSavedRxs([]); setIssueResults([]);
    setPatientId(""); setStaffId(""); setStartDate(TODAY);
    setMedicines([{ ...EMPTY_MED }]);
    setMedSearch([""]); setMedResults([[]]);
    setSaveError(""); setIssueError("");
    fetchPending();
  };

  // Validation
  const mealTimesValid = (med: MedRow) =>
    med.meal_times.length === Number(med.dose_per_day) &&
    med.meal_times.every(t => t.trim() !== "");

  const saveValid =
    patientId !== "" && staffId !== "" &&
    medicines.every(m =>
      m.medicine_id !== null &&
      m.medicine_name.trim() !== "" &&
      Number(m.dose_per_day) > 0 &&
      Number(m.quantity_given) > 0 &&
      mealTimesValid(m)
    );

  const issueValid =
    savedRxs.length > 0 &&
    medicines.some(m => m.medicine_id !== null && Number(m.quantity_given) > 0);

  // Display helpers
  const statusBadge = (r: PrescriptionRecord) => {
    if (r.is_completed)        return { label: "Completed",     color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
    if (r.remaining_days <= 3) return { label: "Expiring Soon", color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)"  };
    return                            { label: "Active",         color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  };
  };
  const filteredHistory = historyRecords.filter(r =>
    r.medicine_name.toLowerCase().includes(search.toLowerCase()) ||
    String(r.patient_id).includes(search) || String(r.id).includes(search)
  );
  const stockColor = (n: number) => n === 0 ? "#f87171" : n < 10 ? "#fbbf24" : "#4ade80";
  const mealLabel  = (m: string | null | undefined) =>
    m ? m.charAt(0).toUpperCase() + m.slice(1) + " meal" : "—";
  const doseLabel  = (r: PendingReminder) =>
    r.dose_number > 0 ? `Dose ${r.dose_number}` : "Refill";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)", fontSize: 22, boxShadow: "0 0 18px rgba(56,189,248,0.1)" }}>📋</div>
          <div>
            <h1 className="page-title gradient-text">Prescriptions</h1>
            <p className="page-sub">Issue prescriptions from WhatsApp or manually, then view history.</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="tab-switcher mb-24 fade-2">
        {([
          { key: "queue",     label: "📋 Queue"     },
          { key: "history",   label: "🗂 History"   },
          { key: "reminders", label: "🔔 Reminders" },
        ] as { key: MainTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab-switch-btn${tab === t.key ? " active" : ""}`}>{t.label}</button>
        ))}
      </div>

      {/* ════════════ QUEUE TAB ════════════ */}
      {tab === "queue" && (
        <div className="queue-grid fade-3">
          <div>
            <div className="step-indicator mb-16">
              <button className={`step-ind-btn${step === "list"  ? " active" : ""}`}>01 Review</button>
              <span className="step-ind-arrow">→</span>
              <button className={`step-ind-btn${step === "save"  ? " active" : ""}`}>02 Save</button>
              <span className="step-ind-arrow">→</span>
              <button className={`step-ind-btn${step === "issue" ? " active" : ""}`}>03 Issue</button>
            </div>

            {/* Step: List */}
            {step === "list" && (
              <div className="glass-card panel-p24">
                <div className="row row-between mb-18">
                  <div>
                    <h2 className="card-title">WhatsApp Queue</h2>
                    <p className="card-sub">Prescriptions sent by patients.</p>
                  </div>
                  <div className="row g-8">
                    <button className="btn-manual" onClick={() => { setSelected(null); setStep("save"); }}>+ Enter Manually</button>
                    <button className="btn-ghost btn-ghost-sm" onClick={fetchPending} disabled={loadingList}>
                      {loadingList ? <span className="spinner" /> : "↻"}
                    </button>
                  </div>
                </div>
                {listError && <div className="warn-box"><p className="hint hint-err">⚠ {listError}</p></div>}
                {loadingList ? (
                  <div className="loading-cell row g-12"><span className="spinner" /><span>Loading from AWS…</span></div>
                ) : pending.length === 0 ? (
                  <div className="center p-empty">
                    <div className="empty-icon-lg">📥</div>
                    <p className="empty-text mb-6">No pending WhatsApp prescriptions</p>
                    <p className="empty-sub mb-20">Patients send images via WhatsApp → saved to AWS → appear here.</p>
                    <button className="btn-primary" onClick={() => { setSelected(null); setStep("save"); }}>+ Enter Manually</button>
                  </div>
                ) : (
                  <div className="col g-8">
                    {pending.map(p => (
                      <div key={p.order_id} className="queue-item" onClick={() => { setSelected(p); setStep("save"); }}>
                        <div className="queue-thumb">
                          {p.prescription_url ? <img src={p.prescription_url} alt="" /> : <span className="queue-thumb-empty">🖼</span>}
                        </div>
                        <div className="queue-info">
                          <div className="queue-info-title">Prescription <span className="queue-info-id">#{p.order_id}</span></div>
                          {p.phone && <div className="queue-info-phone">{p.phone}</div>}
                          <div className="queue-info-date">{new Date(p.created_at).toLocaleString()}</div>
                        </div>
                        <span className="queue-arrow">Review →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Save */}
            {step === "save" && (
              <div className="glass-card panel-p24">
                <div className="row g-10 mb-18">
                  <button className="btn-ghost btn-ghost-sm" onClick={() => setStep("list")}>← Back</button>
                  <div>
                    <h2 className="card-title">{selected ? "Save Prescription" : "Enter Manually"}</h2>
                    <p className="card-sub">Add one or more medicines — each gets its own Rx record and reminder schedule.</p>
                  </div>
                </div>

                {selected?.prescription_url && (
                  <div className="rx-preview mb-18">
                    <img src={selected.prescription_url} alt="prescription" />
                  </div>
                )}

                {/* Shared fields */}
                <div className="grid-2 mb-20">
                  <div className="col g-6">
                    <label className="form-label">Patient ID</label>
                    <input type="number" min="1" placeholder="e.g. 12" className="input-field"
                      value={patientId} onChange={e => setPatientId(e.target.value)} />
                  </div>
                  <div className="col g-6">
                    <label className="form-label">Staff ID</label>
                    <input type="number" min="1" placeholder="e.g. 3" className="input-field"
                      value={staffId} onChange={e => setStaffId(e.target.value)} />
                  </div>
                  <div className="col g-6">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="input-field" style={{ colorScheme: "dark" }}
                      value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                </div>

                {/* Medicine rows */}
                <div className="col g-10 mb-16">
                  {medicines.map((med, idx) => {
                    const doseCount = Math.max(1, parseInt(med.dose_per_day) || 1);
                    return (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 14, padding: "18px 18px 14px" }}>

                        <div className="row row-between mb-14">
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.06em" }}>MEDICINE {idx + 1}</span>
                          {medicines.length > 1 && (
                            <button onClick={() => removeMed(idx)}
                              style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                          )}
                        </div>

                        <div className="grid-2">

                          {/* Medicine search */}
                          <div className="col g-6 span-2" style={{ position: "relative" }}>
                            <label className="form-label">Medicine Name</label>
                            <input
                              type="text" placeholder="Search medicine…" className="input-field"
                              value={medSearch[idx] ?? ""}
                              onChange={e => handleMedSearch(e.target.value, idx)}
                              onFocus={() => setMedFocused(idx)}
                              onBlur={() => setTimeout(() => setMedFocused(null), 200)}
                              style={{ borderColor: med.medicine_id ? "rgba(74,222,128,0.3)" : undefined }}
                            />
                            {med.medicine_id && (
                              <span style={{ position: "absolute", right: 12, top: 34, fontSize: 11, color: "#4ade80" }}>✓ ID {med.medicine_id}</span>
                            )}
                            {medFocused === idx && medResults[idx]?.length > 0 && (
                              <div className="med-dropdown">
                                {medResults[idx].map(m => (
                                  <div key={m.id} className="med-result-item" onClick={() => pickMed(m, idx)}
                                    style={{ padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                                    <span className="med-name">{m.name}</span>
                                    <span className="med-price">LKR {m.selling_price} · {m.unit_of_measurement}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {medFocused === idx && (medSearch[idx]?.length ?? 0) >= 2 && medResults[idx]?.length === 0 && (
                              <div className="med-dropdown" style={{ padding: "10px 14px", color: "#475569", fontSize: 13 }}>No medicines found</div>
                            )}
                          </div>

                          {/* Dose per day */}
                          <div className="col g-6">
                            <label className="form-label">Dose Per Day</label>
                            <input type="number" min="1" max="12" placeholder="e.g. 3" className="input-field"
                              value={med.dose_per_day}
                              onChange={e => handleDoseChange(idx, e.target.value)} />
                          </div>

                          {/* Quantity given */}
                          <div className="col g-6">
                            <label className="form-label">Quantity Given</label>
                            <input type="number" min="1" placeholder="e.g. 90" className="input-field"
                              value={med.quantity_given}
                              onChange={e => updateMed(idx, { quantity_given: e.target.value })} />
                            {Number(med.quantity_given) > 0 && doseCount > 0 && (
                              <span style={{ fontSize: 11, color: "#475569", marginTop: 4, display: "block" }}>
                                ≈ {Math.floor(Number(med.quantity_given) / doseCount)} day supply
                              </span>
                            )}
                          </div>

                          {/* Meal timing toggle */}
                          <div className="col g-6">
                            <label className="form-label">Take Meals</label>
                            <div className="row g-6" style={{ flexWrap: "wrap" }}>
                              {(["before", "after", "with", ""] as Meals[]).map(opt => (
                                <button key={opt} onClick={() => updateMed(idx, { meals: opt })}
                                  style={{
                                    padding: "5px 12px", borderRadius: 8, border: "1px solid",
                                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                                    background:  med.meals === opt ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
                                    color:       med.meals === opt ? "#38bdf8" : "#475569",
                                    borderColor: med.meals === opt ? "rgba(56,189,248,0.3)"  : "rgba(148,163,184,0.1)",
                                  }}>
                                  {opt === "" ? "Not set" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Continuous toggle */}
                          <div className="row g-10 toggle-row" style={{ alignSelf: "flex-end" }}>
                            <div className={`toggle-track ${med.is_continuous ? "toggle-track-on" : "toggle-track-off"}`}
                              onClick={() => updateMed(idx, { is_continuous: !med.is_continuous })}>
                              <div className={`toggle-thumb ${med.is_continuous ? "toggle-thumb-on" : "toggle-thumb-off"}`} />
                            </div>
                            <span className="toggle-label">Continuous</span>
                          </div>

                        </div>

                        {/* Dose times — one time picker per dose */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(148,163,184,0.06)" }}>
                          <label className="form-label" style={{ marginBottom: 8, display: "block" }}>
                            Dose Times
                            {med.meals && (
                              <span style={{ marginLeft: 8, fontSize: 11, color: "#38bdf8", fontWeight: 400 }}>
                                ({med.meals === "before" ? "SMS fires 30 min before each time"
                                  : med.meals === "after"  ? "SMS fires 30 min after each time"
                                  : "SMS fires exactly at each time"})
                              </span>
                            )}
                          </label>
                          <div className="row g-10" style={{ flexWrap: "wrap" }}>
                            {Array.from({ length: doseCount }, (_, doseIdx) => (
                              <div key={doseIdx} className="col g-4">
                                <label style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>Dose {doseIdx + 1}</label>
                                <input
                                  type="time"
                                  className="input-field"
                                  style={{ colorScheme: "dark", minWidth: 110 }}
                                  value={med.meal_times[doseIdx] ?? ""}
                                  onChange={e => handleMealTimeChange(idx, doseIdx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <button onClick={addMed} className="btn-ghost btn-ghost-sm mb-16"
                  style={{ width: "100%", justifyContent: "center" }}>
                  + Add Another Medicine
                </button>

                {saveError && <div className="err-box mb-14"><p className="hint hint-err">⚠ {saveError}</p></div>}

                <button className="btn-primary w-full" onClick={handleSave}
                  disabled={!saveValid || saving} style={{ opacity: !saveValid || saving ? 0.45 : 1 }}>
                  {saving
                    ? <><span className="spinner" />Saving {medicines.length} medicine{medicines.length > 1 ? "s" : ""}…</>
                    : `Save ${medicines.length} Medicine${medicines.length > 1 ? "s" : ""} →`}
                </button>
              </div>
            )}

            {/* Step: Issue */}
            {step === "issue" && savedRxs.length > 0 && (
              <div className="glass-card panel-p24">
                <div className="row g-10 mb-18">
                  <button className="btn-ghost btn-ghost-sm" onClick={() => setStep("save")}>← Back</button>
                  <div>
                    <h2 className="card-title">Issue Medicines</h2>
                    <p className="card-sub">{savedRxs.length} prescription{savedRxs.length > 1 ? "s" : ""} saved — confirm and deduct stock.</p>
                  </div>
                </div>

                <div className="col g-10 mb-14">
                  {savedRxs.map((rx, idx) => {
                    const med  = medicines[idx];
                    const done = issueResults.find(r => r.medicine_name === rx.medicine_name);
                    const daysSupply = med ? Math.floor(Number(med.quantity_given) / Number(med.dose_per_day)) : 0;
                    return (
                      <div key={rx.id} style={{
                        background: done ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${done ? "rgba(74,222,128,0.15)" : "rgba(148,163,184,0.08)"}`,
                        borderRadius: 14, padding: "16px 18px",
                      }}>
                        <div className="row row-between">
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{rx.medicine_name}</span>
                            <span style={{ fontSize: 12, color: "#475569" }}>
                              Rx #{rx.id} · {med?.dose_per_day}×/day · {med?.quantity_given} units · {daysSupply}d supply
                              {med?.meals ? ` · ${med.meals} meal` : ""}
                              {med?.meal_times?.length ? ` · ${med.meal_times.join(", ")}` : ""}
                              {med?.is_continuous ? " · continuous" : ""}
                            </span>
                            {rx.reminders_scheduled > 0 && (
                              <span style={{ fontSize: 11, color: "#818cf8" }}>
                                🔔 {rx.reminders_scheduled} dose reminder{rx.reminders_scheduled > 1 ? "s" : ""} scheduled
                              </span>
                            )}
                          </div>
                          {done
                            ? <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>✓ {done.remaining_stock} left in stock</span>
                            : <span className="badge" style={{ background: "rgba(56,189,248,0.08)", color: "#38bdf8" }}>Ready</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>

                {issueError && <div className="warn-box mb-14"><p className="hint hint-err">⚠ {issueError}</p></div>}

                <div className="row g-10">
                  <button className="btn-primary flex-1" onClick={handleIssueAll}
                    disabled={!issueValid || issuing} style={{ opacity: !issueValid || issuing ? 0.45 : 1 }}>
                    {issuing
                      ? <><span className="spinner" />Issuing…</>
                      : `Issue ${medicines.filter(m => m.medicine_id).length} Medicine${medicines.filter(m => m.medicine_id).length > 1 ? "s" : ""} & Deduct Stock →`}
                  </button>
                  {issueResults.length > 0 && (
                    <button className="btn-ghost btn-ghost-sm" onClick={resetQueue}>New Rx →</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Session sidebar */}
          <div className="glass-card session-card">
            <div className="row row-between mb-14">
              <div>
                <h2 className="card-title">Session</h2>
                <p className="card-sub">Issued this session.</p>
              </div>
              {session.length > 0 && <button className="btn-danger" onClick={() => setSession([])}>Clear</button>}
            </div>
            {session.length === 0 ? (
              <div className="center p-empty-sm">
                <div className="empty-icon-sm">📋</div>
                <p className="empty-note">Nothing issued yet.</p>
              </div>
            ) : (
              <>
                <div className="col g-7">
                  {session.map(r => (
                    <div key={r.seq} className="session-item">
                      <div className="session-item-left">
                        <div className="session-rx">Rx <span className="session-rx-id">#{r.prescription_id}</span></div>
                        <div className="session-med">{r.medicine_name}</div>
                        <div className="session-time">{r.time}</div>
                      </div>
                      <div className="session-right">
                        <div className="session-qty">×{r.quantity}</div>
                        <div style={{ color: stockColor(r.remaining_stock), fontSize: 12 }}>{r.remaining_stock} left</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row g-20 mt-12 session-footer">
                  <MiniStat label="Processed" value={String(session.length)}                                 color="#38bdf8" />
                  <MiniStat label="Units"      value={String(session.reduce((s, r) => s + r.quantity, 0))}  color="#818cf8" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════ HISTORY TAB ════════════ */}
      {tab === "history" && (
        <div className="fade-3">
          <div className="grid-3 mb-20">
            {[
              { label: "Total",     value: historyRecords.length,                              color: "#38bdf8", bg: "rgba(14,165,233,0.07)",  border: "rgba(14,165,233,0.15)"  },
              { label: "Active",    value: historyRecords.filter(r => !r.is_completed).length, color: "#4ade80", bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.15)"  },
              { label: "Completed", value: historyRecords.filter(r =>  r.is_completed).length, color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.15)" },
            ].map(s => (
              <div key={s.label} className="history-stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{historyLoading ? "—" : s.value}</div>
              </div>
            ))}
          </div>

          <div className="glass-card panel-p16-20 mb-14">
            <div className="row g-12 row-wrap">
              <div className="filter-bar">
                {(["all", "active", "completed"] as HistoryFilter[]).map(f => (
                  <button key={f} onClick={() => setHistoryFilter(f)}
                    className={`filter-btn${historyFilter === f ? " active" : ""}`}>{f}</button>
                ))}
              </div>
              <div className="search-wrap search-flex-min">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input className="input-field search-sm" type="text"
                  placeholder="Search by medicine, patient ID or Rx ID…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn-ghost btn-ghost-sm" onClick={() => fetchHistory(historyFilter)}>↻ Refresh</button>
            </div>
          </div>

          <div className="glass-card panel-p24">
            {historyError && <div className="err-box mb-14"><p className="hint hint-err">⚠ {historyError}</p></div>}
            <div className="hist-table-head">
              {["Rx ID", "Patient", "Medicine", "Qty", "Dose/Day", "Status", ""].map(h =>
                <div key={h} className="th th-no-pad">{h}</div>
              )}
            </div>
            {historyLoading ? (
              <div className="loading-cell row g-12"><span className="spinner" /><span>Loading…</span></div>
            ) : filteredHistory.length === 0 ? (
              <div className="center p-empty"><div className="empty-icon-md">📋</div><p className="empty-text">No prescriptions found.</p></div>
            ) : (
              <div className="col g-3">
                {filteredHistory.map(r => {
                  const s      = statusBadge(r);
                  const isOpen = expanded === r.id;
                  return (
                    <div key={r.id}>
                      <div className={`hist-row ${isOpen ? "hist-row-open" : "hist-row-closed"}`}
                        onClick={() => setExpanded(isOpen ? null : r.id)}>
                        <div className="hist-cell-id">#{r.id}</div>
                        <div className="hist-cell-muted">#{r.patient_id}</div>
                        <div className="hist-cell-name">{r.medicine_name}</div>
                        <div className="hist-cell-muted">{r.quantity_given}</div>
                        <div className="hist-cell-muted">{r.dose_per_day}×/day</div>
                        <div><span className="badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{s.label}</span></div>
                        <div className="hist-cell-chevron">{isOpen ? "▲" : "▼"}</div>
                      </div>
                      {isOpen && (
                        <div className="hist-expand">
                          <Detail label="Start Date"     value={r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"} />
                          <Detail label="End Date"       value={r.end_date   ? new Date(r.end_date).toLocaleDateString()   : "—"} />
                          <Detail label="Remaining Days" value={`${Math.round(r.remaining_days)}d`}
                            color={r.remaining_days <= 0 ? "#f87171" : r.remaining_days <= 3 ? "#fbbf24" : "#4ade80"} />
                          <Detail label="Take Meals"     value={r.meals ? r.meals.charAt(0).toUpperCase() + r.meals.slice(1) : "—"}
                            color={r.meals ? "#38bdf8" : "#475569"} />
                          <Detail label="Dose Times"     value={r.meal_times ? r.meal_times.split(",").join("  ·  ") : "—"} />
                          <Detail label="Continuous"     value={r.is_continuous ? "Yes" : "No"}
                            color={r.is_continuous ? "#38bdf8" : "#475569"} />
                          <Detail label="Staff ID"       value={`#${r.uploaded_by_staff_id}`} />
                          <Detail label="Created"        value={new Date(r.created_at).toLocaleString()} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!historyLoading && filteredHistory.length > 0 && (
              <div className="table-footer-note mt-14">
                Showing {filteredHistory.length} of {historyRecords.length} prescriptions
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ REMINDERS TAB ════════════ */}
      {tab === "reminders" && (
        <div className="fade-3">
          {reminderMsg && (
            <div className={`msg-box mb-20 ${reminderMsg.startsWith("✓") ? "msg-box-success" : "msg-box-error"}`}>
              {reminderMsg}
            </div>
          )}

          {/* Pending reminders */}
          <div className="glass-card panel-p16-20 mb-20">
            <div className="row g-12 row-wrap mb-14" style={{ justifyContent: "space-between" }}>
              <h2 className="panel-title">Pending Reminders</h2>
              <div className="row g-8">
                <button className="btn-ghost btn-ghost-sm" onClick={fetchReminders}>↻ Refresh</button>
                <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={handleProcessAll} disabled={processingAll}>
                  {processingAll ? <><span className="spinner" />Processing…</> : "▶ Process All"}
                </button>
              </div>
            </div>
            {remindersLoading ? (
              <div className="loading-cell row g-12"><span className="spinner" /><span>Loading…</span></div>
            ) : reminders.length === 0 ? (
              <div className="center p-empty"><div className="empty-icon-md">🔔</div><p className="empty-text">No pending reminders.</p></div>
            ) : (
              <div className="table-wrap">
                <table className="full-table">
                  <thead>
                    <tr className="thead-border">
                      {["ID", "Prescription", "Scheduled", "Type", "Dose", "Meal timing", "Channel", ""].map(h =>
                        <th key={h} className="th">{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reminders.map(r => (
                      <tr key={r.id} className="tr-border">
                        <td className="td td-order-id">#{r.id}</td>
                        <td className="td td-order-id">Rx #{r.prescription_id}</td>
                        <td className="td td-date">{new Date(r.reminder_time).toLocaleString()}</td>
                        <td className="td">
                          <span className="badge" style={{
                            background: r.one_time        ? "rgba(251,191,36,0.1)"  :
                                        r.dose_number > 0 ? "rgba(129,140,248,0.1)" : "rgba(56,189,248,0.1)",
                            color:      r.one_time        ? "#fbbf24" :
                                        r.dose_number > 0 ? "#818cf8" : "#38bdf8",
                          }}>
                            {r.one_time ? "One-time" : r.dose_number > 0 ? "Dose" : "Refill"}
                          </span>
                        </td>
                        <td className="td" style={{ color: "#e2e8f0", fontWeight: 500 }}>
                          {doseLabel(r)}
                        </td>
                        <td className="td" style={{ color: "#94a3b8", fontSize: 12 }}>
                          {mealLabel(r.meal_timing)}
                        </td>
                        <td className="td"><span className="badge">{r.channel.toUpperCase()}</span></td>
                        <td className="td">
                          <button className="btn-sm btn-sm-green" style={{ fontSize: 11 }}
                            onClick={() => handleSendOneTime(r.prescription_id)}
                            disabled={reminderActionId === r.prescription_id}>
                            {reminderActionId === r.prescription_id ? "…" : "Send Now"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Per-prescription reminder controls */}
          <div className="glass-card panel-p16-20">
            <div className="row g-12 row-wrap mb-14" style={{ justifyContent: "space-between" }}>
              <div>
                <h2 className="panel-title">Prescription Reminder Controls</h2>
                <p className="panel-sub" style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Send a one-time SMS or toggle recurring refill reminders per prescription
                </p>
              </div>
              <button className="btn-ghost btn-ghost-sm" onClick={() => fetchHistory(historyFilter)}>↻ Refresh</button>
            </div>
            <div className="search-wrap search-flex mb-14">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input className="input-field search-sm"
                placeholder="Search by medicine or patient ID…"
                value={rxSearch} onChange={e => setRxSearch(e.target.value)} />
            </div>
            {historyLoading ? (
              <div className="loading-cell row g-12"><span className="spinner" /><span>Loading prescriptions…</span></div>
            ) : historyRecords.filter(r =>
                r.medicine_name.toLowerCase().includes(rxSearch.toLowerCase()) ||
                String(r.patient_id).includes(rxSearch) || String(r.id).includes(rxSearch)
              ).length === 0 ? (
              <div className="center p-empty">
                <div className="empty-icon-md">📋</div>
                <p className="empty-text">No prescriptions. Switch to Queue tab to create one first.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="full-table">
                  <thead>
                    <tr className="thead-border">
                      {["Rx ID", "Patient", "Medicine", "Doses", "Remaining", "Refill?", "Actions"].map(h =>
                        <th key={h} className="th">{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords
                      .filter(r =>
                        r.medicine_name.toLowerCase().includes(rxSearch.toLowerCase()) ||
                        String(r.patient_id).includes(rxSearch) || String(r.id).includes(rxSearch)
                      )
                      .map(r => (
                        <tr key={r.id} className="tr-border">
                          <td className="td td-order-id">#{r.id}</td>
                          <td className="td td-order-id">#{r.patient_id}</td>
                          <td className="td" style={{ color: "#e2e8f0", fontWeight: 500 }}>{r.medicine_name}</td>
                          <td className="td" style={{ color: "#94a3b8", fontSize: 12 }}>
                            {r.dose_per_day}×/day{r.meals ? ` · ${r.meals}` : ""}
                          </td>
                          <td className="td">
                            <span style={{ color: r.remaining_days <= 0 ? "#f87171" : r.remaining_days <= 3 ? "#fbbf24" : "#4ade80", fontWeight: 600 }}>
                              {Math.round(r.remaining_days)}d
                            </span>
                          </td>
                          <td className="td">
                            <button onClick={() => handleMarkContinuous(r.id, r.is_continuous)}
                              disabled={reminderActionId === r.id}
                              className={r.is_continuous ? "btn-sm btn-sm-green" : "btn-sm"}
                              style={{ opacity: reminderActionId === r.id ? 0.5 : 1 }}>
                              {reminderActionId === r.id ? "…" : r.is_continuous ? "✓ On" : "Off"}
                            </button>
                          </td>
                          <td className="td">
                            <button className="btn-sm" style={{ fontSize: 11 }}
                              onClick={() => handleSendOneTime(r.id)}
                              disabled={reminderActionId === r.id}>
                              {reminderActionId === r.id ? "…" : "📱 Send SMS"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="mini-stat-label">{label}</div>
      <div className="mini-stat-value" style={{ color }}>{value}</div>
    </div>
  );
}

function Detail({ label, value, color = "#94a3b8" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="form-label">{label}</div>
      <div className="detail-value" style={{ color }}>{value}</div>
    </div>
  );
}