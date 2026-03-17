"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getInventory } from "../routes/inventoryRoutes";
import { getBatches } from "../routes/batchRoutes";
import { getReorderRecommendations } from "../routes/analyticsRoutes";
import { getTokenFromStorage } from "../routes/authRoutes";

export default function StockManagementPage() {
  const [stats, setStats] = useState({ totalSKUs: 0, lowStock: 0, critical: 0, expiringSoon: 0, damagedUnits: 0, reorderNeeded: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = getTokenFromStorage();
      const [invResult, batchesResult, reorderResult] = await Promise.allSettled([
        getInventory(), getBatches(false), getReorderRecommendations(token),
      ]);
      const inv     = invResult.status     === "fulfilled" ? invResult.value     : [];
      const batches = batchesResult.status === "fulfilled" ? batchesResult.value : [];
      const reorder = reorderResult.status === "fulfilled" ? reorderResult.value : [];
      const now = Date.now();
      setStats({
        totalSKUs:     inv.length,
        lowStock:      inv.filter(i => i.quantity_available <= i.reorder_level).length,
        critical:      inv.filter(i => i.quantity_available <= i.reorder_level * 0.5).length,
        expiringSoon:  batches.filter(b => Math.ceil((new Date(b.expiry_date).getTime() - now) / 86400000) <= 30).length,
        damagedUnits:  inv.reduce((s, i) => s + i.quantity_damaged, 0),
        reorderNeeded: reorder.length,
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const modules = [
    { href: "/stock-management/inventory",   label: "Inventory", desc: "View & manage stock levels",         badge: stats.lowStock,      badgeColor: "#f59e0b", badgeLabel: "low stock"  },
    { href: "/stock-management/batches",     label: "Batches", desc: "Track batches & expiry dates",       badge: stats.expiringSoon,  badgeColor: "#f97316", badgeLabel: "expiring"   },
    { href: "/stock-management/alerts",      label: "Alerts", desc: "Stock & expiry warnings",            badge: stats.critical,      badgeColor: "#ef4444", badgeLabel: "critical"   },
    { href: "/stock-management/analytics",   label: "Analytics", desc: "Demand trends & recommendations",    badge: stats.reorderNeeded, badgeColor: "#818cf8", badgeLabel: "reorder"    },
    { href: "/stock-management/adjustments", label: "Adjustments",desc: "Log damaged, expired & corrections", badge: stats.damagedUnits,  badgeColor: "#64748b", badgeLabel: "damaged"    },
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
            <h1 className="page-title gradient-text">Stock Management</h1>
            <p className="page-sub">Inventory · Batches · Alerts · Analytics · Adjustments</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {lastUpdated && <span style={{ fontSize: 12, color: "#334155" }}>Updated {lastUpdated}</span>}
          <button className="btn-ghost" style={{ padding: "9px 16px", fontSize: 13 }} onClick={fetchStats}>↻ Refresh</button>
        </div>
      </div>

      {!loading && (stats.critical > 0 || stats.expiringSoon > 0) && (
        <div className="fade-2 alert-banner alert-banner-red" style={{ marginBottom: 20 }}>
          <div className="alert-dot alert-dot-red" />
          <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>
            {stats.critical > 0 && `${stats.critical} critical stock items`}
            {stats.critical > 0 && stats.expiringSoon > 0 && " · "}
            {stats.expiringSoon > 0 && `${stats.expiringSoon} batches expiring within 30 days`}
            {" — immediate action required"}
          </span>
        </div>
      )}

      <div className="fade-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total stock",     value: loading ? "—" : stats.totalSKUs,     color: "#38bdf8" },
          { label: "Low Stock",      value: loading ? "—" : stats.lowStock,      color: "#f59e0b" },
          { label: "Critical",       value: loading ? "—" : stats.critical,      color: "#ef4444" },
          { label: "Expiring < 30d",  value: loading ? "—" : stats.expiringSoon,  color: "#f97316" },
          { label: "Damaged Units",  value: loading ? "—" : stats.damagedUnits,  color: "#64748b" },
          { label: "Reorder Needed", value: loading ? "—" : stats.reorderNeeded, color: "#818cf8" },
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
                <div style={{ fontSize: 28 }}></div>
                {m.badge > 0 && (
                  <span className="badge" style={{ background: `${m.badgeColor}18`, color: m.badgeColor }}>
                    {m.badge} {m.badgeLabel}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 12.5, color: "#475569" }}>{m.desc}</div>
              <div style={{ marginTop: 14, fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>Open</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}