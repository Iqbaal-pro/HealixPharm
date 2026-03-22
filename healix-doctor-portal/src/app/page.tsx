"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchDoctors } from "../lib/api";

export default function HomePage() {
  const [doctorCount, setDoctorCount]   = useState<number | null>(null);
  const [hospitalCount, setHospitalCount] = useState<number | null>(null);

  useEffect(() => {
    fetchDoctors({}).then(doctors => {
      setDoctorCount(doctors.length);
      const uniqueHospitals = new Set(doctors.map(d => d.hospital));
      setHospitalCount(uniqueHospitals.size);
    }).catch(() => {});
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "90vh",
      padding: "0 24px", textAlign: "center",
    }}>

      {/* Eyebrow badge */}
      <div className="animate-fade-up" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 16px", borderRadius: 99,
        border: "1px solid rgba(14,165,233,0.15)",
        background: "rgba(14,165,233,0.05)",
        marginBottom: 32, fontSize: 12, fontWeight: 500,
        color: "#7dd3fc", letterSpacing: 0.5,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
        eChannelling Portal
      </div>

      {/* Heading */}
      <h1 className="animate-fade-up-1" style={{
        fontFamily: "Syne, sans-serif",
        fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
        fontWeight: 800, lineHeight: 1.1,
        color: "#f1f5f9", letterSpacing: -1.5,
        marginBottom: 20, maxWidth: 600,
      }}>
        Book a Doctor,{" "}
        <span style={{ background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Instantly.
        </span>
      </h1>

      {/* Subtext */}
      <p className="animate-fade-up-2" style={{ color: "#a9b1bd", fontSize: 16, lineHeight: 1.8, maxWidth: 380, marginBottom: 40 }}>
        Search specialists, pick a time slot and confirm your appointment
      </p>

      {/* CTA */}
      <div className="animate-fade-up-3" style={{ marginBottom: 56 }}>
        <Link href="/channel" className="btn-glow" style={{ padding: "13px 34px", fontSize: 15, textDecoration: "none", display: "inline-block", borderRadius: 10 }}>
          Find a Doctor
        </Link>
      </div>

      {/* EKG pulse line */}
      <div className="animate-fade-up-4" style={{ width: "100%", maxWidth: 500, marginBottom: 48, position: "relative" }}>
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 60, display: "block" }}>
          <path
            className="ekg-line"
            d="M0,30 L80,30 L100,30 L115,10 L125,50 L135,15 L145,30 L165,30 L180,30 L195,30 L210,10 L220,50 L230,15 L240,30 L260,30 L280,30 L295,10 L305,50 L315,15 L325,30 L345,30 L500,30"
            stroke="url(#ekgGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="ekgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0"/>
              <stop offset="20%"  stopColor="#38bdf8" stopOpacity="1"/>
              <stop offset="80%"  stopColor="#818cf8" stopOpacity="1"/>
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stats — now real data */}
      <div className="animate-fade-up-4" style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {[
          { value: doctorCount !== null ? String(doctorCount)   : "...", label: "Doctors"   },
          { value: hospitalCount !== null ? String(hospitalCount) : "...", label: "Hospitals" },
          { value: "24/7", label: "Booking" },
        ].map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", padding: "0 32px" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ color: "#b4bbc6", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
            {i < 2 && <div style={{ width: 1, height: 32, background: "rgba(148,163,184,0.1)" }} />}
          </div>
        ))}
      </div>

    </div>
  );
}