"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";

interface InventoryItem {
  quantity_available: number;
  quantity_damaged: number;
  quantity_expired: number;
  reorder_level: number;
  minimum_stock_threshold?: number;
}

interface Batch {
  expiry_date: string;
  is_expired: boolean;
  is_active: boolean;
}

interface ReorderItem { medicine_id: number; }

const daysUntil = (dateStr: string) =>
  Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const modules = [
  {
    href:  "/stock-management/inventory",
    title: "Inventory",
    desc:  "Live stock levels per medicine & batch",
    color: "#38bdf8",
    bg:    "rgba(14,165,233,0.08)",
    border:"rgba(14,165,233,0.18)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href:  "/stock-management/batches",
    title: "Batches",
    desc:  "Batch tracking, expiry dates & FEFO",
    color: "#818cf8",
    bg:    "rgba(129,140,248,0.08)",
    border:"rgba(129,140,248,0.18)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="21 8 21 21 3 21 3 8"/>
        <rect x="1" y="3" width="22" height="5"/>
        <line x1="10" y1="12" x2="14" y2="12"/>
      </svg>
    ),
  },
  {
    href:  "/stock-management/alerts",
    title: "Alerts",
    desc:  "Low stock, critical & expiry warnings",
    color: "#f59e0b",
    bg:    "rgba(245,158,11,0.08)",
    border:"rgba(245,158,11,0.18)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href:  "/stock-management/analytics",
    title: "Analytics",
    desc:  "Consumption trends & reorder insights",
    color: "#4ade80",
    bg:    "rgba(74,222,128,0.08)",
    border:"rgba(74,222,128,0.18)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    href:  "/stock-management/adjustments",
    title: "Adjustments",
    desc:  "Damaged, expired & correction logs",
    color: "#f87171",
    bg:    "rgba(248,113,113,0.08)",
    border:"rgba(248,113,113,0.18)",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
];

export default function StockManagementPage() {
  const [inventory, setInventory]   = useState<InventoryItem[]>([]);
  const [batches, setBatches]       = useState<Batch[]>([]);
  const [reorder, setReorder]       = useState<ReorderItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, batchRes, reorderRes] = await Promise.all([
        fetch(`${API}/inventory/`),
        fetch(`${API}/batches/?include_expired=false`),
        fetch(`${API}/analytics/reorder-recommendations`),
      ]);
      if (!invRes.ok || !batchRes.ok) throw new Error("Failed to load stock data");
      const [invData, batchData, reorderData] = await Promise.all([
        invRes.json(),
        batchRes.json(),
        reorderRes.ok ? reorderRes.json() : [],
      ]);
      setInventory(invData);
      setBatches(batchData);
      setReorder(Array.isArray(reorderData) ? reorderData : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Derived stats from real data
  const totalSKUs      = inventory.length;
  const lowStock       = inventory.filter(i => i.quantity_available <= i.reorder_level && i.quantity_available > 0).length;
  const criticalStock  = inventory.filter(i => i.quantity_available === 0 || (i.minimum_stock_threshold != null && i.quantity_available <= i.minimum_stock_threshold)).length;
  const expiringSoon   = batches.filter(b => !b.is_expired && daysUntil(b.expiry_date) <= 30).length;
  const totalDamaged   = inventory.reduce((s, i) => s + i.quantity_damaged, 0);
  const reorderNeeded  = reorder.length;

  const stats = [
    { label:"Total SKUs",      value: loading ? "—" : totalSKUs,     color:"#38bdf8", sub:"medicines tracked"         },
    { label:"Low Stock",       value: loading ? "—" : lowStock,      color:"#f59e0b", sub:"below reorder level"       },
    { label:"Critical",        value: loading ? "—" : criticalStock,  color:"#ef4444", sub:"at or below minimum"       },
    { label:"Expiring <30d",   value: loading ? "—" : expiringSoon,  color:"#f97316", sub:"batches expiring soon"     },
    { label:"Damaged Units",   value: loading ? "—" : totalDamaged,  color:"#818cf8", sub:"write-off needed"          },
    { label:"Reorder Needed",  value: loading ? "—" : reorderNeeded, color:"#4ade80", sub:"supplier orders pending"   },
  ];

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <Link href="/dashboard" style={{ color:"#334155", fontSize:13, textDecoration:"none" }}>Dashboard</Link>
        <span style={{ color:"#1e3a5f" }}>›</span>
        <span style={{ color:"#38bdf8", fontSize:13, fontWeight:600 }}>Stock Management</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:50, height:50, borderRadius:14,
            background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.22)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#38bdf8", boxShadow:"0 0 22px rgba(14,165,233,0.12)", flexShrink:0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, margin:0, letterSpacing:"-0.02em" }}>
              Stock Management
            </h1>
            <p style={{ color:"#475569", fontSize:13.5, margin:"3px 0 0" }}>
              Unified view of inventory, batches, alerts & analytics
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {lastUpdated && (
            <span style={{ fontSize:12, color:"#334155" }}>Updated {lastUpdated}</span>
          )}
          <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:13 }} onClick={fetchAll}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom:20, padding:"12px 16px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#f87171", fontSize:13 }}>
          ⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchAll}>retry</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14, marginBottom:32 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:11, color:"#334155", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
              {s.label}
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, color:s.color, lineHeight:1, marginBottom:6 }}>
              {loading ? (
                <div style={{ width:40, height:36, background:"rgba(148,163,184,0.06)", borderRadius:8, animation:"pulse 1.5s ease infinite" }}/>
              ) : s.value}
            </div>
            <div style={{ fontSize:11, color:"#334155" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert Banner — show if critical issues */}
      {!loading && (criticalStock > 0 || expiringSoon > 0) && (
        <div className="fade-3" style={{
          marginBottom:24, padding:"14px 20px",
          background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)",
          borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", boxShadow:"0 0 8px #ef4444", flexShrink:0, animation:"pulse 1.5s ease infinite" }}/>
            <span style={{ fontSize:13.5, color:"#f87171", fontWeight:500 }}>
              {criticalStock > 0 && `${criticalStock} medicine${criticalStock > 1 ? "s" : ""} critically low`}
              {criticalStock > 0 && expiringSoon > 0 && " · "}
              {expiringSoon > 0 && `${expiringSoon} batch${expiringSoon > 1 ? "es" : ""} expiring within 30 days`}
            </span>
          </div>
          <Link href="/stock-management/alerts" style={{
            fontSize:12, color:"#ef4444", fontWeight:600, textDecoration:"none",
            padding:"5px 12px", borderRadius:7, background:"rgba(239,68,68,0.1)",
          }}>
            View Alerts →
          </Link>
        </div>
      )}

      {/* Module Cards */}
      <div className="fade-3">
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#94a3b8", margin:"0 0 16px", letterSpacing:"0.04em", textTransform:"uppercase" }}>
          Modules
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
          {modules.map(mod => (
            <Link key={mod.href} href={mod.href} style={{ textDecoration:"none" }}>
              <div style={{
                background:"rgba(10,20,42,0.8)",
                border:`1px solid ${mod.border}`,
                borderRadius:18, padding:"24px",
                cursor:"pointer", transition:"all 0.22s ease",
                backdropFilter:"blur(16px)",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${mod.bg}`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = mod.color + "55";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.borderColor = mod.border;
                }}
              >
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{
                    width:46, height:46, borderRadius:13,
                    background:mod.bg, border:`1px solid ${mod.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:mod.color,
                  }}>
                    {mod.icon}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:"#f1f5f9", marginBottom:6 }}>
                  {mod.title}
                </div>
                <div style={{ fontSize:13, color:"#475569", lineHeight:1.5 }}>
                  {mod.desc}
                </div>

                {/* Live badge per module */}
                {!loading && (
                  <div style={{ marginTop:14 }}>
                    {mod.title === "Inventory" && (
                      <span className="badge" style={{ background:"rgba(56,189,248,0.08)", color:"#38bdf8" }}>
                        {totalSKUs} SKUs tracked
                      </span>
                    )}
                    {mod.title === "Batches" && (
                      <span className="badge" style={{ background: expiringSoon > 0 ? "rgba(249,115,22,0.08)" : "rgba(74,222,128,0.08)", color: expiringSoon > 0 ? "#f97316" : "#4ade80" }}>
                        {expiringSoon > 0 ? `${expiringSoon} expiring soon` : "All batches healthy"}
                      </span>
                    )}
                    {mod.title === "Alerts" && (
                      <span className="badge" style={{ background: criticalStock > 0 ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.08)", color: criticalStock > 0 ? "#ef4444" : "#4ade80" }}>
                        {criticalStock > 0 ? `${criticalStock} critical alerts` : "No critical alerts"}
                      </span>
                    )}
                    {mod.title === "Analytics" && (
                      <span className="badge" style={{ background:"rgba(129,140,248,0.08)", color:"#818cf8" }}>
                        {reorderNeeded > 0 ? `${reorderNeeded} reorders needed` : "Stock levels OK"}
                      </span>
                    )}
                    {mod.title === "Adjustments" && (
                      <span className="badge" style={{ background: totalDamaged > 0 ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)", color: totalDamaged > 0 ? "#f87171" : "#4ade80" }}>
                        {totalDamaged > 0 ? `${totalDamaged} damaged units` : "No damaged stock"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer status */}
      <div className="fade-4" style={{ marginTop:28, padding:"14px 20px", borderTop:"1px solid rgba(148,163,184,0.06)", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", flexShrink:0 }}/>
        <span style={{ color:"#334155", fontSize:12 }}>
          Live data from HealixPharm backend · FEFO enforced · Auto-alerts active
        </span>
      </div>

    </div>
  );
}