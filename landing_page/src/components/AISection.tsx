"use client";

export default function AISection() {
  const steps = [
    { icon: "🔄", title: "Auto stock reduction",       desc: "Every sale instantly reduces stock — no manual entry needed." },
    { icon: "📅", title: "FEFO batch prioritization",  desc: "Always recommends selling the soonest-expiring batch first." },
    { icon: "📤", title: "Automatic supplier alerts",  desc: "When stock hits the reorder threshold, supplier is notified automatically." },
    { icon: "📋", title: "Daily & monthly reports",    desc: "Usage patterns, wastage, and items needing immediate attention." },
  ];

  const batches = [
    { name: "Amoxicillin B12", width: "18%", color: "linear-gradient(90deg,#f59e0b,#fbbf24)", days: "6 days",  warn: true  },
    { name: "Metformin B07",   width: "54%", color: "linear-gradient(90deg,#0ea5e9,#38bdf8)", days: "38 days", warn: false },
    { name: "Paracetamol B09", width: "86%", color: "linear-gradient(90deg,#22c55e,#4ade80)", days: "94 days", warn: false },
  ];

  const alerts = [
    { bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.2)",  color: "#fcd34d", text: "⚠️  Low stock: Metformin 500mg — 14 units" },
    { bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.2)",   color: "#fca5a5", text: "🔴  Expiry: Amoxicillin Batch B12 — 6 days" },
    { bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.15)", color: "#86efac", text: "✅  Supplier notified — reorder triggered" },
  ];

  return (
    <section id="stock" style={{ padding: "100px 0", background: "#060d1a", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.12), transparent)" }} />

      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "0 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>

          {/* Left */}
          <div>
            <span style={{
              background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)",
              color: "#7dd3fc", borderRadius: "99px", fontSize: "11px", fontWeight: 600,
              padding: "5px 14px", display: "inline-block", marginBottom: "20px",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Inventory System
            </span>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: "clamp(26px,3.5vw,42px)", letterSpacing: "-0.025em",
              color: "#f1f5f9", marginBottom: "16px", lineHeight: 1.12,
            }}>
              Zero shortages.
              <br />Zero expired stock.
              <br />
              <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Zero guesswork.
              </span>
            </h2>
            <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1.72, marginBottom: "28px" }}>
              Every medicine tracked by batch, expiry, and quantity. FEFO ensures the right stock is sold first. Alerts fire before anything goes wrong.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {steps.map((s) => (
                <div key={s.title} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  padding: "14px 16px", borderRadius: "12px",
                  background: "rgba(10,20,42,0.6)",
                  border: "1px solid rgba(148,163,184,0.07)",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "9px",
                    background: "rgba(14,165,233,0.08)",
                    border: "1px solid rgba(14,165,233,0.15)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", flexShrink: 0,
                  }}>{s.icon}</div>
                  <div>
                    <h4 style={{ fontSize: "14.5px", fontWeight: 700, color: "#f1f5f9", marginBottom: "3px" }}>{s.title}</h4>
                    <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.55 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — inventory card */}
          <div style={{
            background: "rgba(10,20,42,0.85)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(148,163,184,0.09)", borderRadius: "20px",
            padding: "24px", boxShadow: "0 0 60px rgba(14,165,233,0.05), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "16px", borderBottom: "1px solid rgba(148,163,184,0.07)" }}>
              <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "14px", color: "#f1f5f9" }}>Inventory Dashboard</span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#4ade80", fontSize: "12px", fontWeight: 600 }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "livepulse 1.8s ease infinite" }} />
                Live
              </span>
            </div>

            {/* FEFO */}
            <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#334155", marginBottom: "12px" }}>
              FEFO Batch Priority Queue
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              {batches.map((b) => (
                <div key={b.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12.5px", color: "#cbd5e1", width: "120px", flexShrink: 0, fontWeight: 500 }}>{b.name}</span>
                  <div style={{ flex: 1, height: "6px", background: "rgba(148,163,184,0.08)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: b.width, height: "100%", borderRadius: "99px", background: b.color }} />
                  </div>
                  <span style={{ fontSize: "11px", color: b.warn ? "#f59e0b" : "#334155", width: "50px", textAlign: "right", fontWeight: 600 }}>
                    {b.warn ? "⚠ " : ""}{b.days}
                  </span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {alerts.map((a) => (
                <div key={a.text} style={{
                  background: a.bg, border: `1px solid ${a.border}`,
                  color: a.color, borderRadius: "9px",
                  padding: "8px 12px", fontSize: "12.5px", fontWeight: 500,
                }}>
                  {a.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}