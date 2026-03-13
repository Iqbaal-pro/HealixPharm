"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Hero() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <>
      <section className="hero-section">
        {/* Background */}
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-grid" />
        <div className="hero-cursor-orb" ref={orbRef} />

        <div className="hero-content">

          {/* Badge */}
          <div style={{ marginBottom: "0" }}>
            <span className="hero-badge">
              <div className="badge-pulse animate-pulse-soft">
                <span className="badge-pulse" />
              </div>
              AI-Driven Pharmacy Platform · Powered by Twilio
            </span>
          </div>
          {/* EKG Line */}
          <svg viewBox="0 0 600 60" fill="none" style={{ width: "340px", height: "40px", margin: "0 auto 24px", display: "block" }}>
        <path
          className="ekg-line"
          d="M0 30 L80 30 L100 30 L115 5 L130 55 L145 15 L160 30 L200 30 L220 30 L235 5 L250 55 L265 15 L280 30 L600 30"
          stroke="url(#ekgGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <linearGradient id="ekgGrad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="30%" stopColor="#0ea5e9" stopOpacity="1" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
            <stop offset="70%" stopColor="#7c3aed" stopOpacity="1" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

          {/* Headline */}
          <h1 style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <span className="hero-headline">Less Chaos.</span>
            <span className="hero-headline-grad grad-animate">Better Care.</span>
          </h1>
          {/* Subtext */}
          <p className="hero-sub">
            From <strong>AI-driven stock management</strong> to instant{" "}
            <strong>WhatsApp support</strong> and medicine delivery,
            run your pharmacy smarter and deliver better patient care.
          </p>

          {/* Buttons */}
          <div className="hero-buttons">
            <Link href="/register" className="btn-primary btn-modern">
              Get Started
            </Link>
            <Link href="#features" className="btn-secondary btn-modern">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
              </svg>
              See Features
            </Link>
          </div>

          {/* Feature pills */}
          <div className="hero-pills">
            {[
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round"/></svg>, label: "AI Stock Forecasting" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#38bdf8" strokeWidth="1.5"/></svg>, label: "WhatsApp Integration" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#818cf8" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: "Smart Refill / Dosage Reminders" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round"/></svg>, label: "FEFO Expiry Control" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#818cf8" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: "24/7 Patient Support" },
            ].map((p) => (
              <div key={p.label} className="hero-pill">
                <div className="animate-pulse-soft">{p.icon}</div>
                {p.label}
              </div>
            ))}
          </div>

        </div>

      </section>
    </>
  );
}