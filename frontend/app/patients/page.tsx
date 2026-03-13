"use client";
import { useState, useEffect } from "react";
import { getPatients, createPatient, updateConsent, type Patient } from "../routes/patientRoutes";

export default function PatientsPage() {
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState("");
  const [form, setForm]               = useState({ name: "", phone_number: "", language: "en", consent: false });
  const [togglingId, setTogglingId]   = useState<number | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try { setPatients(await getPatients()); }
    catch { setPatients([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.phone_number.trim()) { setMsg("Name and phone are required."); return; }
    setSaving(true); setMsg("");
    try {
      await createPatient(form);
      setMsg("✓ Patient created.");
      setForm({ name: "", phone_number: "", language: "en", consent: false });
      setShowForm(false);
      fetchPatients();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed to create patient"); }
    finally { setSaving(false); }
  };

  const handleConsent = async (patient: Patient) => {
    setTogglingId(patient.id);
    try { await updateConsent(patient.id, !patient.consent); fetchPatients(); }
    catch { setMsg("Failed to update consent."); }
    finally { setTogglingId(null); }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone_number.includes(search)
  );

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="page-icon" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.22)", fontSize: 22, boxShadow: "0 0 18px rgba(74,222,128,0.1)" }}>👤</div>
          <div>
            <h1 className="page-title gradient-text">Patients</h1>
            <p className="page-sub">Manage patients and SMS reminder consent</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(s => !s); setMsg(""); }}>
          {showForm ? "✕ Cancel" : "+ New Patient"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-panel fade-2 mb-24" style={{ padding: 24 }}>
          <h2 className="panel-title" style={{ marginBottom: 18 }}>New Patient</h2>
          <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
            <div>
              <div className="field-label">Full Name</div>
              <input className="input-field" placeholder="Patient name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Phone Number</div>
              <input className="input-field" placeholder="+94XXXXXXXXX" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Language</div>
              <select className="input-field" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="consent" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} />
              <label htmlFor="consent" style={{ color: "#cbd5e1", fontSize: 13.5, cursor: "pointer" }}>Patient gives SMS consent</label>
            </div>
          </div>
          {msg && <div className={`msg-box mb-14 ${msg.startsWith("✓") ? "msg-box-success" : "msg-box-error"}`}>{msg}</div>}
          <button className="btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? <><span className="spinner" />Saving…</> : "Save Patient"}
          </button>
        </div>
      )}

      {msg && !showForm && <div className={`msg-box fade-2 mb-20 ${msg.startsWith("✓") ? "msg-box-success" : "msg-box-error"}`}>{msg}</div>}

      {/* Table */}
      <div className="glass-panel fade-3">
        <div className="toolbar">
          <div className="search-wrap search-flex">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="input-field search-sm" placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="count-label">{filtered.length} patients</span>
        </div>

        {loading
          ? <div className="loading-cell"><div className="spinner-lg" />Loading patients…</div>
          : filtered.length === 0
            ? <div className="loading-cell">{patients.length === 0 ? "No patients yet — add one above" : "No patients match your search"}</div>
            : (
              <div className="table-wrap">
                <table className="full-table">
                  <thead>
                    <tr className="thead-border">
                      {["ID", "Name", "Phone", "Language", "SMS Consent"].map(h => <th key={h} className="th">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="tr-hover tr-border">
                        <td className="td td-order-id">#{p.id}</td>
                        <td className="td" style={{ color: "#f1f5f9", fontWeight: 500 }}>{p.name}</td>
                        <td className="td td-phone-cell"><div className="td-phone">{p.phone_number}</div></td>
                        <td className="td"><span className="badge">{p.language.toUpperCase()}</span></td>
                        <td className="td">
                          <button
                            onClick={() => handleConsent(p)}
                            disabled={togglingId === p.id}
                            className={p.consent ? "btn-sm btn-sm-green" : "btn-sm"}
                            style={{ opacity: togglingId === p.id ? 0.5 : 1 }}
                          >
                            {togglingId === p.id ? "…" : p.consent ? "✓ Consented" : "No Consent"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
    </div>
  );
}