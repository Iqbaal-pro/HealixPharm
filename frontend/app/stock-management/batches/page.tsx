"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getBatches, createBatch, deactivateBatch, type Batch } from "../../routes/batchRoutes";

const daysUntil = (dateStr: string) =>
  Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const getBatchStatus = (batch: Batch) => {
  if (batch.is_expired || !batch.is_active) return "expired";
  const days = daysUntil(batch.expiry_date);
  if (days <= 30) return "critical";
  if (days <= 90) return "expiring";
  return "active";
};

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: "rgba(74,222,128,0.08)",  color: "#4ade80", label: "Active"   },
  expiring: { bg: "rgba(249,115,22,0.08)",  color: "#f97316", label: "Expiring" },
  critical: { bg: "rgba(239,68,68,0.08)",   color: "#ef4444", label: "Critical" },
  expired:  { bg: "rgba(100,116,139,0.08)", color: "#64748b", label: "Expired"  },
};

type FilterType = "all" | "active" | "expiring" | "critical" | "expired";

export default function BatchesPage() {
  const [batches, setBatches]         = useState<Batch[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [filter, setFilter]           = useState<FilterType>("all");
  const [search, setSearch]           = useState("");
  const [showExpired, setShowExpired] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitMsg, setSubmitMsg]     = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    medicine_id: "", batch_number: "", manufacture_date: "",
    expiry_date: "", cost_price: "", supplier_id: "", quantity_received: "",
  });

  useEffect(() => { fetchBatches(); }, [showExpired]);

  const fetchBatches = async () => {
    try {
      setLoading(true); setError(null);
      setBatches(await getBatches(showExpired));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch batches");
    } finally { setLoading(false); }
  };

  const handleCreateBatch = async () => {
    setSubmitting(true); setSubmitMsg("");
    try {
      await createBatch({
        medicine_id:       parseInt(form.medicine_id),
        batch_number:      form.batch_number,
        manufacture_date:  new Date(form.manufacture_date).toISOString(),
        expiry_date:       new Date(form.expiry_date).toISOString(),
        cost_price:        parseFloat(form.cost_price),
        supplier_id:       form.supplier_id ? parseInt(form.supplier_id) : null,
        quantity_received: form.quantity_received ? parseInt(form.quantity_received) : 0,
      });
      setSubmitMsg("Batch created successfully!");
      fetchBatches();
      setTimeout(() => {
        setShowModal(false); setSubmitMsg("");
        setForm({ medicine_id:"", batch_number:"", manufacture_date:"", expiry_date:"", cost_price:"", supplier_id:"", quantity_received:"" });
      }, 1500);
    } catch (err: unknown) {
      setSubmitMsg(err instanceof Error ? err.message : "Error creating batch");
    } finally { setSubmitting(false); }
  };

  const handleDeactivate = async (batchId: number) => {
    if (!confirm("Deactivate this batch?")) return;
    setApprovingId(batchId);
    try {
      await deactivateBatch(batchId);
      fetchBatches();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deactivating batch");
    } finally { setApprovingId(null); }
  };

  const filtered = batches.filter(b => {
    const status = getBatchStatus(b);
    const matchFilter = filter === "all" || status === filter;
    const matchSearch =
      b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      String(b.medicine_id).includes(search) ||
      String(b.supplier_id ?? "").includes(search);
    return matchFilter && matchSearch;
  });

  const counts = {
    active:   batches.filter(b => getBatchStatus(b) === "active").length,
    expiring: batches.filter(b => getBatchStatus(b) === "expiring").length,
    critical: batches.filter(b => getBatchStatus(b) === "critical").length,
    expired:  batches.filter(b => getBatchStatus(b) === "expired").length,
  };

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/stock-management">Stock Management</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Batches</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"#38bdf8", flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>Batches</h1>
            <p style={{ color:"#475569", fontSize:14.5, margin:"3px 0 0" }}>Manage stock batches, expiry dates & FEFO ordering</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <Link href="/stock-management" className="btn-ghost" style={{ padding:"9px 16px", fontSize:14, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6 }}>← Back</Link>
          <button onClick={() => setShowExpired(p => !p)} style={{ padding:"9px 16px", borderRadius:10, fontSize:14, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, background: showExpired ? "rgba(100,116,139,0.15)" : "rgba(148,163,184,0.06)", color: showExpired ? "#94a3b8" : "#475569" }}>
            {showExpired ? "Hide Expired" : "Show Expired"}
          </button>
          <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:14 }} onClick={fetchBatches}>↻ Refresh</button>
          <button className="btn-primary" style={{ padding:"9px 20px", fontSize:14, width:"auto" }} onClick={() => setShowModal(true)}>+ New Batch</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Total Batches", value: loading ? "—" : batches.length,  color:"#38bdf8", sub:"all batches"     },
          { label:"Active",        value: loading ? "—" : counts.active,   color:"#4ade80", sub:"healthy"         },
          { label:"Expiring <90d", value: loading ? "—" : counts.expiring, color:"#f97316", sub:"monitor closely" },
          { label:"Critical <30d", value: loading ? "—" : counts.critical, color:"#ef4444", sub:"act now"         },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {!loading && counts.critical > 0 && (
        <div className="fade-3 alert-banner alert-banner-red" style={{ marginBottom:20 }}>
          <div className="alert-dot alert-dot-red"/>
          <span style={{ fontSize:13, color:"#f87171", fontWeight:500 }}>{counts.critical} batch{counts.critical > 1 ? "es" : ""} expiring within 30 days — prioritise dispensing</span>
        </div>
      )}

      {/* Table */}
      <div className="fade-3 glass-panel">
        <div className="toolbar">
          <div>
            <h2 className="panel-title">All Batches</h2>
            <p className="panel-sub">{loading ? "Loading..." : `${filtered.length} batch${filtered.length !== 1 ? "es" : ""}`}</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-field" placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:30, fontSize:13, padding:"7px 12px 7px 30px", width:200 }} />
            </div>
            <div className="filter-bar">
              {(["all","active","expiring","critical","expired"] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? " active" : ""}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="error-row">⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchBatches}>retry</span></div>}
        {loading && <div style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}><div className="spinner-lg"/>Fetching batches...</div>}

        {!loading && !error && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                  {["Batch No.","Medicine ID","Supplier","Received","Manufacture","Expiry","Days Left","Cost/Unit","Status","Action"].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const status = getBatchStatus(b);
                  const sc     = statusConfig[status];
                  const days   = daysUntil(b.expiry_date);
                  return (
                    <tr key={b.id} className="tr-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"#38bdf8", fontFamily:"monospace", fontWeight:600 }}>{b.batch_number}</td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:"rgba(14,165,233,0.08)", color:"#7dd3fc", fontFamily:"monospace" }}>MED-{b.medicine_id}</span></td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#64748b" }}>{b.supplier_id ?? "—"}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#64748b", whiteSpace:"nowrap" }}>{new Date(b.received_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#64748b", whiteSpace:"nowrap" }}>{new Date(b.manufacture_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color: days <= 90 ? "#f97316" : "#94a3b8", whiteSpace:"nowrap" }}>{new Date(b.expiry_date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}</td>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{ background: b.is_expired ? "rgba(100,116,139,0.08)" : days <= 30 ? "rgba(239,68,68,0.08)" : days <= 90 ? "rgba(249,115,22,0.08)" : "rgba(74,222,128,0.08)", color: b.is_expired ? "#64748b" : days <= 30 ? "#ef4444" : days <= 90 ? "#f97316" : "#4ade80" }}>
                          {b.is_expired ? "Expired" : `${days}d`}
                        </span>
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#64748b" }}>LKR {(b.cost_price * 300).toFixed(2)}</td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:sc.bg, color:sc.color }}>{sc.label}</span></td>
                      <td style={{ padding:"13px 20px" }}>
                        {b.is_active && !b.is_expired && (
                          <button onClick={() => handleDeactivate(b.id)} disabled={approvingId === b.id}
                            style={{ padding:"5px 12px", borderRadius:7, border:"none", cursor:"pointer", background:"rgba(239,68,68,0.08)", color:"#f87171", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", opacity: approvingId === b.id ? 0.6 : 1 }}>
                            {approvingId === b.id ? "..." : "Deactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={10} style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}>{batches.length === 0 ? "No batches found — create your first batch" : "No batches match your filter"}</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer" style={{ justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", flexShrink:0 }}/>
            <span style={{ color:"#334155", fontSize:12 }}>FEFO enforced — earliest expiring batches are always dispatched first.</span>
          </div>
          {!loading && <span style={{ fontSize:12, color:"#334155" }}>{batches.length} total batches</span>}
        </div>
      </div>

      {/* New Batch Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="glass-card modal-inner" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#f1f5f9", margin:0 }}>New Batch</h2>
                <p style={{ fontSize:12, color:"#475569", marginTop:4 }}>POST /batches/</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:22 }}>×</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="grid-2">
                {([{ label:"Medicine ID", key:"medicine_id", placeholder:"e.g. 1" }, { label:"Supplier ID", key:"supplier_id", placeholder:"e.g. 1" }] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="grid-2">
                {([{ label:"Batch Number", key:"batch_number", placeholder:"e.g. BT-2401" }, { label:"Quantity Received", key:"quantity_received", placeholder:"e.g. 200" }] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label className="field-label">Cost Price (per unit)</label>
                <input className="input-field" placeholder="e.g. 0.05" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))} />
              </div>
              <div className="grid-2">
                {([{ label:"Manufacture Date", key:"manufacture_date" }, { label:"Expiry Date", key:"expiry_date" }] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label className="field-label">{f.label}</label>
                    <input type="date" className="input-field" style={{ colorScheme:"dark" }} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              {submitMsg && <div style={{ padding:"10px 14px", borderRadius:9, fontSize:13, background: submitMsg.includes("success") ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)", color: submitMsg.includes("success") ? "#4ade80" : "#f87171", border:`1px solid ${submitMsg.includes("success") ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}` }}>{submitMsg}</div>}
              <button className="btn-primary" style={{ marginTop:4 }} onClick={handleCreateBatch} disabled={submitting}>
                {submitting ? <><div className="spinner"/>Creating...</> : "Create Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}