"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getInventory, addStock, type InventoryItem } from "../../routes/inventoryRoutes";

const getStatus = (item: InventoryItem) => {
  if (item.quantity_available === 0) return "critical";
  if (item.quantity_available <= item.reorder_level * 0.5) return "critical";
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
    medicine_id: "", batch_id: "", batch_number: "", expiry_date: "",
    quantity_added: "", cost_price: "", supplier_id: "", supplier_name: "", staff_id: "1",
  });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true); setError(null);
      setInventory(await getInventory());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally { setLoading(false); }
  };

  const handleAddStock = async () => {
    setSubmitting(true); setSubmitMsg("");
    try {
      await addStock({
        medicine_id:    parseInt(form.medicine_id),
        batch_id:       parseInt(form.batch_id),
        batch_number:   form.batch_number,
        expiry_date:    new Date(form.expiry_date).toISOString(),
        quantity_added: parseInt(form.quantity_added),
        cost_price:     parseFloat(form.cost_price),
        supplier_id:    parseInt(form.supplier_id),
        supplier_name:  form.supplier_name,
        staff_id:       parseInt(form.staff_id),
      });
      setSubmitMsg("Stock added successfully!");
      fetchInventory();
      setTimeout(() => {
        setShowModal(false); setSubmitMsg("");
        setForm({ medicine_id:"", batch_id:"", batch_number:"", expiry_date:"", quantity_added:"", cost_price:"", supplier_id:"", supplier_name:"", staff_id:"1" });
      }, 1500);
    } catch (err: unknown) {
      setSubmitMsg(err instanceof Error ? err.message : "Error adding stock");
    } finally { setSubmitting(false); }
  };

  const filtered = inventory.filter(item => {
    const matchStatus = statusFilter === "all" || getStatus(item) === statusFilter;
    const matchSearch = String(item.medicine_id).includes(search) || String(item.batch_id).includes(search);
    return matchStatus && matchSearch;
  });

  const available = inventory.filter(i => getStatus(i) === "available").length;
  const low       = inventory.filter(i => getStatus(i) === "low").length;
  const critical  = inventory.filter(i => getStatus(i) === "critical").length;
  const damaged   = inventory.reduce((s, i) => s + i.quantity_damaged, 0);

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/stock-management">Stock Management</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Inventory</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"#38bdf8", flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>Inventory</h1>
            <p style={{ color:"#475569", fontSize:13.5, margin:"3px 0 0" }}>Live medicine stock levels, batch tracking & FEFO dispatch</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:13 }} onClick={fetchInventory}>↻ Refresh</button>
          <button className="btn-primary" style={{ padding:"9px 20px", fontSize:13, width:"auto" }} onClick={() => setShowModal(true)}>+ Add Stock</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Total SKUs",    value: loading ? "—" : inventory.length, color:"#38bdf8", sub:"medicines" },
          { label:"Available",     value: loading ? "—" : available,         color:"#4ade80", sub:"in stock"  },
          { label:"Low Stock",     value: loading ? "—" : low,               color:"#f59e0b", sub:"reorder"   },
          { label:"Critical",      value: loading ? "—" : critical,          color:"#ef4444", sub:"urgent"    },
          { label:"Damaged Units", value: loading ? "—" : damaged,           color:"#818cf8", sub:"write-off" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table Panel */}
      <div className="fade-3 glass-panel">

        {/* Toolbar */}
        <div className="toolbar">
          <div>
            <h2 className="panel-title">All Inventory Records</h2>
            <p className="panel-sub">
              {loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-field" placeholder="Search by ID..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:30, fontSize:13, padding:"7px 12px 7px 30px", width:180 }} />
            </div>
            <div className="filter-bar">
              {(["all","available","low","critical"] as StatusFilter[]).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)} className={`filter-btn${statusFilter === f ? " active" : ""}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-row">
            ⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchInventory}>retry</span>
          </div>
        )}

        {loading && (
          <div style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}>
            <div className="spinner-lg"/>
            Fetching inventory...
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                  {["#","Medicine ID","Batch ID","Available","Reserved","Damaged","Expired","Reorder Lvl","Last Updated","Status"].map(h => (
                    <th key={h} className="th">{h}</th>
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
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:"rgba(14,165,233,0.08)", color:"#7dd3fc", fontFamily:"monospace" }}>MED-{item.medicine_id}</span></td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:"rgba(148,163,184,0.06)", color:"#64748b", fontFamily:"monospace" }}>BAT-{item.batch_id}</span></td>
                      <td style={{ padding:"13px 20px", fontWeight:700, fontSize:14, color: status === "available" ? "#4ade80" : status === "low" ? "#f59e0b" : "#ef4444" }}>{item.quantity_available}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#64748b" }}>{item.quantity_reserved}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color: item.quantity_damaged > 0 ? "#f87171" : "#334155" }}>{item.quantity_damaged}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color: item.quantity_expired > 0 ? "#f59e0b" : "#334155" }}>{item.quantity_expired}</td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#475569" }}>{item.reorder_level}</td>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"#334155", whiteSpace:"nowrap" }}>
                        {item.last_stock_update ? new Date(item.last_stock_update).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                      </td>
                      <td style={{ padding:"13px 20px" }}><span className="badge" style={{ background:s.bg, color:s.color, textTransform:"capitalize" }}>{status}</span></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} style={{ padding:"48px 24px", textAlign:"center", color:"#334155", fontSize:13 }}>
                    {inventory.length === 0 ? "No inventory records — add stock to get started" : "No records match your filter"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer" style={{ justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", flexShrink:0 }}/>
            <span style={{ color:"#334155", fontSize:12 }}>Live data · FEFO dispatch enforced across all batches</span>
          </div>
          {!loading && <span style={{ fontSize:12, color:"#334155" }}>{inventory.length} total records</span>}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="glass-card modal-inner" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#f1f5f9", margin:0 }}>Add Stock</h2>
                <p style={{ fontSize:12, color:"#475569", marginTop:4 }}>POST /inventory/add-stock</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:22 }}>×</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="grid-2">
                {([
                  { label:"Medicine ID", key:"medicine_id", placeholder:"e.g. 1" },
                  { label:"Batch ID",    key:"batch_id",    placeholder:"e.g. 1" },
                ] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              {([
                { label:"Batch Number",  key:"batch_number",  placeholder:"e.g. BT-2401"       },
                { label:"Supplier Name", key:"supplier_name", placeholder:"e.g. MedSupply Co." },
              ] as const).map(f => (
                <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label className="field-label">{f.label}</label>
                  <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="grid-3">
                {([
                  { label:"Qty Added",   key:"quantity_added", placeholder:"e.g. 200"  },
                  { label:"Cost Price",  key:"cost_price",     placeholder:"e.g. 0.05" },
                  { label:"Supplier ID", key:"supplier_id",    placeholder:"e.g. 1"    },
                ] as const).map(f => (
                  <div key={f.key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label className="field-label">{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <label className="field-label">Expiry Date</label>
                <input type="date" className="input-field" style={{ colorScheme:"dark" }} value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
              </div>
              {submitMsg && (
                <div style={{ padding:"10px 14px", borderRadius:9, fontSize:13, background: submitMsg.includes("success") ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)", color: submitMsg.includes("success") ? "#4ade80" : "#f87171", border:`1px solid ${submitMsg.includes("success") ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  {submitMsg}
                </div>
              )}
              <button className="btn-primary" style={{ marginTop:4 }} onClick={handleAddStock} disabled={submitting}>
                {submitting ? <><div className="spinner"/>Adding...</> : "Add Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}