"use client";
import { TimeSlot } from "../../types";
import Button from "../ui/Button";

interface Props {
  slots: TimeSlot[];
  loading: boolean;
  error: string;
  selected: string;
  onSelect: (time: string, id: number) => void;
  onBook: () => void;
  hospital: string;
  hours: string;
  date: string;
}

export default function TimeSlots({ slots, loading, error, selected, onSelect, onBook, hospital, hours, date }: Props) {
  const available = slots.filter(s => !s.booked).length;

  if (loading) {
    return (
      <div className="glass animate-fade-up-2" style={{ padding: "24px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Time Slots</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 42, borderRadius: 10, background: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.06)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.07), transparent)", animation: "shimmer 1.5s infinite" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="glass animate-fade-up-2" style={{ padding: "24px" }}><p style={{ color: "#f87171", fontSize: 14 }}>{error}</p></div>;
  }

  if (slots.length === 0) {
    return (
      <div className="glass animate-fade-up-2" style={{ padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "#334155", fontSize: 15, marginBottom: 6 }}>No slots available</p>
        <p style={{ color: "#1e293b", fontSize: 13 }}>{hospital} has no slots on {new Date(date + "T00:00:00").toLocaleDateString("en-LK", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
    );
  }

  return (
    <div className="glass animate-fade-up-2" style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>Time Slots</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: available > 0 ? "rgba(14,165,233,0.06)" : "rgba(148,163,184,0.06)", border: `1px solid ${available > 0 ? "rgba(14,165,233,0.15)" : "rgba(148,163,184,0.1)"}`, fontSize: 11, fontWeight: 500, color: available > 0 ? "#7dd3fc" : "#475569" }}>
          {available > 0 ? `${available} slots left` : "Fully booked"}
        </div>
      </div>
      <p style={{ color: "#334155", fontSize: 12, marginBottom: 16 }}>{hospital} · {hours}</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {[
          { color: "rgba(14,165,233,0.15)", border: "rgba(14,165,233,0.3)", label: "Available" },
          { color: "rgba(148,163,184,0.04)", border: "rgba(148,163,184,0.06)", label: "Booked" },
          { color: "linear-gradient(135deg, #0369a1, #0e7ab5)", border: "transparent", label: "Selected" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, border: `1px solid ${l.border}`, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#334155" }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginBottom: 20 }}>
        {slots.map(slot => {
          const isSelected = selected === slot.time;
          return (
            <button key={slot.id} disabled={slot.booked} onClick={() => !slot.booked && onSelect(slot.time, slot.id)}
              style={{ padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: slot.booked ? "not-allowed" : "pointer", transition: "all 0.15s", border: isSelected ? "1px solid rgba(14,165,233,0.4)" : slot.booked ? "1px solid rgba(148,163,184,0.06)" : "1px solid rgba(14,165,233,0.15)", background: isSelected ? "linear-gradient(135deg, #0369a1, #0e7ab5)" : slot.booked ? "rgba(148,163,184,0.03)" : "rgba(14,165,233,0.06)", color: isSelected ? "#e0f2fe" : slot.booked ? "#1e293b" : "#7dd3fc", textDecoration: slot.booked ? "line-through" : "none", transform: isSelected ? "scale(1.03)" : "none", boxShadow: isSelected ? "0 4px 12px rgba(3,105,161,0.25)" : "none" }}>
              {slot.time}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="animate-scale-in" style={{ background: "rgba(3,105,161,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🕐</div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>Your Selected Time</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9", lineHeight: 1 }}>{selected}</p>
              <p style={{ color: "#475569", fontSize: 11, marginTop: 3 }}>{hospital}</p>
            </div>
          </div>
          <Button size="lg" onClick={onBook}>Book Now</Button>
        </div>
      )}
    </div>
  );
}