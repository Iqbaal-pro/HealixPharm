"use client";
import { useState, useEffect } from "react";
import {
  getPendingPrescriptions,
  createPrescription,
  issueMedicine,
  getAllPrescriptions,
  type PendingPrescription,
  type PrescriptionResponse,
  type PrescriptionRecord,
  type IssueResponse,
} from "../routes/prescriptionRoutes";

// ── Border-safe input style ───────────────────────────────────────────────────
function iStyle(focused: boolean, hasError = false): React.CSSProperties {
  return {
    width: "100%", background: "rgba(6,13,26,0.9)",
    borderWidth: "1px", borderStyle: "solid",
    borderColor: hasError ? "rgba(248,113,113,0.55)" : focused ? "rgba(56,189,248,0.5)" : "rgba(148,163,184,0.1)",
    boxShadow: focused && !hasError ? "0 0 0 3px rgba(56,189,248,0.07)" : "none",
    borderRadius: 11, color: "#f1f5f9", padding: "11px 14px", fontSize: 13.5,
    fontFamily: "'DM Sans',sans-serif", outline: "none",
    boxSizing: "border-box" as const, transition: "border-color .2s, box-shadow .2s",
  };
}

type MainTab = "queue" | "history";
type QueueStep = "list" | "save" | "issue";
type HistoryFilter = "all" | "active" | "completed";

interface SessionRecord {
  seq: number;
  prescription_id: number;
  medicine_id: number;
  quantity: number;
  remaining_stock: number;
  medicine_name: string;
  time: string;
}

const TODAY = new Date().toISOString().split("T")[0];

export default function PrescriptionPage() {
  const [tab, setTab] = useState<MainTab>("queue");

  // ── Queue state ──────────────────────────────────────────────────────────────
  const [step, setStep]             = useState<QueueStep>("list");
  const [pending, setPending]       = useState<PendingPrescription[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError]   = useState("");
  const [selected, setSelected]     = useState<PendingPrescription | null>(null);

  const [saveForm, setSaveForm] = useState({
    patient_id: "", uploaded_by_staff_id: "", medicine_name: "",
    dose_per_day: "1", start_date: TODAY, quantity_given: "", is_continuous: false,
  });
  const [saveFocused, setSaveFocused] = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState("");
  const [savedRx, setSavedRx]         = useState<PrescriptionResponse | null>(null);

  const [issueForm, setIssueForm]     = useState({ medicine_id: "", quantity: "" });
  const [issueFocused, setIssueFocused] = useState<string | null>(null);
  const [issuing, setIssuing]         = useState(false);
  const [issueError, setIssueError]   = useState("");
  const [issueResult, setIssueResult] = useState<IssueResponse | null>(null);

  const [session, setSession]         = useState<SessionRecord[]>([]);
  const [counter, setCounter]         = useState(1);

  // ── History state ────────────────────────────────────────────────────────────
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [historyRecords, setHistoryRecords] = useState<PrescriptionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState("");
  const [search, setSearch]                 = useState("");
  const [searchFocused, setSearchFocused]   = useState(false);
  const [expanded, setExpanded]             = useState<number | null>(null);

  // ── Load on mount ────────────────────────────────────────────────────────────
  useEffect(() => { fetchPending(); }, []);
  useEffect(() => { if (tab === "history") fetchHistory(historyFilter); }, [tab, historyFilter]);

  const fetchPending = async () => {
    setLoadingList(true); setListError("");
    try {
      const data = await getPendingPrescriptions();
      setPending(data);
    } catch {
      setPending([]);
      setListError("⚠ GET /prescriptions/pending not yet implemented — use manual entry.");
    } finally { setLoadingList(false); }
  };

  const fetchHistory = async (f: HistoryFilter) => {
    setHistoryLoading(true); setHistoryError("");
    try {
      const completedOnly = f === "completed" ? true : f === "active" ? false : undefined;
      const data = await getAllPrescriptions(completedOnly);
      setHistoryRecords(data);
    } catch (e: unknown) {
      setHistoryError(e instanceof Error ? e.message : "Failed to load prescriptions");
    } finally { setHistoryLoading(false); }
  };

  // ── Save prescription ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveError("");
    try {
      const rx = await createPrescription({
        patient_id:           Number(saveForm.patient_id),
        uploaded_by_staff_id: Number(saveForm.uploaded_by_staff_id),
        medicine_name:        saveForm.medicine_name.trim(),
        dose_per_day:         Number(saveForm.dose_per_day),
        start_date:           saveForm.start_date,
        quantity_given:       Number(saveForm.quantity_given),
        is_continuous:        saveForm.is_continuous,
      });
      setSavedRx(rx);
      setIssueForm({ medicine_id: "", quantity: String(rx.quantity_given) });
      setStep("issue");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  };

  // ── Issue medicine ───────────────────────────────────────────────────────────
  const handleIssue = async () => {
    if (!savedRx) return;
    setIssuing(true); setIssueError("");
    try {
      const result = await issueMedicine({
        prescription_id: savedRx.id,
        medicine_id:     Number(issueForm.medicine_id),
        quantity:        Number(issueForm.quantity),
      });
      setIssueResult(result);
      setSession(prev => [{
        seq: counter, prescription_id: savedRx.id,
        medicine_id: Number(issueForm.medicine_id),
        quantity: Number(issueForm.quantity),
        remaining_stock: result.remaining_stock,
        medicine_name: savedRx.medicine_name,
        time: new Date().toLocaleTimeString(),
      }, ...prev]);
      setCounter(c => c + 1);
    } catch (e: unknown) {
      setIssueError(e instanceof Error ? e.message : "Failed to issue");
    } finally { setIssuing(false); }
  };

  const resetQueue = () => {
    setStep("list"); setSelected(null); setSavedRx(null); setIssueResult(null);
    setSaveForm({ patient_id: "", uploaded_by_staff_id: "", medicine_name: "", dose_per_day: "1", start_date: TODAY, quantity_given: "", is_continuous: false });
    setIssueForm({ medicine_id: "", quantity: "" });
    setSaveError(""); setIssueError("");
    fetchPending();
  };

  const saveValid = saveForm.patient_id !== "" && saveForm.uploaded_by_staff_id !== "" && saveForm.medicine_name.trim() !== "" && Number(saveForm.dose_per_day) > 0 && Number(saveForm.quantity_given) > 0;
  const issueValid = issueForm.medicine_id !== "" && Number(issueForm.quantity) > 0;
  const sf = (k: string) => saveFocused === k;
  const isf = (k: string) => issueFocused === k;

  const statusBadge = (r: PrescriptionRecord) => {
    if (r.is_completed) return { label: "Completed", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
    if (r.remaining_days <= 3) return { label: "Expiring Soon", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" };
    return { label: "Active", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" };
  };

  const filteredHistory = historyRecords.filter(r =>
    r.medicine_name.toLowerCase().includes(search.toLowerCase()) ||
    String(r.patient_id).includes(search) ||
    String(r.id).includes(search)
  );

  const stockColor = (n: number) => n === 0 ? "#f87171" : n < 10 ? "#fbbf24" : "#4ade80";

  return (
    <div style={pageWrap}>
      <style>{CSS}</style>
      <div style={gridBg} />
      <div className="orb orb1" /><div className="orb orb2" />

      <div style={{ position: "relative", zIndex: 1, padding: "40px 48px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Page header ── */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={iconBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <h1 style={pageTitle}>Prescriptions</h1>
          </div>
          <p style={pageSub}>Issue prescriptions from WhatsApp/manually, then view the full history.</p>
        </div>

        {/* ── Main tabs ── */}
        <div className="fade-up" style={{ display: "flex", gap: 4, background: "rgba(10,20,42,0.7)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.08)", borderRadius: 14, padding: 5, marginBottom: 24, width: "fit-content", animationDelay: ".04s" }}>
          {([
            { key: "queue",   label: "📋 Queue",   sub: "Issue prescriptions" },
            { key: "history", label: "🗂 History",  sub: "View all prescriptions" },
          ] as { key: MainTab; label: string; sub: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s", background: tab === t.key ? "rgba(14,165,233,0.15)" : "transparent", color: tab === t.key ? "#38bdf8" : "#475569", fontWeight: tab === t.key ? 700 : 500, fontSize: 14 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1 — QUEUE
        ══════════════════════════════════════════════════════════ */}
        {tab === "queue" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

            {/* ── Main queue panel ── */}
            <div className="fade-up">

              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                {[
                  { key: "list",  label: "01 Review" },
                  { key: "save",  label: "02 Save" },
                  { key: "issue", label: "03 Issue" },
                ].map((s, i, arr) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: step === s.key ? "rgba(14,165,233,0.15)" : "transparent", borderWidth: 1, borderStyle: "solid", borderColor: step === s.key ? "rgba(14,165,233,0.4)" : "rgba(148,163,184,0.08)", color: step === s.key ? "#38bdf8" : "#334155" }}>
                      {s.label}
                    </div>
                    {i < arr.length - 1 && <span style={{ color: "#1e293b", fontSize: 12 }}>→</span>}
                  </div>
                ))}
              </div>

              {/* ── STEP: List ── */}
              {step === "list" && (
                <div style={glassCard}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div>
                      <h2 style={cardTitle}>Pending from WhatsApp</h2>
                      <p style={cardSub}>Select a prescription from AWS S3 to process.</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setSelected(null); setStep("save"); }} style={btnManual}>+ Enter Manually</button>
                      <button onClick={fetchPending} style={btnGhost} disabled={loadingList}>
                        {loadingList ? <span className="spinner" /> : "↻"}
                      </button>
                    </div>
                  </div>

                  {listError && <div style={warnBox}><p style={{ color: "#fbbf24", fontSize: 13, margin: 0 }}>{listError}</p></div>}

                  {loadingList ? (
                    <div style={centerPad}>
                      <span className="spinner" />
                      <span style={{ color: "#475569", fontSize: 14 }}>Loading from AWS…</span>
                    </div>
                  ) : pending.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 10 }}>📥</div>
                      <p style={{ color: "#334155", fontSize: 14, margin: "0 0 6px" }}>No pending WhatsApp prescriptions</p>
                      <p style={{ color: "#1e293b", fontSize: 13, margin: "0 0 20px" }}>Patients send images via WhatsApp → saved to AWS → appear here.</p>
                      <button onClick={() => { setSelected(null); setStep("save"); }} style={{ ...btnPrimary, width: "auto", padding: "10px 24px", display: "inline-block" }}>
                        + Enter Manually
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {pending.map(p => (
                        <div key={p.order_id} onClick={() => { setSelected(p); setStep("save"); }}
                          style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(15,23,42,0.5)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.07)", borderRadius: 12, padding: "12px 16px", cursor: "pointer", transition: "border-color .2s" }}>
                          <div style={{ width: 52, height: 52, borderRadius: 9, overflow: "hidden", background: "rgba(6,13,26,0.8)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {p.prescription_url ? <img src={p.prescription_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20, opacity: 0.25 }}>🖼</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: "#f1f5f9", fontSize: 13.5, fontWeight: 600 }}>Prescription <span style={{ color: "#38bdf8" }}>#{String(p.order_id)}</span></div>
                            {p.phone && <div style={{ color: "#475569", fontSize: 12 }}>{p.phone}</div>}
                            <div style={{ color: "#334155", fontSize: 12 }}>{new Date(p.created_at).toLocaleString()}</div>
                          </div>
                          <span style={{ color: "#38bdf8", fontSize: 13 }}>Review →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP: Save ── */}
              {step === "save" && (
                <div style={glassCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <button onClick={() => setStep("list")} style={btnGhost}>← Back</button>
                    <div>
                      <h2 style={cardTitle}>{selected ? "Save Prescription" : "Enter Manually"}</h2>
                      <p style={cardSub}>{selected ? "Review image and fill in details." : "Fill in prescription details — ID auto-assigned."}</p>
                    </div>
                  </div>

                  {/* S3 image (only if from WhatsApp) */}
                  {selected && (
                    <div style={{ background: "rgba(6,13,26,0.8)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.07)", borderRadius: 12, overflow: "hidden", marginBottom: 18, minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected.prescription_url
                        ? <img src={selected.prescription_url} alt="prescription" style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain" }} />
                        : <div style={{ textAlign: "center", padding: 32 }}>
                            <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 8 }}>🖼</div>
                            <p style={{ color: "#334155", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{selected.token}</p>
                          </div>
                      }
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Patient ID</Label><input type="number" min="1" placeholder="e.g. 12" value={saveForm.patient_id} onChange={e => setSaveForm(f => ({ ...f, patient_id: e.target.value }))} onFocus={() => setSaveFocused("pid")} onBlur={() => setSaveFocused(null)} style={iStyle(sf("pid"))} /></div>
                    <div><Label>Staff ID</Label><input type="number" min="1" placeholder="e.g. 3" value={saveForm.uploaded_by_staff_id} onChange={e => setSaveForm(f => ({ ...f, uploaded_by_staff_id: e.target.value }))} onFocus={() => setSaveFocused("sid")} onBlur={() => setSaveFocused(null)} style={iStyle(sf("sid"))} /></div>
                    <div style={{ gridColumn: "1 / -1" }}><Label>Medicine Name</Label><input type="text" placeholder="e.g. Metformin 500mg" value={saveForm.medicine_name} onChange={e => setSaveForm(f => ({ ...f, medicine_name: e.target.value }))} onFocus={() => setSaveFocused("mn")} onBlur={() => setSaveFocused(null)} style={iStyle(sf("mn"))} /></div>
                    <div><Label>Dose Per Day</Label><input type="number" min="1" placeholder="e.g. 2" value={saveForm.dose_per_day} onChange={e => setSaveForm(f => ({ ...f, dose_per_day: e.target.value }))} onFocus={() => setSaveFocused("dpd")} onBlur={() => setSaveFocused(null)} style={iStyle(sf("dpd"))} /></div>
                    <div><Label>Quantity Given</Label><input type="number" min="1" placeholder="e.g. 60" value={saveForm.quantity_given} onChange={e => setSaveForm(f => ({ ...f, quantity_given: e.target.value }))} onFocus={() => setSaveFocused("qg")} onBlur={() => setSaveFocused(null)} style={iStyle(sf("qg"))} /></div>
                    <div><Label>Start Date</Label><input type="date" value={saveForm.start_date} onChange={e => setSaveForm(f => ({ ...f, start_date: e.target.value }))} onFocus={() => setSaveFocused("sd")} onBlur={() => setSaveFocused(null)} style={{ ...iStyle(sf("sd")), colorScheme: "dark" }} /></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
                      <div onClick={() => setSaveForm(f => ({ ...f, is_continuous: !f.is_continuous }))} style={{ width: 42, height: 23, borderRadius: 99, background: saveForm.is_continuous ? "rgba(14,165,233,0.6)" : "rgba(148,163,184,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: saveForm.is_continuous ? "rgba(14,165,233,0.4)" : "rgba(148,163,184,0.15)", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                        <div style={{ position: "absolute", top: 3, left: saveForm.is_continuous ? 20 : 3, width: 15, height: 15, borderRadius: "50%", background: saveForm.is_continuous ? "#bae6fd" : "#475569", transition: "left .2s" }} />
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>Continuous</span>
                    </div>
                  </div>

                  {saveError && <div style={errBox}><p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {saveError}</p></div>}

                  <button onClick={handleSave} disabled={!saveValid || saving} style={{ ...btnPrimary, marginTop: 18, opacity: !saveValid || saving ? 0.45 : 1 }}>
                    {saving ? <Spinner text="Saving…" /> : "Save Prescription →"}
                  </button>
                </div>
              )}

              {/* ── STEP: Issue ── */}
              {step === "issue" && savedRx && (
                <div style={glassCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <button onClick={() => setStep("save")} style={btnGhost}>← Back</button>
                    <div>
                      <h2 style={cardTitle}>Issue Medicine</h2>
                      <p style={cardSub}>Prescription saved — deduct stock now.</p>
                    </div>
                  </div>

                  {/* Saved rx summary */}
                  <div style={{ background: "rgba(14,165,233,0.05)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(14,165,233,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                    <MiniStat label="Rx ID"     value={`#${savedRx.id}`}              color="#38bdf8" />
                    <MiniStat label="Medicine"  value={savedRx.medicine_name}          color="#f1f5f9" />
                    <MiniStat label="Dose/Day"  value={String(savedRx.dose_per_day)}   color="#f1f5f9" />
                    <MiniStat label="Qty Given" value={String(savedRx.quantity_given)} color="#f1f5f9" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><Label>Medicine ID</Label><input type="number" min="1" placeholder="e.g. 7" value={issueForm.medicine_id} onChange={e => setIssueForm(f => ({ ...f, medicine_id: e.target.value }))} onFocus={() => setIssueFocused("mid")} onBlur={() => setIssueFocused(null)} style={iStyle(isf("mid"))} /></div>
                    <div><Label>Quantity to Issue</Label><input type="number" min="1" placeholder="e.g. 60" value={issueForm.quantity} onChange={e => setIssueForm(f => ({ ...f, quantity: e.target.value }))} onFocus={() => setIssueFocused("qty")} onBlur={() => setIssueFocused(null)} style={iStyle(isf("qty"))} /></div>
                  </div>

                  {issueError && <div style={errBox}><p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {issueError}</p></div>}

                  {issueResult && (
                    <div style={{ background: "rgba(74,222,128,0.05)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(74,222,128,0.2)", borderRadius: 12, padding: "14px 16px", marginTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#4ade80" }}>✓</span>
                        <span style={{ color: "#4ade80", fontSize: 13.5, fontWeight: 700 }}>Issued successfully</span>
                      </div>
                      <MiniStat label="Remaining Stock" value={String(issueResult.remaining_stock)} color={stockColor(issueResult.remaining_stock)} />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button onClick={handleIssue} disabled={!issueValid || issuing} style={{ ...btnPrimary, flex: 1, opacity: !issueValid || issuing ? 0.45 : 1 }}>
                      {issuing ? <Spinner text="Issuing…" /> : "Issue Medicine →"}
                    </button>
                    {issueResult && (
                      <button onClick={resetQueue} style={btnGhost}>Next →</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Session sidebar ── */}
            <div className="fade-up" style={{ ...glassCard, animationDelay: ".08s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h2 style={cardTitle}>Session</h2>
                  <p style={cardSub}>Issued this session.</p>
                </div>
                {session.length > 0 && <button onClick={() => setSession([])} style={btnDanger}>Clear</button>}
              </div>

              {session.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 12px" }}>
                  <div style={{ fontSize: 26, opacity: 0.2, marginBottom: 8 }}>📋</div>
                  <p style={{ color: "#334155", fontSize: 13 }}>Nothing issued yet.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {session.map(r => (
                      <div key={r.seq} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.5)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.07)", borderRadius: 10, padding: "10px 13px" }}>
                        <div>
                          <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>Rx <span style={{ color: "#38bdf8" }}>#{r.prescription_id}</span></div>
                          <div style={{ color: "#475569", fontSize: 12 }}>{r.medicine_name}</div>
                          <div style={{ color: "#334155", fontSize: 11, marginTop: 2 }}>{r.time}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>×{r.quantity}</div>
                          <div style={{ color: stockColor(r.remaining_stock), fontSize: 12 }}>{r.remaining_stock} left</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(148,163,184,0.06)", display: "flex", gap: 20 }}>
                    <MiniStat label="Processed" value={String(session.length)} color="#38bdf8" />
                    <MiniStat label="Units" value={String(session.reduce((s, r) => s + r.quantity, 0))} color="#818cf8" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2 — HISTORY
        ══════════════════════════════════════════════════════════ */}
        {tab === "history" && (
          <div className="fade-up">

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Total",     value: historyRecords.length,                           color: "#38bdf8", bg: "rgba(14,165,233,0.07)",  border: "rgba(14,165,233,0.15)"  },
                { label: "Active",    value: historyRecords.filter(r => !r.is_completed).length, color: "#4ade80", bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.15)"  },
                { label: "Completed", value: historyRecords.filter(r => r.is_completed).length,  color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.15)" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderWidth: 1, borderStyle: "solid", borderColor: s.border, borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: 26, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{historyLoading ? "—" : s.value}</div>
                </div>
              ))}
            </div>

            {/* Filters + search */}
            <div style={{ ...glassCard, marginBottom: 14, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
                <div style={{ display: "flex", gap: 4, background: "rgba(6,13,26,0.6)", borderRadius: 9, padding: 3 }}>
                  {(["all","active","completed"] as HistoryFilter[]).map(f => (
                    <button key={f} onClick={() => setHistoryFilter(f)} style={{ padding: "5px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: historyFilter === f ? "rgba(14,165,233,0.2)" : "transparent", color: historyFilter === f ? "#38bdf8" : "#475569", fontWeight: historyFilter === f ? 700 : 500, fontSize: 13, textTransform: "capitalize" as const }}>
                      {f}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                  <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </span>
                  <input type="text" placeholder="Search by medicine, patient ID or Rx ID…" value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                    style={{ width: "100%", background: "rgba(6,13,26,0.9)", borderWidth: 1, borderStyle: "solid", borderColor: searchFocused ? "rgba(56,189,248,0.5)" : "rgba(148,163,184,0.1)", borderRadius: 9, color: "#f1f5f9", padding: "8px 12px 8px 32px", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" as const }} />
                </div>
                <button onClick={() => fetchHistory(historyFilter)} style={btnGhost}>↻ Refresh</button>
              </div>
            </div>

            {/* Table */}
            <div style={glassCard}>
              {historyError && <div style={errBox}><p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {historyError}</p></div>}

              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr 90px 90px 120px 24px", gap: 12, padding: "0 12px 10px", borderBottom: "1px solid rgba(148,163,184,0.06)", marginBottom: 6 }}>
                {["Rx ID","Patient","Medicine","Qty","Dose/Day","Status",""].map(h => (
                  <div key={h} style={{ color: "#334155", fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const }}>{h}</div>
                ))}
              </div>

              {historyLoading ? (
                <div style={centerPad}><span className="spinner" /><span style={{ color: "#475569", fontSize: 14 }}>Loading…</span></div>
              ) : filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 28, opacity: 0.2, marginBottom: 8 }}>📋</div>
                  <p style={{ color: "#334155", fontSize: 14 }}>No prescriptions found.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {filteredHistory.map(r => {
                    const s = statusBadge(r);
                    const isOpen = expanded === r.id;
                    return (
                      <div key={r.id}>
                        <div onClick={() => setExpanded(isOpen ? null : r.id)}
                          style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr 90px 90px 120px 24px", gap: 12, padding: "11px 12px", borderRadius: 9, background: isOpen ? "rgba(14,165,233,0.04)" : "transparent", cursor: "pointer", transition: "background .15s", alignItems: "center" }}>
                          <div style={{ color: "#38bdf8", fontSize: 13.5, fontWeight: 700 }}>#{r.id}</div>
                          <div style={{ color: "#94a3b8", fontSize: 13 }}>#{r.patient_id}</div>
                          <div style={{ color: "#f1f5f9", fontSize: 13.5, fontWeight: 500 }}>{r.medicine_name}</div>
                          <div style={{ color: "#94a3b8", fontSize: 13 }}>{r.quantity_given}</div>
                          <div style={{ color: "#94a3b8", fontSize: 13 }}>{r.dose_per_day}×/day</div>
                          <div><span style={{ display: "inline-block", background: s.bg, borderWidth: 1, borderStyle: "solid", borderColor: s.border, color: s.color, borderRadius: 99, padding: "3px 10px", fontSize: 11.5, fontWeight: 700 }}>{s.label}</span></div>
                          <div style={{ color: "#334155", fontSize: 11, textAlign: "right" as const }}>{isOpen ? "▲" : "▼"}</div>
                        </div>
                        {isOpen && (
                          <div style={{ margin: "0 12px 6px", background: "rgba(6,13,26,0.5)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.07)", borderRadius: 10, padding: "14px 18px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                            <Detail label="Start Date"     value={r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"} />
                            <Detail label="Remaining Days" value={`${Math.round(r.remaining_days)}d`} color={r.remaining_days <= 0 ? "#f87171" : r.remaining_days <= 3 ? "#fbbf24" : "#4ade80"} />
                            <Detail label="Continuous"     value={r.is_continuous ? "Yes" : "No"} color={r.is_continuous ? "#38bdf8" : "#475569"} />
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
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(148,163,184,0.06)", color: "#334155", fontSize: 12.5 }}>
                  Showing {filteredHistory.length} of {historyRecords.length} prescriptions
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", color: "#64748b", fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const, marginBottom: 7 }}>{children}</label>;
}
function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ color: "#475569", fontSize: 11, marginBottom: 2 }}>{label}</div>
      <div style={{ color, fontSize: 15, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{value}</div>
    </div>
  );
}
function Detail({ label, value, color = "#94a3b8" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ color: "#334155", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, marginBottom: 3 }}>{label}</div>
      <div style={{ color, fontSize: 13.5, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
function Spinner({ text }: { text: string }) {
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="spinner" />{text}</span>;
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties  = { minHeight: "100vh", background: "#060d1a", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" };
const gridBg: React.CSSProperties   = { position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(148,163,184,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.025) 1px,transparent 1px)", backgroundSize: "52px 52px" };
const glassCard: React.CSSProperties = { background: "rgba(10,20,42,0.85)", backdropFilter: "blur(20px)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.09)", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", padding: "24px" };
const iconBox: React.CSSProperties  = { width: 36, height: 36, borderRadius: 10, background: "rgba(14,165,233,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center" };
const pageTitle: React.CSSProperties = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: "-0.02em" };
const pageSub: React.CSSProperties  = { color: "#475569", fontSize: 13.5, margin: 0 };
const cardTitle: React.CSSProperties = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#f1f5f9", margin: "0 0 2px" };
const cardSub: React.CSSProperties  = { color: "#475569", fontSize: 12, margin: 0 };
const centerPad: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 };
const errBox: React.CSSProperties   = { background: "rgba(239,68,68,0.07)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginTop: 14 };
const warnBox: React.CSSProperties  = { background: "rgba(251,191,36,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 };
const btnPrimary: React.CSSProperties = { width: "100%", background: "linear-gradient(90deg,#0369a1,#0e7ab5)", color: "#bae6fd", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 18px rgba(3,105,161,.28)", transition: "opacity .18s" };
const btnGhost: React.CSSProperties  = { background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,.12)", color: "#94a3b8", borderRadius: 9, padding: "7px 14px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };
const btnManual: React.CSSProperties = { background: "rgba(56,189,248,0.08)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(56,189,248,0.25)", color: "#38bdf8", borderRadius: 9, padding: "7px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };
const btnDanger: React.CSSProperties = { background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.2)", color: "#f87171", borderRadius: 9, padding: "5px 12px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:rgba(14,165,233,0.04);top:-200px;right:-100px;animation:d1 24s ease-in-out infinite alternate}
  .orb2{width:400px;height:400px;background:rgba(129,140,248,0.04);bottom:-100px;left:-80px;animation:d2 28s ease-in-out infinite alternate}
  @keyframes d1{to{transform:translate(-60px,80px)}} @keyframes d2{to{transform:translate(60px,-60px)}}
  .fade-up{opacity:0;transform:translateY(16px);animation:fu .35s ease forwards}
  @keyframes fu{to{opacity:1;transform:translateY(0)}}
  .spinner{width:14px;height:14px;border:2px solid rgba(186,230,253,.2);border-top-color:#bae6fd;border-radius:50%;animation:sp .7s linear infinite;display:inline-block;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
  button:not(:disabled):hover{opacity:.82}
  input[type=number]::-webkit-inner-spin-button{opacity:0.3}
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
`;