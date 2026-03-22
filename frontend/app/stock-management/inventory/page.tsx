"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getInventory, type InventoryItem } from "../../routes/inventoryRoutes";

const CATEGORIES = [
  "Anti-Diabetic","Cardiovascular","Analgesics (Pain/Fever)",
  "Vitamins & Supplements","Gastrointestinal","Respiratory & Antibiotics",
  "Consumer Goods & Skincare","Other Meds/Unclassified",
];
const DOSAGE_FORMS = ["tablet","capsule","syrup","injection","ointment","drops","inhaler","cream","powder","patch"];
const UNITS        = ["Nos","tablet","capsule","ml","vial","tube","sachet","strip","bottle","piece","g"];
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const getStatus = (item: InventoryItem) => {
  if (item.quantity_available === 0)                        return "critical";
  if (item.quantity_available <= item.reorder_level * 0.5) return "critical";
  if (item.quantity_available <= item.reorder_level)       return "low";
  return "available";
};
const statusStyle = (s: string) => {
  if (s === "available") return { bg: "rgba(74,222,128,0.08)",  color: "#4ade80" };
  if (s === "low")       return { bg: "rgba(245,158,11,0.08)",  color: "#f59e0b" };
  if (s === "critical")  return { bg: "rgba(239,68,68,0.08)",   color: "#ef4444" };
  return { bg: "", color: "" };
};

type StatusFilter = "all" | "available" | "low" | "critical";

const emptyAddForm = {
  medicine_name: "", category: "Anti-Diabetic", dosage_form: "tablet",
  strength: "", unit_of_measurement: "Nos", cost_price: "", selling_price: "",
  minimum_stock_threshold: "10", batch_number: "", manufacture_date: "",
  expiry_date: "", supplier_name: "", quantity: "",
};

const emptyEditForm = {
  quantity_available: "", selling_price: "", cost_price: "",
  minimum_stock_threshold: "", reorder_level: "",
};

export default function InventoryPage() {
  const [inventory, setInventory]       = useState<InventoryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState({ ...emptyAddForm });
  const [addMsg, setAddMsg]             = useState("");
  const [addLoading, setAddLoading]     = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget]       = useState<InventoryItem | null>(null);
  const [editForm, setEditForm]           = useState({ ...emptyEditForm });
  const [editMsg, setEditMsg]             = useState("");
  const [editLoading, setEditLoading]     = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true); setError(null);
      setInventory(await getInventory());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally { setLoading(false); }
  };

  // ── Add Stock ──────────────────────────────────────────────────────
  const openAdd = () => { setAddForm({ ...emptyAddForm }); setAddMsg(""); setShowAddModal(true); };
  const closeAdd = () => { setShowAddModal(false); setAddMsg(""); };

  const handleAddStock = async () => {
    if (!addForm.medicine_name.trim()) return setAddMsg("Medicine name is required");
    if (!addForm.batch_number.trim())  return setAddMsg("Batch number is required");
    if (!addForm.expiry_date)          return setAddMsg("Expiry date is required");
    if (!addForm.manufacture_date)     return setAddMsg("Manufacture date is required");
    if (!addForm.quantity)             return setAddMsg("Quantity is required");
    if (!addForm.cost_price)           return setAddMsg("Cost price is required");
    if (!addForm.selling_price)        return setAddMsg("Selling price is required");

    setAddLoading(true); setAddMsg("");
    try {
      const res = await fetch(`${BASE}/stock/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine_name:           addForm.medicine_name.trim(),
          category:                addForm.category,
          dosage_form:             addForm.dosage_form,
          strength:                addForm.strength.trim() || null,
          unit_of_measurement:     addForm.unit_of_measurement,
          cost_price:              parseFloat(addForm.cost_price),
          selling_price:           parseFloat(addForm.selling_price),
          minimum_stock_threshold: parseInt(addForm.minimum_stock_threshold),
          batch_number:            addForm.batch_number.trim(),
          manufacture_date:        new Date(addForm.manufacture_date).toISOString(),
          expiry_date:             new Date(addForm.expiry_date).toISOString(),
          supplier_name:           addForm.supplier_name.trim(),
          quantity:                parseInt(addForm.quantity),
          staff_id:                1,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(e.detail ?? "Failed");
      }
      const data = await res.json();
      setAddMsg(`✓ ${data.medicine_name} added — ${data.quantity_added} units in stock`);
      fetchInventory();
      setTimeout(() => closeAdd(), 2000);
    } catch (err: unknown) {
      setAddMsg(err instanceof Error ? err.message : "Error adding stock");
    } finally { setAddLoading(false); }
  };

  // ── Edit Stock ────────────────────────────────────────────────────
  const openEdit = (item: InventoryItem) => {
    setEditTarget(item);
    setEditForm({
      quantity_available:      String(item.quantity_available),
      selling_price:           String((item as any).selling_price ?? ""),
      cost_price:              String((item as any).cost_price ?? ""),
      minimum_stock_threshold: String((item as any).minimum_stock_threshold ?? "10"),
      reorder_level:           String(item.reorder_level ?? "10"),
    });
    setEditMsg("");
    setShowEditModal(true);
  };
  const closeEdit = () => { setShowEditModal(false); setEditMsg(""); setEditTarget(null); };

  const handleEditStock = async () => {
    if (!editTarget) return;
    setEditLoading(true); setEditMsg("");
    try {
      const body: Record<string, number> = {};
      if (editForm.quantity_available)      body.quantity_available      = parseInt(editForm.quantity_available);
      if (editForm.selling_price)           body.selling_price           = parseFloat(editForm.selling_price);
      if (editForm.cost_price)              body.cost_price              = parseFloat(editForm.cost_price);
      if (editForm.minimum_stock_threshold) body.minimum_stock_threshold = parseInt(editForm.minimum_stock_threshold);
      if (editForm.reorder_level)           body.reorder_level           = parseInt(editForm.reorder_level);

      const res = await fetch(`${BASE}/stock/update/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(e.detail ?? "Failed");
      }
      setEditMsg("✓ Stock updated successfully!");
      fetchInventory();
      setTimeout(() => closeEdit(), 1500);
    } catch (err: unknown) {
      setEditMsg(err instanceof Error ? err.message : "Error updating stock");
    } finally { setEditLoading(false); }
  };

  // ── Delete Stock ──────────────────────────────────────────────────
  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${(item as any).medicine_name ?? "this item"}" from inventory? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`${BASE}/stock/delete/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(e.detail ?? "Failed");
      }
      fetchInventory();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting stock");
    } finally { setDeletingId(null); }
  };

  const filtered = inventory.filter(item => {
    const matchStatus = statusFilter === "all" || getStatus(item) === statusFilter;
    const name = ((item as any).medicine_name ?? "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
                        String(item.medicine_id).includes(search) ||
                        String(item.batch_id).includes(search) ||
                        ((item as any).batch_number ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const available = inventory.filter(i => getStatus(i) === "available").length;
  const low       = inventory.filter(i => getStatus(i) === "low").length;
  const critical  = inventory.filter(i => getStatus(i) === "critical").length;
  const damaged   = inventory.reduce((s, i) => s + i.quantity_damaged, 0);

  const inp = (label: string, val: string, onChange: (v: string) => void, placeholder: string, type = "text") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="field-label">{label}</label>
      <input type={type} className="input-field" placeholder={placeholder} value={val} onChange={e => onChange(e.target.value)} />
    </div>
  );
  const sel = (label: string, val: string, onChange: (v: string) => void, options: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="field-label">{label}</label>
      <select className="input-field" style={{ colorScheme: "dark" }} value={val} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ padding: "28px", fontFamily: "'DM Sans',sans-serif" }}>

      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/stock-management">Stock Management</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Inventory</span>
      </div>

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, margin: 0, letterSpacing: "-0.02em" }}>Inventory</h1>
            <p style={{ color: "#475569", fontSize: 14.5, margin: "3px 0 0" }}>Live medicine stock levels, batch tracking & FEFO dispatch</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/stock-management" className="btn-ghost" style={{ padding: "9px 16px", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>← Back</Link>
          <button className="btn-ghost" style={{ padding: "9px 16px", fontSize: 14 }} onClick={fetchInventory}>↻ Refresh</button>
          <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 14, width: "auto" }} onClick={openAdd}>+ Add Stock</button>
        </div>
      </div>

      <div className="fade-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total SKUs",    value: loading ? "—" : inventory.length, color: "#38bdf8", sub: "medicines"  },
          { label: "Available",     value: loading ? "—" : available,         color: "#4ade80", sub: "in stock"  },
          { label: "Low Stock",     value: loading ? "—" : low,               color: "#f59e0b", sub: "reorder"   },
          { label: "Critical",      value: loading ? "—" : critical,          color: "#ef4444", sub: "urgent"    },
          { label: "Damaged Units", value: loading ? "—" : damaged,           color: "#818cf8", sub: "write-off" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="fade-3 glass-panel">
        <div className="toolbar">
          <div>
            <h2 className="panel-title">All Inventory Records</h2>
            <p className="panel-sub">{loading ? "Loading..." : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-field" placeholder="Search medicine or batch..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 30, fontSize: 13, padding: "7px 12px 7px 30px", width: 210 }} />
            </div>
            <div className="filter-bar">
              {(["all","available","low","critical"] as StatusFilter[]).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)} className={`filter-btn${statusFilter === f ? " active" : ""}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="error-row">⚠ {error} — <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={fetchInventory}>retry</span></div>}
        {loading && <div style={{ padding: "48px 24px", textAlign: "center", color: "#334155", fontSize: 13 }}><div className="spinner-lg"/>Fetching inventory...</div>}

        {!loading && !error && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  {["#","Medicine","Batch No.","Expiry","Available","Reserved","Damaged","Reorder Lvl","Status","Action"].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const status = getStatus(item);
                  const s      = statusStyle(status);
                  const med    = item as any;
                  return (
                    <tr key={item.id} className="tr-hover" style={{ borderBottom: "1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#334155" }}>{idx + 1}</td>
                      <td style={{ padding: "13px 16px", maxWidth: 180 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9" }}>{med.medicine_name ?? `MED-${item.medicine_id}`}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{med.category ?? "—"} · {med.dosage_form ?? "—"}</div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#38bdf8", fontFamily: "monospace" }}>{med.batch_number ?? `BAT-${item.batch_id}`}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: med.is_expired ? "#ef4444" : "#64748b", whiteSpace: "nowrap" }}>
                        {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        {med.is_expired && <span style={{ marginLeft: 4, color: "#ef4444", fontSize: 10 }}>EXPIRED</span>}
                      </td>
                      <td style={{ padding: "13px 16px", fontWeight: 700, fontSize: 14, color: status === "available" ? "#4ade80" : status === "low" ? "#f59e0b" : "#ef4444" }}>{item.quantity_available}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{item.quantity_reserved}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: item.quantity_damaged > 0 ? "#f87171" : "#334155" }}>{item.quantity_damaged}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569" }}>{item.reorder_level}</td>
                      <td style={{ padding: "13px 16px" }}><span className="badge" style={{ background: s.bg, color: s.color, textTransform: "capitalize" }}>{status}</span></td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(item)}
                            style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(56,189,248,0.08)", color: "#38bdf8", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item)} disabled={deletingId === item.id}
                            style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", opacity: deletingId === item.id ? 0.6 : 1 }}>
                            {deletingId === item.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: "48px 24px", textAlign: "center", color: "#334155", fontSize: 13 }}>
                    {inventory.length === 0 ? "No inventory yet — click \"+ Add Stock\" to add your first medicine" : "No records match your filter"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", flexShrink: 0 }}/>
            <span style={{ color: "#334155", fontSize: 12 }}>Live data · FEFO dispatch enforced across all batches</span>
          </div>
          {!loading && <span style={{ fontSize: 12, color: "#334155" }}>{inventory.length} total records</span>}
        </div>
      </div>

      {/* ── Add Stock Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAdd}>
          <div className="glass-card modal-inner" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "#f1f5f9", margin: 0 }}>Add Stock</h2>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Fill in the details — medicine, batch & stock added in one go</p>
              </div>
              <button onClick={closeAdd} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: -4 }}>Medicine</div>
              {inp("Medicine Name", addForm.medicine_name, v => setAddForm(p => ({...p, medicine_name: v})), "e.g. PANADOL 500MG")}
              <div className="grid-2">
                {sel("Category", addForm.category, v => setAddForm(p => ({...p, category: v})), CATEGORIES)}
                {sel("Dosage Form", addForm.dosage_form, v => setAddForm(p => ({...p, dosage_form: v})), DOSAGE_FORMS)}
              </div>
              <div className="grid-2">
                {inp("Strength", addForm.strength, v => setAddForm(p => ({...p, strength: v})), "e.g. 500mg (optional)")}
                {sel("Unit", addForm.unit_of_measurement, v => setAddForm(p => ({...p, unit_of_measurement: v})), UNITS)}
              </div>
              <div className="grid-2">
                {inp("Cost Price (LKR)", addForm.cost_price, v => setAddForm(p => ({...p, cost_price: v})), "e.g. 3.50", "number")}
                {inp("Selling Price (LKR)", addForm.selling_price, v => setAddForm(p => ({...p, selling_price: v})), "e.g. 4.50", "number")}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, marginBottom: -4 }}>Batch / Delivery</div>
              {inp("Batch Number", addForm.batch_number, v => setAddForm(p => ({...p, batch_number: v})), "e.g. BT-2026-001")}
              <div className="grid-2">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="field-label">Manufacture Date</label>
                  <input type="date" className="input-field" style={{ colorScheme: "dark" }} value={addForm.manufacture_date} onChange={e => setAddForm(p => ({...p, manufacture_date: e.target.value}))} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="field-label">Expiry Date</label>
                  <input type="date" className="input-field" style={{ colorScheme: "dark" }} value={addForm.expiry_date} onChange={e => setAddForm(p => ({...p, expiry_date: e.target.value}))} />
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, marginBottom: -4 }}>Stock</div>
              <div className="grid-2">
                {inp("Quantity", addForm.quantity, v => setAddForm(p => ({...p, quantity: v})), "e.g. 500", "number")}
                {inp("Supplier Name", addForm.supplier_name, v => setAddForm(p => ({...p, supplier_name: v})), "e.g. MedLine (optional)")}
              </div>
              {addMsg && (
                <div style={{ padding: "10px 14px", borderRadius: 9, fontSize: 13,
                  background: addMsg.startsWith("✓") ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
                  color: addMsg.startsWith("✓") ? "#4ade80" : "#f87171",
                  border: `1px solid ${addMsg.startsWith("✓") ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  {addMsg}
                </div>
              )}
              <button className="btn-primary" style={{ marginTop: 4 }} onClick={handleAddStock} disabled={addLoading}>
                {addLoading ? <><div className="spinner"/>Adding Stock...</> : "Add Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Stock Modal ────────────────────────────────────────── */}
      {showEditModal && editTarget && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="glass-card modal-inner" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "#f1f5f9", margin: 0 }}>Edit Stock</h2>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{(editTarget as any).medicine_name ?? `Medicine ID: ${editTarget.medicine_id}`}</p>
              </div>
              <button onClick={closeEdit} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-2">
                {inp("Quantity Available", editForm.quantity_available, v => setEditForm(p => ({...p, quantity_available: v})), "e.g. 500", "number")}
                {inp("Reorder Level", editForm.reorder_level, v => setEditForm(p => ({...p, reorder_level: v})), "e.g. 10", "number")}
              </div>
              <div className="grid-2">
                {inp("Cost Price (LKR)", editForm.cost_price, v => setEditForm(p => ({...p, cost_price: v})), "e.g. 3.50", "number")}
                {inp("Selling Price (LKR)", editForm.selling_price, v => setEditForm(p => ({...p, selling_price: v})), "e.g. 4.50", "number")}
              </div>
              {inp("Min Stock Threshold", editForm.minimum_stock_threshold, v => setEditForm(p => ({...p, minimum_stock_threshold: v})), "e.g. 10", "number")}
              {editMsg && (
                <div style={{ padding: "10px 14px", borderRadius: 9, fontSize: 13,
                  background: editMsg.startsWith("✓") ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
                  color: editMsg.startsWith("✓") ? "#4ade80" : "#f87171",
                  border: `1px solid ${editMsg.startsWith("✓") ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  {editMsg}
                </div>
              )}
              <button className="btn-primary" style={{ marginTop: 4 }} onClick={handleEditStock} disabled={editLoading}>
                {editLoading ? <><div className="spinner"/>Saving...</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
