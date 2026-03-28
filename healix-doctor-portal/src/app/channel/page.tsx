"use client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import SearchFilters from "../../components/doctors/SearchFilters";
import { SearchFilters as ISearchFilters } from "../../types";

function ChannelContent() {
  const router = useRouter();

  const handleSearch = (filters: ISearchFilters) => {
    const params = new URLSearchParams();
    if (filters.specialization) params.set("spec",     filters.specialization);
    if (filters.hospital)       params.set("hospital", filters.hospital);
    if (filters.doctorName)     params.set("name",     filters.doctorName);
    if (filters.date)           params.set("date",     filters.date);
    router.push(`/channel/results?${params.toString()}`);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
      <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 16px", borderRadius: 99,
          border: "1px solid rgba(14,165,233,0.15)",
          background: "rgba(14,165,233,0.05)",
          marginBottom: 20, fontSize: 12, fontWeight: 500,
          color: "#7dd3fc", letterSpacing: 0.5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          Find a Doctor
        </div>
        <h1 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: 28, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 10,
        }}>
          Search for a Doctor
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
          Filter by specialization, hospital, or name to find the right doctor.
        </p>
      </div>
      <SearchFilters onSearch={handleSearch} />
    </div>
  );
}

export default function ChannelPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "#475569", fontSize: 13 }}>Loading...</div>
      </div>
    }>
      <ChannelContent />
    </Suspense>
  );
}