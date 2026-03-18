"use client";
import { useState, useEffect } from "react";
import {
  getPendingPrescriptions, createPrescription, issueMedicine,
  getAllPrescriptions, notifyPrescriptionIssued, getOrderDetail,
  getPresignedUrl, uploadPrescriptionImage, checkImageClarity,
  type PendingPrescription, type PrescriptionResponse,
  type PrescriptionRecord, type IssueResponse,
} from "../routes/prescriptionRoutes";
import {
  getPendingReminders, sendOneTimeReminder, markContinuous,
  processReminders, type PendingReminder,
} from "../routes/reminderRoutes";
import { searchMedicines, type MedResult } from "../routes/orderRoutes";

type MainTab       = "queue" | "history" | "reminders" | "forecast";
type QueueStep     = "list"  | "save"    | "issue";
type HistoryFilter = "all"   | "active"  | "completed";
type Meals         = "before" | "after"  | "with" | "";

interface MedRow {
  medicine_id:    number | null;
  medicine_name:  string;
  selling_price:  number;       // NEW: stored when picked from search
  dose_per_day:   string;
  quantity_given: string;
  meals:          Meals;
  meal_times:     string[];
  is_continuous:  boolean;
}

interface SessionRecord {
  seq: number; prescription_id: number; medicine_id: number;
  quantity: number; remaining_stock: number; medicine_name: string; time: string;
}

const TODAY     = new Date().toISOString().split("T")[0];
const EMPTY_MED: MedRow = {
  medicine_id: null, medicine_name: "", selling_price: 0, dose_per_day: "1",
  quantity_given: "", meals: "", meal_times: [], is_continuous: false,
};

const PRESET_TIMES: Record<number, string[]> = {
  1: [],
  2: [],
  3: [],
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
  const [selected,    setSelected]    = useState<PendingPrescription | null>(null);
  const [freshUrl,    setFreshUrl]    = useState<string | null>(null);
  const [urlLoading,  setUrlLoading]  = useState(false);

  // Manual image upload state
  const [uploadFile,     setUploadFile]     = useState<File | null>(null);
  const [uploadPreview,  setUploadPreview]  = useState<string | null>(null);
  const [uploadStatus,   setUploadStatus]   = useState<"idle"|"checking"|"uploading"|"done"|"error">("idle");
  const [uploadMsg,      setUploadMsg]      = useState("");
  const [uploadedKey,    setUploadedKey]    = useState<string | null>(null);

  // Save form
  const [patientId,    setPatientId]    = useState("");
  const [patientPhone, setPatientPhone] = useState("");   // NEW
  const [staffId,      setStaffId]      = useState("");
  const [startDate,    setStartDate]    = useState(TODAY);
  const [medicines,    setMedicines]    = useState<MedRow[]>([{ ...EMPTY_MED }]);
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [savedRxs,     setSavedRxs]    = useState<PrescriptionResponse[]>([]);

  // Medicine search
  const [medSearch,  setMedSearch]  = useState<string[]>([""]);
  const [medResults, setMedResults] = useState<MedResult[][]>([[]])
  const [medFocused, setMedFocused] = useState<number | null>(null);

  // Issue
  const [issuing,        setIssuing]        = useState(false);
  const [issueError,     setIssueError]     = useState("");
  const [issueResults,   setIssueResults]   = useState<(IssueResponse & { medicine_name: string })[]>([]);
  const [notifyStatus,   setNotifyStatus]   = useState<"idle"|"sending"|"sent"|"failed">("idle");  // NEW
  const [notifyMsg,      setNotifyMsg]      = useState("");  // NEW
  const [sendWhatsApp,   setSendWhatsApp]   = useState(true);  // NEW: opt-in toggle

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
  useEffect(() => { if (tab === "history" || tab === "reminders" || tab === "forecast") fetchHistory(historyFilter); }, [tab, historyFilter]);
  useEffect(() => { if (tab === "reminders") fetchReminders(); }, [tab]);

  // When WhatsApp prescription selected, pre-fill phone
  useEffect(() => {
    if (selected?.phone) setPatientPhone(selected.phone);
  }, [selected]);

  // ── Bill calculation ───────────────────────────────────────────────────────
  const billItems = medicines.map(m => ({
    medicine_name: m.medicine_name,
    quantity:      Number(m.quantity_given) || 0,
    unit_price:    m.selling_price,
    subtotal:      (Number(m.quantity_given) || 0) * m.selling_price,
  }));
  const billTotal = billItems.reduce((sum, i) => sum + i.subtotal, 0);

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
      setReminderMsg(` Reminder sent to ${res.patient ?? "patient"} for ${res.medicine ?? "medicine"}.`);
      fetchReminders();
    } catch (e: unknown) { setReminderMsg(e instanceof Error ? e.message : "Failed to send reminder"); }
    finally { setReminderActionId(null); }
  };
  const handleMarkContinuous = async (prescriptionId: number, current: boolean) => {
    setReminderActionId(prescriptionId); setReminderMsg("");
    try {
      await markContinuous(prescriptionId, !current);
      setReminderMsg(` Prescription #${prescriptionId} marked as ${!current ? "continuous" : "not continuous"}.`);
      fetchHistory(historyFilter);
    } catch (e: unknown) { setReminderMsg(e instanceof Error ? e.message : "Failed to update"); }
    finally { setReminderActionId(null); }
  };
  const handleProcessAll = async () => {
    setProcessingAll(true); setReminderMsg("");
    try { const res = await processReminders(); setReminderMsg(` ${res.message}`); fetchReminders(); }
    catch (e: unknown) { setReminderMsg(e instanceof Error ? e.message : "Failed"); }
    finally { setProcessingAll(false); }
  };

  // ── Data fetches ───────────────────────────────────────────────────────────
  // Fetch a fresh presigned URL when pharmacist clicks a queue item
  // The URL from the list may be expired (presigned URLs last 1hr)
  const selectQueueItem = async (p: PendingPrescription) => {
    setSelected(p);
    setFreshUrl(null);
    setUploadFile(null); setUploadPreview(null); setUploadStatus("idle"); setUploadMsg(""); setUploadedKey(null);
    setStep("save");
    if (p.order_id) {
      setUrlLoading(true);
      try {
        // If we have an s3_key directly, use getPresignedUrl for a cleaner fresh URL
        // Otherwise fall back to getOrderDetail
        const detail = await getOrderDetail(p.order_id) as { prescription_url?: string; prescription?: { s3_key?: string } };
        const s3Key = detail?.prescription?.s3_key;
        if (s3Key) {
          const url = await getPresignedUrl(s3Key);
          setFreshUrl(url);
        } else {
          setFreshUrl(detail?.prescription_url ?? p.prescription_url ?? null);
        }
      } catch {
        setFreshUrl(p.prescription_url ?? null);
      } finally {
        setUrlLoading(false);
      }
    }
  };

  const handleImageSelect = async (file: File) => {
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadStatus("checking"); setUploadMsg("Checking image clarity…");
    try {
      const clarity = await checkImageClarity(file);
      if (!clarity.is_clear) {
        setUploadStatus("error");
        setUploadMsg(`⚠ ${clarity.message} — please use a clearer photo.`);
        return;
      }
      setUploadStatus("uploading"); setUploadMsg("Uploading to S3…");
      const prxId = `manual_${Date.now()}`;
      const result = await uploadPrescriptionImage(file, prxId);
      setUploadedKey(result.key);
      setUploadStatus("done"); setUploadMsg("✓ Image uploaded successfully.");
    } catch (e: unknown) {
      setUploadStatus("error");
      setUploadMsg(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const fetchPending = async () => {
    setLoadingList(true);
    try { setPending(await getPendingPrescriptions()); }
    catch { setPending([]); }
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
    updateMed(idx, { medicine_id: null, medicine_name: q, selling_price: 0 });
    if (q.length < 2) { const r = [...medResults]; r[idx] = []; setMedResults(r); return; }
    try {
      const data = await searchMedicines(q);
      const r = [...medResults]; r[idx] = data; setMedResults(r);
    } catch { /* silent */ }
  };
  const pickMed = (med: MedResult, idx: number) => {
    updateMed(idx, { medicine_id: med.id, medicine_name: med.name, selling_price: med.selling_price ?? 0 });
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
      setNotifyStatus("idle");
      setNotifyMsg("");
      setStep("issue");
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  // ── Issue ──────────────────────────────────────────────────────────────────
  const handleIssueAll = async () => {
    setIssuing(true); setIssueError(""); setNotifyStatus("idle"); setNotifyMsg("");
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

      // Send WhatsApp bill if opted in and phone provided
      if (sendWhatsApp && patientPhone.trim()) {
        setNotifyStatus("sending");
        const totalReminders = savedRxs.reduce((s, rx) => s + (rx.reminders_scheduled || 0), 0);
        const notifResult = await notifyPrescriptionIssued({
          patient_phone: patientPhone.trim(),
          items: billItems.filter(i => i.quantity > 0),
          total_amount: billTotal,
          reminders_scheduled: totalReminders,
        });
        setNotifyStatus(notifResult.success ? "sent" : "failed");
        setNotifyMsg(notifResult.message);
      }
    } catch (e: unknown) { setIssueError(e instanceof Error ? e.message : "Failed to issue"); }
    finally { setIssuing(false); }
  };

  const resetQueue = () => {
    setStep("list"); setSelected(null); setFreshUrl(null); setSavedRxs([]); setIssueResults([]);
    setUploadFile(null); setUploadPreview(null); setUploadStatus("idle"); setUploadMsg(""); setUploadedKey(null);
    setPatientId(""); setPatientPhone(""); setStaffId(""); setStartDate(TODAY);
    setMedicines([{ ...EMPTY_MED }]);
    setMedSearch([""]); setMedResults([[]]);
    setSaveError(""); setIssueError("");
    setNotifyStatus("idle"); setNotifyMsg("");
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

  // ── Forecast data: prescriptions running low in next 3 days ───────────────
  const forecastRecords = historyRecords
    .filter(r => !r.is_completed && r.remaining_days >= 0 && r.remaining_days <= 5)
    .sort((a, b) => a.remaining_days - b.remaining_days);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)", boxShadow: "0 0 18px rgba(56,189,248,0.1)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8"><path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg></div>
          <div>
            <h1 className="page-title gradient-text">Prescriptions</h1>
            <p className="page-sub">Issue prescriptions from WhatsApp or manually, then view history.</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="tab-switcher mb-24 fade-2">
        {([
          { key: "queue",     label: " Queue"     },
          { key: "history",   label: " History"   },
          { key: "reminders", label: " Reminders" },
          { key: "forecast",  label: " Refill Forecast" },
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
                {loadingList ? (
                  <div className="loading-cell row g-12"><span className="spinner" /><span>Loading from AWS…</span></div>
                ) : pending.length === 0 ? (
                  <div className="center p-empty">
                    <div className="empty-icon-lg"></div>
                    <p className="empty-text mb-6">No pending WhatsApp prescriptions</p>
                    <p className="empty-sub mb-20">Patients send images via WhatsApp → saved to AWS → appear here.</p>
                    <button className="btn-primary" onClick={() => { setSelected(null); setStep("save"); }}>+ Enter Manually</button>
                  </div>
                ) : (
                  <div className="col g-8">
                    {pending.map(p => (
                      <div key={p.order_id} className="queue-item" onClick={() => selectQueueItem(p)}>
                        <div className="queue-thumb">
                          {p.prescription_url
                            ? <img src={p.prescription_url} alt="" onError={e => { (e.target as HTMLImageElement).style.display="none"; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("style"); }} />
                            : null}
                          <span className="queue-thumb-empty" style={{ display: p.prescription_url ? "none" : undefined }}>🖼</span>
                        </div>
                        <div className="queue-info">
                          <div className="queue-info-title">Prescription <span className="queue-info-id">#{p.order_id}</span></div>
                          {p.patient_id && <div className="queue-info-phone">Patient ID: #{p.patient_id}</div>}
                          {p.phone && <div className="queue-info-phone">{p.phone}</div>}
                          <div className="queue-info-date">{new Date(p.created_at).toLocaleString()}</div>
                        </div>
                        <span className="queue-arrow">Review </span>
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

                {selected && (freshUrl || urlLoading) && (
                  <div className="rx-preview mb-18">
                    {urlLoading ? (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:120, gap:10, color:"#475569", fontSize:13 }}>
                        <span className="spinner" /> Loading prescription image…
                      </div>
                    ) : freshUrl ? (
                      <a href={freshUrl} target="_blank" rel="noreferrer">
                        <img src={freshUrl} alt="prescription" />
                      </a>
                    ) : null}
                  </div>
                )}

                {/* Info banner for WhatsApp queue items */}
                {selected && (
                  <div style={{
                    background: "rgba(56,189,248,0.06)",
                    border: "1px solid rgba(56,189,248,0.15)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>
                       Order <span style={{ color: "#38bdf8", fontWeight: 700 }}>#{selected.order_id}</span>
                    </span>
                    {selected.patient_id && (
                      <span style={{ fontSize: 12, color: "#475569" }}>
                         Patient ID <span style={{ color: "#4ade80", fontWeight: 700 }}>#{selected.patient_id}</span>
                      </span>
                    )}
                    {selected.phone && (
                      <span style={{ fontSize: 12, color: "#475569" }}>
                         <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{selected.phone}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Shared fields */}
                {/* Manual prescription image upload — only shown when entering manually (no WhatsApp queue item) */}
                {!selected && (
                  <div className="mb-18">
                    <label className="form-label">Prescription Image (optional)</label>
                    <div style={{ marginTop: 6 }}>
                      {!uploadFile ? (
                        <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:"24px 16px", borderRadius:12, border:"2px dashed rgba(148,163,184,0.2)", cursor:"pointer", background:"rgba(255,255,255,0.02)", transition:"border-color 0.2s" }}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageSelect(f); }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span style={{ fontSize:13, color:"#475569" }}>Click to upload or drag & drop</span>
                          <span style={{ fontSize:11, color:"#334155" }}>JPG, PNG — max 10MB</span>
                          <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }} />
                        </label>
                      ) : (
                        <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"1px solid rgba(148,163,184,0.1)" }}>
                          {uploadPreview && <img src={uploadPreview} alt="preview" style={{ width:"100%", maxHeight:200, objectFit:"cover", display:"block" }} />}
                          <button onClick={() => { setUploadFile(null); setUploadPreview(null); setUploadStatus("idle"); setUploadMsg(""); setUploadedKey(null); }}
                            style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:"50%", width:28, height:28, cursor:"pointer", color:"#fff", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                        </div>
                      )}
                      {uploadMsg && (
                        <div style={{ marginTop:8, padding:"8px 12px", borderRadius:8, fontSize:12, fontWeight:500,
                          background: uploadStatus==="done" ? "rgba(74,222,128,0.08)" : uploadStatus==="error" ? "rgba(248,113,113,0.08)" : "rgba(56,189,248,0.08)",
                          color:      uploadStatus==="done" ? "#4ade80"               : uploadStatus==="error" ? "#f87171"               : "#38bdf8",
                          border:     `1px solid ${uploadStatus==="done" ? "rgba(74,222,128,0.2)" : uploadStatus==="error" ? "rgba(248,113,113,0.2)" : "rgba(56,189,248,0.2)"}`,
                          display:"flex", alignItems:"center", gap:8
                        }}>
                          {(uploadStatus==="checking"||uploadStatus==="uploading") && <span className="spinner" />}
                          {uploadMsg}
                        </div>
                      )}
                    </div>
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
                  {/* NEW: Patient phone */}
                  <div className="col g-6">
                    <label className="form-label">
                      Patient WhatsApp Number
                      <span style={{ marginLeft: 6, fontSize: 10, color: "#475569", fontWeight: 400 }}>for bill notification</span>
                    </label>
                    <input type="tel" placeholder="+94771234567" className="input-field"
                      value={patientPhone} onChange={e => setPatientPhone(e.target.value)} />
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
                    const subtotal  = (Number(med.quantity_given) || 0) * med.selling_price;
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
                              <span style={{ position: "absolute", right: 12, top: 34, fontSize: 11, color: "#4ade80" }}> ID {med.medicine_id}</span>
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

                        {/* Meal time checkboxes */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(148,163,184,0.06)" }}>
                          <label className="form-label" style={{ marginBottom: 10, display: "block" }}>
                            Dose Times
                            <span style={{ marginLeft: 8, fontSize: 11, color: "#475569", fontWeight: 400 }}>
                              (SMS sent at each selected meal time)
                            </span>
                          </label>
                          <div className="row g-10" style={{ flexWrap: "wrap" }}>
                            {([
                              { label: "Breakfast", time: "07:30", icon: "" },
                              { label: "Lunch",     time: "13:30", icon: "" },
                              { label: "Dinner",    time: "19:30", icon: "" },
                            ] as { label: string; time: string; icon: string }[]).map(meal => {
                              const checked = med.meal_times.includes(meal.time);
                              return (
                                <button
                                  key={meal.time}
                                  onClick={() => {
                                    const updated = checked
                                      ? med.meal_times.filter(t => t !== meal.time)
                                      : [...med.meal_times, meal.time].sort();
                                    updateMed(idx, { meal_times: updated, dose_per_day: String(updated.length || 1) });
                                  }}
                                  style={{
                                    padding: "8px 16px", borderRadius: 10, border: "1px solid",
                                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                                    background:  checked ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
                                    color:       checked ? "#38bdf8" : "#475569",
                                    borderColor: checked ? "rgba(56,189,248,0.3)"  : "rgba(148,163,184,0.1)",
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                                  }}>
                                  <span style={{ fontSize: 16 }}>{meal.icon}</span>
                                  <span>{meal.label}</span>
                                  <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>
                                    {meal.label === "Breakfast" ? "7:30 AM" : meal.label === "Lunch" ? "1:30 PM" : "7:30 PM"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {med.meal_times.length === 0 && (
                            <span style={{ fontSize: 11, color: "#f87171", marginTop: 6, display: "block" }}>
                               Select at least one meal time
                            </span>
                          )}
                        </div>

                        {/* NEW: Per-medicine bill line */}
                        {med.selling_price > 0 && Number(med.quantity_given) > 0 && (
                          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(148,163,184,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#475569" }}>
                              {med.quantity_given} × LKR {med.selling_price.toFixed(2)}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                              LKR {subtotal.toFixed(2)}
                            </span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

                <button onClick={addMed} className="btn-ghost btn-ghost-sm mb-16"
                  style={{ width: "100%", justifyContent: "center" }}>
                  + Add Another Medicine
                </button>

                {/* NEW: Bill total preview */}
                {billTotal > 0 && (
                  <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>Estimated Total</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>LKR {billTotal.toFixed(2)}</span>
                  </div>
                )}

                {saveError && <div className="err-box mb-14"><p className="hint hint-err"> {saveError}</p></div>}

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

                {/* NEW: Bill summary */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.08)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.06em", marginBottom: 10 }}>BILL SUMMARY</div>
                  <div className="col g-6">
                    {billItems.filter(i => i.quantity > 0).map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#94a3b8" }}>{item.medicine_name} × {item.quantity}</span>
                        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>LKR {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(148,163,184,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8" }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#38bdf8" }}>LKR {billTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* NEW: WhatsApp notification opt-in */}
                <div style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className={`toggle-track ${sendWhatsApp ? "toggle-track-on" : "toggle-track-off"}`}
                        onClick={() => setSendWhatsApp(v => !v)}>
                        <div className={`toggle-thumb ${sendWhatsApp ? "toggle-thumb-on" : "toggle-thumb-off"}`} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Send bill via WhatsApp</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>
                          {patientPhone ? `Will send to ${patientPhone}` : "Enter patient phone number in Save step"}
                        </div>
                      </div>
                    </div>
                    {!patientPhone && sendWhatsApp && (
                      <span style={{ fontSize: 11, color: "#fbbf24" }}> No phone number entered</span>
                    )}
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
                                 {rx.reminders_scheduled} dose reminder{rx.reminders_scheduled > 1 ? "s" : ""} scheduled via SMS
                              </span>
                            )}
                          </div>
                          {done
                            ? <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}> {done.remaining_stock} left in stock</span>
                            : <span className="badge" style={{ background: "rgba(56,189,248,0.08)", color: "#38bdf8" }}>Ready</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>

                {issueError && <div className="warn-box mb-14"><p className="hint hint-err"> {issueError}</p></div>}

                {/* NEW: WhatsApp notification status */}
                {notifyStatus !== "idle" && (
                  <div style={{
                    marginBottom: 14, padding: "12px 16px", borderRadius: 10,
                    background: notifyStatus === "sent" ? "rgba(74,222,128,0.08)" : notifyStatus === "failed" ? "rgba(248,113,113,0.08)" : "rgba(56,189,248,0.08)",
                    border: `1px solid ${notifyStatus === "sent" ? "rgba(74,222,128,0.2)" : notifyStatus === "failed" ? "rgba(248,113,113,0.2)" : "rgba(56,189,248,0.2)"}`,
                    color: notifyStatus === "sent" ? "#4ade80" : notifyStatus === "failed" ? "#f87171" : "#38bdf8",
                    fontSize: 13,
                  }}>
                    {notifyStatus === "sending" && <><span className="spinner" style={{ marginRight: 8 }} />Sending WhatsApp bill…</>}
                    {notifyStatus === "sent"    && ` WhatsApp bill sent to ${patientPhone}`}
                    {notifyStatus === "failed"  && ` WhatsApp failed: ${notifyMsg}`}
                  </div>
                )}

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
                <div className="empty-icon-sm"></div>
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
            {historyError && <div className="err-box mb-14"><p className="hint hint-err"> {historyError}</p></div>}
            <div className="hist-table-head">
              {["Rx ID", "Patient", "Medicine", "Qty", "Dose/Day", "Remaining", "Status", ""].map(h =>
                <div key={h} className="th th-no-pad">{h}</div>
              )}
            </div>
            {historyLoading ? (
              <div className="loading-cell row g-12"><span className="spinner" /><span>Loading…</span></div>
            ) : filteredHistory.length === 0 ? (
              <div className="center p-empty"><div className="empty-icon-md"></div><p className="empty-text">No prescriptions found.</p></div>
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
                        {/* NEW: Remaining days inline */}
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13,
                            color: r.remaining_days <= 0 ? "#f87171" : r.remaining_days <= 3 ? "#fbbf24" : "#4ade80" }}>
                            {Math.round(r.remaining_days)}d
                          </span>
                        </div>
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
            <div className={`msg-box mb-20 ${reminderMsg.startsWith("") ? "msg-box-success" : "msg-box-error"}`}>
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
              <div className="center p-empty"><div className="empty-icon-md"></div><p className="empty-text">No pending reminders.</p></div>
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
                <div className="empty-icon-md"></div>
                <p className="empty-text">No prescriptions. Switch to Queue tab to create one first.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="full-table">
                  <thead>
                    <tr className="thead-border">
                      {["Rx ID", "Patient", "Medicine", "Doses", "Remaining", "Status", "Refill?", "Actions"].map(h =>
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
                      .map(r => {
                        const s = statusBadge(r);
                        return (
                          <tr key={r.id} className="tr-border">
                            <td className="td td-order-id">#{r.id}</td>
                            <td className="td td-order-id">#{r.patient_id}</td>
                            <td className="td" style={{ color: "#e2e8f0", fontWeight: 500 }}>{r.medicine_name}</td>
                            <td className="td" style={{ color: "#94a3b8", fontSize: 12 }}>
                              {r.dose_per_day}×/day{r.meals ? ` · ${r.meals}` : ""}
                            </td>
                            {/* NEW: Remaining days with color */}
                            <td className="td">
                              <span style={{ fontWeight: 700,
                                color: r.remaining_days <= 0 ? "#f87171" : r.remaining_days <= 3 ? "#fbbf24" : "#4ade80" }}>
                                {Math.round(r.remaining_days)}d
                              </span>
                            </td>
                            {/* NEW: Status badge */}
                            <td className="td">
                              <span className="badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 11 }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="td">
                              <button onClick={() => handleMarkContinuous(r.id, r.is_continuous)}
                                disabled={reminderActionId === r.id}
                                className={r.is_continuous ? "btn-sm btn-sm-green" : "btn-sm"}
                                style={{ opacity: reminderActionId === r.id ? 0.5 : 1 }}>
                                {reminderActionId === r.id ? "…" : r.is_continuous ? " On" : "Off"}
                              </button>
                            </td>
                            <td className="td">
                              <button className="btn-sm" style={{ fontSize: 11 }}
                                onClick={() => handleSendOneTime(r.id)}
                                disabled={reminderActionId === r.id}>
                                {reminderActionId === r.id ? "…" : " Send SMS"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ REFILL FORECAST TAB ════════════ */}
      {tab === "forecast" && (
        <div className="fade-3">
          <div style={{ marginBottom: 20 }}>
            <h2 className="panel-title" style={{ marginBottom: 4 }}> Refill Forecast</h2>
            <p style={{ fontSize: 13, color: "#475569" }}>
              Patients whose medicine supply is running out soon — stock these medicines before their refill reminder fires.
            </p>
          </div>

          {historyLoading ? (
            <div className="loading-cell row g-12"><span className="spinner" /><span>Loading…</span></div>
          ) : forecastRecords.length === 0 ? (
            <div className="glass-card panel-p24">
              <div className="center p-empty">
                <div className="empty-icon-lg"></div>
                <p className="empty-text mb-4">No patients running low</p>
                <p className="empty-sub">All active prescriptions have more than 5 days of supply remaining.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Urgency summary */}
              <div className="grid-3 mb-20">
                {[
                  { label: "Running Out Today", value: forecastRecords.filter(r => r.remaining_days <= 0).length, color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.15)" },
                  { label: "Within 3 Days",     value: forecastRecords.filter(r => r.remaining_days > 0 && r.remaining_days <= 3).length, color: "#fbbf24", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.15)" },
                  { label: "Within 5 Days",     value: forecastRecords.filter(r => r.remaining_days > 3 && r.remaining_days <= 5).length, color: "#38bdf8", bg: "rgba(56,189,248,0.07)", border: "rgba(56,189,248,0.15)" },
                ].map(s => (
                  <div key={s.label} className="history-stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="glass-card panel-p24">
                <div className="table-wrap">
                  <table className="full-table">
                    <thead>
                      <tr className="thead-border">
                        {["Rx ID", "Patient", "Medicine", "Doses/Day", "Days Left", "Continuous", "Action"].map(h =>
                          <th key={h} className="th">{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {forecastRecords.map(r => (
                        <tr key={r.id} className="tr-border">
                          <td className="td td-order-id">#{r.id}</td>
                          <td className="td td-order-id">#{r.patient_id}</td>
                          <td className="td" style={{ color: "#e2e8f0", fontWeight: 600 }}>{r.medicine_name}</td>
                          <td className="td" style={{ color: "#94a3b8", fontSize: 12 }}>{r.dose_per_day}×/day</td>
                          <td className="td">
                            <span style={{
                              fontWeight: 800, fontSize: 14,
                              color: r.remaining_days <= 0 ? "#f87171" : r.remaining_days <= 3 ? "#fbbf24" : "#38bdf8"
                            }}>
                              {r.remaining_days <= 0 ? "OUT" : `${Math.round(r.remaining_days)}d`}
                            </span>
                          </td>
                          <td className="td">
                            <span style={{ color: r.is_continuous ? "#4ade80" : "#475569", fontSize: 12, fontWeight: 600 }}>
                              {r.is_continuous ? " Yes" : "No"}
                            </span>
                          </td>
                          <td className="td">
                            <button className="btn-sm btn-sm-green" style={{ fontSize: 11 }}
                              onClick={() => handleSendOneTime(r.id)}
                              disabled={reminderActionId === r.id}>
                              {reminderActionId === r.id ? "…" : " Send Reminder"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer-note mt-14">
                  {forecastRecords.length} patient{forecastRecords.length > 1 ? "s" : ""} need refills soon — ensure stock is ready.
                </div>
              </div>
            </>
          )}

          {reminderMsg && (
            <div className={`msg-box mt-16 ${reminderMsg.startsWith("") ? "msg-box-success" : "msg-box-error"}`}>
              {reminderMsg}
            </div>
          )}
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