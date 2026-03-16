"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSlots, addSlot, deleteSlot, getDoctors, TimeSlot, Doctor } from "../../../routes/channelingRoutes";

const TIMES = [
  "08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM",
  "04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM","06:30 PM",
];

const HOSPITALS = [
  "Colombo National Hospital","Lanka Hospital","Asiri Medical",
  "Nawaloka Hospital","Durdans Hospital","Hemas Hospital",
  "Central Hospital","Ninewells Hospital",
];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(6,13,26,0.9)",
  border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10,
  padding: "10px 14px", color: "#f1f5f9", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.08em",
  display: "block", marginBottom: 6,
};

export default function SlotsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const doctorId = parseInt(id);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ hospital: "", date: "", time: "" });

  const load = async () => {
    try {
      setLoading(true);
      const [allDoctors, allSlots] = await Promise.all([
        getDoctors(),
        getSlots(doctorId),
      ]);
      setDoctor(allDoctors.find(d => d.id === doctorId) || null);
      setSlots(allSlots);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [doctorId]);

  const handleAdd = async () => {
    if (!form.hospital || !form.date || !form.time) {
      setError("Please fill in all fields.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      const slot = await addSlot(doctorId, form);
      setSlots(prev => [...prev, slot]);
      setForm({ hospital: "", date: "", time: "" });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (slotId: number) => {
    setDeleting(slotId);
    try {
      await deleteSlot(slotId);
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  // Group slots by date
  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => router.push("/channelling")} style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Doctors
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {doctor ? `${doctor.name} — Slots` : "Manage Slots"}
        </h1>
        {doctor && <p style={{ fontSize: 14, color: "#475569" }}>{doctor.specialization} · {doctor.hospital}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "start" }}>

        {/* Add slot form */}
        <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Add Time Slot</h3>

          <div>
            <label style={labelStyle}>Hospital *</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.hospital} onChange={e => setForm(p => ({ ...p, hospital: e.target.value }))}>
              <option value="">Select hospital</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Time *</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}>
              <option value="">Select time</option>
              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12 }}>
              {error}
            </div>
          )}

          <button onClick={handleAdd} disabled={adding} style={{ padding: "11px 0", borderRadius: 10, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", opacity: adding ? 0.6 : 1 }}>
            {adding ? "Adding..." : "Add Slot"}
          </button>
        </div>

        {/* Slots list */}
        <div>
          {loading && <p style={{ color: "#475569", fontSize: 14 }}>Loading slots...</p>}

          {!loading && slots.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#334155" }}>
              <p style={{ fontSize: 15 }}>No slots added yet.</p>
              <p style={{ fontSize: 13 }}>Add a slot using the form.</p>
            </div>
          )}

          {!loading && Object.keys(grouped).sort().map(date => (
            <div key={date} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                {new Date(date).toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {grouped[date].map(slot => (
                  <div key={slot.id} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 12px", borderRadius: 8,
                    background: slot.booked ? "rgba(248,113,113,0.06)" : "rgba(8,16,32,0.7)",
                    border: `1px solid ${slot.booked ? "rgba(248,113,113,0.2)" : "rgba(148,163,184,0.09)"}`,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: slot.booked ? "#f87171" : "#e2e8f0" }}>
                      {slot.time}
                    </span>
                    {slot.booked ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "2px 6px", borderRadius: 4 }}>BOOKED</span>
                    ) : (
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={deleting === slot.id}
                        style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}
                      >
                        {deleting === slot.id ? "..." : "×"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}