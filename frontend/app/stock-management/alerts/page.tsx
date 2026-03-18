"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAlerts, acknowledgeAlert } from "../../routes/alertRoutes";
import { getTokenFromStorage } from "../../routes/authRoutes";

interface StockAlert {
  id: number;
  medicine_id: number;
  batch_id: number | null;
  alert_type: string;
  current_quantity: number;
  threshold_value: number;
  is_active: boolean;
  is_acknowledged: boolean;
  acknowledged_by: number | null;
  acknowledged_at: string | null;
  created_at: string;
  resolved_at: string | null;
}

const alertConfig: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  low_stock:      { bg:"rgba(245,158,11,0.08)",  color:"#f59e0b", icon:"⚠",  label:"Low Stock"      },
  critical_stock: { bg:"rgba(239,68,68,0.08)",   color:"#ef4444", icon:"🔴", label:"Critical Stock" },
  out_of_stock:   { bg:"rgba(239,68,68,0.1)",    color:"#f87171", icon:"❌", label:"Out of Stock"   },
  expiring_soon:  { bg:"rgba(249,115,22,0.08)",  color:"#f97316", icon:"⏱",  label:"Expiring Soon"  },
  expired:        { bg:"rgba(100,116,139,0.08)", color:"#64748b", icon:"🗑",  label:"Expired"        },
  overstock:      { bg:"rgba(129,140,248,0.08)", color:"#818cf8", icon:"📦", label:"Overstock"      },
};

function ac(type: string) {
  return alertConfig[type] ?? { bg:"rgba(148,163,184,0.08)", color:"#94a3b8", icon:"•", label: type.replace(/_/g," ") };
}

type FilterType = "all" | "active" | "acknowledged";
type TypeFilter = "all" | string;

export default function AlertsPage() {
  const [alerts, setAlerts]         = useState<StockAlert[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<FilterType>("active");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch]         = useState("");
  const [ackingId, setAckingId]     = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    setLoading(true); setError(null);
    try {
      const token = getTokenFromStorage();
      setAlerts(await getAlerts(token));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch alerts");
    } finally { setLoading(false); }
  };

  const handleAcknowledge = async (id: number) => {
    setAckingId(id);
    try {
      const token = getTokenFromStorage();
      await acknowledgeAlert(id, 1, token);
      fetchAlerts();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    } finally { setAckingId(null); }
  };

  const alertTypes = Array.from(new Set(alerts.map(a => a.alert_type)));

  const filtered = alerts.filter(a => {
    const matchStatus =
      filter === "all" ? true :
      filter === "active" ? (a.is_active && !a.is_acknowledged) :
      a.is_acknowledged;
    const matchType = typeFilter === "all" || a.alert_type === typeFilter;
    const matchSearch =
      String(a.medicine_id).includes(search) ||
      String(a.batch_id ?? "").includes(search) ||
      a.alert_type.includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const active       = alerts.filter(a => a.is_active && !a.is_acknowledged).length;
  const critical     = alerts.filter(a => a.alert_type === "critical_stock" || a.alert_type === "out_of_stock").length;
  const acknowledged = alerts.filter(a => a.is_acknowledged).length;

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/stock-management">Stock Management</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Alerts</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444", flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>
              Stock Alerts
            </h1>
            <p style={{ color:"#475569", fontSize:14.5, margin:"3px 0 0" }}>Live warnings for low stock, expiry and critical levels</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {lastUpdated && <span style={{ fontSize:12, color:"#334155" }}>Updated {lastUpdated}</span>}
          <button onClick={fetchAlerts} className="btn-ghost" style={{ padding:"9px 16px", fontSize:14 }}>↻ Refresh</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Total Alerts", value: loading ? "—" : alerts.length, color:"#38bdf8", sub:"all time"       },
          { label:"Active",       value: loading ? "—" : active,         color:"#ef4444", sub:"need action"    },
          { label:"Critical",     value: loading ? "—" : critical,       color:"#f87171", sub:"out / critical" },
          { label:"Acknowledged", value: loading ? "—" : acknowledged,   color:"#4ade80", sub:"reviewed"       },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Active banner */}
      {!loading && active > 0 && (
        <div className="fade-2 alert-banner alert-banner-red" style={{ marginBottom:20 }}>
          <div className="alert-dot alert-dot-red"/>
          <span style={{ fontSize:13, color:"#f87171", fontWeight:500 }}>
            {active} alert{active > 1 ? "s" : ""} require immediate attention
          </span>
        </div>
      )}

      {/* Table panel */}
      <div className="fade-3 glass-panel">

        {/* Toolbar */}
        <div className="toolbar">
          <div>
            <h2 className="panel-title">Alert Log</h2>
            <p className="panel-sub">{loading ? "Loading…" : `${filtered.length} alerts`}</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-field" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft:30, fontSize:13, padding:"7px 12px 7px 30px", width:160 }} />
            </div>
            <div className="filter-bar">
              {(["all","active","acknowledged"] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? " active" : ""}`}>{f}</button>
              ))}
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ background:"rgba(6,13,26,0.9)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:9, color:"#94a3b8", padding:"6px 10px", fontSize:12, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer" }}>
              <option value="all">All types</option>
              {alertTypes.map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="error-row">⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchAlerts}>retry</span></div>}

        {loading && (
          <div style={{ padding:"48px", textAlign:"center", color:"#334155", fontSize:13 }}>
            <div className="spinner-lg"/>
            Fetching alerts…
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                  {["Type","Medicine","Batch","Current Qty","Threshold","Status","Created","Action"].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const cfg = ac(a.alert_type);
                  return (
                    <tr key={a.id} className="tr-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{ background:cfg.bg, color:cfg.color }}>{cfg.icon} {cfg.label}</span>
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{ background:"rgba(14,165,233,0.08)", color:"#7dd3fc", fontFamily:"monospace" }}>MED-{a.medicine_id}</span>
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#475569" }}>
                        {a.batch_id ? <span style={{ fontFamily:"monospace", color:"#64748b" }}>BAT-{a.batch_id}</span> : "—"}
                      </td>
                      <td style={{ padding:"13px 20px", fontWeight:700, fontSize:14,
                        color: a.current_quantity === 0 ? "#f87171" : a.current_quantity <= a.threshold_value ? "#f59e0b" : "#4ade80" }}>
                        {a.current_quantity}
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:13, color:"#475569" }}>{a.threshold_value}</td>
                      <td style={{ padding:"13px 20px" }}>
                        <span className="badge" style={{
                          background: a.is_acknowledged ? "rgba(74,222,128,0.08)" : a.is_active ? "rgba(239,68,68,0.08)" : "rgba(148,163,184,0.08)",
                          color:      a.is_acknowledged ? "#4ade80"               : a.is_active ? "#ef4444"              : "#64748b",
                        }}>
                          {a.is_acknowledged ? "Acknowledged" : a.is_active ? "Active" : "Resolved"}
                        </span>
                      </td>
                      <td style={{ padding:"13px 20px", fontSize:12, color:"#334155", whiteSpace:"nowrap" }}>
                        {new Date(a.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        {!a.is_acknowledged && a.is_active && (
                          <button onClick={() => handleAcknowledge(a.id)} disabled={ackingId === a.id}
                            style={{ padding:"5px 12px", borderRadius:7, border:"none", cursor:"pointer", background:"rgba(56,189,248,0.08)", color:"#38bdf8", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", opacity: ackingId === a.id ? 0.6 : 1 }}>
                            {ackingId === a.id ? "…" : "Acknowledge"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ padding:"48px", textAlign:"center", color:"#334155", fontSize:13 }}>
                      {alerts.length === 0 ? "No alerts — stock levels are healthy ✅" : "No alerts match your filter"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: active > 0 ? "#ef4444" : "#4ade80", boxShadow: active > 0 ? "0 0 6px #ef4444" : "0 0 6px #4ade80", flexShrink:0 }}/>
            <span style={{ color:"#334155", fontSize:12 }}>
              {active > 0 ? `${active} active alerts require attention` : "All alerts acknowledged — stock is healthy"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}