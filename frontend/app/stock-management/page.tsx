"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getInventory } from "../routes/inventoryRoutes";
import { getBatches } from "../routes/batchRoutes";
import { getReorderRecommendations } from "../routes/analyticsRoutes";
import { getTokenFromStorage } from "../routes/authRoutes";

export default function StockManagementPage() {
  const [stats, setStats] = useState({
    totalSKUs: 0,
    lowStock: 0,
    critical: 0,
    totalBudget: 0,
    predictedItems: 0,
    reorderNeeded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = getTokenFromStorage();
      const [invResult, reorderResult, predictResult] = await Promise.allSettled([
        getInventory(),
        getReorderRecommendations(token),
        fetch(`${process.env.NEXT_PUBLIC_ML_API_URL ? process.env.NEXT_PUBLIC_ML_API_URL : 'http://localhost:8002'}/api/v1/predict/summary`).then(r => r.ok ? r.json() : null),
      ]);
      const inv     = invResult.status     === "fulfilled" ? invResult.value     : [];
      const reorder = reorderResult.status === "fulfilled" ? reorderResult.value : [];
      const predict = predictResult.status === "fulfilled" ? predictResult.value : null;

      setStats({
        totalSKUs:      inv.length || 0,
        lowStock:       inv.filter((i: any) => i.quantity_available <= i.reorder_level).length,
        critical:       inv.filter((i: any) => i.quantity_available <= i.reorder_level * 0.5).length,
        totalBudget:    predict?.total_budget || 0,
        predictedItems: predict?.total_items || 0,
        reorderNeeded:  Array.isArray(reorder) ? reorder.length : 0,
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const modules = [
    { href: "/stock-management/inventory",   label: "Inventory",   icon: "🗃", desc: "View & manage stock levels",         badge: stats.lowStock,      badgeColor: "#f59e0b", badgeLabel: "low stock"    },
    { href: "/stock-management/batches",     label: "Batches",     icon: "📦", desc: "Track batches & inventory",          badge: stats.reorderNeeded, badgeColor: "#818cf8", badgeLabel: "reorder"      },
    { href: "/stock-management/predictions", label: "Predictions", icon: "🤖", desc: "ML-powered stock forecasting",      badge: stats.predictedItems,badgeColor: "#10b981", badgeLabel: "items"        },
    { href: "/stock-management/analytics",   label: "Analytics",   icon: "📊", desc: "Demand trends & recommendations",    badge: stats.reorderNeeded, badgeColor: "#818cf8", badgeLabel: "reorder"      },
  ];

  return (
    <div style={{ padding: "28px" }}>
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Stock Management</span>
      </div>

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            className="page-icon"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.22)",
              boxShadow: "0 0 18px rgba(56,189,248,0.1)"
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
            >
              <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/>
              <path d="M9 21V12h6v9"/>
              <line x1="12" y1="7" x2="12" y2="3"/>
              <line x1="10" y1="5" x2="14" y2="5"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>
              Stock Management
            </h1>
            <p style={{ color:"#475569", fontSize:13.5, margin:"3px 0 0" }}>
              Inventory · Batches · Predictions · Analytics
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {lastUpdated && <span style={{ fontSize: 12, color: "#334155" }}>Updated {lastUpdated}</span>}
          <button className="btn-ghost" style={{ padding: "9px 16px", fontSize: 13 }} onClick={fetchStats}>↻ Refresh</button>
        </div>
      </div>

      {/* Prediction Alert */}
      {!loading && stats.predictedItems === 0 && (
        <div className="fade-2" style={{
          marginBottom:20, padding:"12px 20px",
          background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.15)",
          borderRadius:12, display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#38bdf8", boxShadow:"0 0 8px #38bdf8", flexShrink:0 }}/>
          <span style={{ fontSize:13, color:"#38bdf8", fontWeight:500 }}>
            ML Predictions are ready for next month — check the Predictions module for details.
          </span>
        </div>
      )}

      {/* Critical Alert */}
      {!loading && stats.critical > 0 && (
        <div className="fade-2" style={{
          marginBottom:20, padding:"12px 20px",
          background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)",
          borderRadius:12, display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#ef4444", boxShadow:"0 0 8px #ef4444", flexShrink:0 }}/>
          <span style={{ fontSize:13, color:"#f87171", fontWeight:500 }}>
            {stats.critical} critical stock items — immediate action required
          </span>
        </div>
      )}

      <div className="fade-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label:"Total SKUs",      value: loading ? "—" : stats.totalSKUs,     color:"#38bdf8" },
          { label:"Low Stock",       value: loading ? "—" : stats.lowStock,      color:"#f59e0b" },
          { label:"Critical",        value: loading ? "—" : stats.critical,      color:"#ef4444" },
          { label:"Predicted Items", value: loading ? "—" : stats.predictedItems,color:"#10b981" },
          { label:"Est. Budget",     value: loading ? "—" : `Rs. ${(stats.totalBudget/1000000).toFixed(1)}M`, color:"#818cf8" },
          { label:"Reorder Needed",  value: loading ? "—" : stats.reorderNeeded, color:"#f97316" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 32 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="fade-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {modules.map(m => (
          <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: 24, cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 28 }}>{m.icon}</div>
                {m.badge > 0 && (
                  <span className="badge" style={{ background: `${m.badgeColor}18`, color: m.badgeColor }}>
                    {m.badge} {m.badgeLabel}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 16, color: "#f1f5f9", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 14.5, color: "#475569" }}>{m.desc}</div>
              <div style={{ marginTop: 14, fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>Open</div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}