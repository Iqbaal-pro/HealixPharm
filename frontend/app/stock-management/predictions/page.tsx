"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const API = "http://localhost:8002/api/v1/predict";

export default function PredictionsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, invRes] = await Promise.all([
        fetch(`${API}/summary`),
        fetch(`${API}/inventory`),
      ]);
      
      if (sumRes.ok) setSummary(await sumRes.json());
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch prediction data:", err);
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async () => {
    try {
      setRunning(true);
      const res = await fetch(`${API}/run`, { method: "POST" });
      if (res.ok) {
        await fetchData();
        alert("ML Pipeline completed successfully!");
      } else {
        alert("Pipeline failed. Check backend logs.");
      }
    } catch (err) {
      alert("Error connecting to prediction API.");
    } finally {
      setRunning(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.item.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "28px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Link href="/dashboard" style={{ color: "#334155", fontSize: 13, textDecoration: "none" }}>Dashboard</Link>
        <span style={{ color: "#1e3a5f" }}>›</span>
        <Link href="/stock-management" style={{ color: "#334155", fontSize: 13, textDecoration: "none" }}>Stock Management</Link>
        <span style={{ color: "#1e3a5f" }}>›</span>
        <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 600 }}>Predictions</span>
      </div>

      {/* Header */}
      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 0 18px rgba(16,185,129,0.1)", flexShrink: 0,
          }}>🤖</div>
          <div>
            <h1 className="gradient-text" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, margin: 0, letterSpacing: "-0.02em" }}>
              Stock Predictions
            </h1>
            <p style={{ color: "#475569", fontSize: 13.5, margin: "3px 0 0" }}>
              ML-powered forecasting for {summary?.target_month || "next month"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button 
            className="btn-primary" 
            style={{ padding: "9px 20px", fontSize: 13, background: running ? "#334155" : undefined }}
            onClick={runPipeline}
            disabled={running}
          >
            {running ? "⌛ Running Pipeline..." : "🚀 Run ML Pipeline"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="fade-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Total Budget</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#818cf8", lineHeight: 1, marginBottom: 4 }}>
            {summary ? `Rs. ${(summary.total_budget / 1000000).toFixed(2)}M` : "—"}
          </div>
          <div style={{ fontSize: 12, color: "#475569" }}>Estimated for {summary?.target_month}</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Items Predicted</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#38bdf8", lineHeight: 1, marginBottom: 4 }}>
            {summary ? summary.total_items : "—"}
          </div>
          <div style={{ fontSize: 12, color: "#475569" }}>Across all categories</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Top Category</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#f59e0b", lineHeight: 1, marginBottom: 4, fontSize: 24 }}>
            {summary ? summary.top_category : "—"}
          </div>
          <div style={{ fontSize: 12, color: "#475569" }}>Highest budget requirement</div>
        </div>
      </div>

      {/* Inventory Plan Table */}
      <div className="fade-3">
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: "#f1f5f9" }}>Detailed Inventory Plan</h3>
            <input 
              type="text" 
              placeholder="Search items or categories..." 
              className="search-input"
              style={{ width: "300px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#f1f5f9" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
                  <th style={{ padding: "12px", fontSize: 13, color: "#64748b" }}>Item Name</th>
                  <th style={{ padding: "12px", fontSize: 13, color: "#64748b" }}>Category</th>
                  <th style={{ padding: "12px", fontSize: 13, color: "#64748b" }}>Predicted Qty</th>
                  <th style={{ padding: "12px", fontSize: 13, color: "#64748b" }}>Recommended</th>
                  <th style={{ padding: "12px", fontSize: 13, color: "#64748b" }}>Est. Budget</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item, idx) => (
                    <tr key={idx} className="tr-hover" style={{ borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                      <td style={{ padding: "14px 12px", fontSize: 14 }}>{item.item}</td>
                      <td style={{ padding: "14px 12px", fontSize: 13, color: "#94a3b8" }}>{item.category}</td>
                      <td style={{ padding: "14px 12px", fontSize: 14, fontWeight: 600, color: "#38bdf8" }}>{item.predicted_qty}</td>
                      <td style={{ padding: "14px 12px", fontSize: 14, fontWeight: 600, color: "#10b981" }}>{item.recommended_stock}</td>
                      <td style={{ padding: "14px 12px", fontSize: 14 }}>Rs. {item.budget_required.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>
                      {loading ? "Loading prediction data..." : "No prediction data found. Please run the ML pipeline."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
