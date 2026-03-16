"use client";
import { useEffect, useRef } from "react";

const features = [
  {
    title: "AI Stock Management",
    desc: "Predicts when you'll run out and automates restocking, before shelves go empty.",
    tag: "AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path className="icon-spin" d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    animClass: "anim-spin",
  },
  {
    title: "Expiry Alerts",
    desc: "Get notified before medicines expire, protect your stock and stay compliant.",
    tag: "Alerts",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.8"/>
        <path className="icon-hand" d="M12 6v6l4 2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    animClass: "anim-pulse",
  },
  {
    title: "WhatsApp Bot",
    desc: "Let your customers order, track, and get support via WhatsApp, always reachable.",
    tag: "Twilio",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle className="icon-dot1" cx="9" cy="10" r="1" fill="white"/>
        <circle className="icon-dot2" cx="12" cy="10" r="1" fill="white"/>
        <circle className="icon-dot3" cx="15" cy="10" r="1" fill="white"/>
      </svg>
    ),
    animClass: "anim-chat",
  },
  {
    title: "E-Channelling",
    desc: "Offer doctor bookings through your pharmacy, a new revenue stream with zero extra effort.",
    tag: "Booking",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="1.8"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <path className="icon-check" d="M8 15l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    animClass: "anim-check",
  },
  {
    title: "Medicine Delivery",
    desc: "Offer delivery from your pharmacy, orders come in via WhatsApp and your staff fulfils them.",
    tag: "Delivery",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="3" width="15" height="13" rx="1" stroke="white" strokeWidth="1.8"/>
        <path className="icon-truck" d="M16 8h4l3 3v5h-7V8z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="5.5" cy="18.5" r="2.5" stroke="white" strokeWidth="1.8"/>
        <circle cx="18.5" cy="18.5" r="2.5" stroke="white" strokeWidth="1.8"/>
      </svg>
    ),
    animClass: "anim-truck",
  },
  {
    title: "Refill Reminders",
    desc: "Automatically remind your customers when it's time to restock, keep them coming back.",
    tag: "SMS",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    animClass: "anim-bell",
  },
  {
    title: "Live Agent Support",
    desc: "Your staff can step into any WhatsApp conversation instantly when a customer needs help.",
    tag: "Support",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.8"/>
        <path className="icon-plus" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    animClass: "anim-pulse",
  },
  {
    title: "Role-Based Access",
    desc: "Admin, Pharmacist, Storekeeper, control who sees and does what across your entire team.",
    tag: "Security",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="1.8"/>
        <path className="icon-shackle" d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    animClass: "anim-lock",
  },
];

export default function Features() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".feat-reveal").forEach((el, i) =>
              setTimeout(() => el.classList.add("visible"), i * 80)
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" className="features-section reveal-up" ref={ref}>
      <div className="features-top-line" />

      <div className="features-inner">
        <div className="features-header feat-reveal">
          <div className="section-badge">
            <span className="badge-dot" />
            <span className="badge-text">Platform Features</span>
          </div>
          <h2 className="features-title">
            Everything your pharmacy needs.{" "}
            <span className="grad">Nothing missing.</span>
          </h2>
          <p className="features-sub">
            From AI stock tracking to WhatsApp ordering, one fully automated platform built for Sri Lankan pharmacies.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`feat-card feat-reveal ${f.animClass}`}
              style={{ transitionDelay: `${i * 0.055}s` }}
            >
              <div className="feat-tag">{f.tag}</div>
              <div className="feat-icon-wrap">
                {f.icon}
              </div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}