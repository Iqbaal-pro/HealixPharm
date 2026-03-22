"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",        label: "Home"        },
  { href: "/channel", label: "Book Doctor" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background: "rgba(6,13,26,0.85)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "0 1px 30px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        width: "100%",
        padding: "0 40px",
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <img
            src="/logohealix.png"
            alt="HealixPharm"
            style={{
              height: 34, width: 34,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#e2e8f0",
              letterSpacing: -0.2,
              lineHeight: 1,
            }}>
              HealixPharm
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              color: "#1e3a52",
              letterSpacing: 2,
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              eChannelling
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navLinks.map(link => {
            const active = link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  padding: "7px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                  transition: "all 0.2s",
                  letterSpacing: 0.1,
                  ...(active ? {
                    background: "rgba(99,102,241,0.08)",
                    WebkitTextFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    backgroundImage: "linear-gradient(90deg, #38bdf8, #818cf8)",
                  } : { color: "#475569" }),
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.color = "#94a3b8";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.color = "#475569";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}