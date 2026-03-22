"use client";
import { useEffect, useRef } from "react";

const team = [
  { 
    name: "Iqbaal Meedin",    
    role: "Team Lead & Backend",      
    img: "/team/iqbaal.jpg",   
    initial: "IM",
    linkedin: "https://www.linkedin.com/in/iqbaal-meedin-261a54325?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
  { 
    name: "Maneth Liyanage",  
    role: "Backend & ML",             
    img: "/team/maneth.jpg",   
    initial: "ML",
    linkedin: "https://www.linkedin.com/in/liyanage-don-maneth-mihisara-72b734359?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
  },
  { 
    name: "Rukaiya Riyas",    
    role: "Frontend, UI/UX & QA",     
    img: "/team/rukaiya.jpg",  
    initial: "RR",
    linkedin: "https://www.linkedin.com/in/rukaiya-riyas-803395353"
  },
  { 
    name: "Nasrin Nas",       
    role: "Frontend, UI/UX & QA",     
    img: "/team/nasrin.jpg",   
    initial: "NN",
    linkedin: "https://www.linkedin.com/in/nasrin-nas-b62076353"
  },
  { 
    name: "Oneli Herath",     
    role: "WhatsApp Bot",              
    img: "/team/oneli.jpg",    
    initial: "OH",
    linkedin: "https://www.linkedin.com/in/oneli-herath"
  },
  { 
    name: "Theran De Alwis",  
    role: "Marketing & ML",           
    img: "/team/theran.jpg",   
    initial: "TD",
    linkedin: "https://www.linkedin.com/in/theran-de-alwis-18471732b/"
  },
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
              <h3 className="team-name">
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="team-link">
                  {m.name}
                  <svg className="linkedin-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </h3>

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
        .team-link {
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .team-link:hover {
          color: #38bdf8;
        }
        .team-link:hover .linkedin-icon {
          color: #38bdf8;
          transform: translateY(-1px);
        }
        .linkedin-icon {
          color: #64748b;
          transition: all 0.2s ease;
          opacity: 0.8;
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