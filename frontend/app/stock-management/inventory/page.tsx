"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const API = "http://localhost:8000";

interface InventoryItem {
  id: number;
  medicine_id: number;
  batch_id: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_damaged: number;
  quantity_expired: number;
  reorder_level: number;
  reorder_quantity: number | null;
  turnover_rate: number | null;
  last_stock_update: string;
  last_dispensed_at: string | null;
  minimum_stock_threshold?: number;
}

const getStatus = (item: InventoryItem) => {
  if (item.quantity_available === 0) return "critical";
  if (item.minimum_stock_threshold != null && item.quantity_available <= item.minimum_stock_threshold) return "critical";
  if (item.quantity_available <= item.reorder_level) return "low";
  return "available";
};

const statusStyle = (status: string) => {
  if (status === "available") return { bg: "rgba(74,222,128,0.08)",  color: "#4ade80" };
  if (status === "low")       return { bg: "rgba(245,158,11,0.08)",  color: "#f59e0b" };
  if (status === "critical")  return { bg: "rgba(239,68,68,0.08)",   color: "#ef4444" };
  return { bg: "", color: "" };
};

type StatusFilter = "all" | "available" | "low" | "critical";

export default function InventoryPage() {
  const [inventory, setInventory]   = useState<InventoryItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg]   = useState("");

  const [form, setForm] = useState({
    medicine_id:    "",
    batch_id:       "",
    batch_number:   "",
    expiry_date:    "",
    quantity_added: "",
    cost_price:     "",
    supplier_id:    "",
    supplier_name:  "",
    staff_id:       "1",
  });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/inventory/`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setInventory(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch(`${API}/inventory/add-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_id:    parseInt(form.medicine_id),
          batch_id:       parseInt(form.batch_id),
          batch_number:   form.batch_number,
          expiry_date:    new Date(form.expiry_date).toISOString(),
          quantity_added: parseInt(form.quantity_added),
          cost_price:     parseFloat(form.cost_price),
          supplier_id:    parseInt(form.supplier_id),
          supplier_name:  form.supplier_name,
          staff_id:       parseInt(form.staff_id),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add stock");
      }
      setSubmitMsg("Stock added successfully!");
      fetchInventory();
      setTimeout(() => { setShowModal(false); setSubmitMsg(""); setForm({ medicine_id:"", batch_id:"", batch_number:"", expiry_date:"", quantity_added:"", cost_price:"", supplier_id:"", supplier_name:"", staff_id:"1" }); }, 1500);
    } catch (err: unknown) {
      setSubmitMsg(err instanceof Error ? err.message : "Error adding stock");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = inventory.filter(item => {
    const matchStatus = statusFilter === "all" || getStatus(item) === statusFilter;
    const matchSearch =
      String(item.medicine_id).includes(search) ||
      String(item.batch_id).includes(search)    ||
      `medicine #${item.medicine_id}`.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const available = inventory.filter(i => getStatus(i) === "available").length;
  const low       = inventory.filter(i => getStatus(i) === "low").length;
  const critical  = inventory.filter(i => getStatus(i) === "critical").length;
  const damaged   = inventory.reduce((s, i) => s + i.quantity_damaged, 0);

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <Link href="/dashboard"        style={{ color:"#334155", fontSize:13, textDecoration:"none" }}>Dashboard</Link>
        <span style={{ color:"#1e3a5f" }}>›</span>
        <Link href="/stock-management" style={{ color:"#334155", fontSize:13, textDecoration:"none" }}>Stock Management</Link>
        <span style={{ color:"#1e3a5f" }}>›</span>
        <span style={{ color:"#38bdf8", fontSize:13, fontWeight:600 }}>Inventory</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:46, height:46, borderRadius:13,
            background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.22)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#38bdf8", boxShadow:"0 0 18px rgba(14,165,233,0.1)", flexShrink:0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>
              Inventory
            </h1>
            <p style={{ color:"#475569", fontSize:13.5, margin:"3px 0 0" }}>
              Live medicine stock levels, batch tracking & FEFO dispatch
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:13 }} onClick={fetchInventory}>
            ↻ Refresh
          </button>
          <button className="btn-primary" style={{ padding:"9px 20px", fontSize:13 }} onClick={() => setShowModal(true)}>
            + Add Stock
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Total SKUs",    value: loading ? "—" : inventory.length, color:"#38bdf8", sub:"medicines" },
          { label:"Available",     value: loading ? "—" : available,         color:"#4ade80", sub:"in stock"  },
          { label:"Low Stock",     value: loading ? "—" : low,               color:"#f59e0b", sub:"reorder"   },
          { label:"Critical",      value: loading ? "—" : critical,           color:"#ef4444", sub:"urgent"    },
          { label:"Damaged Units", value: loading ? "—" : damaged,           color:"#818cf8", sub:"write-off" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:11, color:"#334155", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
              {s.label}
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:s.color, lineHeight:1, marginBottom:4 }}>
              {s.value}
            </div>
            <div style={{ fontSize:11, color:"#334155" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table Panel */}
      <div className="fade-3 glass-panel">

        {/* Toolbar */}
        <div style={{ padding:"18px 24px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(148,163,184,0.06)", flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#f1f5f9", margin:0 }}>
              All Inventory Records
            </h2>
            <p style={{ fontSize:12, color:"#475569", marginTop:3 }}>
              {loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`}
            </p>
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="input-field"
                placeholder="Search by ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:30, fontSize:13, padding:"7px 12px 7px 30px", width:180 }}
              />
            </div>

            {/* Status filter */}
            <div style={{ display:"flex", gap:4, background:"rgba(6,13,26,0.6)", borderRadius:9, padding:3 }}>
              {(["all","available","low","critical"] as StatusFilter[]).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)} style={{
                  padding:"5px 10px", borderRadius:7, border:"none", cursor:"pointer",
                  fontSize:11, fontWeight:500, fontFamily:"'DM Sans',sans-serif",
                  background: statusFilter === f ? "rgba(14,165,233,0.12)" : "transparent",
                  color: statusFilter === f ? "#38bdf8" : "#475569",
                  textTransform:"capitalize", transition:"all 0.2s",
                }}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin:"16px 24px", padding:"12px 16px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#f87171", fontSize:13 }}>
            ⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchInventory}>retry</span>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}>
            <div style={{ width:24, height:24, border:"2px solid rgba(56,189,248,0.2)", borderTop:"2px solid #38bdf8", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }}/>
            Fetching inventory from backend...
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                  {["#", "Medicine ID", "Batch ID", "Available", "Reserved", "Damaged", "Expired", "Reorder Lvl", "Last Updated", "Status"].map(h => (
                    <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, color:"#334155", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const status = getStatus(item);
                  const s      = statusStyle(status);
                  return (
                    <tr key={item.id} className="tr-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"#334155" }}>{idx + 1}</td>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{ background:"rgba(14,165,233,0.08)", color:"#7dd3fc", fontFamily:"monospace" }}>
                          MED-{item.medicine_id}
                        </span>
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{ background:"rgba(148,163,184,0.06)", color:"#64748b", fontFamily:"monospace" }}>
                          BAT-{item.batch_id}
                        </span>
                      </td>
                      <td style={{ padding:"13px 20px", fontWeight:700, fontSize:14,
                        color: status === "available" ? "#4ade80" : status === "low" ? "#f59e0b" : "#ef4444"
                      }}>
                        {item.quantity_available}
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#64748b" }}>{item.quantity_reserved}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color: item.quantity_damaged > 0 ? "#f87171" : "#334155" }}>
                        {item.quantity_damaged}
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:13, color: item.quantity_expired > 0 ? "#f59e0b" : "#334155" }}>
                        {item.quantity_expired}
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#475569" }}>{item.reorder_level}</td>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"#334155", whiteSpace:"nowrap" }}>
                        {item.last_stock_update
                          ? new Date(item.last_stock_update).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
                          : "—"}
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{ background:s.bg, color:s.color, textTransform:"capitalize" }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}>
                      {inventory.length === 0 ? "No inventory records found — add stock to get started" : "No records match your filter"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid rgba(148,163,184,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", flexShrink:0 }}/>
            <span style={{ color:"#334155", fontSize:12 }}>
              Live data · FEFO dispatch enforced across all batches
            </span>
          </div>
          {!loading && (
            <span style={{ fontSize:12, color:"#334155" }}>{inventory.length} total records</span>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showModal && (
        <div style={{
          position:"fixed", inset:0, zIndex:50,
          background:"rgba(0,0,0,0.65)", backdropFilter:"blur(5px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:24,
        }} onClick={() => setShowModal(false)}>
          <div className="glass-card" style={{ width:"100%", maxWidth:520, padding:"32px", maxHeight:"90vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#f1f5f9", margin:0 }}>Add Stock</h2>
                <p style={{ fontSize:12, color:"#475569", marginTop:4 }}>POST /inventory/add-stock</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {([
                  { label:"Medicine ID", key:"medicine_id", placeholder:"e.g. 1" },
                  { label:"Batch ID",    key:"batch_id",    placeholder:"e.g. 1" },
                ] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              {([
                { label:"Batch Number",  key:"batch_number",  placeholder:"e.g. BT-2401"        },
                { label:"Supplier Name", key:"supplier_name", placeholder:"e.g. MedSupply Co."  },
              ] as const).map(f => (
                <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>{f.label}</label>
                  <input className="input-field" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {([
                  { label:"Qty Added",   key:"quantity_added", placeholder:"e.g. 200"  },
                  { label:"Cost Price",  key:"cost_price",     placeholder:"e.g. 0.05" },
                  { label:"Supplier ID", key:"supplier_id",    placeholder:"e.g. 1"    },
                ] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>Expiry Date</label>
                <input type="date" className="input-field" style={{ colorScheme:"dark" }}
                  value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
              </div>

              {submitMsg && (
                <div style={{
                  padding:"10px 14px", borderRadius:9, fontSize:13,
                  background: submitMsg.includes("success") ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
                  color:      submitMsg.includes("success") ? "#4ade80"               : "#f87171",
                  border:     `1px solid ${submitMsg.includes("success") ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                  {submitMsg}
                </div>
              )}

              <button className="btn-primary" style={{ marginTop:4 }} onClick={handleAddStock} disabled={submitting}>
                {submitting
                  ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Adding...</>
                  : "Add Stock"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}