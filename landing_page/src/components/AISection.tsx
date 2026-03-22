"use client";
import { useEffect, useRef } from "react";

const predictions = [
  { name: "Paracetamol 500mg", stock: 42,  unit: "strips",   runout: "~4 days",  action: "Reorder now",  c: "#f87171" },
  { name: "Metformin 500mg",   stock: 118, unit: "tablets",  runout: "~12 days", action: "Reorder soon", c: "#818cf8" },
  { name: "Amoxicillin 250mg", stock: 340, unit: "capsules", runout: "~38 days", action: "Stock healthy", c: "#38bdf8" },
];

const points = [
  { label: "Predicts runout dates",     desc: "Based on your actual sales velocity" },
  { label: "Triggers reorder alerts",   desc: "Before stock hits critical levels" },
  { label: "FEFO batch prioritization", desc: "Sells soonest-expiring stock first" },
];

export default function AISection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".ai-reveal").forEach((el, i) =>
              setTimeout(() => el.classList.add("visible"), i * 120)
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="ai" className="ai-section reveal-up" ref={ref}>
      <div className="ai-top-line" />

      <div className="ai-inner">

        {/* Header — centered like other sections */}
        <div className="ai-header ai-reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            AI Engine
          </div>
          <h2 className="ai-title">
            Your pharmacy knows{" "}
            <span className="grad">before you do.</span>
          </h2>
          <p className="ai-subtitle">
            HealixPharm monitors your stock continuously and predicts when each
            medicine will run out — so you reorder before shelves go empty, not after.
          </p>
        </div>

        {/* Content — two columns */}
        <div className="ai-grid">

          {/* Left — feature points */}
          <div className="ai-points ai-reveal" style={{ transitionDelay: "0.1s" }}>
            {points.map((item, i) => (
              <div key={item.label} className="ai-point">
                {/* Gradient icon block — same as features */}
                <div className="ai-point-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="ai-point-label">{item.label}</p>
                  <p className="ai-point-desc">{item.desc}</p>
                </div>
              </div>
            ))}

            {/* Stat row */}
            <div className="ai-stats-row">
              {[
                { n: "94%",   l: "Prediction accuracy" },
                { n: "24/7",  l: "Continuous monitoring" },
                { n: "FEFO",  l: "Batch management" },
              ].map((s) => (
                <div key={s.l} className="ai-stat-box">
                  <span className="ai-stat-num">{s.n}</span>
                  <span className="ai-stat-label">{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — prediction card */}
          <div className="ai-card ai-reveal" style={{ transitionDelay: "0.2s" }}>

            {/* Card header */}
            <div className="ai-card-header">
              <div className="ai-card-title-row">
                <div className="ai-card-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="ai-card-name">AI Stock Predictions</p>
                  <p className="ai-card-sub">Updated just now</p>
                </div>
              </div>
              <span className="ai-live-badge">
                <span className="ai-live-dot" />
                Live
              </span>
            </div>

            {/* Column headers */}
            <div className="ai-col-headers">
              {["Medicine", "Stock", "Runout", "Status"].map((h) => (
                <span key={h} className="ai-col-header">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="ai-rows">
              {predictions.map((p, i) => (
                <div key={p.name} className="ai-row" style={{ borderBottom: i < predictions.length - 1 ? "1px solid rgba(148,163,184,0.06)" : "none" }}>
                  <div className="ai-row-name">
                    <span className="ai-row-dot" style={{ background: p.c }} />
                    <span className="ai-row-label">{p.name}</span>
                  </div>
                  <span className="ai-row-stock">{p.stock} {p.unit}</span>
                  <span className="ai-row-runout" style={{ color: p.c }}>{p.runout}</span>
                  <span className="ai-row-badge" style={{ color: p.c, background: `${p.c}12`, border: `1px solid ${p.c}28` }}>
                    {p.action}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="ai-card-footer">
              <span><span style={{ color: "#38bdf8", fontWeight: 700 }}>3</span> medicines tracked</span>
              <span>Powered by HealixPharm AI</span>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-section {
          padding: 130px 0;
          position: relative;
          background: transparent;
          overflow: hidden;
        }
        .ai-top-line {
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent);
        }
        .ai-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 28px;
          position: relative;
          z-index: 1;
        }
        .ai-header {
          text-align: center;
          margin-bottom: 72px;
        }
        .ai-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f1f5f9;
          line-height: 1.1;
          margin: 0 0 18px;
        }
        .ai-subtitle {
          font-size: 17px;
          color: #64748b;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.8;
        }
        .ai-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 48px;
          align-items: center;
        }
        .ai-points {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .ai-point {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .ai-point-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai-point-label {
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }
        .ai-point-desc {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }
        .ai-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 8px;
        }
        .ai-stat-box {
          background: rgba(8, 16, 32, 0.7);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 16px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ai-stat-num {
          font-family: 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .ai-stat-label {
          font-size: 11px;
          color: #475569;
          font-weight: 500;
          line-height: 1.4;
        }
        .ai-card {
          background: rgba(8, 16, 32, 0.85);
          border: 1px solid rgba(148,163,184,0.09);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .ai-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(148,163,184,0.07);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ai-card-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ai-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai-card-name {
          font-size: 14px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }
        .ai-card-sub {
          font-size: 11px;
          color: #334155;
          margin: 2px 0 0;
        }
        .ai-live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #4ade80;
        }
        .ai-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          display: inline-block;
          animation: livepulse 1.8s ease infinite;
        }
        .ai-col-headers {
          padding: 10px 24px;
          display: grid;
          grid-template-columns: 1fr 100px 80px 110px;
          gap: 8px;
          border-bottom: 1px solid rgba(148,163,184,0.05);
        }
        .ai-col-header {
          font-size: 10px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .ai-rows { padding: 4px 0; }
        .ai-row {
          padding: 15px 24px;
          display: grid;
          grid-template-columns: 1fr 100px 80px 110px;
          gap: 8px;
          align-items: center;
        }
        .ai-row-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-row-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ai-row-label {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .ai-row-stock {
          font-size: 13px;
          color: #475569;
        }
        .ai-row-runout {
          font-size: 13px;
          font-weight: 700;
        }
        .ai-row-badge {
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          text-align: center;
          letter-spacing: 0.02em;
        }
        .ai-card-footer {
          padding: 14px 24px;
          border-top: 1px solid rgba(148,163,184,0.07);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #334155;
        }
        .ai-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .ai-reveal.visible {
          opacity: 1;
          transform: none;
        }
        @media (max-width: 768px) {
          .ai-grid { grid-template-columns: 1fr; gap: 40px; }
          .ai-stats-row { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </section>
  );
}