"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      position: "relative",
      zIndex: 1,
      marginTop: 80,
      borderTop: "1px solid rgba(56,189,248,0.08)",
      background: "rgba(2,8,24,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      {/* Top glow line */}
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.22), transparent)",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 24px 28px" }}>

        {/* Main row */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 40,
          marginBottom: 40,
        }}>

          {/* Brand + tagline */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: 15, color: "#e2e8f0",
                lineHeight: 1, marginBottom: 4,
              }}>
                HealixPharm
              </div>
              <div style={{ color: "#1e3a52", fontSize: 9, letterSpacing: 2 }}>
                eCHANNELLING
              </div>
            </div>
            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.75 }}>
              Sri Lanka's smart pharmacy platform — connecting patients
              with doctors instantly via WhatsApp and web.
            </p>
          </div>

          {/* Contact info */}
          <div>
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: 12, color: "#64748b",
              letterSpacing: 1.5, textTransform: "uppercase",
              marginBottom: 16,
            }}>
              Contact
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "📍", text: "Colombo 03, Sri Lanka"     },
                { icon: "📞", text: "+94 11 234 5678"           },
                { icon: "✉️", text: "healixpharm@gmail.com"     },
                { icon: "💬", text: "WhatsApp: +94 77 000 0000" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ color: "#475569", fontSize: 13, lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social icons */}
          <div>
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: 12, color: "#64748b",
              letterSpacing: 1.5, textTransform: "uppercase",
              marginBottom: 16,
            }}>
              Follow Us
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: "𝕏",  label: "Twitter"   },
                { icon: "in", label: "LinkedIn"  },
                { icon: "f",  label: "Facebook"  },
                { icon: "ig", label: "Instagram" },
              ].map(s => (
                <div
                  key={s.label}
                  title={s.label}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(14,165,233,0.06)",
                    border: "1px solid rgba(56,189,248,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#475569", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                    userSelect: "none" as const,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                    e.currentTarget.style.color = "#38bdf8";
                    e.currentTarget.style.background = "rgba(14,165,233,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(56,189,248,0.1)";
                    e.currentTarget.style.color = "#475569";
                    e.currentTarget.style.background = "rgba(14,165,233,0.06)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(56,189,248,0.06)",
          paddingTop: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <p style={{ color: "#2d3f55", fontSize: 12 }}>
            © {new Date().getFullYear()} Healix Smart Pharmacy. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service"].map(item => (
              <Link key={item} href="#" style={{
                textDecoration: "none", color: "#2d3f55",
                fontSize: 12, transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"}
              onMouseLeave={e => e.currentTarget.style.color = "#2d3f55"}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}