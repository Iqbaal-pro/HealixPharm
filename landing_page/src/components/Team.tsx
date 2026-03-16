"use client";
import { useEffect, useRef } from "react";

const team = [
  { name: "Iqbaal Meedin",    role: "Team Lead & Backend",      img: "/team/iqbaal.jpg",   initial: "IM" },
  { name: "Maneth Liyanage",  role: "Backend & ML",             img: "/team/maneth.jpg",   initial: "ML" },
  { name: "Rukaiya Riyas",    role: "Frontend, UI/UX & QA",     img: "/team/rukaiya.jpg",  initial: "RR" },
  { name: "Nasrin Nas",       role: "Frontend, UI/UX & QA",     img: "/team/nasrin.jpg",   initial: "NN" },
  { name: "Oneli Herath",     role: "WhatsApp Bot",              img: "/team/oneli.jpg",    initial: "OH" },
  { name: "Theran De Alwis",  role: "Marketing & ML",           img: "/team/theran.jpg",   initial: "TD" },
];

export default function Team() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target.querySelectorAll(".team-reveal").forEach((el, i) =>
              setTimeout(() => el.classList.add("visible"), i * 80)
            );
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="team" ref={ref} className="team-section reveal-up">
      <div className="team-inner">

        <div className="team-header team-reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            The Team
          </div>
          <h2 className="team-title">
            Meet the people <span className="grad">behind HealixPharm.</span>
          </h2>
          {/*<p className="team-sub">
            Six students from IIT Sri Lanka building technology to modernize pharmacies.
          </p>*/}
        </div>

        <div className="team-grid">
          {team.map((m, i) => (
            <div
              key={m.name}
              className="team-card team-reveal"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="team-avatar">
                <img
                  src={m.img}
                  alt={m.name}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.style.display = "none";
                    t.parentElement!.innerHTML = `<span class="team-initial">${m.initial}</span>`;
                  }}
                />
              </div>
              <h3 className="team-name">{m.name}</h3>
              <p className="team-role">{m.role}</p>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .team-section {
          padding: 130px 0;
          position: relative;
        }
        .team-inner {
          max-width: 1100px;
          margin: auto;
          padding: 0 28px;
        }
        .team-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .team-title {
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.03em;
        }
        .team-sub {
          font-size: 17px;
          color: #64748b;
          max-width: 440px;
          margin: auto;
          line-height: 1.7;
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .team-card {
          background: rgba(8, 18, 36, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 32px 24px 28px;
          text-align: center;
          transition: all 0.25s ease;
          cursor: default;
        }
        .team-card:hover {
          border-color: rgba(148, 163, 184, 0.15);
          transform: translateY(-4px);
          background: rgba(8, 18, 36, 0.8);
        }
        .team-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          margin: 0 auto 20px;
          overflow: hidden;
          background: rgba(56, 189, 248, 0.08);
          border: 2px solid rgba(148, 163, 184, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .team-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .team-initial {
          font-family: 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #38bdf8;
        }
        .team-name {
          font-size: 17px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .team-role {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.5;
        }
        @media (max-width: 900px) {
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  );
}