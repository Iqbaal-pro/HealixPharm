"use client";
import { useState } from "react";
import { createMOHAlert, type CreateAlertPayload } from "../routes/mohRoutes";

const TODAY = new Date().toISOString().slice(0, 16);

export default function MOHAlertsPage() {
  const [form, setForm] = useState<CreateAlertPayload>({
    disease_name: "",
    region: "",
    threat_level: "High",
    start_date: TODAY,
    end_date: TODAY,
  });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const [lastAlert, setLastAlert] = useState<{ id: number; disease_name: string; region: string } | null>(null);

  const handleSubmit = async () => {
    if (!form.disease_name.trim() || !form.region.trim()) {
      setMsg("Disease name and region are required.");
      return;
    }
    if (form.start_date > form.end_date) {
      setMsg("End date must be after start date.");
      return;
    }
    setSaving(true); setMsg("");
    try {
      const created = await createMOHAlert(form);
      setLastAlert({ id: created.id, disease_name: created.disease_name, region: created.region });
      setMsg(`✓ Alert created — it will be broadcast to all active patients via WhatsApp.`);
      setForm({ disease_name: "", region: "", threat_level: "High", start_date: TODAY, end_date: TODAY });
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed to create alert"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "28px" }}>
      <div className="page-spacer" />

      <div className="fade-1" style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 14 }}>
        <div className="page-icon" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", fontSize: 22, boxShadow: "0 0 18px rgba(239,68,68,0.1)" }}>🚨</div>
        <div>
          <h1 className="page-title gradient-text">MOH Disease Alerts</h1>
          <p className="page-sub">Broadcast health alerts to all patients via WhatsApp</p>
        </div>
      </div>

      <div className="fade-2" style={{ maxWidth: 700 }}>

        {lastAlert && (
          <div className="alert-banner alert-banner-red mb-24 fade">
            <div className="alert-dot alert-dot-red" />
            <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>
              Last alert: <strong>{lastAlert.disease_name}</strong> in {lastAlert.region} (ID #{lastAlert.id}) — broadcast queued
            </span>
          </div>
        )}

        <div className="glass-panel" style={{ padding: 28 }}>
          <h2 className="panel-title" style={{ marginBottom: 20 }}>Create New Alert</h2>

          <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
            <div>
              <div className="field-label">Disease Name</div>
              <input className="input-field" placeholder="e.g. Dengue Fever" value={form.disease_name} onChange={e => setForm(f => ({ ...f, disease_name: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Region</div>
              <input className="input-field" placeholder="e.g. Colombo District" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Threat Level</div>
              <select className="input-field" value={form.threat_level} onChange={e => setForm(f => ({ ...f, threat_level: e.target.value }))}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 16, marginBottom: 24 }}>
            <div>
              <div className="field-label">Start Date</div>
              <input className="input-field" type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">End Date</div>
              <input className="input-field" type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          {/* Preview */}
          {form.disease_name && form.region && (
            <div className="info-box mb-20" style={{ fontSize: 13 }}>
              <strong style={{ color: "#38bdf8" }}>Preview message:</strong><br />
              <span style={{ color: "#94a3b8", lineHeight: 1.7 }}>
                &quot;ALERT: {form.disease_name} in {form.region}. Source: MOH&quot;
              </span>
            </div>
          )}

          {msg && <div className={`msg-box mb-20 ${msg.startsWith("✓") ? "msg-box-success" : "msg-box-error"}`}>{msg}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="spinner" />Creating Alert…</> : "🚨 Create & Broadcast Alert"}
          </button>
        </div>

        <div className="glass-panel mt-20" style={{ padding: 20 }}>
          <h2 className="panel-title" style={{ marginBottom: 10 }}>How it works</h2>
          <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.8 }}>
            <div>1. Only <strong style={{ color: "#94a3b8" }}>High</strong> threat level alerts are auto-broadcast to patients.</div>
            <div>2. The alert scheduler runs daily and broadcasts to all <strong style={{ color: "#94a3b8" }}>active patients</strong>.</div>
            <div>3. Each alert is broadcast <strong style={{ color: "#94a3b8" }}>once</strong> — duplicate broadcasts are prevented.</div>
            <div>4. Expired alerts (past end date) are automatically marked as Expired.</div>
          </div>
        </div>
      </div>
    </div>
  );
}