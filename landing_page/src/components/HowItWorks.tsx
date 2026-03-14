"use client";
import { useEffect, useRef } from "react";

const steps = [
  {
    n: "01", c: "#38bdf8", g: "rgba(56,189,248,0.12)",
    title: "Add stock easily",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    points: [
      "Pharmacist enters new medicines",
      "System records batch, expiry & quantity",
      "Stock instantly visible across dashboard",
    ],
  },
  {
    n: "02", c: "#818cf8", g: "rgba(129,140,248,0.12)",
    title: "Track automatically",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    points: [
      "Real-time stock monitoring 24/7",
      "Instant low-stock & expiry detection",
      "FEFO batch prioritisation built in",
    ],
  },
  {
    n: "03", c: "#c084fc", g: "rgba(192,132,252,0.12)",
    title: "Connect via WhatsApp",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
    points: [
      "Your customers message on WhatsApp",
      "Simple menu — order, book, get alerts",
      "Staff receives requests in real time",
    ],
  },
  {
    n: "04", c: "#2dd4bf", g: "rgba(45,212,191,0.12)",
    title: "Deliver & delight",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="3" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    points: [
      "Orders verified instantly",
      "Real-time delivery alerts for staff",
      "Customers receive orders on time, boosting loyalty",
    ],
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target.querySelectorAll(".hiw-reveal").forEach((el, i) =>
              setTimeout(() => el.classList.add("visible"), i * 100)
            );
        });
      },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>

      <section id="how-it-works" className="hiw-section reveal-up" ref={ref}>
        <div className="hiw-top-line" />
        <div className="hiw-glow" />

        <div className="hiw-inner">

          {/* Header */}
          <div className="hiw-header hiw-reveal">
            <div className="section-badge">
              <span
                className="badge-dot"
                style={{ background: "linear-gradient(90deg, #818cf8, #c084fc)" }}
              />
              <span className="badge-text">How It Works</span>
            </div>
            <h2 className="hiw-title">
              Up and running{" "}
              <span className="grad">in under an hour.</span>
            </h2>
            <p className="hiw-subtitle">
              Four steps to a fully automated pharmacy.
            </p>
          </div>

          {/* Grid */}
          <div className="hiw-grid">

            {/* Connector line */}
            <div className="hiw-connector">
              <div className="hiw-connector-line" />
              <div className="hiw-connector-shimmer" />
            </div>

            {steps.map((s, i) => (
              <div
                key={s.n}
                className="hiw-reveal"
                style={{ transitionDelay: `${i * 0.1}s`, position: "relative", zIndex: 1 }}
              >
                <div
                  className="hiw-card"
                  style={{ "--c": s.c } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${s.c}45`;
                    el.style.boxShadow = `0 32px 64px rgba(0,0,0,0.35), 0 0 40px ${s.g}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "rgba(255,255,255,0.07)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="hiw-card-stripe"
                    style={{ background: `linear-gradient(90deg, ${s.c}, ${s.c}44, transparent)` }}
                  />

                  <div className="hiw-card-body">
                    <div className="hiw-card-top">
                      <span
                        className="hiw-number"
                        style={{
                          background: `linear-gradient(135deg, ${s.c}, ${s.c}35)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {s.n}
                      </span>
                      <div
                        className="hiw-icon"
                        style={{
                          background: `${s.c}12`,
                          border: `1px solid ${s.c}28`,
                          color: s.c,
                        }}
                      >
                        {s.icon}
                      </div>
                    </div>

                    <h3 className="hiw-card-title">{s.title}</h3>

                    <div className="hiw-points">
                      {s.points.map((p, pi) => (
                        <div key={p} className="hiw-point">
                          <div
                            className="hiw-point-num"
                            style={{
                              background: `${s.c}12`,
                              border: `1px solid ${s.c}30`,
                              color: s.c,
                            }}
                          >
                            {pi + 1}
                          </div>
                          <span className="hiw-point-text">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}