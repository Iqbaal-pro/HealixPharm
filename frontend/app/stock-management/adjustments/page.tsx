"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAdjustmentHistory, submitAdjustment, approveAdjustment, type Adjustment, type AdjType } from "../../routes/adjustmentRoutes";

const typeConfig: Record<string, { bg: string; color: string; icon: string }> = {
  expired:    { bg: "rgba(239,68,68,0.08)",   color: "#ef4444", icon: "⏱" },
  damaged:    { bg: "rgba(245,158,11,0.08)",  color: "#f59e0b", icon: "⚠" },
  waste:      { bg: "rgba(249,115,22,0.08)",  color: "#f97316", icon: "🗑" },
  correction: { bg: "rgba(56,189,248,0.08)",  color: "#38bdf8", icon: "✏" },
  returned:   { bg: "rgba(74,222,128,0.08)",  color: "#4ade80", icon: "↩" },
};

type FilterType = "all" | AdjType;

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [filter, setFilter]           = useState<FilterType>("all");
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [adjType, setAdjType]         = useState<AdjType>("damaged");
  const [submitting, setSubmitting]   = useState(false);
  const [submitMsg, setSubmitMsg]     = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    medicine_id: "", batch_id: "", quantity: "", quantity_adjustment: "", reason: "", staff_id: "1",
  });

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true); setError(null);
      setAdjustments(await getAdjustmentHistory());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch adjustments");
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitMsg("");
    try {
      const isCorrection = adjType === "correction";
      const body = isCorrection
        ? { medicine_id: parseInt(form.medicine_id), batch_id: parseInt(form.batch_id), quantity_adjustment: parseInt(form.quantity_adjustment), staff_id: parseInt(form.staff_id), reason: form.reason || null }
        : { medicine_id: parseInt(form.medicine_id), batch_id: parseInt(form.batch_id), quantity: parseInt(form.quantity), staff_id: parseInt(form.staff_id), reason: form.reason || null };
      await submitAdjustment(adjType, body);
      setSubmitMsg("Adjustment submitted successfully!");
      fetchHistory();
      setTimeout(() => {
        setShowModal(false); setSubmitMsg("");
        setForm({ medicine_id:"", batch_id:"", quantity:"", quantity_adjustment:"", reason:"", staff_id:"1" });
      }, 1500);
    } catch (err: unknown) {
      setSubmitMsg(err instanceof Error ? err.message : "Error submitting adjustment");
    } finally { setSubmitting(false); }
  };

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      await approveAdjustment(id, 1);
      fetchHistory();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error approving");
    } finally { setApprovingId(null); }
  };

  const filtered = adjustments.filter(a => {
    const matchFilter = filter === "all" || a.adjustment_type === filter;
    const matchSearch =
      String(a.medicine_id).includes(search) ||
      String(a.batch_id).includes(search) ||
      (a.reason ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pending  = adjustments.filter(a => !a.approved_by).length;
  const approved = adjustments.filter(a =>  a.approved_by).length;

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/stock-management">Stock Management</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Adjustments</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:"rgba(2,132,199,0.1)", border:"1px solid rgba(2,132,199,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"#0284c7", flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>Adjustments</h1>
            <p style={{ color:"#475569", fontSize:14.5, margin:"3px 0 0" }}>Stock corrections, damage reports & write-off audit trail</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/stock-management" className="btn-ghost" style={{ padding:"9px 16px", fontSize:14, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6 }}>← Back</Link>
          <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:14 }} onClick={fetchHistory}>↻ Refresh</button>
          <button className="btn-primary" style={{ padding:"9px 20px", fontSize:14, width:"auto" }} onClick={() => setShowModal(true)}>+ New Adjustment</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Total",      value: loading ? "—" : adjustments.length,                                                                                color:"#38bdf8", sub:"all time"          },
          { label:"Pending",    value: loading ? "—" : pending,                                                                                            color:"#f59e0b", sub:"awaiting approval" },
          { label:"Approved",   value: loading ? "—" : approved,                                                                                           color:"#4ade80", sub:"processed"         },
          { label:"This Month", value: loading ? "—" : adjustments.filter(a => new Date(a.created_at).getMonth() === new Date().getMonth()).length,         color:"#818cf8", sub:"recent"            },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {!loading && pending > 0 && (
        <div className="fade-3 alert-banner alert-banner-yellow" style={{ marginBottom:20 }}>
          <div className="alert-dot alert-dot-yellow"/>
          <span style={{ fontSize:13, color:"#f59e0b", fontWeight:500 }}>{pending} adjustment{pending > 1 ? "s" : ""} pending manager approval</span>
        </div>
      )}

      {/* Table */}
      <div className="fade-3 glass-panel">
        <div className="toolbar">
          <div>
            <h2 className="panel-title">Adjustment Log</h2>
            <p className="panel-sub">{loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-field" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:30, fontSize:13, padding:"7px 12px 7px 30px", width:180 }} />
            </div>
            <div className="filter-bar">
              {(["all","expired","damaged","waste","correction","returned"] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? " active" : ""}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="error-row">⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchHistory}>retry</span></div>}
        {loading && <div style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}><div className="spinner-lg"/>Fetching adjustment history...</div>}

        {!loading && !error && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                  {["Medicine ID","Batch ID","Type","Qty","Reason","Staff","Status","Date","Action"].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const t = typeConfig[a.adjustment_type] ?? { bg:"rgba(148,163,184,0.06)", color:"#94a3b8", icon:"•" };
                  const isPending = !a.approved_by;
                  return (
                    <tr key={a.id} className="tr-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:"rgba(14,165,233,0.08)", color:"#7dd3fc", fontFamily:"monospace" }}>MED-{a.medicine_id}</span></td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:"rgba(148,163,184,0.06)", color:"#64748b", fontFamily:"monospace" }}>BAT-{a.batch_id}</span></td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:t.bg, color:t.color, textTransform:"capitalize" }}>{t.icon} {a.adjustment_type}</span></td>
                      <td style={{ padding:"13px 20px", fontSize:13, fontWeight:700, color: a.adjustment_quantity < 0 ? "#4ade80" : "#f87171" }}>
                        {a.adjustment_quantity > 0 ? `-${a.adjustment_quantity}` : `+${Math.abs(a.adjustment_quantity)}`}
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:12.5, color:"#64748b", maxWidth:200 }}>{a.reason ?? "—"}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#94a3b8" }}>Staff #{a.staff_id}</td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background: isPending ? "rgba(245,158,11,0.08)" : "rgba(74,222,128,0.08)", color: isPending ? "#f59e0b" : "#4ade80" }}>{isPending ? "Pending" : "Approved"}</span></td>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"#334155", whiteSpace:"nowrap" }}>{new Date(a.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}</td>
                      <td style={{ padding:"13px 20px" }}>
                        {isPending && (
                          <button onClick={() => handleApprove(a.id)} disabled={approvingId === a.id}
                            style={{ padding:"5px 12px", borderRadius:7, border:"none", cursor:"pointer", background:"rgba(74,222,128,0.08)", color:"#4ade80", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", opacity: approvingId === a.id ? 0.6 : 1 }}>
                            {approvingId === a.id ? "..." : "Approve"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={9} style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}>{adjustments.length === 0 ? "No adjustments recorded yet" : "No records match your filter"}</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", boxShadow:"0 0 6px #f59e0b", flexShrink:0 }}/>
            <span style={{ color:"#334155", fontSize:12 }}>All adjustments require manager approval before stock levels are updated.</span>
          </div>
        </div>
      </div>

      {/* New Adjustment Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="glass-card modal-inner" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#f1f5f9", margin:0 }}>New Adjustment</h2>
                <p style={{ fontSize:12, color:"#475569", marginTop:4 }}>POST /stock-adjustments/{"{type}"}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:22 }}>×</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <label className="field-label">Adjustment Type</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {(Object.entries(typeConfig) as [AdjType, typeof typeConfig[string]][]).map(([key, val]) => (
                    <button key={key} onClick={() => setAdjType(key)} style={{ padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, textTransform:"capitalize", background: adjType === key ? val.bg : "rgba(148,163,184,0.06)", color: adjType === key ? val.color : "#475569", borderWidth:1, borderStyle:"solid", borderColor: adjType === key ? `${val.color}40` : "transparent", transition:"all 0.2s" }}>{val.icon} {key}</button>
                  ))}
                </div>
              </div>
              <div className="grid-2">
                {([{ label:"Medicine ID", key:"medicine_id", placeholder:"e.g. 1" }, { label:"Batch ID", key:"batch_id", placeholder:"e.g. 1" }] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label className="field-label">{adjType === "correction" ? "Quantity Adjustment (+ or -)" : "Quantity"}</label>
                <input className="input-field" placeholder={adjType === "correction" ? "e.g. -5 or 10" : "e.g. 5"}
                  value={adjType === "correction" ? form.quantity_adjustment : form.quantity}
                  onChange={e => setForm(p => adjType === "correction" ? { ...p, quantity_adjustment: e.target.value } : { ...p, quantity: e.target.value })} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label className="field-label">Reason</label>
                <textarea className="input-field" placeholder="Describe the reason..." rows={3} style={{ resize:"none" }} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
              {submitMsg && <div style={{ padding:"10px 14px", borderRadius:9, fontSize:13, background: submitMsg.includes("success") ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)", color: submitMsg.includes("success") ? "#4ade80" : "#f87171", border:`1px solid ${submitMsg.includes("success") ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}` }}>{submitMsg}</div>}
              <button className="btn-primary" style={{ marginTop:4 }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><div className="spinner"/>Submitting...</> : "Submit for Approval"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}