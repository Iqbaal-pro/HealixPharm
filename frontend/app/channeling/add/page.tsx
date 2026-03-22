"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoctor, addOtherHospital, DoctorPayload } from "../../routes/channelingRoutes";

const SPECIALIZATIONS = [
  "General Practitioner","Cardiologist","Dermatologist","Neurologist",
  "Orthopedic Surgeon","Pediatrician","Psychiatrist","Gynecologist",
  "Ophthalmologist","ENT Specialist","Diabetologist","Urologist",
];

const HOSPITALS = [
  "Colombo National Hospital","Lanka Hospital","Asiri Medical",
  "Nawaloka Hospital","Durdans Hospital","Hemas Hospital",
  "Central Hospital","Ninewells Hospital",
];

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(6,13,26,0.9)",
  border: "1px solid rgba(148,163,184,0.12)", borderRadius: 10,
  padding: "11px 14px", color: "#f1f5f9", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.08em",
  display: "block", marginBottom: 6,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, paddingBottom: 14, borderBottom: "1px solid rgba(148,163,184,0.07)" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function AddDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [step, setStep]       = useState<"form" | "done">("form");
  const [newDoctorId, setNewDoctorId] = useState<number | null>(null);
  const [newDoctorName, setNewDoctorName] = useState("");

  const [form, setForm] = useState<DoctorPayload>({
    name: "", specialization: "", hospital: "",
    fee: 0, experience: "", qualifications: "",
    available: true, initials: "",
  });

  const [otherHospitals, setOtherHospitals] = useState<{ name: string; days: string; hours: string }[]>([]);
  const [ohForm, setOhForm]     = useState({ name: "", days: "", hours: "" });
  const [addingOh, setAddingOh] = useState(false);

  const set = (key: keyof DoctorPayload, value: any) => setForm(p => ({ ...p, [key]: value }));

  const addOh = () => {
    if (!ohForm.name) return;
    setOtherHospitals(p => [...p, { ...ohForm }]);
    setOhForm({ name: "", days: "", hours: "" });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.specialization || !form.hospital || !form.fee) {
      setError("Please fill in all required fields."); return;
    }
    setLoading(true); setError("");
    try {
      const doctor = await addDoctor(form);
      for (const oh of otherHospitals) {
        await addOtherHospital(doctor.id, oh);
      }
      setNewDoctorId(doctor.id);
      setNewDoctorName(doctor.name);
      setStep("done");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (step === "done" && newDoctorId) {
    return (
      <div style={{ padding: "32px 36px", maxWidth: 560 }}>
        <div style={{ textAlign: "center", padding: "48px 32px", background: "rgba(8,16,32,0.7)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Doctor Added</h2>
          <p style={{ color: "#475569", fontSize: 14, marginBottom: 28 }}>
            <strong style={{ color: "#e2e8f0" }}>{newDoctorName}</strong> is now visible in the patient booking portal.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {/* FIXED: single 'l' */}
            <button onClick={() => router.push(`/channeling/${newDoctorId}/slots`)}
              style={{ padding: "10px 20px", borderRadius: 10, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
              Add Time Slots
            </button>
            <button onClick={() => router.push("/channeling")}
              style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        {/* FIXED: single 'l' */}
        <button onClick={() => router.push("/channeling")} style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Doctors
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>Add Doctor</h1>
        <p style={{ fontSize: 13, color: "#475569" }}>This doctor will appear in the patient booking portal.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Section title="Basic Information">
          <div>
            <label style={lbl}>Full Name *</label>
            <input style={inp} placeholder="Dr. Ayesha Perera" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>Specialization *</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.specialization} onChange={e => set("specialization", e.target.value)}>
                <option value="">Select</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Consultation Fee (LKR) *</label>
              <input style={inp} type="number" placeholder="2500" value={form.fee || ""} onChange={e => set("fee", parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>Experience <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", fontSize: 10 }}>(optional)</span></label>
              <input style={inp} placeholder="10+ years" value={form.experience} onChange={e => set("experience", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Initials <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", fontSize: 10 }}>(optional)</span></label>
              <input style={inp} placeholder="AP" maxLength={3} value={form.initials} onChange={e => set("initials", e.target.value.toUpperCase())} />
            </div>
          </div>
          <div>
            <label style={lbl}>Qualifications <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", fontSize: 10 }}>(optional)</span></label>
            <input style={inp} placeholder="MBBS, MD (Cardiology)" value={form.qualifications} onChange={e => set("qualifications", e.target.value)} />
          </div>
        </Section>

        <Section title="Main Hospital">
          <div>
            <label style={lbl}>Hospital *</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.hospital} onChange={e => set("hospital", e.target.value)}>
              <option value="">Select hospital</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(148,163,184,0.07)" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Available for booking</p>
              <p style={{ fontSize: 11, color: "#334155", margin: "2px 0 0" }}>Patients can book this doctor if enabled</p>
            </div>
            <button onClick={() => set("available", !form.available)}
              style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: form.available ? "#0369a1" : "rgba(148,163,184,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 3, left: form.available ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </button>
          </div>
        </Section>

        <Section title="Other Hospitals (Optional)">
          <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>Add other hospitals where this doctor also practices.</p>
          {otherHospitals.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {otherHospitals.map((oh, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{oh.name}</p>
                    {(oh.days || oh.hours) && <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{[oh.days, oh.hours].filter(Boolean).join(" · ")}</p>}
                  </div>
                  <button onClick={() => setOtherHospitals(p => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          )}
          {addingOh ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(148,163,184,0.08)" }}>
              <select value={ohForm.name} onChange={e => setOhForm(p => ({ ...p, name: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Select hospital</option>
                {HOSPITALS.filter(h => h !== form.hospital && !otherHospitals.find(o => o.name === h)).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input style={inp} placeholder="Days (e.g. Mon, Wed)" value={ohForm.days} onChange={e => setOhForm(p => ({ ...p, days: e.target.value }))} />
                <input style={inp} placeholder="Hours (e.g. 5PM – 7PM)" value={ohForm.hours} onChange={e => setOhForm(p => ({ ...p, hours: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAddingOh(false); setOhForm({ name: "", days: "", hours: "" }); }} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "transparent", border: "1px solid rgba(148,163,184,0.1)", color: "#64748b", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { addOh(); setAddingOh(false); }} disabled={!ohForm.name} style={{ flex: 2, padding: "9px", borderRadius: 8, background: ohForm.name ? "rgba(56,189,248,0.1)" : "rgba(148,163,184,0.05)", border: `1px solid ${ohForm.name ? "rgba(56,189,248,0.2)" : "rgba(148,163,184,0.08)"}`, color: ohForm.name ? "#38bdf8" : "#334155", fontSize: 13, fontWeight: 600, cursor: ohForm.name ? "pointer" : "not-allowed" }}>Add Hospital</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingOh(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 8, background: "transparent", border: "1px dashed rgba(148,163,184,0.2)", color: "#475569", fontSize: 13, cursor: "pointer", width: "fit-content" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add another hospital
            </button>
          )}
        </Section>

        {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          {/* FIXED: single 'l' */}
          <button onClick={() => router.push("/channeling")} style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "12px 0", borderRadius: 10, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Adding..." : "Add Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}