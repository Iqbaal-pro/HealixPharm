"use client";

export default function Testimonials() {
  const team = [
    { initial: "A", bg: "linear-gradient(135deg,#0ea5e9,#818cf8)", name: "Your Name",     role: "Full Stack Developer & Team Lead",  skills: ["React", "Node.js", "Python"] },
    { initial: "B", bg: "linear-gradient(135deg,#818cf8,#a78bfa)", name: "Team Member 2", role: "Backend Developer & Database",       skills: ["Python", "Flask", "SQL"] },
    { initial: "C", bg: "linear-gradient(135deg,#22c55e,#16a34a)", name: "Team Member 3", role: "WhatsApp Bot & Twilio Integration",  skills: ["Twilio", "WhatsApp API", "JS"] },
    { initial: "D", bg: "linear-gradient(135deg,#f59e0b,#d97706)", name: "Team Member 4", role: "Frontend & UI/UX Designer",          skills: ["Figma", "React", "CSS"] },
  ];

  return (
    <section id="team" style={{ padding: "100px 0", background: "#060d1a", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.12), transparent)" }} />

      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "0 28px" }}>

        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <span style={{
            background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
            color: "#c4b5fd", borderRadius: "99px", fontSize: "11px", fontWeight: 600,
            padding: "5px 14px", display: "inline-block", marginBottom: "20px",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>The Team</span>
          <h2 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 700,
            fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.025em",
            color: "#f1f5f9", marginBottom: "14px", lineHeight: 1.15,
          }}>
            Built by students who{" "}
            <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              care about healthcare.
            </span>
          </h2>
          <p style={{ fontSize: "17px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.65 }}>
            A passionate team building HealixPharm as part of our SDGP 2025.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {team.map((m) => (
            <div key={m.name} style={{
              background: "rgba(10,20,42,0.7)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(148,163,184,0.07)", borderRadius: "20px",
              padding: "28px 20px", textAlign: "center",
              transition: "all 0.25s", cursor: "default",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)";
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.background = "rgba(14,165,233,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(148,163,184,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(10,20,42,0.7)";
              }}
            >
              <div style={{
                width: "68px", height: "68px", borderRadius: "50%",
                margin: "0 auto 16px", background: m.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Syne,sans-serif", fontSize: "22px",
                fontWeight: 800, color: "#fff",
                border: "3px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}>{m.initial}</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", marginBottom: "5px" }}>{m.name}</div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.5, marginBottom: "14px" }}>{m.role}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center" }}>
                {m.skills.map((sk) => (
                  <span key={sk} style={{
                    fontSize: "11px", padding: "3px 9px", borderRadius: "99px", fontWeight: 600,
                    background: "rgba(14,165,233,0.08)", color: "#7dd3fc",
                    border: "1px solid rgba(14,165,233,0.15)",
                  }}>{sk}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}