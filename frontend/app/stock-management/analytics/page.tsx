"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getTokenFromStorage } from "../../routes/authRoutes";
import {
  getReorderRecommendations,
  getHighDemand,
  getSlowMoving,
  getStockoutAnalysis,
  type ReorderRec,
  type HighDemand,
  type SlowMoving,
  type StockoutRisk,
} from "../../routes/analyticsRoutes";

type Tab = "reorder" | "high-demand" | "slow-moving" | "stockout";

export default function AnalyticsPage() {
  const [tab, setTab]             = useState<Tab>("reorder");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [reorder,    setReorder]    = useState<ReorderRec[]>([]);
  const [highDemand, setHighDemand] = useState<HighDemand[]>([]);
  const [slowMoving, setSlowMoving] = useState<SlowMoving[]>([]);
  const [stockout,   setStockout]   = useState<StockoutRisk[]>([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    const token = getTokenFromStorage();
    try {
      const [r, h, s, st] = await Promise.allSettled([
        getReorderRecommendations(token),
        getHighDemand(token),
        getSlowMoving(token),
        getStockoutAnalysis(token),
      ]);
      if (r.status  === "fulfilled") setReorder(r.value);
      if (h.status  === "fulfilled") setHighDemand(h.value);
      if (s.status  === "fulfilled") setSlowMoving(s.value);
      if (st.status === "fulfilled") setStockout(st.value);
      if ([r, h, s, st].every(x => x.status === "rejected")) setError("Failed to load analytics data.");
    } catch {
      setError("Unexpected error loading analytics.");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: "reorder",     label: "Reorder Needed", count: reorder.length,    color: "#818cf8" },
    { key: "high-demand", label: "High Demand",     count: highDemand.length, color: "#38bdf8" },
    { key: "slow-moving", label: "Slow Moving",     count: slowMoving.length, color: "#f59e0b" },
    { key: "stockout",    label: "Stockout Risk",   count: stockout.length,   color: "#ef4444" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp { 0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade { animation: fadeInUp 0.4s ease both; }
        .glass { background:rgba(10,20,42,0.8); backdrop-filter:blur(16px); border:1px solid rgba(148,163,184,0.08); border-radius:18px; }
        .tab-btn { padding:8px 18px; border-radius:10px; border:1px solid transparent; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:7px; }
        .tab-active   { background:rgba(56,189,248,0.1); border-color:rgba(56,189,248,0.25); color:#38bdf8; }
        .tab-inactive { background:transparent; color:#475569; }
        .tab-inactive:hover { background:rgba(148,163,184,0.05); color:#94a3b8; }
        .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:600; }
        .tr { transition:background 0.15s; }
        .tr:hover { background:rgba(148,163,184,0.03) !important; }
        th { padding:10px 20px; text-align:left; font-size:11px; color:#334155; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; }
        td { padding:13px 20px; font-size:13px; border-bottom:1px solid rgba(148,163,184,0.04); }
      `}</style>

      <div style={{ padding: "28px", fontFamily: "'DM Sans', sans-serif", maxWidth: 1100 }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Link href="/dashboard" style={{ color: "#334155", fontSize: 13, textDecoration: "none" }}>Dashboard</Link>
          <span style={{ color: "#1e3a5f" }}>›</span>
          <Link href="/stock-management" style={{ color: "#334155", fontSize: 13, textDecoration: "none" }}>Stock Management</Link>
          <span style={{ color: "#1e3a5f" }}>›</span>
          <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 600 }}>Analytics</span>
        </div>

        {/* Header */}
        <div className="fade" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: "#f1f5f9", letterSpacing: "-0.02em", margin: 0 }}>
              Analytics
            </h1>
            <p style={{ color: "#475569", fontSize: 14.5, marginTop: 4 }}>
              Demand trends, reorder recommendations and stockout risk
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Link href="/stock-management" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:10, color:"#94a3b8", fontSize:13, fontFamily:"'DM Sans',sans-serif", textDecoration:"none", cursor:"pointer" }}>← Back</Link>
            <button onClick={fetchAll} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, color: "#38bdf8", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}>
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Summary cards — click to switch tab */}
        <div className="fade" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
          {tabs.map(t => (
            <div key={t.key} onClick={() => setTab(t.key)}
              style={{ background: tab === t.key ? `${t.color}12` : "rgba(10,20,42,0.7)", border: `1px solid ${tab === t.key ? t.color + "33" : "rgba(148,163,184,0.08)"}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all 0.18s" }}>
              <div style={{ fontSize: 28, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: t.color, lineHeight: 1 }}>
                {loading ? "—" : t.count}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>{t.label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`tab-btn ${tab === t.key ? "tab-active" : "tab-inactive"}`}>
              {t.label}
              <span className="badge" style={{ background: `${t.color}18`, color: t.color }}>
                {loading ? "…" : t.count}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 18px", color: "#fca5a5", fontSize: 13, marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        {/* Table panel */}
        <div className="glass fade" style={{ animationDelay: "0.1s" }}>

          {/* ── Reorder Needed ── */}
          {tab === "reorder" && (
            <>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>Reorder Recommendations</h2>
                <p style={{ fontSize: 13.5, color: "#475569", marginTop: 3 }}>Medicines with less than 7 days of stock remaining at current consumption rate</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    <th>Medicine ID</th><th>Name</th><th>Current Stock</th><th>Daily Avg</th><th>Days Left</th><th>Order Qty</th>
                  </tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>Loading…</td></tr>
                    : reorder.length === 0 ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#334155" }}> All medicines have sufficient stock</td></tr>
                    : reorder.map(r => (
                      <tr key={r.medicine_id} className="tr">
                        <td style={{ color: "#475569" }}>#{r.medicine_id}</td>
                        <td style={{ color: "#cbd5e1", fontWeight: 500 }}>{r.medicine_name ?? `MED-${r.medicine_id}`}</td>
                        <td style={{ color: "#f1f5f9" }}>{r.current_quantity}</td>
                        <td style={{ color: "#94a3b8" }}>{r.daily_average.toFixed(1)}/day</td>
                        <td>
                          <span className="badge" style={{ background: r.days_remaining <= 3 ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: r.days_remaining <= 3 ? "#ef4444" : "#f59e0b" }}>
                            {r.days_remaining}d
                          </span>
                        </td>
                        <td style={{ color: "#818cf8", fontWeight: 600 }}>{r.reorder_quantity} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── High Demand ── */}
          {tab === "high-demand" && (
            <>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>High Demand Medicines</h2>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>Top medicines by total units dispensed in the last 30 days</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    <th>Rank</th><th>Medicine ID</th><th>Name</th><th>Total Dispensed (30d)</th>
                  </tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>Loading…</td></tr>
                    : highDemand.length === 0 ? <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>No dispensing data available yet</td></tr>
                    : highDemand.map((h, i) => (
                      <tr key={h.medicine_id} className="tr">
                        <td style={{ color: "#334155", fontWeight: 700 }}>#{i + 1}</td>
                        <td style={{ color: "#475569" }}>#{h.medicine_id}</td>
                        <td style={{ color: "#cbd5e1", fontWeight: 500 }}>{h.medicine_name ?? `MED-${h.medicine_id}`}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(148,163,184,0.08)", maxWidth: 120 }}>
                              <div style={{ height: "100%", borderRadius: 99, background: "#38bdf8", width: `${Math.min((h.total_consumed / (highDemand[0]?.total_consumed || 1)) * 100, 100)}%` }} />
                            </div>
                            <span style={{ color: "#38bdf8", fontWeight: 600 }}>{h.total_consumed}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Slow Moving ── */}
          {tab === "slow-moving" && (
            <>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>Slow Moving Medicines</h2>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>Medicines dispensed fewer than 5 times in the last 90 days</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    <th>Medicine ID</th><th>Name</th><th>Stock on Hand</th><th>Times Dispensed (90d)</th>
                  </tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>Loading…</td></tr>
                    : slowMoving.length === 0 ? <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>No slow moving medicines found</td></tr>
                    : slowMoving.map(s => (
                      <tr key={s.medicine_id} className="tr">
                        <td style={{ color: "#475569" }}>#{s.medicine_id}</td>
                        <td style={{ color: "#cbd5e1", fontWeight: 500 }}>{s.medicine_name ?? `MED-${s.medicine_id}`}</td>
                        <td style={{ color: "#f1f5f9" }}>{s.quantity_available}</td>
                        <td>
                          <span className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                            {s.times_dispensed}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Stockout Risk ── */}
          {tab === "stockout" && (
            <>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>Stockout Risk</h2>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>Medicines with frequent stockout events in the last 90 days</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    <th>Medicine ID</th><th>Name</th><th>Stockout Events (90d)</th>
                  </tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={3} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>Loading…</td></tr>
                    : stockout.length === 0 ? <tr><td colSpan={3} style={{ padding: "32px", textAlign: "center", color: "#334155" }}>✅ No stockout events detected</td></tr>
                    : stockout.map(s => (
                      <tr key={s.medicine_id} className="tr">
                        <td style={{ color: "#475569" }}>#{s.medicine_id}</td>
                        <td style={{ color: "#cbd5e1", fontWeight: 500 }}>{s.medicine_name ?? `MED-${s.medicine_id}`}</td>
                        <td>
                          <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            {s.stockout_events} events
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}