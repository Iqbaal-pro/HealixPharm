"use client";
import { useEffect, useRef, useState } from "react";

const info = [
  {
    label: "Address",
    value: "IIT, Spencer Building, 435 Galle Rd, Colombo 03",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="12" cy="9" r="2.5" stroke="#38bdf8" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Email",
    value: "healixpharm@gmail.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#38bdf8" strokeWidth="1.5"/>
        <path d="M2 7l10 7 10-7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+94 771 443 155",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#38bdf8" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const socials = [
  {
    label: "Facebook",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="#7dd3fc" strokeWidth="1.5"/>
        <path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="#7dd3fc" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" stroke="#7dd3fc" strokeWidth="1.5"/>
        <circle cx="17.5" cy="6.5" r="1" fill="#7dd3fc"/>
      </svg>
    ),
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 120);
            });
          }
        });
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  return (
    <>

      <section id="contact" className="contact-section reveal-up" ref={sectionRef}>
        <div className="contact-top-line" />
        <div className="contact-glow" />

        <div className="contact-inner">

          {/* Header */}
          <div className="contact-header reveal">
            <div className="section-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#38bdf8" strokeWidth="2"/>
              </svg>
              Get In Touch
            </div>
            <h2 className="contact-title">
              We&apos;d love to{" "}
              <span className="grad">hear from you.</span>
            </h2>
            <p className="contact-subtitle">
              Have questions about HealixPharm? Reach out and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          <div className="contact-grid">

            {/* Left col */}
            <div className="reveal" style={{ transitionDelay: "0.1s" }}>
              <div className="info-card">
                <h3 className="info-card-title">Contact Info</h3>
                <div className="info-items">
                  {info.map((c) => (
                    <div key={c.label} className="info-item">
                      <div className="info-icon">{c.icon}</div>
                      <div>
                        <div className="info-label">{c.label}</div>
                        <div className="info-value">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="social-card">
                <div className="social-title">Follow Us</div>
                <div className="social-btns">
                  {socials.map((s) => (
                    <a key={s.label} href="#" className="social-btn">
                      {s.icon}
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col — form */}
            <div className="form-card reveal" style={{ transitionDelay: "0.18s" }}>
              {sent ? (
                <div className="success-state">
                  <div className="success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="success-title">Message sent!</h3>
                  <p className="success-sub">We&apos;ll get back to you shortly.</p>
                </div>
              ) : (
                <>
                  <h3 className="form-title">Send us a message</h3>
                  <div className="form-fields">
                    <div>
                      <label className="field-label">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Silva"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Email Address</label>
                      <input
                        type="email"
                        placeholder="john@pharmacy.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label className="field-label">Message</label>
                      <textarea
                        placeholder="Tell us about your pharmacy..."
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="field-input field-textarea"
                      />
                    </div>
                    <button className="submit-btn" onClick={handleSubmit}>
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}