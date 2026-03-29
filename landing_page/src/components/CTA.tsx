"use client";
import React from "react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const perks = [
  "No technical knowledge needed",
  "Setup in under 1 hour",
  "Local Sri Lankan support",
];

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="cta-section reveal-up" ref={sectionRef}>
        <div className="cta-top-line" />
        <div className="cta-glow-main" />
        <div className="cta-ring" />
        <div className="cta-ring cta-ring-2" />

        <div className="cta-inner">

          <div className="reveal">
            <div className="section-badge">
              <span className="badge-dot" />
              Get Started Today
            </div>
            <h2 className="cta-title">
              Ready to modernize<br />
              <span className="grad">your pharmacy?</span>
            </h2>
            <p className="cta-sub">
              Join the waitlist today. Setup takes under an hour, and your
              first automated stock alert will fire before end of day.
            </p>
          </div>

          <div className="cta-buttons reveal" style={{ transitionDelay: "0.1s" }}>
            <a
              href="https://healixpharm-frontend.onrender.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Register Your Pharmacy
            </a>
            <Link href="#contact" className="btn-secondary">
              Talk to Us First
            </Link>
          </div>

          <div className="cta-perks reveal" style={{ transitionDelay: "0.18s" }}>
            {perks.map((p, i) => (
              <React.Fragment key={p}>
                <span className="perk-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </span>
                {i < perks.length - 1 && <span className="perk-dot" />}
              </React.Fragment>
            ))}
          </div>

          <div className="reveal" style={{
            transitionDelay: "0.26s",
            marginTop: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            {[
              { label: "SDGP 2025",          sub: "IIT Sri Lanka" },
              { label: "Twilio",             sub: "Powered" },
              { label: "PayHere",            sub: "Integrated" },
              { label: "WhatsApp Business",  sub: "Connected" },
            ].map((b) => (
              <div key={b.label} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px 20px",
                background: "rgba(148,163,184,0.03)",
                border: "1px solid rgba(148,163,184,0.08)",
                borderRadius: "12px",
                minWidth: "100px",
              }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.02em" }}>{b.label}</span>
                <span style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{b.sub}</span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}