"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDoctors, deleteDoctor, Doctor } from "../routes/channelingRoutes";

export default function ChannellingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete Dr. ${name}? This will also delete all their slots.`)) return;
    setDeleting(id);
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 6 }}>
            E-Channelling
          </h1>
          <p style={{ fontSize: 14, color: "#475569" }}>
            Manage doctors and time slots for the patient booking portal.
          </p>
        </div>
        <Link href="/channelling/add" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 10,
          background: "linear-gradient(90deg, #0369a1, #4f46e5)",
          color: "#fff", fontSize: 14, fontWeight: 600,
          textDecoration: "none", transition: "opacity 0.2s",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Doctor
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div style={{ color: "#475569", fontSize: 14 }}>Loading doctors...</div>
      )}
      {error && (
        <div style={{ color: "#f87171", fontSize: 14, padding: "12px 16px", background: "rgba(248,113,113,0.08)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {doctors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#334155" }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No doctors added yet.</p>
              <p style={{ fontSize: 13 }}>Click "Add Doctor" to get started.</p>
            </div>
          ) : (
            <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 16, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 80px 100px 120px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(148,163,184,0.07)", background: "rgba(255,255,255,0.02)" }}>
                {["Doctor", "Specialization", "Hospital", "Fee", "Status", "Actions"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {doctors.map((d, i) => (
                <div key={d.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 80px 100px 120px",
                  gap: 12, padding: "16px 20px", alignItems: "center",
                  borderBottom: i < doctors.length - 1 ? "1px solid rgba(148,163,184,0.05)" : "none",
                  transition: "background 0.15s",
                }}>
                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #38bdf8, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {d.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{d.name}</p>
                      {d.experience && <p style={{ fontSize: 11, color: "#334155", margin: 0 }}>{d.experience}</p>}
                    </div>
                  </div>

                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{d.specialization}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{d.hospital}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>Rs. {d.fee.toLocaleString()}</span>

                  {/* Status */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 600,
                    color: d.available ? "#4ade80" : "#f87171",
                    background: d.available ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                    border: `1px solid ${d.available ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                    padding: "3px 10px", borderRadius: 99,
                    width: "fit-content",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: d.available ? "#4ade80" : "#f87171" }} />
                    {d.available ? "Active" : "Inactive"}
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/channelling/${d.id}/slots`} style={{
                      padding: "5px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                      background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
                      color: "#38bdf8", textDecoration: "none",
                    }}>
                      Slots
                    </Link>
                    <button
                      onClick={() => handleDelete(d.id, d.name)}
                      disabled={deleting === d.id}
                      style={{
                        padding: "5px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                        background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                        color: "#f87171", cursor: "pointer",
                        opacity: deleting === d.id ? 0.5 : 1,
                      }}
                    >
                      {deleting === d.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}