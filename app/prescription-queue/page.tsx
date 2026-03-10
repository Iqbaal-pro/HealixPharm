"use client";
import { useState, useEffect } from "react";
import {
  getPendingPrescriptions,
  createPrescription,
  issueMedicine,
  type PendingPrescription,
  type PrescriptionResponse,
  type IssueResponse,
} from "../routes/prescriptionRoutes";

// ── Input style — no border shorthand ────────────────────────────────────────
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

type Step = "queue" | "save" | "issue";

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

export default function PrescriptionQueuePage() {
  // ── Step state ──
  const [step, setStep] = useState<Step>("queue");

  // ── Step 1: pending list ──
  const [pending, setPending]       = useState<PendingPrescription[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError]   = useState("");
  const [selected, setSelected]     = useState<PendingPrescription | null>(null);

  // ── Step 2: save prescription form ──
  const [saveForm, setSaveForm] = useState({
    patient_id: "", uploaded_by_staff_id: "",
    medicine_name: "", dose_per_day: "1",
    start_date: TODAY, quantity_given: "", is_continuous: false,
  });
  const [saveFocused, setSaveFocused] = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState("");
  const [savedRx, setSavedRx]         = useState<PrescriptionResponse | null>(null);

  // ── Step 3: issue medicine ──
  const [issueForm, setIssueForm] = useState({ medicine_id: "", quantity: "" });
  const [issueFocused, setIssueFocused] = useState<string | null>(null);
  const [issuing, setIssuing]     = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issueResult, setIssueResult] = useState<IssueResponse | null>(null);

  // ── Session history ──
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [counter, setCounter] = useState(1);

  // ── Load pending on mount ──
  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoadingList(true); setListError("");
    try {
      const data = await getPendingPrescriptions();
      setPending(data);
    } catch {
      // ⚠ Backend endpoint not yet implemented — show empty state
      setPending([]);
      setListError("⚠ GET /prescriptions/pending not yet implemented on backend.");
    } finally { setLoadingList(false); }
  };

  const sf = (k: string) => saveFocused === k;
  const iff = (k: string) => issueFocused === k;

  const saveFormValid =
    saveForm.patient_id.trim() !== "" &&
    saveForm.uploaded_by_staff_id.trim() !== "" &&
    saveForm.medicine_name.trim() !== "" &&
    Number(saveForm.dose_per_day) > 0 &&
    Number(saveForm.quantity_given) > 0;

  const issueFormValid =
    issueForm.medicine_id.trim() !== "" &&
    Number(issueForm.quantity) > 0;

  // ── Step 2: Save prescription ──
  const handleSave = async () => {
    if (!saveFormValid) return;
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
        s3_key:               selected?.id,
      });
      setSavedRx(rx);
      setIssueForm({ medicine_id: "", quantity: String(rx.quantity_given) });
      setStep("issue");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save prescription");
    } finally { setSaving(false); }
  };

  // ── Step 3: Issue medicine ──
  const handleIssue = async () => {
    if (!savedRx || !issueFormValid) return;
    setIssuing(true); setIssueError("");
    try {
      const result = await issueMedicine({
        prescription_id: savedRx.id,
        medicine_id:     Number(issueForm.medicine_id),
        quantity:        Number(issueForm.quantity),
      });
      setIssueResult(result);
      setHistory(prev => [{
        seq:             counter,
        prescription_id: savedRx.id,
        medicine_id:     Number(issueForm.medicine_id),
        quantity:        Number(issueForm.quantity),
        remaining_stock: result.remaining_stock,
        medicine_name:   savedRx.medicine_name,
        time:            new Date().toLocaleTimeString(),
      }, ...prev]);
      setCounter(c => c + 1);
    } catch (e: unknown) {
      setIssueError(e instanceof Error ? e.message : "Failed to issue medicine");
    } finally { setIssuing(false); }
  };

  const resetToQueue = () => {
    setStep("queue");
    setSelected(null);
    setSavedRx(null);
    setIssueResult(null);
    setSaveForm({ patient_id: "", uploaded_by_staff_id: "", medicine_name: "", dose_per_day: "1", start_date: TODAY, quantity_given: "", is_continuous: false });
    setIssueForm({ medicine_id: "", quantity: "" });
    setSaveError(""); setIssueError("");
    fetchPending();
  };

  const stockColor = (n: number) => n === 0 ? "#f87171" : n < 10 ? "#fbbf24" : "#4ade80";

  return (
    <div style={pageWrap}>
      <style>{CSS}</style>
      <div style={gridBg} />
      <div className="orb orb1" /><div className="orb orb2" />

      <div style={{ position: "relative", zIndex: 1, padding: "40px 48px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={iconBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
              </div>
              <div>
                <h1 style={pageTitle}>Prescription Queue</h1>
                <p style={pageSub}>WhatsApp → AWS S3 → Review → Save → Issue</p>
              </div>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {[
                { key: "queue", label: "01 Review" },
                { key: "save",  label: "02 Save" },
                { key: "issue", label: "03 Issue" },
              ].map((s, i, arr) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: step === s.key ? "rgba(14,165,233,0.15)" : "transparent", borderWidth: 1, borderStyle: "solid", borderColor: step === s.key ? "rgba(14,165,233,0.4)" : "rgba(148,163,184,0.08)", color: step === s.key ? "#38bdf8" : "#334155" }}>
                    {s.label}
                  </div>
                  {i < arr.length - 1 && <span style={{ color: "#1e293b", fontSize: 12 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>

          {/* ── MAIN PANEL ── */}
          <div>

            {/* ══ STEP 1: Queue ══ */}
            {step === "queue" && (
              <div className="fade-up" style={glassCard}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={cardTitle}>Pending Prescriptions</h2>
                    <p style={cardSub}>From AWS S3 via WhatsApp bot — select one to process.</p>
                  </div>
                  <button onClick={fetchPending} style={btnGhost} disabled={loadingList}>
                    {loadingList ? <span className="spinner" /> : "↻ Refresh"}
                  </button>
                </div>

                {listError && (
                  <div style={{ background: "rgba(251,191,36,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(251,191,36,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 16 }}>
                    <p style={{ color: "#fbbf24", fontSize: 13, margin: 0 }}>{listError}</p>
                  </div>
                )}

                {loadingList ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 52, gap: 12 }}>
                    <span className="spinner" />
                    <span style={{ color: "#475569", fontSize: 14 }}>Loading from AWS…</span>
                  </div>
                ) : pending.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "52px 20px" }}>
                    <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.25 }}>📥</div>
                    <p style={{ color: "#334155", fontSize: 14, margin: "0 0 6px" }}>No pending prescriptions</p>
                    <p style={{ color: "#1e293b", fontSize: 13, margin: 0 }}>New ones appear here when patients send via WhatsApp.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {pending.map(p => (
                      <div key={p.id} onClick={() => { setSelected(p); setStep("save"); }}
                        style={{ ...pendingRow, borderColor: selected?.id === p.id ? "rgba(56,189,248,0.3)" : "rgba(148,163,184,0.07)", cursor: "pointer" }}>
                        <div style={{ width: 60, height: 60, borderRadius: 10, overflow: "hidden", background: "rgba(15,23,42,0.8)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {p.image_url
                            ? <img src={p.image_url} alt="prescription" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 24, opacity: 0.3 }}>🖼</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#f1f5f9", fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>
                            Prescription <span style={{ color: "#38bdf8" }}>#{p.id.slice(-6)}</span>
                          </div>
                          {p.phone_number && <div style={{ color: "#475569", fontSize: 12 }}>{p.phone_number}</div>}
                          <div style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>{new Date(p.received_at).toLocaleString()}</div>
                        </div>
                        <div style={{ color: "#38bdf8", fontSize: 13, fontWeight: 600 }}>Review →</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 2: Save Prescription ══ */}
            {step === "save" && selected && (
              <div className="fade-up" style={glassCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStep("queue")} style={btnGhost}>← Back</button>
                  <div>
                    <h2 style={cardTitle}>Save Prescription to Database</h2>
                    <p style={cardSub}>Enter details from the prescription image. ID will be auto-assigned.</p>
                  </div>
                </div>

                {/* Image viewer */}
                <div style={{ background: "rgba(6,13,26,0.8)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.08)", borderRadius: 14, overflow: "hidden", marginBottom: 20, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selected.image_url
                    ? <img src={selected.image_url} alt="prescription" style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain" }} />
                    : <div style={{ textAlign: "center", padding: 40 }}>
                        <div style={{ fontSize: 40, opacity: 0.2, marginBottom: 10 }}>🖼</div>
                        <p style={{ color: "#334155", fontSize: 13 }}>Prescription image from AWS S3</p>
                        <p style={{ color: "#1e293b", fontSize: 12, marginTop: 4, fontFamily: "monospace" }}>Key: {selected.id}</p>
                      </div>
                  }
                </div>

                {/* Form */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>Patient ID</Label>
                    <input type="number" min="1" placeholder="e.g. 12" value={saveForm.patient_id}
                      onChange={e => setSaveForm(f => ({ ...f, patient_id: e.target.value }))}
                      onFocus={() => setSaveFocused("pid")} onBlur={() => setSaveFocused(null)}
                      style={iStyle(sf("pid"), !!(saveForm.patient_id && Number(saveForm.patient_id) < 1))} />
                  </div>
                  <div>
                    <Label>Staff ID</Label>
                    <input type="number" min="1" placeholder="e.g. 3" value={saveForm.uploaded_by_staff_id}
                      onChange={e => setSaveForm(f => ({ ...f, uploaded_by_staff_id: e.target.value }))}
                      onFocus={() => setSaveFocused("sid")} onBlur={() => setSaveFocused(null)}
                      style={iStyle(sf("sid"))} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Label>Medicine Name</Label>
                    <input type="text" placeholder="e.g. Metformin 500mg" value={saveForm.medicine_name}
                      onChange={e => setSaveForm(f => ({ ...f, medicine_name: e.target.value }))}
                      onFocus={() => setSaveFocused("mn")} onBlur={() => setSaveFocused(null)}
                      style={iStyle(sf("mn"))} />
                  </div>
                  <div>
                    <Label>Dose Per Day</Label>
                    <input type="number" min="1" placeholder="e.g. 2" value={saveForm.dose_per_day}
                      onChange={e => setSaveForm(f => ({ ...f, dose_per_day: e.target.value }))}
                      onFocus={() => setSaveFocused("dpd")} onBlur={() => setSaveFocused(null)}
                      style={iStyle(sf("dpd"))} />
                  </div>
                  <div>
                    <Label>Quantity Given</Label>
                    <input type="number" min="1" placeholder="e.g. 60" value={saveForm.quantity_given}
                      onChange={e => setSaveForm(f => ({ ...f, quantity_given: e.target.value }))}
                      onFocus={() => setSaveFocused("qg")} onBlur={() => setSaveFocused(null)}
                      style={iStyle(sf("qg"))} />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <input type="date" value={saveForm.start_date}
                      onChange={e => setSaveForm(f => ({ ...f, start_date: e.target.value }))}
                      onFocus={() => setSaveFocused("sd")} onBlur={() => setSaveFocused(null)}
                      style={{ ...iStyle(sf("sd")), colorScheme: "dark" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 24 }}>
                    <div onClick={() => setSaveForm(f => ({ ...f, is_continuous: !f.is_continuous }))}
                      style={{ width: 44, height: 24, borderRadius: 99, background: saveForm.is_continuous ? "rgba(14,165,233,0.6)" : "rgba(148,163,184,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: saveForm.is_continuous ? "rgba(14,165,233,0.4)" : "rgba(148,163,184,0.15)", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                      <div style={{ position: "absolute", top: 3, left: saveForm.is_continuous ? 22 : 3, width: 16, height: 16, borderRadius: "50%", background: saveForm.is_continuous ? "#bae6fd" : "#475569", transition: "left .2s" }} />
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: 13.5 }}>Continuous medication</span>
                  </div>
                </div>

                {saveError && (
                  <div style={{ background: "rgba(239,68,68,0.07)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: "11px 14px", marginTop: 16 }}>
                    <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {saveError}</p>
                  </div>
                )}

                <button onClick={handleSave} disabled={!saveFormValid || saving}
                  style={{ ...btnPrimary, marginTop: 20, opacity: !saveFormValid || saving ? 0.45 : 1 }}>
                  {saving
                    ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="spinner" />Saving…</span>
                    : "Save Prescription →"}
                </button>
              </div>
            )}

            {/* ══ STEP 3: Issue Medicine ══ */}
            {step === "issue" && savedRx && (
              <div className="fade-up" style={glassCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStep("save")} style={btnGhost}>← Back</button>
                  <div>
                    <h2 style={cardTitle}>Issue Medicine</h2>
                    <p style={cardSub}>Prescription saved — now deduct stock.</p>
                  </div>
                </div>

                {/* Saved rx summary */}
                <div style={{ background: "rgba(14,165,233,0.05)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(14,165,233,0.15)", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  <MiniStat label="Prescription ID" value={`#${savedRx.id}`} color="#38bdf8" />
                  <MiniStat label="Medicine" value={savedRx.medicine_name} color="#f1f5f9" />
                  <MiniStat label="Dose/Day" value={String(savedRx.dose_per_day)} color="#f1f5f9" />
                  <MiniStat label="Qty Given" value={String(savedRx.quantity_given)} color="#f1f5f9" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>Medicine ID</Label>
                    <input type="number" min="1" placeholder="e.g. 7" value={issueForm.medicine_id}
                      onChange={e => setIssueForm(f => ({ ...f, medicine_id: e.target.value }))}
                      onFocus={() => setIssueFocused("mid")} onBlur={() => setIssueFocused(null)}
                      style={iStyle(iff("mid"))} />
                  </div>
                  <div>
                    <Label>Quantity to Issue</Label>
                    <input type="number" min="1" placeholder="e.g. 60" value={issueForm.quantity}
                      onChange={e => setIssueForm(f => ({ ...f, quantity: e.target.value }))}
                      onFocus={() => setIssueFocused("qty")} onBlur={() => setIssueFocused(null)}
                      style={iStyle(iff("qty"))} />
                  </div>
                </div>

                {issueError && (
                  <div style={{ background: "rgba(239,68,68,0.07)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: "11px 14px", marginTop: 14 }}>
                    <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {issueError}</p>
                  </div>
                )}

                {issueResult && (
                  <div style={{ background: "rgba(74,222,128,0.05)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(74,222,128,0.2)", borderRadius: 12, padding: "14px 16px", marginTop: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: "#4ade80" }}>✓</span>
                      <span style={{ color: "#4ade80", fontSize: 13.5, fontWeight: 700 }}>Medicine issued successfully</span>
                    </div>
                    <MiniStat label="Remaining Stock" value={String(issueResult.remaining_stock)} color={stockColor(issueResult.remaining_stock)} />
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={handleIssue} disabled={!issueFormValid || issuing}
                    style={{ ...btnPrimary, flex: 1, opacity: !issueFormValid || issuing ? 0.45 : 1 }}>
                    {issuing
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="spinner" />Issuing…</span>
                      : "Issue Medicine →"}
                  </button>
                  {issueResult && (
                    <button onClick={resetToQueue} style={{ ...btnGhost, whiteSpace: "nowrap" as const }}>
                      Next Prescription
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── SESSION HISTORY ── */}
          <div className="fade-up" style={{ ...glassCard, animationDelay: ".1s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={cardTitle}>Session History</h2>
                <p style={cardSub}>Issued this session.</p>
              </div>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} style={btnDanger}>Clear</button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ fontSize: 28, opacity: 0.2, marginBottom: 10 }}>📋</div>
                <p style={{ color: "#334155", fontSize: 13 }}>No medicines issued yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map(r => (
                  <div key={r.seq} className="row-in" style={historyRow}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>
                        Rx <span style={{ color: "#38bdf8" }}>#{r.prescription_id}</span>
                      </div>
                      <div style={{ color: "#475569", fontSize: 12 }}>{r.medicine_name}</div>
                      <div style={{ color: "#334155", fontSize: 11, marginTop: 2 }}>{r.time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>×{r.quantity}</div>
                      <div style={{ color: stockColor(r.remaining_stock), fontSize: 12, marginTop: 2 }}>{r.remaining_stock} left</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(148,163,184,0.06)", display: "flex", gap: 20 }}>
                <MiniStat label="Processed" value={String(history.length)} color="#38bdf8" />
                <MiniStat label="Units" value={String(history.reduce((s, r) => s + r.quantity, 0))} color="#818cf8" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
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

// ── Styles ────────────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties   = { minHeight: "100vh", background: "#060d1a", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" };
const gridBg: React.CSSProperties    = { position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(148,163,184,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.025) 1px,transparent 1px)", backgroundSize: "52px 52px" };
const glassCard: React.CSSProperties  = { background: "rgba(10,20,42,0.85)", backdropFilter: "blur(20px)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.09)", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", padding: "28px" };
const iconBox: React.CSSProperties   = { width: 36, height: 36, borderRadius: 10, background: "rgba(14,165,233,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center" };
const pageTitle: React.CSSProperties  = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: "-0.02em" };
const pageSub: React.CSSProperties   = { color: "#475569", fontSize: 13, margin: 0 };
const cardTitle: React.CSSProperties  = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15.5, color: "#f1f5f9", margin: "0 0 3px" };
const cardSub: React.CSSProperties   = { color: "#475569", fontSize: 12.5, margin: 0 };
const pendingRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, background: "rgba(15,23,42,0.5)", borderWidth: 1, borderStyle: "solid", borderRadius: 12, padding: "12px 16px", transition: "border-color .2s, background .2s" };
const historyRow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.5)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.07)", borderRadius: 11, padding: "10px 14px" };
const btnPrimary: React.CSSProperties = { width: "100%", background: "linear-gradient(90deg,#0369a1,#0e7ab5)", color: "#bae6fd", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 18px rgba(3,105,161,.28)", transition: "opacity .18s" };
const btnGhost: React.CSSProperties  = { background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,.12)", color: "#94a3b8", borderRadius: 9, padding: "7px 16px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };
const btnDanger: React.CSSProperties = { background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.2)", color: "#f87171", borderRadius: 9, padding: "5px 12px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:rgba(14,165,233,0.04);top:-200px;right:-100px;animation:d1 24s ease-in-out infinite alternate}
  .orb2{width:400px;height:400px;background:rgba(129,140,248,0.04);bottom:-100px;left:-80px;animation:d2 28s ease-in-out infinite alternate}
  @keyframes d1{to{transform:translate(-60px,80px)}} @keyframes d2{to{transform:translate(60px,-60px)}}
  .fade-up{opacity:0;transform:translateY(16px);animation:fu .4s ease forwards}
  @keyframes fu{to{opacity:1;transform:translateY(0)}}
  .row-in{animation:ri .2s ease forwards}
  @keyframes ri{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
  .spinner{width:14px;height:14px;border:2px solid rgba(186,230,253,.2);border-top-color:#bae6fd;border-radius:50%;animation:sp .7s linear infinite;display:inline-block;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
  button:not(:disabled):hover{opacity:.82}
  input[type=number]::-webkit-inner-spin-button{opacity:0.3}
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
`;