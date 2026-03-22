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

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

type Tab = "reorder" | "high-demand" | "slow-moving" | "stockout";

const ML_API = "http://localhost:8002/api/v1/predict";

const COLORS = ["#38bdf8", "#818cf8", "#fbbf24", "#f87171", "#10b981", "#6366f1"];

export default function AnalyticsPage() {
  const [tab, setTab]             = useState<Tab>("reorder");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [reorder,    setReorder]    = useState<ReorderRec[]>([]);
  const [highDemand, setHighDemand] = useState<HighDemand[]>([]);
  const [slowMoving, setSlowMoving] = useState<SlowMoving[]>([]);
  const [stockout,   setStockout]   = useState<StockoutRisk[]>([]);
  const [trends,     setTrends]     = useState<any[]>([]);
  const [budgets,    setBudgets]    = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    const token = getTokenFromStorage();
    try {
      const [r, h, s, st, tr, bg] = await Promise.allSettled([
        getReorderRecommendations(token),
        getHighDemand(token),
        getSlowMoving(token),
        getStockoutAnalysis(token),
        fetch(`${ML_API}/trends`).then(r => r.ok ? r.json() : null),
        fetch(`${ML_API}/budgets`).then(r => r.ok ? r.json() : null),
      ]);
      
      if (r.status  === "fulfilled") setReorder(r.value);
      if (h.status  === "fulfilled") setHighDemand(h.value);
      if (s.status  === "fulfilled") setSlowMoving(s.value);
      if (st.status === "fulfilled") setStockout(st.value);
      if (tr.status === "fulfilled" && tr.value) setTrends(tr.value.data || []);
      if (bg.status === "fulfilled" && bg.value) setBudgets(bg.value.categories || []);

      if ([r, h, s, st].every(x => x.status === "rejected")) setError("Failed to load analytics data.");
    } catch {
      setError("Unexpected error loading analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare trend data for charts
  const monthlyTrendsMap: any = {};
  trends.forEach(t => {
    const month = t.month_name;
    if (!monthlyTrendsMap[month]) monthlyTrendsMap[month] = { name: month };
    monthlyTrendsMap[month].sales = (monthlyTrendsMap[month].sales || 0) + t.total_qty;
  });
  const trendData = Object.values(monthlyTrendsMap);

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: "reorder",     label: "Reorder Needed", count: reorder.length,    color: "#818cf8" },
    { key: "high-demand", label: "High Demand",     count: highDemand.length, color: "#38bdf8" },
    { key: "slow-moving", label: "Slow Moving",     count: slowMoving.length, color: "#f59e0b" },
    { key: "stockout",    label: "Stockout Risk",   count: stockout.length,   color: "#ef4444" },
  ];

  const getActiveData = () => {
    switch(tab) {
      case "reorder": return reorder.slice(0, 5).map(r => ({ name: r.medicine_name || `MED-${r.medicine_id}`, value: r.current_quantity, reorder: r.reorder_quantity }));
      case "high-demand": return highDemand.slice(0, 5).map(h => ({ name: h.medicine_name || `MED-${h.medicine_id}`, value: h.total_consumed }));
      case "slow-moving": return slowMoving.slice(0, 5).map(s => ({ name: s.medicine_name || `MED-${s.medicine_id}`, value: s.quantity_available }));
      default: return [];
    }
  };

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
        .chart-container { height: 300px; width: 100%; margin-top: 20px; }
      `}</style>

      <div style={{ padding: "28px", fontFamily: "'DM Sans', sans-serif", maxWidth: 1200, margin: "0 auto" }}>

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
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#f1f5f9", letterSpacing: "-0.02em", margin: 0 }}>
              Analytics
            </h1>
            <p style={{ color: "#475569", fontSize: 14.5, marginTop: 4 }}>
              Interactive demand trends, reorder insights and stockout risk assessment
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Link href="/stock-management" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:10, color:"#94a3b8", fontSize:13, textDecoration:"none" }}>← Back</Link>
            <button onClick={fetchAll} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, color: "#38bdf8", fontSize: 13, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}>
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Top Overview Cards */}
        <div className="fade" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 28 }}>
          {tabs.map(t => (
            <div key={t.key} className="glass" onClick={() => setTab(t.key)}
              style={{ padding: "24px", cursor: "pointer", borderLeft: `4px solid ${t.color}`, boxShadow: tab === t.key ? `0 8px 32px ${t.color}15` : "none", transition: "all 0.2s" }}>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.label}</div>
              <div style={{ fontSize: 36, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#f1f5f9", marginTop: 8 }}>
                {loading ? "—" : t.count}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(148,163,184,0.06)" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: t.color, width: loading ? "0%" : `${Math.min(t.count * 5, 100)}%` }} />
                </div>
                <span style={{ fontSize: 11, color: t.color }}>{t.count > 0 ? "Action Required" : "Healthy"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="fade" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(500px,1fr))", gap: 20, marginBottom: 28 }}>
          
          {/* Main Sales Trend Chart */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, color: "#f1f5f9", margin: "0 0 20px" }}>12-Month Sales History</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "#060d1a", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "10px", color: "#f1f5f9" }} 
                    itemStyle={{ color: "#38bdf8" }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Allocation by Category */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, color: "#f1f5f9", margin: "0 0 20px" }}>Budget Requirement by Category</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgets.slice(0, 5).map(b => ({ name: b.category, value: b.budget_required }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                  >
                    {budgets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `Rs. ${value.toLocaleString()}`}
                    contentStyle={{ background: "#060d1a", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "10px" }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="fade" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20, marginBottom: 28 }}>
          
          {/* Detailed Data Table */}
          <div className="glass" style={{ overflow: "hidden" }}>
             <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(148,163,184,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, color: "#f1f5f9", margin: 0 }}>{tabs.find(t => t.key === tab)?.label}</h3>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                   {tabs.map(t => (
                     <button key={t.key} onClick={() => setTab(t.key)}
                        style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, border: "none", opacity: tab === t.key ? 1 : 0.2, cursor: "pointer" }} />
                   ))}
                </div>
             </div>
             
             <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                    {tab === "reorder" ? <><th>Name</th><th>Stock</th><th>Days Left</th><th>Order Qty</th></>
                    : tab === "high-demand" ? <><th>Medicine</th><th>Consumption</th><th>Trend</th></>
                    : <><th>Medicine</th><th>Value</th><th>Status</th></>}
                  </tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#334155" }}>Loading…</td></tr>
                    : getActiveData().length === 0 ? <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#334155" }}>No data to display in this category</td></tr>
                    : getActiveData().map((item, idx) => (
                      <tr key={idx} className="tr">
                        <td style={{ color: "#cbd5e1" }}>{item.name}</td>
                        <td style={{ color: "#f1f5f9", fontWeight: 600 }}>{item.value || 0}</td>
                        {tab === "reorder" ? (
                           <>
                             <td><span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Low</span></td>
                             <td style={{ color: "#38bdf8", fontWeight: 700 }}>+{item.reorder}</td>
                           </>
                        ) : (
                          <>
                             <td>
                               <div style={{ height: 3, width: 60, borderRadius: 2, background: "rgba(148,163,184,0.06)" }}>
                                  <div style={{ height: "100%", borderRadius: 2, background: tabs.find(t=>t.key===tab)?.color, width: `${(item.value / getActiveData()[0].value) * 100}%` }} />
                               </div>
                             </td>
                             <td><span style={{ fontSize: 11, color: "#475569" }}>{idx === 0 ? "Highest" : "Significant"}</span></td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             <div style={{ padding: "14px 22px", background: "rgba(148,163,184,0.02)", textAlign: "center" }}>
                <Link href="/stock-management/inventory" style={{ color: "#38bdf8", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>View All Inventory Reports →</Link>
             </div>
          </div>

          {/* Quick Item Comparison Bar Chart */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, color: "#f1f5f9", margin: "0 0 20px" }}>Top 5 Comparison</h3>
            <div className="chart-container">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={getActiveData()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.02)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={80} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: "rgba(148,163,184,0.03)" }}
                      contentStyle={{ background: "#060d1a", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "10px" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {getActiveData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={tabs.find(t => t.key === tab)?.color} opacity={1 - (index * 0.15)} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
            <p style={{ color: "#334155", fontSize: 11, marginTop: 15, fontStyle: "italic" }}>
              * Graphically compares relative importance within the selected category.
            </p>
          </div>

        </div>

      </div>
    </>
  );
}