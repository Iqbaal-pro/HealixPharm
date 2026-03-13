"use client";

import { useEffect, useRef } from "react";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 140);
            });
          }
        });
      },
      { threshold: 0.08 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      
      {/* Top border */}
      <div className="about-top-line" />

      {/* Background texture */}
      <div className="about-noise" />

      {/* Glow accents */}
      <div className="about-glow-tl" />
      <div className="about-glow-br" />

      <div className="about-inner">

        {/* Header */}
        <div className="about-header reveal">
          <div className="about-badge">
            <span className="about-badge-dot" />
            Why HealixPharm
          </div>

          <h2 className="about-title">
            Traditional pharmacies <br />
            are <span className="about-title-grad">falling behind</span>
          </h2>

          <p className="about-subtitle">
            Sri Lankan pharmacies still rely on manual processes —
            handwritten stock books, phone calls for refills,
            and spreadsheets that go out of date instantly.
            HealixPharm modernizes the entire workflow.
          </p>
        </div>


        {/* Problem / Solution Grid */}
        <div className="about-grid reveal">

          {/* Problem */}
          <div className="about-problem-card">

            <h3 className="about-problem-title">
              The current system is broken
            </h3>

            <ul className="about-problem-list">
              <li>Manual inventory books</li>
              <li>Expired medicines unnoticed</li>
              <li>Patients forgetting refills</li>
              <li>Suppliers contacted too late</li>
            </ul>

          </div>


          {/* Solution */}
          <div className="about-solution-card">

            <h3 className="about-solution-title">
              HealixPharm fixes it instantly
            </h3>

            <p className="about-solution-desc">
              One connected platform automates inventory, reminders,
              supplier alerts, and patient engagement — all in real time.
            </p>

            <div className="about-features">

              {[
                {
                  label: "Auto stock tracking",
                  sub: "AI logs inventory in real time",
                  c: "#38bdf8",
                },
                {
                  label: "WhatsApp refill reminders",
                  sub: "Patients never miss medication",
                  c: "#818cf8",
                },
                {
                  label: "Expiry protection",
                  sub: "FEFO alerts prevent losses",
                  c: "#c084fc",
                },
              ].map((s) => (
                <div key={s.label} className="about-feature">

                  <div
                    className="about-feature-icon"
                    style={{
                      background: `${s.c}20`,
                      borderColor: `${s.c}40`,
                    }}
                  />

                  <div>
                    <div
                      className="about-feature-title"
                      style={{ color: s.c }}
                    >
                      {s.label}
                    </div>
                    <div className="about-feature-sub">
                      {s.sub}
                    </div>
                  </div>

                </div>
              ))}

            </div>
          </div>

        </div>


        {/* Stats */}
        <div className="about-stats reveal">

          {[
            { num: "80%", label: "Less manual work" },
            { num: "3×", label: "Faster inventory updates" },
            { num: "0", label: "Missed refill reminders" },
          ].map((s) => (
            <div key={s.label} className="about-stat">

              <div className="about-stat-num">
                {s.num}
              </div>

              <div className="about-stat-label">
                {s.label}
              </div>

            </div>
          ))}

        </div>

      </div>

      {/* Bottom border */}
      <div className="about-bottom-line" />

    </section>
  );
}