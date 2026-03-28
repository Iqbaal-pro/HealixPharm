"use client";
import Link from "next/link";

const platformLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Team", href: "#team" },
  { label: "Sign Up", href: "https://healixpharm-frontend.onrender.com/signup" },
];

const projectLinks = [
  { label: "GitHub", href: "https://github.com/Iqbaal-pro/HealixPharm" }
];

const contactInfo = [
  {
    label: "healixpharm@gmail.com",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#475569" strokeWidth="1.5" />
        <path d="M2 7l10 7 10-7" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "+94 714 292 929",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#475569" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "IIT, Spencer Building, Colombo 03",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2.5" stroke="#475569" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1CFaukYhhC/?mibextid=wwXIfr",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/healixpharm/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="#7dd3fc" strokeWidth="1.5" />
        <path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/healix_pharm?igsh=aHF5bHc5ZDZtemFs",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="#7dd3fc" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="#7dd3fc" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="#7dd3fc" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-top-glow" />
        <div className="footer-bg-glow" />

        <div className="footer-inner">
          <div className="footer-grid">

            {/* Brand */}
            <div>
              <span className="footer-logo">HealixPharm</span>
              <p className="footer-tagline">
                The smart pharmacy management platform built for Sri Lankan pharmacies, stock, customers, delivery, and channelling in one place.
              </p>
              <div className="footer-contact-items">
                {contactInfo.map((c) => (
                  <div key={c.label} className="footer-contact-item">
                    {c.icon}
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <div className="footer-col-title">Platform</div>
              {platformLinks.map((l) => (
                <Link key={l.label} href={l.href} className="footer-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Social + project */}
            <div>
              <div className="footer-col-title">Follow Us</div>
              <div className="footer-socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="social-icon-btn" title={s.label} target="_blank" rel="noopener noreferrer">
                    {s.icon}
                  </a>
                ))}
              </div>

              <div className="footer-col-title">Project</div>
              {projectLinks.map((l) => (
                <Link key={l.label} href={l.href} className="footer-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {l.label}
                </Link>
              ))}
            </div>

          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <span className="footer-bottom-text">© 2026 HealixPharm · All Rights Reserved</span>
            <div className="footer-bottom-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              SDGP 2025 · IIT Sri Lanka
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}