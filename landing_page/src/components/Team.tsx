"use client";
import { useEffect, useRef, useState } from "react";

const team = [
  { 
    name: "Iqbaal Meedin",    
    role: "Team Lead & Backend",      
    img: "/Iqbaal.png",   
    initial: "IM",
    linkedin: "https://www.linkedin.com/in/iqbaal-meedin-261a54325?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
  { 
    name: "Maneth Liyanage",  
    role: "Backend & ML",             
    img: "/maneth.jpg",   
    initial: "ML",
    linkedin: "https://www.linkedin.com/in/liyanage-don-maneth-mihisara-72b734359?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
  },
  { 
    name: "Rukaiya Riyas",    
    role: "Frontend, UI/UX with backend support & QA",     
    img: null,
    initial: "RR",
    linkedin: "https://www.linkedin.com/in/rukaiya-riyas-803395353"
  },
  { 
    name: "Nasrin Nas",       
    role: "Frontend, UI/UX & QA",     
    img: null,
    initial: "NN",
    linkedin: "https://www.linkedin.com/in/nasrin-nas-b62076353"
  },
  { 
    name: "Oneli Herath",     
    role: "WhatsApp Bot",              
    img: "/herath.jpg",    
    initial: "OH",
    linkedin: "https://www.linkedin.com/in/oneli-herath"
  },
  { 
    name: "Theran De Alwis",  
    role: "Marketing & ML",           
    img: "/theran.jpg",   
    initial: "TD",
    linkedin: "https://www.linkedin.com/in/theran-de-alwis-18471732b/"
  },
];

function TeamCard({ m, i }: { m: typeof team[0]; i: number }) {
  const [imgError, setImgError] = useState(false);
  const showInitial = !m.img || imgError;

  return (
    <div
      className="team-card team-reveal"
      style={{
        transitionDelay: `${i * 0.07}s`,
        background: "rgba(8, 18, 36, 0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        overflow: "hidden",
        transition: "all 0.25s ease",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: "100%",
        height: 300,
        background: "rgba(56,189,248,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {showInitial ? (
          <span style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#38bdf8",
            letterSpacing: "-0.02em",
            fontFamily: "inherit",
          }}>
            {m.initial}
          </span>
        ) : (
          <img
            src={m.img!}
            alt={m.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "20px 22px 24px" }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: 5,
          letterSpacing: "-0.01em",
        }}>
          <a
            href={m.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {m.name}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </h3>
        <p style={{
          fontSize: 12.5,
          color: "#64748b",
          fontWeight: 500,
          lineHeight: 1.5,
          margin: 0,
        }}>
          {m.role}
        </p>
      </div>
    </div>
  );
}

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
      <div style={{ maxWidth: 1100, margin: "auto", padding: "0 28px" }}>

        <div className="team-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-badge">
            <span className="badge-dot" />
            The Team
          </div>
          <h2 className="team-title">
            Meet the people <span className="grad">behind HealixPharm.</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}>
          {team.map((m, i) => (
            <TeamCard key={m.name} m={m} i={i} />
          ))}
        </div>

      </div>

      <style jsx>{`
        .team-section {
          padding: 130px 0;
          position: relative;
        }
        .team-title {
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.03em;
        }
        @media (max-width: 900px) {
          div[style*="repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          div[style*="repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
