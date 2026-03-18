"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchFilters as ISearchFilters } from "../../types";
import SearchFilters from "../../components/doctors/SearchFilters";

export default function ChannelPage() {
  const router = useRouter();

  const handleSearch = (filters: ISearchFilters) => {
    const params = new URLSearchParams();
    if (filters.specialization) params.set("spec", filters.specialization);
    if (filters.hospital)       params.set("hospital", filters.hospital);
    if (filters.date)           params.set("date", filters.date);
    if (filters.doctorName)     params.set("name", filters.doctorName);
    router.push(`/channel/results?${params.toString()}`);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
      {/* Hero */}
      <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
        <div className="badge-shimmer animate-fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 18px", borderRadius: 99,
          border: "1px solid rgba(56,189,248,0.2)",
          marginBottom: 24, fontSize: 12, fontWeight: 600,
          color: "#38bdf8", letterSpacing: 0.5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
          Real-time availability
        </div>

        <h1 className="animate-fade-up-1" style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "#f1f5f9", marginBottom: 14,
        }}>
          Book a Doctor{" "}
          <span style={{
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Appointment
          </span>
        </h1>
        <p className="animate-fade-up-2" style={{ color: "#64748b", fontSize: 15, maxWidth: 420, margin: "0 auto" }}>
          Search by specialization, hospital, date or doctor name. Get instant WhatsApp confirmation.
        </p>
      </div>

      <div className="animate-fade-up-3">
        <SearchFilters onSearch={handleSearch} />
      </div>
    </div>
  );
}