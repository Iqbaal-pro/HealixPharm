"use client";
import { useEffect, useRef } from "react";

const steps = [
  {
    n: "01",
    title: "Register your pharmacy",
    desc: "Sign up, add your medicines, batches, and stock levels. Your dashboard is live in under an hour, no IT team needed.",
  },
  {
    n: "02",
    title: "Stock tracks itself",
    desc: "Every sale auto-reduces your inventory. Low stock and expiry alerts fire automatically, FEFO batch prioritisation built in.",
  },
  {
    n: "03",
    title: "Customers reach you on WhatsApp",
    desc: "Customers order medicines via WhatsApp. Your staff gets notified instantly and can step into any conversation anytime.",
  },
  {
    n: "04",
    title: "Grow your pharmacy",
    desc: "Offer delivery, add doctor channelling as a revenue stream, and retain customers with auto refill reminders, all automated.",
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
              setTimeout(() => el.classList.add("visible"), i * 120)
            );
        });
      },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="hiw-section reveal-up" ref={ref}>
      <div className="hiw-top-line" />

      <div className="hiw-inner">

        <div className="hiw-header hiw-reveal">
          <div className="section-badge">
            <span className="badge-dot" style={{ background: "linear-gradient(90deg, #818cf8, #c084fc)" }} />
            <span className="badge-text">How It Works</span>
          </div>
          <h2 className="hiw-title">
            Up and running{" "}
            <span className="grad">in under an hour.</span>
          </h2>
          <p className="hiw-subtitle">
            Four steps to a fully automated pharmacy, no IT team needed.
          </p>
        </div>

        <div className="hiw-timeline">
          {steps.map((s, i) => (
            <div key={s.n} className="hiw-step hiw-reveal" style={{ transitionDelay: `${i * 0.12}s` }}>

              {/* Left — number + line */}
              <div className="hiw-step-left">
                <div className="hiw-step-circle">{s.n}</div>
                {i < steps.length - 1 && <div className="hiw-step-line" />}
              </div>

              {/* Right — content */}
              <div className="hiw-step-content">
                <h3 className="hiw-step-title">{s.title}</h3>
                <p className="hiw-step-desc">{s.desc}</p>
              </div>

            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .hiw-inner {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 28px;
          position: relative;
          z-index: 1;
        }
        .hiw-header {
          text-align: center;
          margin-bottom: 72px;
        }
        .hiw-timeline {
          display: flex;
          flex-direction: column;
        }
        .hiw-step {
          display: grid;
          grid-template-columns: 56px 1fr;
          align-items: stretch;
        }
        .hiw-step-left {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hiw-step-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #38bdf8;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .hiw-step-line {
          width: 1px;
          background: rgba(148, 163, 184, 0.12);
          flex: 1;
          margin-top: 6px;
        }
        .hiw-step-content {
          padding: 0 0 52px 20px;
        }
        .hiw-step-title {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
          line-height: 1.3;
          padding-top: 8px;
        }
        .hiw-step-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.8;
        }
        @media (max-width: 560px) {
          .hiw-step-title { font-size: 18px; }
          .hiw-step-content { padding-bottom: 36px; }
        }
      `}</style>
    </section>
  );
}