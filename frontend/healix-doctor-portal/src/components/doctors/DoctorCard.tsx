"use client";
import { useState } from "react";
import { Doctor } from "../../types";
import { formatCurrency } from "../../lib/utils";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface Props {
  doctor: Doctor;
  onChannel: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onChannel }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="glass"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "all 0.2s",
        borderColor: hovered && doctor.available
          ? "rgba(14,165,233,0.25)" : "rgba(148,163,184,0.08)",
        transform: hovered && doctor.available ? "translateY(-1px)" : "none",
        boxShadow: hovered && doctor.available
          ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: hovered && doctor.available ? "#0369a1" : "#0c2340",
          border: "1px solid rgba(14,165,233,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#7dd3fc", fontWeight: 700, fontSize: 14,
          fontFamily: "Syne, sans-serif",
          transition: "background 0.3s", flexShrink: 0,
        }}>
          {doctor.initials}
        </div>
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 10, height: 10, borderRadius: "50%",
          background: doctor.available ? "#4ade80" : "#ef4444",
          border: "2px solid #060d1a",
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700,
          color: "#f1f5f9", fontSize: 14,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {doctor.name}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          <Badge variant="blue">{doctor.specialization}</Badge>
          <Badge variant="slate">{doctor.hospital}</Badge>
        </div>
      </div>

      {/* Right */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: 8, flexShrink: 0,
      }}>
        <div style={{ textAlign: "right" }}>
          <p style={{
            color: "#475569", fontSize: 10, fontWeight: 500,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 2,
          }}>
            Consultation
          </p>
          <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>
            {formatCurrency(doctor.fee)}
          </p>
        </div>
        {doctor.available ? (
          <Button variant="primary" size="sm" onClick={() => onChannel(doctor)}>
            Channel
          </Button>
        ) : (
          <button disabled style={{
            padding: "6px 14px", borderRadius: 10,
            fontSize: 12, fontWeight: 600,
            fontFamily: "DM Sans, sans-serif",
            cursor: "not-allowed",
            background: "rgba(148,163,184,0.05)",
            border: "1px solid rgba(148,163,184,0.1)",
            color: "#2d3f55",
          }}>
            Fully Booked
          </button>
        )}
      </div>
    </div>
  );
}