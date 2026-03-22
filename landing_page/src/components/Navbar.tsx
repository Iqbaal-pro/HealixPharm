"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".mobile-pill") && !target.closest(".mobile-dropdown")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const links = [
    { label: "Features",     href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "AI Engine",    href: "#ai" },
    { label: "Team",         href: "#team" },
  ];

  return (
    <>
      <style>{`
        /* ── DESKTOP PILL ── */
        .nav-wrapper {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(7, 24, 40, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 99px;
          padding: 8px 10px;
          box-shadow: 0 4px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04);
          transition: all 0.3s ease;
        }
        .nav-wrapper.scrolled {
          background: rgba(7, 24, 40, 0.95);
          border-color: rgba(56, 189, 248, 0.12);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          padding: 4px 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nav-logo img {
          height: 32px;
          width: auto;
          display: block;
        }
        .nav-logo-text {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }
        .nav-pill-divider {
          width: 1px; height: 22px;
          background: rgba(148, 163, 184, 0.1);
          flex-shrink: 0;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 99px;
          transition: all 0.2s ease;
          white-space: nowrap;
          cursor: pointer;
          background: none;
          border: none;
        }
        .nav-link:hover {
          color: #f1f5f9;
          background: rgba(148, 163, 184, 0.08);
        }
        .nav-status {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74,222,128,0.7);
          animation: pulse-dot 2s infinite;
          flex-shrink: 0;
          margin: 0 4px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 4px;
        }
        .nav-btn-primary {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #bae6fd;
          background: linear-gradient(90deg, #0369a1, #0e7ab5);
          border: none;
          padding: 8px 20px;
          border-radius: 99px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.18s ease;
          white-space: nowrap;
          box-shadow: 0 2px 12px rgba(3,105,161,0.3);
        }
        .nav-btn-primary:hover {
          background: linear-gradient(90deg, #0284c7, #0ea5e9);
          box-shadow: 0 4px 18px rgba(3,105,161,0.45);
          transform: translateY(-1px);
        }

        /* ── MOBILE PILL ── */
        .mobile-pill {
          display: none;
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          align-items: center;
          gap: 10px;
          background: rgba(7,24,40,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148,163,184,0.12);
          border-radius: 99px;
          padding: 9px 18px 9px 14px;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
          transition: all 0.2s ease;
          user-select: none;
          white-space: nowrap;
        }
        .mobile-pill:hover { border-color: rgba(56,189,248,0.25); }
        .mobile-pill.open {
          border-color: rgba(56,189,248,0.4);
          background: rgba(7,24,40,0.99);
          box-shadow: 0 0 0 1px rgba(56,189,248,0.15), 0 8px 32px rgba(0,0,0,0.5);
        }
        .mobile-pill-status {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74,222,128,0.7);
          animation: pulse-dot 2s infinite;
          flex-shrink: 0;
        }
        .mobile-logo {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: -0.01em;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mobile-pill-divider {
          width: 1px; height: 14px;
          background: rgba(148,163,184,0.12);
          flex-shrink: 0;
        }
        .mobile-burger {
          display: flex;
          flex-direction: column;
          gap: 3.5px;
          width: 16px;
          flex-shrink: 0;
        }
        .mobile-burger span {
          display: block;
          height: 1.5px;
          background: #64748b;
          border-radius: 2px;
          transition: all 0.28s ease;
          transform-origin: center;
        }
        .mobile-burger.open span:nth-child(1) { transform: translateY(5px) rotate(45deg); background: #38bdf8; }
        .mobile-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .mobile-burger.open span:nth-child(3) { transform: translateY(-5px) rotate(-45deg); background: #38bdf8; }

        /* ── MOBILE DROPDOWN ── */
        .mobile-dropdown {
          display: none;
          position: fixed;
          top: 72px;
          left: 50%;
          transform: translateX(-50%) translateY(-6px) scale(0.97);
          z-index: 199;
          width: 280px;
          background: rgba(7,24,40,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(148,163,184,0.09);
          border-radius: 20px;
          padding: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
          opacity: 0;
          pointer-events: none;
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
          transform-origin: top center;
        }
        .mobile-dropdown.open {
          transform: translateX(-50%) translateY(0) scale(1);
          opacity: 1;
          pointer-events: all;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          padding: 11px 14px;
          border-radius: 12px;
          transition: all 0.15s ease;
          border: 1px solid transparent;
          cursor: pointer;
          background: none;
          width: 100%;
          text-align: left;
        }
        .mobile-nav-link:hover {
          color: #f1f5f9;
          background: rgba(148,163,184,0.07);
          border-color: rgba(148,163,184,0.06);
        }
        .mobile-divider { height: 1px; background: rgba(148,163,184,0.07); margin: 6px 4px; }
        .mobile-actions { display: flex; gap: 8px; padding: 4px; }
        .mobile-actions a {
          flex: 1;
          text-align: center;
          justify-content: center;
          font-size: 13px;
          padding: 9px 0;
          border-radius: 12px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .nav-wrapper { display: none; }
          .mobile-pill { display: flex; }
          .mobile-dropdown { display: block; }
        }
      `}</style>

      {/* ── DESKTOP NAV ── */}
      <nav className={`nav-wrapper ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          <img src="/logohealix.png" alt="HealixPharm" style={{ borderRadius: "8px"}} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block"; }} />
          <span className="nav-logo-text" style={{ display: "none" }}>HealixPharm</span>
        </Link>
        <div className="nav-pill-divider" />
        <div className="nav-links">
          {links.map((l) => (
            <button
              key={l.href}
              className="nav-link"
              onClick={() => handleNavClick(l.href)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="nav-pill-divider" />
        <span className="nav-status" />
        <div className="nav-actions">
          <a
              href="https://healixpharm-frontend.onrender.com/"
              className="nav-btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sign In
            </a>
        </div>
      </nav>

      {/* ── MOBILE PILL ── */}
      <div
        className={`mobile-pill ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <img
          src="/logohealix.png"
          alt="HealixPharm"
          style={{ height: "45px", width: "auto", borderRadius: "16px" }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
          }}
        />
        <span className="mobile-logo" style={{ display: "none" }}>HealixPharm</span>
        <div className={`mobile-burger ${open ? "open" : ""}`}>
          <span /><span /><span />
        </div>
      </div>

      {/* ── MOBILE DROPDOWN ── */}
      <div className={`mobile-dropdown ${open ? "open" : ""}`}>
        {links.map((l) => (
          <button
            key={l.href}
            className="mobile-nav-link"
            onClick={() => handleNavClick(l.href)}
          >
            {l.label}
          </button>
        ))}
        <div className="mobile-divider" />
        <div className="mobile-actions">
          <Link href="/login" className="nav-btn-ghost" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/register" className="nav-btn-primary" onClick={() => setOpen(false)}>Get Started</Link>
        </div>
      </div>
    </>
  );
}