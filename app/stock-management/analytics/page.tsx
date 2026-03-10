"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const API = "http://localhost:8000";

interface HighDemandItem {
  medicine_id: number;
  medicine_name: string;
  total_consumed: number;
}

interface SlowMovingItem {
  medicine_id: number;
  medicine_name: string;
  quantity_available: number;
  times_dispensed: number;
}

interface ReorderItem {
  medicine_id: number;
  medicine_name?: string;
  recommended_quantity?: number;
  current_stock?: number;
  daily_average?: number;
}

interface MonthlyTrend {
  month: string;
  quantity_used: number;
}

const CHART_MEDICINES = [
  { id: 1, label: "Medicine #1", color: "#38bdf8" },
  { id: 2, label: "Medicine #2", color: "#818cf8" },
  { id: 3, label: "Medicine #3", color: "#4ade80" },
  { id: 4, label: "Medicine #4", color: "#f59e0b" },
];

export default function AnalyticsPage() {
  const [highDemand, setHighDemand]       = useState<HighDemandItem[]>([]);
  const [slowMoving, setSlowMoving]       = useState<SlowMovingItem[]>([]);
  const [reorder, setReorder]             = useState<ReorderItem[]>([]);
  const [trend, setTrend]                 = useState<MonthlyTrend[]>([]);
  const [activeMed, setActiveMed]         = useState(CHART_MEDICINES[0]);
  const [loading, setLoading]             = useState(true);
  const [trendLoading, setTrendLoading]   = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchTrend(activeMed.id); }, [activeMed]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [demandRes, slowRes, reorderRes] = await Promise.all([
        fetch(`${API}/analytics/high-demand?limit=10`),
        fetch(`${API}/analytics/slow-moving?days=90`),
        fetch(`${API}/analytics/reorder-recommendations`),
      ]);
      if (!demandRes.ok || !slowRes.ok) throw new Error("One or more requests failed");
      const [demandData, slowData, reorderData] = await Promise.all([
        demandRes.json(),
        slowRes.json(),
        reorderRes.ok ? reorderRes.json() : [],
      ]);
      setHighDemand(demandData);
      setSlowMoving(slowData);
      setReorder(Array.isArray(reorderData) ? reorderData : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (medicineId: number) => {
    try {
      setTrendLoading(true);
      const res = await fetch(`${API}/analytics/medicine/${medicineId}/monthly-trend?months=6`);
      if (!res.ok) throw new Error("Failed to fetch trend");
      const data = await res.json();
      setTrend(data);
    } catch {
      setTrend([]);
    } finally {
      setTrendLoading(false);
    }
  };

  const maxTrend  = Math.max(...trend.map(t => t.quantity_used), 1);
  const maxDemand = Math.max(...highDemand.map(d => d.total_consumed), 1);
  const totalConsumed = highDemand.reduce((s, d) => s + d.total_consumed, 0);

  return (
    <div style={{ padding:"28px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <Link href="/dashboard"        style={{ color:"#334155", fontSize:13, textDecoration:"none" }}>Dashboard</Link>
        <span style={{ color:"#1e3a5f" }}>›</span>
        <Link href="/stock-management" style={{ color:"#334155", fontSize:13, textDecoration:"none" }}>Stock Management</Link>
        <span style={{ color:"#1e3a5f" }}>›</span>
        <span style={{ color:"#38bdf8", fontSize:13, fontWeight:600 }}>Analytics</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:46, height:46, borderRadius:13,
            background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.22)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#818cf8", boxShadow:"0 0 18px rgba(129,140,248,0.1)", flexShrink:0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, margin:0, letterSpacing:"-0.02em" }}>
              Analytics
            </h1>
            <p style={{ color:"#475569", fontSize:13.5, margin:"3px 0 0" }}>
              Usage trends, high demand medicines & reorder recommendations
            </p>
          </div>
        </div>
        <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:13 }} onClick={fetchAll}>
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom:20, padding:"12px 16px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#f87171", fontSize:13 }}>
          ⚠ {error} — <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={fetchAll}>retry</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Top Medicine",   value: loading ? "—" : (highDemand[0]?.medicine_name ?? "—"),  color:"#38bdf8" },
          { label:"Total Consumed", value: loading ? "—" : totalConsumed.toLocaleString(),          color:"#4ade80" },
          { label:"Slow Moving",    value: loading ? "—" : slowMoving.length,                       color:"#f59e0b" },
          { label:"Reorder Needed", value: loading ? "—" : reorder.length,                          color:"#ef4444" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:11, color:"#334155", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
              {s.label}
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize: typeof s.value === "string" && s.value.length > 12 ? 16 : 28, color:s.color, lineHeight:1.2 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + High Demand */}
      <div className="fade-3" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:18, marginBottom:18 }}>

        {/* Monthly Trend Chart */}
        <div className="glass-panel" style={{ padding:24 }}>
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#f1f5f9", margin:0 }}>
              Monthly Consumption Trend
            </h2>
            <p style={{ fontSize:12, color:"#475569", marginTop:3 }}>Units dispensed per month</p>
          </div>

          {/* Medicine selector */}
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            {CHART_MEDICINES.map(m => (
              <button key={m.id} onClick={() => setActiveMed(m)} style={{
                padding:"4px 14px", borderRadius:99, fontSize:12, border:"none", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", fontWeight:500,
                background: activeMed.id === m.id ? `${m.color}18` : "rgba(148,163,184,0.06)",
                color: activeMed.id === m.id ? m.color : "#475569",
                borderWidth:1, borderStyle:"solid",
                borderColor: activeMed.id === m.id ? `${m.color}40` : "transparent",
                transition:"all 0.2s",
              }}>{m.label}</button>
            ))}
          </div>

          {/* Bar chart */}
          {trendLoading ? (
            <div style={{ height:160, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:20, height:20, border:`2px solid ${activeMed.color}30`, borderTop:`2px solid ${activeMed.color}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            </div>
          ) : trend.length === 0 ? (
            <div style={{ height:160, display:"flex", alignItems:"center", justifyContent:"center", color:"#334155", fontSize:13 }}>
              No trend data available for this medicine
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:160, padding:"0 4px" }}>
              {trend.map((d, i) => {
                const isLast = i === trend.length - 1;
                return (
                  <div key={d.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%", justifyContent:"flex-end" }}>
                    <div style={{ fontSize:11, color:"#334155" }}>{d.quantity_used}</div>
                    <div style={{
                      width:"100%", borderRadius:"6px 6px 0 0",
                      height:`${(d.quantity_used / maxTrend) * 130}px`,
                      background: isLast
                        ? `linear-gradient(180deg,${activeMed.color},${activeMed.color}88)`
                        : `${activeMed.color}22`,
                      transition:"background 0.25s", cursor:"pointer",
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(180deg,${activeMed.color},${activeMed.color}88)`}
                      onMouseLeave={e => { if (!isLast) (e.currentTarget as HTMLDivElement).style.background = `${activeMed.color}22`; }}
                    />
                    <div style={{ fontSize:11, color:"#334155" }}>{d.month}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* High Demand */}
        <div className="glass-panel" style={{ padding:24 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#f1f5f9", margin:0, marginBottom:18 }}>
            High Demand Medicines
          </h2>
          {loading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200 }}>
              <div style={{ width:20, height:20, border:"2px solid rgba(56,189,248,0.2)", borderTop:"2px solid #38bdf8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            </div>
          ) : highDemand.length === 0 ? (
            <div style={{ color:"#334155", fontSize:13 }}>No data available</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {highDemand.slice(0, 8).map((item, i) => (
                <div key={item.medicine_id}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:11, color:"#334155", fontWeight:700, width:16 }}>#{i+1}</span>
                      <span style={{ fontSize:12.5, color:"#cbd5e1", fontWeight:500 }}>{item.medicine_name}</span>
                    </div>
                    <span style={{ fontSize:12, color:"#475569" }}>{item.total_consumed}</span>
                  </div>
                  <div style={{ height:3, borderRadius:99, background:"rgba(148,163,184,0.08)", overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:99,
                      width:`${(item.total_consumed / maxDemand) * 100}%`,
                      background:"linear-gradient(90deg,#38bdf8,#818cf8)",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slow Moving + Reorder */}
      <div className="fade-4" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

        {/* Slow Moving */}
        <div className="glass-panel">
          <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#f1f5f9", margin:0 }}>
              Slow Moving Stock
            </h2>
            <p style={{ fontSize:12, color:"#475569", marginTop:3 }}>Items not dispensed in 90+ days</p>
          </div>
          {loading ? (
            <div style={{ padding:"40px 24px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:20, height:20, border:"2px solid rgba(56,189,248,0.2)", borderTop:"2px solid #38bdf8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            </div>
          ) : slowMoving.length === 0 ? (
            <div style={{ padding:"24px", color:"#334155", fontSize:13 }}>✓ No slow-moving stock detected</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                    {["Medicine", "Available", "Dispensed"].map(h => (
                      <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, color:"#334155", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slowMoving.map(item => (
                    <tr key={item.medicine_id} className="tr-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding:"12px 20px", fontSize:13, color:"#f1f5f9", fontWeight:500 }}>{item.medicine_name}</td>
                      <td style={{ padding:"12px 20px" }}>
                        <span className="badge" style={{ background:"rgba(245,158,11,0.08)", color:"#f59e0b" }}>
                          {item.quantity_available} units
                        </span>
                      </td>
                      <td style={{ padding:"12px 20px", fontSize:13, color:"#64748b" }}>{item.times_dispensed}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reorder Recommendations */}
        <div className="glass-panel">
          <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#f1f5f9", margin:0 }}>
              Reorder Recommendations
            </h2>
            <p style={{ fontSize:12, color:"#475569", marginTop:3 }}>Medicines that need restocking</p>
          </div>
          {loading ? (
            <div style={{ padding:"40px 24px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:20, height:20, border:"2px solid rgba(56,189,248,0.2)", borderTop:"2px solid #38bdf8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            </div>
          ) : reorder.length === 0 ? (
            <div style={{ padding:"24px", color:"#334155", fontSize:13 }}>✓ All stock levels are adequate</div>
          ) : (
            <>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                      {["Medicine", "Current", "Daily Avg", "Reorder Qty"].map(h => (
                        <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, color:"#334155", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reorder.map((item, i) => (
                      <tr key={item.medicine_id ?? i} className="tr-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                        <td style={{ padding:"12px 20px", fontSize:13, color:"#f1f5f9", fontWeight:500 }}>
                          {item.medicine_name ?? `Medicine #${item.medicine_id}`}
                        </td>
                        <td style={{ padding:"12px 20px" }}>
                          <span className="badge" style={{ background:"rgba(239,68,68,0.08)", color:"#ef4444" }}>
                            {item.current_stock ?? "—"}
                          </span>
                        </td>
                        <td style={{ padding:"12px 20px", fontSize:13, color:"#64748b" }}>
                          {item.daily_average != null ? item.daily_average.toFixed(1) : "—"}
                        </td>
                        <td style={{ padding:"12px 20px" }}>
                          <span className="badge" style={{ background:"rgba(56,189,248,0.08)", color:"#38bdf8" }}>
                            {item.recommended_quantity ?? "—"} units
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:"14px 24px", borderTop:"1px solid rgba(148,163,184,0.06)" }}>
                <div style={{ padding:"12px 16px", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.12)", borderRadius:10 }}>
                  <div style={{ fontSize:12, color:"#f59e0b", fontWeight:500, marginBottom:2 }}>⚠ Action Required</div>
                  <div style={{ fontSize:12, color:"#475569" }}>
                    {reorder.length} medicine{reorder.length > 1 ? "s" : ""} need restocking — place orders with suppliers soon.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fade-5" style={{ marginTop:18, padding:"14px 20px", borderTop:"1px solid rgba(148,163,184,0.06)", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#818cf8", boxShadow:"0 0 6px #818cf8", flexShrink:0 }}/>
        <span style={{ color:"#334155", fontSize:12 }}>
          Live data from HealixPharm backend · Analytics updated on each page load
        </span>
      </div>

    </div>
  );
}
