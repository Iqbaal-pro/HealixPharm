"use client";

import { useState } from "react";

const stats = [
  {
    label: "Total Prescriptions",
    value: "1,284",
    change: "+12% this month",
    up: true,
    color: "#38bdf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
      </svg>
    ),
  },
  {
    label: "Available Stock",
    value: "3,540",
    change: "+4% this week",
    up: true,
    color: "#4ade80",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: "Pending Deliveries",
    value: "27",
    change: "5 due today",
    up: false,
    color: "#f59e0b",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: "Low Stock Alerts",
    value: "8",
    change: "3 critical",
    up: false,
    color: "#ef4444",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

const recentPrescriptions = [
  { id: "RX-4821", patient: "Saman Perera",     medicine: "Metformin 500mg",   qty: 60, status: "dispensed", date: "Today, 9:14 AM" },
  { id: "RX-4820", patient: "Nimali Fernando",   medicine: "Atorvastatin 10mg", qty: 30, status: "pending",   date: "Today, 8:50 AM" },
  { id: "RX-4819", patient: "Kamal Silva",       medicine: "Amlodipine 5mg",    qty: 30, status: "dispensed", date: "Today, 8:22 AM" },
  { id: "RX-4818", patient: "Priya Jayawardena", medicine: "Lisinopril 10mg",   qty: 30, status: "pending",   date: "Yesterday"      },
  { id: "RX-4817", patient: "Ruwan Bandara",     medicine: "Insulin Glargine",  qty: 5,  status: "critical",  date: "Yesterday"      },
  { id: "RX-4816", patient: "Dilini Rathnayake", medicine: "Omeprazole 20mg",   qty: 30, status: "dispensed", date: "Yesterday"      },
];

const lowStockItems = [
  { name: "Insulin Glargine 100U/mL", stock: 4,  min: 20,  severity: "critical" },
  { name: "Amoxicillin 500mg",        stock: 12, min: 50,  severity: "low"      },
  { name: "Salbutamol Inhaler",       stock: 6,  min: 15,  severity: "critical" },
  { name: "Paracetamol 500mg",        stock: 30, min: 100, severity: "low"      },
  { name: "Metformin 500mg",          stock: 18, min: 40,  severity: "low"      },
];

const analyticsData = [
  { month: "Oct", value: 72  },
  { month: "Nov", value: 88  },
  { month: "Dec", value: 65  },
  { month: "Jan", value: 95  },
  { month: "Feb", value: 80  },
  { month: "Mar", value: 110 },
];

const maxVal = Math.max(...analyticsData.map(d => d.value));

const statusStyle = (status: string) => {
  if (status === "dispensed") return { bg: "rgba(74,222,128,0.08)",  color: "#4ade80", label: "Dispensed" };
  if (status === "pending")   return { bg: "rgba(245,158,11,0.08)",  color: "#f59e0b", label: "Pending"   };
  if (status === "critical")  return { bg: "rgba(239,68,68,0.08)",   color: "#ef4444", label: "Critical"  };
  return { bg: "", color: "", label: "" };
};

export default function DashboardPage() {
  const [search, setSearch] = useState("");

  const filtered = recentPrescriptions.filter(p =>
    p.patient.toLowerCase().includes(search.toLowerCase()) ||
    p.medicine.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          0%  { opacity: 0; transform: translateY(14px); }
          100%{ opacity: 1; transform: translateY(0);    }
        }
        .stat-card {
          background: rgba(10,20,42,0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148,163,184,0.08);
          border-radius: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          padding: 22px;
          animation: fadeInUp 0.5s ease both;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(14,165,233,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .glass-panel {
          background: rgba(10,20,42,0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148,163,184,0.08);
          border-radius: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 500;
        }
        .tr-hover { transition: background 0.15s; }
        .tr-hover:hover { background: rgba(148,163,184,0.03) !important; }
        .bar-col { transition: background 0.25s; }
        .search-inner {
          background: rgba(6,13,26,0.9);
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 9px;
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 7px 12px 7px 30px;
          outline: none;
          width: 180px;
          transition: all 0.2s;
        }
        .search-inner::placeholder { color: #334155; }
        .search-inner:focus {
          border-color: rgba(14,165,233,0.3);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.06);
        }
      `}</style>

      <div style={{ padding: "28px", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24, animation: "fadeInUp 0.4s ease both" }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: 22, color: "#f1f5f9",
            letterSpacing: "-0.02em", margin: 0,
          }}>
            Dashboard
          </h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}>
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: `${s.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: s.color,
                }}>
                  {s.icon}
                </div>
                <span className="badge" style={{
                  background: s.up ? "rgba(74,222,128,0.08)" : "rgba(245,158,11,0.08)",
                  color: s.up ? "#4ade80" : "#f59e0b",
                }}>
                  {s.change}
                </span>
              </div>
              <div style={{
                fontSize: 28, fontWeight: 700, color: "#f1f5f9",
                fontFamily: "'Syne', sans-serif",
                letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics + Low Stock */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>

          {/* Bar chart */}
          <div className="glass-panel" style={{ padding: 24, animation: "fadeInUp 0.5s ease 0.2s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>
                  Prescription Analytics
                </h2>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>Monthly prescription volume</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["6M", "1Y", "All"].map((t, i) => (
                  <button key={t} style={{
                    padding: "4px 10px", borderRadius: 7, fontSize: 12,
                    border: "none", cursor: "pointer",
                    background: i === 0 ? "rgba(14,165,233,0.12)" : "transparent",
                    color: i === 0 ? "#38bdf8" : "#475569",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, padding: "0 4px" }}>
              {analyticsData.map((d, i) => (
                <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: 11, color: "#334155" }}>{d.value}</div>
                  <div
                    className="bar-col"
                    style={{
                      width: "100%", borderRadius: "6px 6px 0 0",
                      height: `${(d.value / maxVal) * 110}px`,
                      background: i === analyticsData.length - 1
                        ? "linear-gradient(180deg, #38bdf8, #0369a1)"
                        : "rgba(56,189,248,0.15)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(180deg,#38bdf8,#0369a1)"}
                    onMouseLeave={e => {
                      if (i !== analyticsData.length - 1)
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(56,189,248,0.15)";
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#334155" }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock */}
          <div className="glass-panel" style={{ padding: 24, animation: "fadeInUp 0.5s ease 0.28s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>
                Low Stock Alerts
              </h2>
              <span className="badge" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                8 items
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {lowStockItems.map(item => (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, color: "#cbd5e1", fontWeight: 500 }}>{item.name}</span>
                    <span className="badge" style={{
                      background: item.severity === "critical" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                      color: item.severity === "critical" ? "#ef4444" : "#f59e0b",
                      fontSize: 10,
                    }}>{item.severity}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(148,163,184,0.08)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${Math.min((item.stock / item.min) * 100, 100)}%`,
                        background: item.severity === "critical" ? "#ef4444" : "#f59e0b",
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap" }}>
                      {item.stock}/{item.min}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="glass-panel" style={{ animation: "fadeInUp 0.5s ease 0.34s both" }}>
          <div style={{
            padding: "20px 24px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid rgba(148,163,184,0.06)",
          }}>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: 0 }}>
                Recent Prescriptions
              </h2>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>
                {filtered.length} results{search && ` for "${search}"`}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="search-inner"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button style={{
                padding: "7px 14px",
                background: "linear-gradient(90deg, #0369a1, #0e7ab5)",
                color: "#bae6fd", border: "none", borderRadius: 9,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>+ New</button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(148,163,184,0.06)" }}>
                  {["Rx ID", "Patient", "Medicine", "Qty", "Status", "Date"].map(h => (
                    <th key={h} style={{
                      padding: "10px 24px", textAlign: "left",
                      fontSize: 11, color: "#334155", fontWeight: 600,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(rx => {
                  const s = statusStyle(rx.status);
                  return (
                    <tr key={rx.id} className="tr-hover" style={{ borderBottom: "1px solid rgba(148,163,184,0.04)" }}>
                      <td style={{ padding: "13px 24px", fontSize: 13, color: "#38bdf8", fontWeight: 500 }}>{rx.id}</td>
                      <td style={{ padding: "13px 24px", fontSize: 13, color: "#cbd5e1" }}>{rx.patient}</td>
                      <td style={{ padding: "13px 24px", fontSize: 13, color: "#94a3b8" }}>{rx.medicine}</td>
                      <td style={{ padding: "13px 24px", fontSize: 13, color: "#64748b" }}>{rx.qty}</td>
                      <td style={{ padding: "13px 24px" }}>
                        <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "13px 24px", fontSize: 12, color: "#334155", whiteSpace: "nowrap" }}>{rx.date}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "32px 24px", textAlign: "center", color: "#334155", fontSize: 13 }}>
                      No results found for "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}