"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const glassCard: React.CSSProperties = {
  background: "rgba(10,20,42,0.8)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148,163,184,0.08)",
  borderRadius: 20,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

const modules = [
  {
    href: "/stock-management/inventory",
    icon: "⬡",
    label: "Inventory",
    desc: "Live medicine stock levels, batch tracking & supplier info",
    accent: "#0ea5e9",
  },
  {
    href: "/stock-management/batches",
    icon: "◈",
    label: "Batches",
    desc: "Manage incoming stock batches, expiry dates & FEFO ordering",
    accent: "#38bdf8",
  },
  {
    href: "/stock-management/alerts",
    icon: "◬",
    label: "Alerts",
    desc: "Low stock, expiry warnings & out-of-stock predictions",
    accent: "#818cf8",
  },
  {
    href: "/stock-management/analytics",
    icon: "◑",
    label: "Analytics",
    desc: "Usage trends, most-sold medicines & wastage reports",
    accent: "#a78bfa",
  },
  {
    href: "/stock-management/adjustments",
    icon: "⬗",
    label: "Adjustments",
    desc: "Manual stock corrections, audit trail & discrepancy logs",
    accent: "#0284c7",
  },
];

const stats = [
  { label: "Total SKUs",         value: "1,284", delta: "+12 this week",      up: true  },
  { label: "Low Stock Items",    value: "23",    delta: "↑ 5 from yesterday", up: false },
  { label: "Expiring < 30 days", value: "41",    delta: "needs attention",    up: false },
  { label: "Stock Value (LKR)",  value: "4.2M",  delta: "+2.3% this month",  up: true  },
];

export default function StockManagementPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d1a",
        padding: "40px 32px",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Aurora orbs ── */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .orb1 {
          width: 500px; height: 500px;
          background: rgba(14,165,233,0.06);
          top: -120px; left: -100px;
          animation: drift1 18s ease-in-out infinite alternate;
        }
        .orb2 {
          width: 400px; height: 400px;
          background: rgba(129,140,248,0.05);
          bottom: -80px; right: -80px;
          animation: drift2 22s ease-in-out infinite alternate;
        }
        .orb3 {
          width: 300px; height: 300px;
          background: rgba(14,165,233,0.05);
          top: 40%; left: 50%;
          animation: drift3 26s ease-in-out infinite alternate;
        }
        @keyframes drift1 { to { transform: translate(60px, 80px); } }
        @keyframes drift2 { to { transform: translate(-50px, -60px); } }
        @keyframes drift3 { to { transform: translate(40px, -50px); } }

        /* ── Entrance ── */
        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          animation: fadeInUp 0.5s ease forwards;
        }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

        /* ── Stat card hover ── */
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(14,165,233,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.03);
        }

        /* ── Module card hover ── */
        .mod-card {
          transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
        }
        .mod-card:hover { transform: translateY(-5px); }

        /* ── Shimmer badge ── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .badge-shimmer {
          background: linear-gradient(
            90deg,
            rgba(14,165,233,0.08) 25%,
            rgba(56,189,248,0.18) 50%,
            rgba(14,165,233,0.08) 75%
          );
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Aurora orbs */}
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      {/* ─── Page content ─── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{ animationDelay: "0s", marginBottom: 36 }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: "#334155", fontSize: 13 }}>Dashboard</span>
            <span style={{ color: "#1e3a5f" }}>›</span>
            <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 600 }}>
              Stock Management
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Icon box */}
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#38bdf8",
              boxShadow: "0 0 18px rgba(14,165,233,0.12)",
              flexShrink: 0,
            }}>⬡</div>

            <div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 30,
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0, letterSpacing: "-0.02em",
              }}>
                Stock Management
              </h1>
              <p style={{ color: "#475569", fontSize: 13.5, margin: "3px 0 0" }}>
                Unified inventory control — batches, expiry tracking, FEFO dispatch & real-time alerts
              </p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div
          className="fade-up"
          style={{
            animationDelay: "0.08s",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                ...glassCard,
                padding: "22px 24px",
                borderColor: s.up
                  ? "rgba(148,163,184,0.08)"
                  : "rgba(248,113,113,0.07)",
              }}
            >
              <div style={{
                color: "#334155",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                {s.label}
              </div>

              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 28,
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 10, lineHeight: 1,
              }}>
                {s.value}
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 500,
                color: s.up ? "#4ade80" : "#f87171",
              }}>
                <span style={{ fontSize: 10 }}>{s.up ? "▲" : "▼"}</span>
                <span>{s.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Modules label ── */}
        <div
          className="fade-up"
          style={{ animationDelay: "0.14s", marginBottom: 18 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ height: 1, flex: 1, background: "rgba(148,163,184,0.06)" }} />
            <span style={{
              color: "#334155", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Modules
            </span>
            <div style={{ height: 1, flex: 1, background: "rgba(148,163,184,0.06)" }} />
          </div>
        </div>

        {/* ── Module Cards ── */}
        <div
          className="fade-up"
          style={{
            animationDelay: "0.20s",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {modules.map((m, i) => (
            <Link key={i} href={m.href} style={{ textDecoration: "none" }}>
              <div
                className="mod-card"
                style={{ ...glassCard, padding: "28px 26px", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = `${m.accent}55`;
                  el.style.boxShadow =
                    `0 0 32px ${m.accent}14, inset 0 1px 0 rgba(255,255,255,0.04)`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(148,163,184,0.08)";
                  el.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.03)";
                }}
              >
                {/* Watermark icon */}
                <div style={{
                  position: "absolute", top: -24, right: -18,
                  fontSize: 110, opacity: 0.025,
                  color: m.accent, fontFamily: "monospace",
                  pointerEvents: "none", lineHeight: 1,
                }}>
                  {m.icon}
                </div>

                {/* Icon badge */}
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `${m.accent}14`,
                  border: `1px solid ${m.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 19, color: m.accent,
                  marginBottom: 18,
                }}>
                  {m.icon}
                </div>

                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700, fontSize: 17,
                  color: "#f1f5f9", marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}>
                  {m.label}
                </div>

                <div style={{
                  fontSize: 13.5, color: "#64748b",
                  lineHeight: 1.65, marginBottom: 22,
                }}>
                  {m.desc}
                </div>

                {/* Arrow CTA */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12.5, color: m.accent,
                  fontWeight: 700, letterSpacing: "0.04em",
                }}>
                  <span>Open</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Footer status bar ── */}
        <div
          className="fade-up"
          style={{
            animationDelay: "0.52s",
            marginTop: 36,
            padding: "15px 20px",
            background: "rgba(10,20,42,0.5)",
            border: "1px solid rgba(148,163,184,0.06)",
            borderRadius: 14,
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#4ade80",
            border: "2px solid #060d1a",
            boxShadow: "0 0 7px #4ade80",
            flexShrink: 0,
          }} />
          <span style={{ color: "#334155", fontSize: 13 }}>
            Stock data syncs in real-time. FEFO (First Expiring, First Out) is
            enforced automatically across all batches.
          </span>
        </div>

      </div>
    </div>
  );
}