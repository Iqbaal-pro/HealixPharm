"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSlots, addSlot, deleteSlot, getDoctors, addOtherHospital, deleteOtherHospital, TimeSlot, Doctor } from "../../../routes/channelingRoutes";

const TIMES = [
  "08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM",
  "04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM","06:30 PM",
  "07:00 PM","07:30 PM","08:00 PM",
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

const lbl: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.08em",
  display: "block", marginBottom: 5,
};

export default function SlotsPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const doctorId = parseInt(id);

  const [doctor, setDoctor]   = useState<Doctor | null>(null);
  const [slots, setSlots]     = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [form, setForm]         = useState({ hospital: "", date: "", time: "" });
  const [adding, setAdding]     = useState(false);
  const [addError, setAddError] = useState("");

  const [bulkHospital, setBulkHospital] = useState("");
  const [bulkDate, setBulkDate]         = useState("");
  const [bulkTimes, setBulkTimes]       = useState<string[]>([]);
  const [bulkAdding, setBulkAdding]     = useState(false);
  const [bulkError, setBulkError]       = useState("");
  const [bulkTab, setBulkTab]           = useState<"single" | "bulk">("single");

  const [deleting, setDeleting]             = useState<number | null>(null);
  const [filterHospital, setFilterHospital] = useState("");
  const [filterDate, setFilterDate]         = useState("");

  const [ohForm, setOhForm]         = useState({ name: "", days: "", hours: "" });
  const [ohAdding, setOhAdding]     = useState(false);
  const [ohError, setOhError]       = useState("");
  const [ohDeleting, setOhDeleting] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError("");
      const [allDoctors, allSlots] = await Promise.all([getDoctors(), getSlots(doctorId)]);
      setDoctor(allDoctors.find(d => d.id === doctorId) || null);
      setSlots(allSlots);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [doctorId]);

  const handleAdd = async () => {
    if (!form.hospital || !form.date || !form.time) { setAddError("Please fill in all fields."); return; }
    setAdding(true); setAddError("");
    try {
      const slot = await addSlot(doctorId, form);
      setSlots(p => [...p, slot]);
      setForm(p => ({ ...p, time: "" }));
    } catch (e: any) { setAddError(e.message); }
    finally { setAdding(false); }
  };

  const handleBulkAdd = async () => {
    if (!bulkHospital || !bulkDate || bulkTimes.length === 0) { setBulkError("Select hospital, date and at least one time."); return; }
    setBulkAdding(true); setBulkError("");
    const results = await Promise.allSettled(
      bulkTimes.map(t => addSlot(doctorId, { hospital: bulkHospital, date: bulkDate, time: t }))
    );
    const added  = results.filter(r => r.status === "fulfilled").map(r => (r as PromiseFulfilledResult<TimeSlot>).value);
    const failed = results.filter(r => r.status === "rejected").length;
    setSlots(p => [...p, ...added]);
    setBulkTimes([]);
    if (failed > 0) setBulkError(`${failed} slot(s) failed to add.`);
    setBulkAdding(false);
  };

  const toggleBulkTime = (t: string) =>
    setBulkTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const handleDelete = async (slotId: number) => {
    setDeleting(slotId);
    try { await deleteSlot(slotId); setSlots(p => p.filter(s => s.id !== slotId)); }
    catch (e: any) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const handleAddOh = async () => {
    if (!ohForm.name) { setOhError("Please select a hospital."); return; }
    setOhAdding(true); setOhError("");
    try { await addOtherHospital(doctorId, ohForm); await load(); setOhForm({ name: "", days: "", hours: "" }); }
    catch (e: any) { setOhError(e.message); }
    finally { setOhAdding(false); }
  };

  const handleDeleteOh = async (ohId: number) => {
    setOhDeleting(ohId);
    try { await deleteOtherHospital(ohId); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setOhDeleting(null); }
  };

  const filtered = slots.filter(s => {
    if (filterHospital && s.hospital !== filterHospital) return false;
    if (filterDate && s.date !== filterDate) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, s) => {
    const key = `${s.date}__${s.hospital}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const usedTimes    = slots.filter(s => s.hospital === bulkHospital && s.date === bulkDate).map(s => s.time);
  const allHospitals = doctor ? [doctor.hospital, ...doctor.otherHospitals.map(oh => oh.name)] : [];
  const stats        = { total: slots.length, booked: slots.filter(s => s.booked).length, free: slots.filter(s => !s.booked).length };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        {/* FIXED: single 'l' */}
        <button onClick={() => router.push("/channeling")} style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Doctors
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #0369a1, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {doctor?.initials || doctor?.name.slice(0,2).toUpperCase() || "?"}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{loading ? "Loading..." : doctor?.name || "Doctor"}</h1>
            {doctor && <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{doctor.specialization} · {doctor.hospital}</p>}
          </div>
        </div>
      </div>

      {error && <div style={{ color: "#f87171", fontSize: 13, padding: "12px 16px", background: "rgba(248,113,113,0.08)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)", marginBottom: 16 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Slots", value: stats.total,  color: "#38bdf8", bg: "rgba(56,189,248,0.07)",  border: "rgba(56,189,248,0.12)"  },
          { label: "Available",   value: stats.free,   color: "#4ade80", bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.12)"  },
          { label: "Booked",      value: stats.booked, color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.12)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Add Slot Panel */}
          <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
              {(["single","bulk"] as const).map(t => (
                <button key={t} onClick={() => setBulkTab(t)} style={{ flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 600, background: bulkTab === t ? "rgba(56,189,248,0.08)" : "transparent", borderBottom: bulkTab === t ? "2px solid #38bdf8" : "2px solid transparent", color: bulkTab === t ? "#38bdf8" : "#475569", border: "none", cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.03em" }}>
                  {t === "single" ? "Single Slot" : "Bulk Add"}
                </button>
              ))}
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {bulkTab === "single" ? (
                <>
                  <div>
                    <label style={lbl}>Hospital *</label>
                    <select style={{ ...inp, cursor: "pointer" }} value={form.hospital} onChange={e => setForm(p => ({ ...p, hospital: e.target.value }))}>
                      <option value="">Select hospital</option>
                      {allHospitals.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input type="date" style={inp} value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Time *</label>
                    <select style={{ ...inp, cursor: "pointer" }} value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}>
                      <option value="">Select time</option>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {addError && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{addError}</p>}
                  <button onClick={handleAdd} disabled={adding} style={{ padding: "10px 0", borderRadius: 8, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: adding ? 0.6 : 1 }}>
                    {adding ? "Adding..." : "Add Slot"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label style={lbl}>Hospital *</label>
                    <select style={{ ...inp, cursor: "pointer" }} value={bulkHospital} onChange={e => { setBulkHospital(e.target.value); setBulkTimes([]); }}>
                      <option value="">Select hospital</option>
                      {allHospitals.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input type="date" style={inp} value={bulkDate} min={new Date().toISOString().split("T")[0]} onChange={e => { setBulkDate(e.target.value); setBulkTimes([]); }} />
                  </div>
                  <div>
                    <label style={lbl}>Select Times * ({bulkTimes.length} selected)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 200, overflowY: "auto" }}>
                      {TIMES.map(t => {
                        const used    = usedTimes.includes(t);
                        const checked = bulkTimes.includes(t);
                        return (
                          <button key={t} disabled={used} onClick={() => toggleBulkTime(t)} style={{ padding: "6px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: used ? "not-allowed" : "pointer", background: checked ? "rgba(56,189,248,0.12)" : used ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${checked ? "rgba(56,189,248,0.3)" : used ? "rgba(248,113,113,0.15)" : "rgba(148,163,184,0.08)"}`, color: checked ? "#38bdf8" : used ? "#475569" : "#94a3b8", textDecoration: used ? "line-through" : "none" }}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {bulkError && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{bulkError}</p>}
                  <button onClick={handleBulkAdd} disabled={bulkAdding || bulkTimes.length === 0} style={{ padding: "10px 0", borderRadius: 8, background: bulkTimes.length > 0 ? "linear-gradient(90deg, #0369a1, #4f46e5)" : "rgba(148,163,184,0.08)", color: bulkTimes.length > 0 ? "#fff" : "#334155", fontSize: 13, fontWeight: 600, border: "none", cursor: bulkTimes.length > 0 ? "pointer" : "not-allowed", opacity: bulkAdding ? 0.6 : 1 }}>
                    {bulkAdding ? "Adding..." : `Add ${bulkTimes.length} Slot${bulkTimes.length !== 1 ? "s" : ""}`}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Other Hospitals */}
          <div style={{ background: "rgba(8,16,32,0.7)", border: "1px solid rgba(148,163,184,0.09)", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Other Hospitals</h3>
            {doctor?.otherHospitals.length === 0 && <p style={{ fontSize: 12, color: "#334155", marginBottom: 12 }}>No other hospitals added.</p>}
            {doctor?.otherHospitals.map(oh => (
              <div key={oh.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.05)" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{oh.name}</p>
                  {(oh.days || oh.hours) && <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{[oh.days, oh.hours].filter(Boolean).join(" · ")}</p>}
                </div>
                <button onClick={() => handleDeleteOh(oh.id)} disabled={ohDeleting === oh.id} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14, lineHeight: 1, opacity: ohDeleting === oh.id ? 0.5 : 1 }}>×</button>
              </div>
            ))}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <select value={ohForm.name} onChange={e => setOhForm(p => ({ ...p, name: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Add a hospital...</option>
                {HOSPITALS.filter(h => h !== doctor?.hospital && !doctor?.otherHospitals.find(o => o.name === h)).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              {ohForm.name && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input style={inp} placeholder="Days (Mon, Wed)" value={ohForm.days} onChange={e => setOhForm(p => ({ ...p, days: e.target.value }))} />
                    <input style={inp} placeholder="Hours (5–7 PM)" value={ohForm.hours} onChange={e => setOhForm(p => ({ ...p, hours: e.target.value }))} />
                  </div>
                  {ohError && <p style={{ color: "#f87171", fontSize: 11, margin: 0 }}>{ohError}</p>}
                  <button onClick={handleAddOh} disabled={ohAdding} style={{ padding: "8px", borderRadius: 8, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: ohAdding ? 0.6 : 1 }}>
                    {ohAdding ? "Adding..." : "Add Hospital"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Slot list */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <select value={filterHospital} onChange={e => setFilterHospital(e.target.value)} style={{ ...inp, width: "auto", flex: 1, cursor: "pointer" }}>
              <option value="">All Hospitals</option>
              {allHospitals.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ ...inp, width: "auto", flex: 1 }} />
            {(filterHospital || filterDate) && (
              <button onClick={() => { setFilterHospital(""); setFilterDate(""); }} style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.12)", color: "#64748b", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Clear</button>
            )}
          </div>

          {loading && <p style={{ color: "#475569", fontSize: 13 }}>Loading slots...</p>}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(8,16,32,0.4)", borderRadius: 12, border: "1px solid rgba(148,163,184,0.07)" }}>
              <p style={{ fontSize: 15, color: "#334155", marginBottom: 4 }}>No slots found.</p>
              <p style={{ fontSize: 12, color: "#1e293b" }}>Use the form on the left to add time slots.</p>
            </div>
          )}

          {!loading && Object.keys(grouped).sort().map(key => {
            const [date, hospital] = key.split("__");
            const daySlots    = grouped[key].sort((a,b) => a.time.localeCompare(b.time));
            const bookedCount = daySlots.filter(s => s.booked).length;
            return (
              <div key={key} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                      {new Date(date + "T00:00:00").toLocaleDateString("en-LK", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{hospital}</p>
                  </div>
                  <span style={{ fontSize: 11, color: "#475569" }}>{bookedCount}/{daySlots.length} booked</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {daySlots.map(slot => (
                    <div key={slot.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 8, background: slot.booked ? "rgba(248,113,113,0.06)" : "rgba(8,16,32,0.7)", border: `1px solid ${slot.booked ? "rgba(248,113,113,0.2)" : "rgba(148,163,184,0.09)"}` }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: slot.booked ? "#f87171" : "#e2e8f0" }}>{slot.time}</span>
                      {slot.booked ? (
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "2px 5px", borderRadius: 4 }}>BOOKED</span>
                      ) : (
                        <button onClick={() => handleDelete(slot.id)} disabled={deleting === slot.id} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>
                          {deleting === slot.id ? "…" : "×"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}