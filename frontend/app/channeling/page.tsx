"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDoctors, deleteDoctor, updateDoctor, getChannellingSettings, updateChannellingSettings, Doctor, DoctorPayload } from "../routes/channelingRoutes";
import { SPECIALIZATIONS, HOSPITALS } from "../routes/channelingConstants";

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(13,23,42,0.9)",
  border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10,
  padding: "10px 14px", color: "#f1f5f9", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

export default function ChannellingPage() {
  const [doctors, setDoctors]       = useState<Doctor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [search, setSearch]         = useState("");
  const [filterSpec, setFilterSpec] = useState("");

  const [editDoctor, setEditDoctor]   = useState<Doctor | null>(null);
  const [editForm, setEditForm]       = useState<DoctorPayload | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState("");

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
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.hospital.toLowerCase().includes(search.toLowerCase());
    const matchSpec   = filterSpec ? d.specialization === filterSpec : true;
    return matchSearch && matchSpec;
  });

  const stats = {
    total:    doctors.length,
    active:   doctors.filter(d => d.available).length,
    inactive: doctors.filter(d => !d.available).length,
  };

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      {/* Header */}
      <div className="fade-1 channelling-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)", boxShadow: "0 0 18px rgba(56,189,248,0.1)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M12 12v.01M8 12v.01M16 12v.01"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title gradient-text">E-Channelling</h1>
            <p className="page-sub">Manage doctors and time slots for the patient booking portal.</p>
          </div>
        </div>
        <Link href="/channeling/add" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Doctor
        </Link>
      </div>

      {/* Stats */}
      <div className="fade-2 channelling-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Doctors",    value: stats.total,    sub: "registered",    color: "#38bdf8" },
          { label: "Active",           value: stats.active,   sub: "available now", color: "#4ade80" },
          { label: "Inactive",         value: stats.inactive, sub: "unavailable",   color: "#f87171" },
          { label: "Service Charge",   value: `Rs. ${serviceCharge}`, sub: "per booking", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Service Charge Editor */}
      <div className="glass-panel fade-2 service-charge-row" style={{ padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>E-Channelling Service Charge</p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Fee charged to patients per appointment.&nbsp;
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>Currently Rs. {serviceCharge.toLocaleString()}</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }}>Rs.</span>
            <input type="number" min="0" placeholder="150" value={serviceChargeInput}
              onChange={e => { setServiceChargeInput(e.target.value); setChargeError(""); setChargeSuccess(false); }}
              className="input-field" style={{ width: 150, padding: "10px 14px 10px 40px" }} />
          </div>
          <button
            onClick={handleSaveCharge}
            disabled={savingCharge}
            className={chargeSuccess ? "btn-ghost" : "btn-primary"}
            style={{ whiteSpace: "nowrap", color: chargeSuccess ? "#4ade80" : undefined }}
          >
            {savingCharge ? <><span className="spinner" /> Saving…</> : chargeSuccess ? "✓ Saved" : "Update"}
          </button>
        </div>
        {chargeError && <p style={{ color: "#f87171", fontSize: 12, margin: 0, width: "100%" }}>{chargeError}</p>}
      </div>

      {/* Filters */}
      <div className="fade-3 channelling-filters" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="input-field" placeholder="Search doctors or hospitals..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)}
          className="input-field" style={{ width: 220, cursor: "pointer" }}>
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterSpec) && (
          <button className="btn-ghost" onClick={() => { setSearch(""); setFilterSpec(""); }}>Clear</button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="msg-box msg-box-error fade mb-20" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={load} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-panel fade-3">
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 60, borderBottom: "1px solid rgba(148,163,184,0.05)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)", animation: "shimmer 1.5s infinite" }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="glass-panel fade-3" style={{ textAlign: "center", padding: "56px 24px" }}>
          <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 4 }}>{doctors.length === 0 ? "No doctors added yet." : "No doctors match your search."}</p>
          <p style={{ fontSize: 13, color: "#475569" }}>{doctors.length === 0 ? 'Click "Add Doctor" to get started.' : "Try clearing your filters."}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="glass-panel fade-3 channelling-table-wrap">
          <table className="full-table">
            <thead>
              <tr className="thead-border">
                {["Doctor","Specialization","Hospital","Fee","Status","Actions"].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="tr-hover tr-border">
                  <td className="td">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#0369a1,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {d.initials || d.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", margin: 0 }}>{d.name}</p>
                        {d.experience && <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{d.experience}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="td" style={{ color: "#94a3b8" }}>{d.specialization}</td>
                  <td className="td" style={{ color: "#94a3b8" }}>{d.hospital}</td>
                  <td className="td" style={{ color: "#f1f5f9", fontWeight: 500 }}>Rs. {d.fee.toLocaleString()}</td>
                  <td className="td">
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                      color: d.available ? "#4ade80" : "#f87171",
                      background: d.available ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                    }}>
                      <span className="dot" style={{ background: d.available ? "#4ade80" : "#f87171" }} />
                      {d.available ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="td">
                    <div className="channelling-actions" style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(d)} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Edit</button>
                      <Link href={`/channeling/${d.id}/slots`} className="btn-action btn-action-blue" style={{ padding: "5px 12px", fontSize: 12, textDecoration: "none" }}>Slots</Link>
                      <button onClick={() => handleDelete(d.id, d.name)} disabled={deleting === d.id} className="btn-action btn-action-red" style={{ padding: "5px 12px", fontSize: 12, opacity: deleting === d.id ? 0.5 : 1 }}>
                        {deleting === d.id ? "…" : "Del"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editDoctor && editForm && (
        <div className="modal-overlay">
          <div className="glass-panel modal-inner" style={{ maxWidth: 560 }}>
            <div className="toolbar" style={{ marginBottom: 24 }}>
              <h2 className="panel-title">Edit Doctor</h2>
              <button onClick={() => { setEditDoctor(null); setEditForm(null); }} className="icon-btn">×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 4px" }}>
              {[
                { label: "Full Name *",              key: "name",           type: "text",   placeholder: "Dr. Ayesha Perera" },
                { label: "Consultation Fee (LKR) *", key: "fee",            type: "number", placeholder: "2500" },
                { label: "Experience",               key: "experience",     type: "text",   placeholder: "10+ years" },
                { label: "Qualifications",           key: "qualifications", type: "text",   placeholder: "MBBS, MD" },
                { label: "Initials",                 key: "initials",       type: "text",   placeholder: "AP" },
              ].map(f => (
                <div key={f.key}>
                  <label className="field-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(editForm as any)[f.key] ?? ""}
                    onChange={e => setEditForm(p => ({ ...p!, [f.key]: f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                    className="input-field" />
                </div>
              ))}
              <div>
                <label className="field-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>Specialization *</label>
                <select value={editForm.specialization} onChange={e => setEditForm(p => ({ ...p!, specialization: e.target.value }))} className="input-field" style={{ cursor: "pointer" }}>
                  <option value="">Select</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>Main Hospital *</label>
                <select value={editForm.hospital} onChange={e => setEditForm(p => ({ ...p!, hospital: e.target.value }))} className="input-field" style={{ cursor: "pointer" }}>
                  <option value="">Select</option>
                  {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(148,163,184,0.08)" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", margin: 0 }}>Available for booking</p>
                  <p style={{ fontSize: 12, color: "#475569", margin: "2px 0 0" }}>Patients can book this doctor</p>
                </div>
                <button onClick={() => setEditForm(p => ({ ...p!, available: !p!.available }))}
                  style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: editForm.available ? "#0369a1" : "rgba(148,163,184,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: editForm.available ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </button>
              </div>
              {editError && <div className="msg-box msg-box-error">{editError}</div>}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={() => { setEditDoctor(null); setEditForm(null); }} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleEditSave} disabled={editLoading} className="btn-primary" style={{ flex: 2 }}>
                  {editLoading ? <><span className="spinner" /> Saving…</> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}