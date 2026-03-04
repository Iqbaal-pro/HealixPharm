import { Doctor } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { TIME_SLOTS } from "../../data/mockData";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import TimeSlots from "./TimeSlots";

interface Props {
  doctor: Doctor;
  selectedSlot: string;
  onSelectSlot: (time: string) => void;
  onBook: () => void;
  onBack: () => void;
}

export default function DoctorDetail({ doctor, selectedSlot, onSelectSlot, onBook, onBack }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Doctor hero card */}
      <div className="glass animate-fade-up" style={{
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background accent */}
        <div style={{
          position: "absolute",
          top: -40, right: -40,
          width: 180, height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", position: "relative" }}>

          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg, #0c2340, #0369a1)",
            border: "1px solid rgba(14,165,233,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#7dd3fc", fontWeight: 800, fontSize: 20,
            fontFamily: "Syne, sans-serif",
            boxShadow: "0 4px 20px rgba(3,105,161,0.25)",
          }}>
            {doctor.initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: 18, color: "#f1f5f9",
              }}>
                {doctor.name}
              </h2>
              {/* Live availability pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 99,
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.2)",
                fontSize: 11, fontWeight: 600, color: "#4ade80",
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#4ade80", display: "inline-block",
                  animation: "pulse-ring 2s infinite",
                }} />
                Available Today
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              <Badge variant="blue">{doctor.specialization}</Badge>
              <Badge variant="slate">{doctor.hospital}</Badge>
            </div>

            <p style={{ color: "#475569", fontSize: 12 }}>
              {doctor.qualifications} · {doctor.experience}
            </p>
          </div>

          {/* Fee */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{
              color: "#475569", fontSize: 10, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase", marginBottom: 4,
            }}>
              Consultation
            </p>
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: 22, color: "#e2e8f0", lineHeight: 1,
            }}>
              {formatCurrency(doctor.fee)}
            </p>
          </div>
        </div>
      </div>

      {/* Time slots */}
      <TimeSlots
        slots={TIME_SLOTS}
        selected={selectedSlot}
        onSelect={onSelectSlot}
        onBook={onBook}
      />

      {/* Other hospitals */}
      {doctor.otherHospitals.length > 0 && (
        <div className="glass animate-fade-up-3" style={{ padding: "22px 24px" }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: "#475569",
            letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16,
          }}>
            Also Available At
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {doctor.otherHospitals.map(h => (
              <div key={h.name} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(6,13,26,0.5)",
                borderRadius: 10, padding: "12px 16px",
                border: "1px solid rgba(148,163,184,0.07)",
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 13 }}>{h.name}</p>
                  <p style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{h.days} · {h.hours}</p>
                </div>
                <Badge variant="slate">Other Location</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}