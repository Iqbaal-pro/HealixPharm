"use client";
import { useState, useEffect } from "react";
import { createMOHAlert, getActiveAlerts, type MOHAlert, type CreateAlertPayload } from "../routes/mohRoutes";

type Tab = "list" | "create";

const TODAY = new Date().toISOString().slice(0, 16);

const threatCfg: Record<string, { color: string; bg: string; border: string }> = {
  High:   { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  Low:    { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
};

function isExpired(alert: MOHAlert): boolean {
  return new Date(alert.end_date) < new Date();
}

export default function MOHAlertsPage() {
  const [tab, setTab]       = useState<Tab>("list");
  const [alerts, setAlerts] = useState<MOHAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<CreateAlertPayload>({
    disease_name: "", region: "", threat_level: "High",
    start_date: TODAY, end_date: TODAY,
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const loadAlerts = async () => {
    setLoading(true); setListError("");
    try { setAlerts(await getActiveAlerts()); }
    catch (e: unknown) { setListError(e instanceof Error ? e.message : "Failed to load alerts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleCreate = async () => {
    if (!form.disease_name.trim() || !form.region.trim()) {
      setSaveMsg("Disease name and region are required."); return;
    }
    if (form.start_date > form.end_date) {
      setSaveMsg("End date must be after start date."); return;
    }
    setSaving(true); setSaveMsg("");
    try {
      await createMOHAlert(form);
      setSaveMsg("✓ Alert created and will be broadcast to all active patients via WhatsApp.");
      setForm({ disease_name: "", region: "", threat_level: "High", start_date: TODAY, end_date: TODAY });
      setTab("list");
      loadAlerts();
    } catch (e: unknown) { setSaveMsg(e instanceof Error ? e.message : "Failed to create alert"); }
    finally { setSaving(false); }
  };

  const filtered = alerts.filter(a => {
    const expired = isExpired(a);
    if (filter === "active"  && expired)  return false;
    if (filter === "expired" && !expired) return false;
    const q = search.toLowerCase();
    return a.disease_name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q);
  });

  const counts = {
    all:     alerts.length,
    active:  alerts.filter(a => !isExpired(a)).length,
    expired: alerts.filter(a =>  isExpired(a)).length,
  };

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      {/* Header */}
      <div className="fade-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            className="page-icon"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.22)",
              boxShadow: "0 0 18px rgba(56,189,248,0.1)"
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title gradient-text">MOH Alerts</h1>
            <p className="page-sub">Broadcast disease alerts to all active patients via WhatsApp.</p>
          </div>
        </div>
        <div className="row g-8">
          <button className="btn-ghost" onClick={loadAlerts}>↻ Refresh</button>
          <button className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => { setTab(tab === "create" ? "list" : "create"); setSaveMsg(""); }}>
            {tab === "create" ? "← Back to List" : "+ New Alert"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-20 fade-2">
        {[
          { label: "Total Alerts",   value: counts.all,     color: "#38bdf8", bg: "rgba(56,189,248,0.07)",  border: "rgba(56,189,248,0.15)"  },
          { label: "Active",         value: counts.active,  color: "#4ade80", bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.15)"  },
          { label: "Expired",        value: counts.expired, color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.15)" },
        ].map(s => (
          <div key={s.label} className="history-stat-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      {tab === "list" ? (
        <div className="fade-3">
          {/* Filters */}
          <div className="glass-card panel-p16-20 mb-16">
            <div className="row g-12 row-wrap">
              <div className="filter-bar">
                {(["all", "active", "expired"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? " active" : ""}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                  </button>
                ))}
              </div>
              <div className="search-wrap search-flex-min">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input className="input-field search-sm" placeholder="Search disease or region…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Alerts table */}
          <div className="glass-card panel-p24">
            {listError && <div className="err-box mb-14"><p className="hint hint-err">⚠ {listError}</p></div>}
            {loading ? (
              <div className="loading-cell row g-12"><span className="spinner" /><span>Loading alerts…</span></div>
            ) : filtered.length === 0 ? (
              <div className="center p-empty">
                <div className="empty-icon-lg">⚠️</div>
                <p className="empty-text">{alerts.length === 0 ? "No alerts created yet." : "No alerts match your filter."}</p>
                {alerts.length === 0 && (
                  <button className="btn-primary mt-18" onClick={() => setTab("create")}>+ Create First Alert</button>
                )}
              </div>
            ) : (
              <div className="table-wrap">
                <table className="full-table">
                  <thead>
                    <tr className="thead-border">
                      {["ID", "Disease", "Region", "Threat", "Start", "End", "Broadcast", "Status"].map(h => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => {
                      const tc = threatCfg[a.threat_level] ?? threatCfg.Low;
                      const expired = isExpired(a);
                      const daysLeft = Math.ceil((new Date(a.end_date).getTime() - Date.now()) / 86400000);
                      return (
                        <tr key={a.id} className="tr-border" style={{ opacity: expired ? 0.6 : 1 }}>
                          <td className="td td-order-id">#{a.id}</td>
                          <td className="td" style={{ color: "#e2e8f0", fontWeight: 600 }}>{a.disease_name}</td>
                          <td className="td" style={{ color: "#94a3b8" }}>{a.region}</td>
                          <td className="td">
                            <span className="badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                              {a.threat_level}
                            </span>
                          </td>
                          <td className="td td-date">{new Date(a.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                          <td className="td">
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span className="td-date">{new Date(a.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                              {!expired && daysLeft <= 3 && (
                                <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>{daysLeft}d left</span>
                              )}
                            </div>
                          </td>
                          <td className="td">
                            <span className="badge" style={{
                              background: a.broadcast_sent ? "rgba(74,222,128,0.08)" : "rgba(148,163,184,0.08)",
                              color: a.broadcast_sent ? "#4ade80" : "#475569",
                              border: `1px solid ${a.broadcast_sent ? "rgba(74,222,128,0.2)" : "rgba(148,163,184,0.1)"}`,
                            }}>
                              {a.broadcast_sent ? "✓ Sent" : "Pending"}
                            </span>
                          </td>
                          <td className="td">
                            <span className="badge" style={{
                              background: expired ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.08)",
                              color: expired ? "#f87171" : "#4ade80",
                              border: `1px solid ${expired ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)"}`,
                            }}>
                              {expired ? "Expired" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <div className="table-footer-note mt-14">Showing {filtered.length} of {alerts.length} alerts</div>
            )}
          </div>
        </div>
      ) : (
        /* Create form */
        <div className="fade-3" style={{ maxWidth: 600 }}>
          <div className="glass-card panel-p24">
            <h2 className="card-title mb-6">New MOH Alert</h2>
            <p className="card-sub mb-20">Alert will be broadcast to all active patients via WhatsApp once created.</p>

            <div className="grid-2">
              <div className="col g-6 span-2">
                <label className="form-label">Disease Name</label>
                <input className="input-field" placeholder="e.g. Dengue Fever" value={form.disease_name} onChange={e => setForm(f => ({ ...f, disease_name: e.target.value }))} />
              </div>
              <div className="col g-6 span-2">
                <label className="form-label">Region</label>
                <input className="input-field" placeholder="e.g. Western Province" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
              </div>
              <div className="col g-6">
                <label className="form-label">Threat Level</label>
                <div className="row g-6">
                  {(["Low", "Medium", "High"] as const).map(t => {
                    const tc = threatCfg[t];
                    return (
                      <button key={t} onClick={() => setForm(f => ({ ...f, threat_level: t }))}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                          background:   form.threat_level === t ? tc.bg   : "rgba(255,255,255,0.03)",
                          color:        form.threat_level === t ? tc.color : "#475569",
                          borderColor:  form.threat_level === t ? tc.border : "rgba(148,163,184,0.1)" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="col g-6">
                <label className="form-label">Start Date</label>
                <input type="datetime-local" className="input-field" style={{ colorScheme: "dark" }} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="col g-6">
                <label className="form-label">End Date</label>
                <input type="datetime-local" className="input-field" style={{ colorScheme: "dark" }} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(148,163,184,0.08)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>WhatsApp Preview</p>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                🚨 <strong style={{ color: "#f1f5f9" }}>ALERT:</strong> {form.disease_name || "Disease name"} in {form.region || "Region"}.{" "}
                <strong style={{ color: threatCfg[form.threat_level]?.color }}>Threat Level: {form.threat_level}</strong>. Source: MoH
              </p>
            </div>

            {saveMsg && (
              <div className={`msg-box mt-14 ${saveMsg.startsWith("✓") ? "msg-box-success" : "msg-box-error"}`}>{saveMsg}</div>
            )}

            <button className="btn-primary w-full mt-18" onClick={handleCreate} disabled={saving || !form.disease_name.trim() || !form.region.trim()}
              style={{ opacity: saving || !form.disease_name.trim() || !form.region.trim() ? 0.45 : 1 }}>
              {saving ? <><span className="spinner" />Creating…</> : "🚨 Create & Broadcast Alert"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}