"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDoctors, deleteDoctor, updateDoctor, getChannellingSettings, updateChannellingSettings, Doctor, DoctorPayload } from "../routes/channelingRoutes";

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
  border: "1px solid rgba(148,163,184,0.12)", borderRadius: 8,
  padding: "9px 12px", color: "#f1f5f9", fontSize: 13,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

export default function ChannellingPage() {
  const [doctors, setDoctors]   = useState<Doctor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch]     = useState("");
  const [filterSpec, setFilterSpec] = useState("");

  const [editDoctor, setEditDoctor]   = useState<Doctor | null>(null);
  const [editForm, setEditForm]       = useState<DoctorPayload | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState("");

  // Service charge state — inside component
  const [serviceCharge, setServiceCharge]           = useState<number>(0);
  const [serviceChargeInput, setServiceChargeInput] = useState<string>("");
  const [savingCharge, setSavingCharge]             = useState(false);
  const [chargeSuccess, setChargeSuccess]           = useState(false);
  const [chargeError, setChargeError]               = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      setDoctors(await getDoctors());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    // Load service charge
    getChannellingSettings()
      .then(d => {
        setServiceCharge(d.channelling_service_charge);
        setServiceChargeInput(String(d.channelling_service_charge || ""));
      })
      .catch(() => {});
  }, []);

  const handleSaveCharge = async () => {
    const amount = parseFloat(serviceChargeInput);
    if (isNaN(amount) || amount < 0) { setChargeError("Enter a valid amount."); return; }
    setSavingCharge(true); setChargeError(""); setChargeSuccess(false);
    try {
      const result = await updateChannellingSettings(amount);
      setServiceCharge(result.channelling_service_charge);
      setChargeSuccess(true);
      setTimeout(() => setChargeSuccess(false), 3000);
    } catch (e: any) { setChargeError(e.message); }
    finally { setSavingCharge(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete Dr. ${name}? This will also remove all their time slots.`)) return;
    setDeleting(id);
    try {
      await deleteDoctor(id);
      setDoctors(p => p.filter(d => d.id !== id));
    } catch (e: any) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const openEdit = (d: Doctor) => {
    setEditDoctor(d);
    setEditForm({
      name: d.name, specialization: d.specialization, hospital: d.hospital,
      fee: d.fee, experience: d.experience, qualifications: d.qualifications,
      available: d.available, initials: d.initials,
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editDoctor || !editForm) return;
    if (!editForm.name || !editForm.specialization || !editForm.hospital || !editForm.fee) {
      setEditError("Please fill in all required fields."); return;
    }
    setEditLoading(true); setEditError("");
    try {
      const updated = await updateDoctor(editDoctor.id, editForm);
      setDoctors(p => p.map(d => d.id === editDoctor.id ? updated : d));
      setEditDoctor(null); setEditForm(null);
    } catch (e: any) { setEditError(e.message); }
    finally { setEditLoading(false); }
  };

  const filtered = doctors.filter(d => {
    const matchSearch = (d.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                        (d.hospital?.toLowerCase() || "").includes(search.toLowerCase());
    const matchSpec = filterSpec ? d.specialization === filterSpec : true;
    return matchSearch && matchSpec;
  });

  const stats = {
    total:    doctors.length,
    active:   doctors.filter(d => d.available).length,
    inactive: doctors.filter(d => !d.available).length,
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>E-Channelling</h1>
          <p style={{ fontSize: 13, color: "#475569" }}>Manage doctors and time slots for the patient booking portal.</p>
        </div>
        <Link href="/channeling/add" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Doctor
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Doctors", value: stats.total,    color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.15)"  },
          { label: "Active",        value: stats.active,   color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.15)"  },
          { label: "Inactive",      value: stats.inactive, color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.15)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* E-Channelling Service Charge */}
      <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>E-Channelling Service Charge</p>
            <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
              Fee charged to patients when booking an appointment. Currently&nbsp;
              <strong style={{ color: "#38bdf8" }}>Rs. {serviceCharge.toLocaleString()}</strong>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }}>Rs.</span>
              <input
                type="number"
                min="0"
                placeholder="150"
                value={serviceChargeInput}
                onChange={e => { setServiceChargeInput(e.target.value); setChargeError(""); setChargeSuccess(false); }}
                style={{ ...inp, width: 140, paddingLeft: 36 }}
              />
            </div>
            <button
              onClick={handleSaveCharge}
              disabled={savingCharge || serviceChargeInput === String(serviceCharge)}
              style={{
                padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: chargeSuccess ? "rgba(74,222,128,0.15)" : "linear-gradient(90deg, #0369a1, #4f46e5)",
                color: chargeSuccess ? "#4ade80" : "#fff",
                opacity: (savingCharge || serviceChargeInput === String(serviceCharge)) ? 0.5 : 1,
                transition: "all 0.2s",
              }}
            >
              {savingCharge ? "Saving..." : chargeSuccess ? "✓ Saved" : "Update"}
            </button>
          </div>
        </div>
        {chargeError && <p style={{ color: "#f87171", fontSize: 12, margin: "8px 0 0" }}>{chargeError}</p>}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Search doctors or hospitals..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 36 }} />
        </div>
        <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} style={{ ...inp, width: 200, cursor: "pointer" }}>
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterSpec) && (
          <button onClick={() => { setSearch(""); setFilterSpec(""); }} style={{ padding: "9px 14px", borderRadius: 8, background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)", color: "#64748b", fontSize: 13, cursor: "pointer" }}>Clear</button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: "#f87171", fontSize: 13, padding: "12px 16px", background: "rgba(248,113,113,0.08)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {error}
          <button onClick={load} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 68, borderRadius: 12, background: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.07)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.06), transparent)", animation: "shimmer 1.5s infinite" }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>👨‍⚕️</div>
          <p style={{ fontSize: 15, color: "#334155", marginBottom: 4 }}>{doctors.length === 0 ? "No doctors added yet." : "No doctors match your search."}</p>
          <p style={{ fontSize: 13, color: "#1e293b" }}>{doctors.length === 0 ? 'Click "Add Doctor" to get started.' : "Try clearing your filters."}</p>
        </div>
      )}

      {/* Doctor table */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.6fr 90px 100px 160px", gap: 12, padding: "11px 20px", borderBottom: "1px solid rgba(148,163,184,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {["Doctor","Specialization","Hospital","Fee","Status","Actions"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>
            ))}
          </div>
          {filtered.map((d, i) => (
            <div key={d.id}
              style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.6fr 90px 100px 160px", gap: 12, padding: "14px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(148,163,184,0.05)" : "none", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0369a1, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {d.initials || d.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{d.name}</p>
                  {d.experience && <p style={{ fontSize: 11, color: "#334155", margin: 0 }}>{d.experience}</p>}
                </div>
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{d.specialization}</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{d.hospital}</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Rs. {d.fee.toLocaleString()}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: d.available ? "#4ade80" : "#f87171", background: d.available ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${d.available ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, padding: "3px 10px", borderRadius: 99, width: "fit-content" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: d.available ? "#4ade80" : "#f87171" }} />
                {d.available ? "Active" : "Inactive"}
              </span>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => openEdit(d)} style={{ padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 600, background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)", color: "#94a3b8", cursor: "pointer" }}>Edit</button>
                <Link href={`/channeling/${d.id}/slots`} style={{ padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 600, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", textDecoration: "none" }}>Slots</Link>
                <button onClick={() => handleDelete(d.id, d.name)} disabled={deleting === d.id} style={{ padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 600, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", cursor: "pointer", opacity: deleting === d.id ? 0.5 : 1 }}>
                  {deleting === d.id ? "..." : "Del"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editDoctor && editForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
          <div style={{ background: "#0a1628", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Edit Doctor</h2>
              <button onClick={() => { setEditDoctor(null); setEditForm(null); }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Full Name *",              key: "name",           type: "text",   placeholder: "Dr. Ayesha Perera" },
                { label: "Consultation Fee (LKR) *", key: "fee",            type: "number", placeholder: "2500" },
                { label: "Experience",               key: "experience",     type: "text",   placeholder: "10+ years" },
                { label: "Qualifications",           key: "qualifications", type: "text",   placeholder: "MBBS, MD" },
                { label: "Initials",                 key: "initials",       type: "text",   placeholder: "AP" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(editForm as any)[f.key] ?? ""}
                    onChange={e => setEditForm(p => ({ ...p!, [f.key]: f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                    style={inp} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Specialization *</label>
                <select value={editForm.specialization} onChange={e => setEditForm(p => ({ ...p!, specialization: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Select</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Main Hospital *</label>
                <select value={editForm.hospital} onChange={e => setEditForm(p => ({ ...p!, hospital: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  <option value="">Select</option>
                  {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(148,163,184,0.07)" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Available for booking</p>
                  <p style={{ fontSize: 11, color: "#334155", margin: "2px 0 0" }}>Patients can book this doctor</p>
                </div>
                <button onClick={() => setEditForm(p => ({ ...p!, available: !p!.available }))}
                  style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: editForm.available ? "#0369a1" : "rgba(148,163,184,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: editForm.available ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </button>
              </div>
              {editError && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 12 }}>{editError}</div>}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={() => { setEditDoctor(null); setEditForm(null); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleEditSave} disabled={editLoading} style={{ flex: 2, padding: "10px 0", borderRadius: 10, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: editLoading ? 0.6 : 1 }}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}