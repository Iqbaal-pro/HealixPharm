"use client";

import { useState, useEffect } from "react";
import { getTokenFromStorage } from "../routes/authRoutes";
import { getInventory } from "../routes/inventoryRoutes";
import { getOrders } from "../routes/orderRoutes";
import { getAlerts } from "../routes/alertRoutes";
import { getReorderRecommendations } from "../routes/analyticsRoutes";
import { getAllPrescriptions } from "../routes/prescriptionRoutes";


interface StatItem { label:string; value:string; change:string; up:boolean; color:string; icon:React.ReactNode; }

export default function DashboardPage() {
  const [stats, setStats]                     = useState<StatItem[]>([]);
  const [loadingStats, setLoadingStats]       = useState(true);
  const [recentPrescriptions, setRecentPrescriptions] = useState<{ id:number; medicine_name:string; patient_id:number; quantity_given:number; is_completed:boolean; created_at:string }[]>([]);
  const [lowStockItems, setLowStockItems]     = useState<{ name:string; stock:number; min:number; severity:string }[]>([]);
  const [search, setSearch]                   = useState("");

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoadingStats(true);
    const token = getTokenFromStorage();
    try {
      const [inventory, orders, alerts, reorder, prescriptions] = await Promise.allSettled([
        getInventory(), getOrders(), getAlerts(token), getReorderRecommendations(token), getAllPrescriptions(),
      ]);
      const inv  = inventory.status     === "fulfilled" ? inventory.value     : [];
      const ords = orders.status        === "fulfilled" ? orders.value        : [];
      const alts = alerts.status        === "fulfilled" ? alerts.value        : [];
      const rxs  = prescriptions.status === "fulfilled" ? prescriptions.value : [];

      const pending    = ords.filter(o => o.status === "PENDING_VERIFICATION" || o.status === "PENDING").length;
      const critical   = alts.filter(a => a.is_active && !a.is_acknowledged).length;
      const totalAvail = inv.reduce((s, i) => s + i.quantity_available, 0);

      setStats([
        { label:"Total Prescriptions", value:String(rxs.length),   change:`${rxs.filter(r=>!r.is_completed).length} active`, up:true,  color:"#38bdf8",
          icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg> },
        { label:"Available Stock",     value:String(totalAvail),   change:`${inv.length} SKUs`,        up:true,  color:"#4ade80",
          icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
        { label:"Pending Orders",      value:String(pending),      change:`${ords.length} total`,      up:false, color:"#f59e0b",
          icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
        { label:"Active Alerts",       value:String(critical),     change:`${alts.length} total`,      up:false, color:"#ef4444",
          icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
      ]);

      setLowStockItems(inv.filter(i => i.quantity_available <= i.reorder_level).slice(0,5).map(i => ({
        name:`MED-${i.medicine_id}`, stock:i.quantity_available, min:i.reorder_level,
        severity: i.quantity_available === 0 || i.quantity_available <= i.reorder_level * 0.5 ? "critical" : "low",
      })));
      setRecentPrescriptions(rxs.slice(0,6));
    } catch { /* silent */ } finally { setLoadingStats(false); }
  };

  const filtered = recentPrescriptions.filter(p =>
    (p.medicine_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    String(p.patient_id).includes(search) || String(p.id).includes(search)
  );

  const statusBadge = (completed: boolean) =>
    completed ? { bg:"rgba(56,189,248,0.08)", color:"#38bdf8", label:"Completed" }
              : { bg:"rgba(74,222,128,0.08)", color:"#4ade80", label:"Active"    };

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)", boxShadow: "0 0 18px rgba(56,189,248,0.1)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div>
          <div>
            <h1 className="page-title gradient-text">Dashboard</h1>
            <p className="page-sub">{new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="fade-2 stats-grid mb-24">
        {loadingStats
          ? [1,2,3,4].map(i => (
              <div key={i} className="stat-card" style={{ animationDelay:`${i*0.08}s` }}>
                <div className="skel-label" style={{ marginBottom:12 }} />
                <div className="skel-val" />
              </div>
            ))
          : stats.map((s, i) => (
              <div key={s.label} className="stat-card" style={{ animationDelay:`${i*0.08}s` }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
                <div className="stat-sub">{s.change}</div>
              </div>
            ))
        }
      </div>

      {/* Lower grid */}
      <div className="fade-3 main-grid">

        {/* Recent Prescriptions */}
        <div className="glass-panel">
          <div className="toolbar">
            <div>
              <h2 className="panel-title">Recent Prescriptions</h2>
              <p className="panel-sub">{filtered.length} results</p>
            </div>
            <div className="search-wrap search-wrap-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="input-field search-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table className="full-table">
              <thead>
                <tr className="thead-border">
                  {["Rx ID","Patient","Medicine","Qty","Status","Date"].map(h => <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="loading-cell">{loadingStats ? "Loading..." : "No prescriptions yet"}</td></tr>
                ) : filtered.map(rx => {
                  const s = statusBadge(rx.is_completed);
                  return (
                    <tr key={rx.id} className="tr-hover tr-border">
                      <td className="td td-id">#{rx.id}</td>
                      <td className="td td-muted">Patient #{rx.patient_id}</td>
                      <td className="td td-bright">{rx.medicine_name}</td>
                      <td className="td td-dim">{rx.quantity_given}</td>
                      <td className="td"><span className="badge" style={{ background:s.bg, color:s.color }}>{s.label}</span></td>
                      <td className="td td-date">{new Date(rx.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="glass-panel panel-padded">
          <div className="panel-header">
            <h2 className="panel-title">Low Stock</h2>
            <span className="badge badge-red">{lowStockItems.length} items</span>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="loading-cell">{loadingStats ? "Loading..." : " All stock levels healthy"}</div>
          ) : (
            <div className="stock-list">
              {lowStockItems.map(item => (
                <div key={item.name}>
                  <div className="stock-item-row">
                    <span className="stock-item-name">{item.name}</span>
                    <span className="badge" style={{ background:item.severity==="critical"?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.08)", color:item.severity==="critical"?"#ef4444":"#f59e0b", fontSize:10 }}>{item.severity}</span>
                  </div>
                  <div className="stock-bar-row">
                    <div className="stock-bar-track">
                      <div className="stock-bar-fill" style={{ width:`${Math.min((item.stock/item.min)*100,100)}%`, background:item.severity==="critical"?"#ef4444":"#f59e0b" }} />
                    </div>
                    <span className="stock-bar-label">{item.stock}/{item.min}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}