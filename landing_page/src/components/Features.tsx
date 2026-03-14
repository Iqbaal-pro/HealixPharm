"use client";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    title: "AI Stock Management",
    sub: "Predicts when you'll run out and automates restocking — before shelves go empty.",
    tag: "AI", c: "#38bdf8", g: "rgba(56,189,248,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Expiry Alerts",
    sub: "Get notified before medicines expire — protect your stock and stay compliant.",
    tag: "Alerts", c: "#c084fc", g: "rgba(192,132,252,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    title: "WhatsApp Bot",
    sub: "Let your customers order, track, and get support via WhatsApp — your pharmacy, always reachable.",
    tag: "Twilio", c: "#34d399", g: "rgba(52,211,153,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "E-Channelling",
    sub: "Offer doctor bookings through your pharmacy — a new revenue stream with zero extra effort.",
    tag: "Booking", c: "#818cf8", g: "rgba(129,140,248,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="3" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    title: "Medicine Delivery",
    sub: "Offer delivery from your pharmacy — orders come in via WhatsApp and your staff fulfils them.",
    tag: "Delivery", c: "#2dd4bf", g: "rgba(45,212,191,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Refill Reminders",
    sub: "Automatically remind your customers when it's time to restock — keep them coming back to you.",
    tag: "SMS", c: "#c084fc", g: "rgba(192,132,252,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Live Agent Support",
    sub: "Your staff can step into any WhatsApp conversation instantly when a customer needs help.",
    tag: "Support", c: "#38bdf8", g: "rgba(56,189,248,0.15)",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Role-Based Access",
    sub: "Admin, Pharmacist, Storekeeper — control who sees and does what across your entire team.",
    tag: "Security", c: "#818cf8", g: "rgba(129,140,248,0.15)",
  },
];

export default function Features() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target.querySelectorAll(".feat-reveal").forEach((el, i) =>
              setTimeout(() => el.classList.add("visible"), i * 70)
            );
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" className="features-section reveal-up" ref={ref}>
      <div className="features-top-line" />
      <div className="features-glow" />

      <div className="features-inner">
        <div className="features-header feat-reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span className="badge-text">Platform Features</span>
          </div>
          <h2 className="features-title">
            Everything your pharmacy needs.{" "}
            <span className="grad">Nothing missing.</span>
          </h2>
          <p className="features-sub">
            From AI stock tracking to WhatsApp ordering — one fully automated platform built for Sri Lankan pharmacies.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feat-card feat-reveal"
              style={{
                transitionDelay: `${i * 0.055}s`,
                "--card-color": f.c,
                "--card-glow": f.g,
              } as React.CSSProperties}
            >
              <div
                className="feat-pill-badge"
                style={{
                  background: f.g,
                  border: `1px solid ${f.c}30`,
                  boxShadow: `0 0 12px ${f.g}`,
                  color: f.c,
                }}
              >
                <span className="feat-pill-icon" style={{ color: f.c }}>
                  {f.icon}
                </span>
                <span className="feat-pill-tag">{f.tag}</span>
              </div>

              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}