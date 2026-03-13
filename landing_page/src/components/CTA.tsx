"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const perks = [
  "No credit card required",
  "Setup in under 1 hour",
  "Cancel anytime",
];

const floatingStats = [
  { n: "500+", l: "Pharmacies" },
  { n: "99.9%", l: "Uptime" },
  { n: "< 1hr", l: "Setup Time" },
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
              Give your pharmacy the<br />
              <span className="grad">upgrade it deserves.</span>
            </h2>
            <p className="cta-sub">
              Setup takes under an hour. Your first automated refill reminder
              will be sent before end of day.
            </p>
          </div>

          <div className="cta-buttons reveal" style={{ transitionDelay: "0.1s" }}>
            <Link href="/register" className="btn-primary">
              Sign Up Your Pharmacy
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="#features" className="btn-secondary">
              Learn More
            </Link>
          </div>

          <div className="cta-perks reveal" style={{ transitionDelay: "0.18s" }}>
            {perks.map((p, i) => (
              <>
                <span key={p} className="perk-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </span>
                {i < perks.length - 1 && <span className="perk-dot" />}
              </>
            ))}
          </div>

          <div className="cta-stats reveal" style={{ transitionDelay: "0.26s" }}>
            {floatingStats.map((s) => (
              <div key={s.l} className="cta-stat">
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}