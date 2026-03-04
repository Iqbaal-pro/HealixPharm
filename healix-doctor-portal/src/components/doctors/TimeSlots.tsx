"use client";
import { TimeSlot } from "../../types";
import Button from "../ui/Button";

interface Props {
  slots: TimeSlot[];
  selected: string;
  onSelect: (time: string) => void;
  onBook: () => void;
}

export default function TimeSlots({ slots, selected, onSelect, onBook }: Props) {
  const available = slots.filter(s => !s.booked).length;

  return (
    <div className="glass animate-fade-up-2" style={{ padding: "24px" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 20,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: "#475569",
          letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          Available Slots
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 99,
          background: "rgba(14,165,233,0.06)",
          border: "1px solid rgba(14,165,233,0.15)",
          fontSize: 11, fontWeight: 500, color: "#7dd3fc",
        }}>
          {available} slots left
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {[
          { color: "rgba(14,165,233,0.15)", border: "rgba(14,165,233,0.3)", label: "Available" },
          { color: "rgba(148,163,184,0.04)", border: "rgba(148,163,184,0.06)", label: "Booked" },
          { color: "linear-gradient(135deg, #0369a1, #0e7ab5)", border: "transparent", label: "Selected" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: l.color,
              border: `1px solid ${l.border}`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: "#334155" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Slot grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
        gap: 8, marginBottom: 20,
      }}>
        {slots.map(slot => {
          const isSelected = selected === slot.time;
          return (
            <button
              key={slot.time}
              disabled={slot.booked}
              onClick={() => !slot.booked && onSelect(slot.time)}
              style={{
                padding: "10px 6px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                cursor: slot.booked ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                border: isSelected
                  ? "1px solid rgba(14,165,233,0.4)"
                  : slot.booked
                  ? "1px solid rgba(148,163,184,0.06)"
                  : "1px solid rgba(14,165,233,0.15)",
                background: isSelected
                  ? "linear-gradient(135deg, #0369a1, #0e7ab5)"
                  : slot.booked
                  ? "rgba(148,163,184,0.03)"
                  : "rgba(14,165,233,0.06)",
                color: isSelected
                  ? "#e0f2fe"
                  : slot.booked
                  ? "#1e293b"
                  : "#7dd3fc",
                textDecoration: slot.booked ? "line-through" : "none",
                transform: isSelected ? "scale(1.03)" : "none",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(3,105,161,0.25)"
                  : "none",
              }}
              onMouseEnter={e => {
                if (!slot.booked && !isSelected) {
                  e.currentTarget.style.background = "rgba(14,165,233,0.12)";
                  e.currentTarget.style.borderColor = "rgba(14,165,233,0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                if (!slot.booked && !isSelected) {
                  e.currentTarget.style.background = "rgba(14,165,233,0.06)";
                  e.currentTarget.style.borderColor = "rgba(14,165,233,0.15)";
                  e.currentTarget.style.transform = "none";
                }
              }}
            >
              {slot.time}
            </button>
          );
        })}
      </div>

      {/* Selected slot confirmation */}
      {selected && (
        <div className="animate-scale-in" style={{
          background: "rgba(3,105,161,0.08)",
          border: "1px solid rgba(14,165,233,0.2)",
          borderRadius: 14, padding: "18px 20px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Clock icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              🕐
            </div>
            <div>
              <p style={{
                fontSize: 10, fontWeight: 600, color: "#475569",
                letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3,
              }}>
                Your Selected Time
              </p>
              <p style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: 20, color: "#f1f5f9", lineHeight: 1,
              }}>
                {selected}
              </p>
            </div>
          </div>
          <Button size="lg" onClick={onBook}>
            Book Now →
          </Button>
        </div>
      )}
    </div>
  );
}