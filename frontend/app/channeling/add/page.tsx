"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoctor, DoctorPayload } from "../../routes/channelingRoutes";

const SPECIALIZATIONS = [
  "General Practitioner", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Gynecologist",
  "Ophthalmologist", "ENT Specialist", "Diabetologist", "Urologist",
];

const HOSPITALS = [
  "Colombo National Hospital", "Lanka Hospital", "Asiri Medical",
  "Nawaloka Hospital", "Durdans Hospital", "Hemas Hospital",
  "Central Hospital", "Ninewells Hospital",
];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(6,13,26,0.9)",
  border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10,
  padding: "11px 14px", color: "#f1f5f9", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.08em",
  display: "block", marginBottom: 6,
};

export default function AddDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<DoctorPayload>({
    name: "", specialization: "", hospital: "",
    fee: 0, experience: "", qualifications: "",
    available: true, initials: "",
  });

  const set = (key: keyof DoctorPayload, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.specialization || !form.hospital || !form.fee) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addDoctor(form);
      router.push("/channelling");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 6 }}>Add Doctor</h1>
        <p style={{ fontSize: 14, color: "#475569" }}>This doctor will appear in the patient booking portal.</p>
      </div>

      {/* Form */}
      <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Name */}
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} placeholder="Dr. Ayesha Perera" value={form.name} onChange={e => set("name", e.target.value)} />
        </div>

        {/* Specialization */}
        <div>
          <label style={labelStyle}>Specialization *</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.specialization} onChange={e => set("specialization", e.target.value)}>
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Hospital */}
        <div>
          <label style={labelStyle}>Main Hospital *</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.hospital} onChange={e => set("hospital", e.target.value)}>
            <option value="">Select hospital</option>
            {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        {/* Fee */}
        <div>
          <label style={labelStyle}>Consultation Fee (LKR) *</label>
          <input style={inputStyle} type="number" placeholder="2500" value={form.fee || ""} onChange={e => set("fee", parseFloat(e.target.value) || 0)} />
        </div>

        {/* Experience */}
        <div>
          <label style={labelStyle}>Experience</label>
          <input style={inputStyle} placeholder="10+ years" value={form.experience} onChange={e => set("experience", e.target.value)} />
        </div>

        {/* Qualifications */}
        <div>
          <label style={labelStyle}>Qualifications</label>
          <input style={inputStyle} placeholder="MBBS, MD (Cardiology)" value={form.qualifications} onChange={e => set("qualifications", e.target.value)} />
        </div>

        {/* Initials */}
        <div>
          <label style={labelStyle}>Initials</label>
          <input style={inputStyle} placeholder="AP" maxLength={3} value={form.initials} onChange={e => set("initials", e.target.value.toUpperCase())} />
          <p style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>Shown as avatar if no photo. Leave blank to auto-generate.</p>
        </div>

        {/* Available toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(148,163,184,0.07)" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Available for booking</p>
            <p style={{ fontSize: 12, color: "#334155", margin: "2px 0 0" }}>Patients can book this doctor if enabled</p>
          </div>
          <button
            onClick={() => set("available", !form.available)}
            style={{
              width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
              background: form.available ? "#0369a1" : "rgba(148,163,184,0.15)",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: form.available ? 23 : 3,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button onClick={() => router.back()} style={{ flex: 1, padding: "11px 0", borderRadius: 10, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "11px 0", borderRadius: 10, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Adding..." : "Add Doctor"}
          </button>
        </div>

      </div>
    </div>
  );
}