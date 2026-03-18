"use client";
import { useState } from "react";
import { Doctor, OtherHospital } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { TIME_SLOTS } from "../../data/mockData";
import Badge from "../ui/Badge";
import TimeSlots from "./TimeSlots";

interface Props {
  doctor: Doctor;
  selectedSlot: string;
  onSelectSlot: (time: string) => void;
  selectedHospital: string;
  onSelectHospital: (hospital: string) => void;
  onBook: () => void;
  onBack: () => void;
}

export default function DoctorDetail({
  doctor, selectedSlot, onSelectSlot,
  selectedHospital, onSelectHospital,
  onBook, onBack,
}: Props) {
  const [activeHospital, setActiveHospital] = useState<"main" | OtherHospital>("main");

  const currentHospital = activeHospital === "main" ? doctor.hospital : activeHospital.name;
  const currentSlots    = activeHospital === "main" ? TIME_SLOTS : activeHospital.timeSlots;
  const currentHours    = activeHospital === "main" ? "Today" : activeHospital.hours;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Doctor hero card */}
      <div className="glass animate-fade-up" style={{
        padding: "28px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 180, height: 180, borderRadius: "50%",
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
                }} />
                Available Today
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              <Badge variant="blue">{doctor.specialization}</Badge>
            </div>
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

      {/* Location selector */}
      <div className="glass animate-fade-up-1" style={{ padding: "18px 24px" }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: "#475569",
          letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14,
        }}>
          Select Location
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Main hospital */}
          <button
            onClick={() => {
              setActiveHospital("main");
              onSelectSlot("");
              onSelectHospital(doctor.hospital);
            }}
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px", borderRadius: 12,
              cursor: "pointer", transition: "all 0.2s",
              background: activeHospital === "main"
                ? "rgba(14,165,233,0.08)" : "rgba(6,13,26,0.5)",
              border: activeHospital === "main"
                ? "1px solid rgba(14,165,233,0.25)"
                : "1px solid rgba(148,163,184,0.07)",
              textAlign: "left" as const,
              width: "100%",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13, marginBottom: 3 }}>
                {doctor.hospital}
              </p>
              <p style={{ color: "#475569", fontSize: 12 }}>
                Main location · Today
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {activeHospital === "main" && (
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#38bdf8", flexShrink: 0,
                }} />
              )}
              <Badge variant="blue">Available</Badge>
            </div>
          </button>

          {/* Other hospitals */}
          {doctor.otherHospitals.map(h => {
            const isActive = activeHospital !== "main" && activeHospital.name === h.name;
            return (
              <button
                key={h.name}
                onClick={() => {
                  setActiveHospital(h);
                  onSelectSlot("");
                  onSelectHospital(h.name);
                }}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 12,
                  cursor: "pointer", transition: "all 0.2s",
                  background: isActive
                    ? "rgba(14,165,233,0.08)" : "rgba(6,13,26,0.5)",
                  border: isActive
                    ? "1px solid rgba(14,165,233,0.25)"
                    : "1px solid rgba(148,163,184,0.07)",
                  textAlign: "left" as const,
                  width: "100%",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13, marginBottom: 3 }}>
                    {h.name}
                  </p>
                  <p style={{ color: "#475569", fontSize: 12 }}>
                    {h.days} · {h.hours}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isActive && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#38bdf8", flexShrink: 0,
                    }} />
                  )}
                  <Badge variant="slate">Other Location</Badge>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <TimeSlots
        slots={currentSlots}
        selected={selectedSlot}
        onSelect={onSelectSlot}
        onBook={onBook}
        hospital={currentHospital}
        hours={currentHours}
      />
    </div>
  );
}