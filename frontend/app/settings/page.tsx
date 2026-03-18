"use client";
import { useState, useEffect } from "react";
import { getPharmacyFromStorage, getUserFromStorage, getTokenFromStorage, type PharmacyResponse, type UserResponse } from "../routes/authRoutes";
import { updatePharmacy } from "../routes/settingsRoutes";

type SettingsTab = "pharmacy"|"account";

export default function SettingsPage() {
  const [tab, setTab]     = useState<SettingsTab>("pharmacy");
  const [pharma, setPharma] = useState<PharmacyResponse|null>(null);
  const [user, setUser]   = useState<UserResponse|null>(null);
  const [pSaving, setPSaving]   = useState(false);
  const [pSuccess, setPSuccess] = useState("");
  const [pError, setPError]     = useState("");
  const [pForm, setPForm] = useState({
    pharmacy_name:"", contact_number:"", whatsapp_number:"",
    address:"", opening_hours:"", estimated_delivery_time:"",
    service_areas:"", service_charge:"", prescription_policy:"", refund_policy:"",
  });

  useEffect(() => {
    const p = getPharmacyFromStorage();
    const u = getUserFromStorage();
    setUser(u);
    if (p) {
      setPharma(p);
      setPForm({
        pharmacy_name:           p.pharmacy_name           ?? "",
        contact_number:          p.contact_number          ?? "",
        whatsapp_number:         p.whatsapp_number         ?? "",
        address:                 p.address                 ?? "",
        opening_hours:           p.opening_hours           ?? "",
        estimated_delivery_time: p.estimated_delivery_time ?? "",
        service_areas:           p.service_areas           ?? "",
        service_charge:          p.service_charge != null ? String(p.service_charge) : "",
        prescription_policy:     p.prescription_policy     ?? "",
        refund_policy:           p.refund_policy           ?? "",
      });
    }
  }, []);

  const handleSave = async () => {
    setPSaving(true); setPSuccess(""); setPError("");
    try {
      const token = getTokenFromStorage();
      if (!token) throw new Error("Not authenticated — please log in again.");
      const data = await updatePharmacy({
        pharmacy_name:           pForm.pharmacy_name           || null,
        contact_number:          pForm.contact_number          || null,
        whatsapp_number:         pForm.whatsapp_number         || null,
        address:                 pForm.address                 || null,
        opening_hours:           pForm.opening_hours           || null,
        estimated_delivery_time: pForm.estimated_delivery_time || null,
        service_areas:           pForm.service_areas           || null,
        service_charge:          pForm.service_charge !== "" ? parseFloat(pForm.service_charge) : null,
        prescription_policy:     pForm.prescription_policy     || null,
        refund_policy:           pForm.refund_policy           || null,
      }, token);
      localStorage.setItem("healix_pharmacy", JSON.stringify(data.pharmacy));
      setPharma(data.pharmacy as unknown as PharmacyResponse);
      setPSuccess("Pharmacy profile updated successfully.");
      setTimeout(() => setPSuccess(""), 4000);
    } catch (e: unknown) {
      setPError(e instanceof Error ? e.message : "Failed to save");
    } finally { setPSaving(false); }
  };

  const hasChanges = pharma && (
    pForm.pharmacy_name           !== (pharma.pharmacy_name           ?? "") ||
    pForm.contact_number          !== (pharma.contact_number          ?? "") ||
    pForm.whatsapp_number         !== (pharma.whatsapp_number         ?? "") ||
    pForm.address                 !== (pharma.address                 ?? "") ||
    pForm.opening_hours           !== (pharma.opening_hours           ?? "") ||
    pForm.estimated_delivery_time !== (pharma.estimated_delivery_time ?? "") ||
    pForm.service_areas           !== (pharma.service_areas           ?? "") ||
    pForm.service_charge          !== (pharma.service_charge != null ? String(pharma.service_charge) : "") ||
    pForm.prescription_policy     !== (pharma.prescription_policy     ?? "") ||
    pForm.refund_policy           !== (pharma.refund_policy           ?? "")
  );

  const p = (k: keyof typeof pForm) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setPForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ padding: "28px" }}>
      <div className="settings-wrap">
        <div className="page-spacer" />

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
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 
                2 0 1 1-2.83 2.83l-.06-.06A1.65 
                1.65 0 0 0 15 19.4a1.65 
                1.65 0 0 0-1 .6 1.65 
                1.65 0 0 0-.33 1V21a2 
                2 0 1 1-4 0v-.09a1.65 
                1.65 0 0 0-.33-1 1.65 
                1.65 0 0 0-1-.6 1.65 
                1.65 0 0 0-1.82.33l-.06.06a2 
                2 0 1 1-2.83-2.83l.06-.06A1.65 
                1.65 0 0 0 4.6 15a1.65 
                1.65 0 0 0-.6-1 1.65 
                1.65 0 0 0-1-.33H3a2 
                2 0 1 1 0-4h.09a1.65 
                1.65 0 0 0 1-.33 1.65 
                1.65 0 0 0 .6-1 1.65 
                1.65 0 0 0-.33-1.82l-.06-.06a2 
                2 0 1 1 2.83-2.83l.06.06A1.65 
                1.65 0 0 0 9 4.6c.3 0 .59-.11.82-.33.23-.23.33-.52.33-.82V3a2 
                2 0 1 1 4 0v.09c0 .3.11.59.33.82.23.23.52.33.82.33.3 
                0 .59-.11.82-.33l.06-.06a2 
                2 0 1 1 2.83 2.83l-.06.06c-.22.23-.33.52-.33.82 
                0 .3.11.59.33.82.23.23.52.33.82.33H21a2 
                2 0 1 1 0 4h-.09c-.3 0-.59.11-.82.33-.23.23-.33.52-.33.82z"/>
              </svg>
            </div>
            <div>
              <h1 className="page-title gradient-text">Settings</h1>
              <p className="page-sub">Manage your pharmacy profile and account details.</p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="tab-switcher mb-28 fade">
          {([{key:"pharmacy",label:"Pharmacy Profile"},{key:"account",icon:"👤",label:"Account"}] as {key:SettingsTab;icon:string;label:string}[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`tab-switch-btn${tab === t.key ? " active" : ""}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Pharmacy tab */}
        {tab === "pharmacy" && (
          <div className="fade">
            <Section title="Basic Information" sub="Your pharmacy's name and contact details.">
              <div className="grid-2">
                <div className="col g-6 span-2">
                  <label className="form-label">Pharmacy Name *</label>
                  <input className="input-field" type="text" placeholder="e.g. HealixPharm" value={pForm.pharmacy_name} onChange={p("pharmacy_name")} />
                </div>
                <div className="col g-6">
                  <label className="form-label">Contact Number</label>
                  <input className="input-field" type="tel" placeholder="+94 37 222 1234" value={pForm.contact_number} onChange={p("contact_number")} />
                </div>
                <div className="col g-6">
                  <label className="form-label">WhatsApp Number</label>
                  <input className="input-field" type="tel" placeholder="+94 77 123 4567" value={pForm.whatsapp_number} onChange={p("whatsapp_number")} />
                </div>
                <div className="col g-6 span-2">
                  <label className="form-label">Address</label>
                  <textarea className="input-field textarea-lg" placeholder="e.g. 12 Main Street, Kurunegala" value={pForm.address} onChange={p("address")} />
                </div>
              </div>
            </Section>

            <div className="divider" />

            <Section title="Operations" sub="Hours, delivery, and service coverage.">
              <div className="grid-2">
                <div className="col g-6">
                  <label className="form-label">Opening Hours</label>
                  <input className="input-field" type="text" placeholder="Mon–Sat 8am–8pm" value={pForm.opening_hours} onChange={p("opening_hours")} />
                </div>
                <div className="col g-6">
                  <label className="form-label">Estimated Delivery Time</label>
                  <input className="input-field" type="text" placeholder="2–4 hours" value={pForm.estimated_delivery_time} onChange={p("estimated_delivery_time")} />
                </div>
                <div className="col g-6 span-2">
                  <label className="form-label">Service Areas</label>
                  <input className="input-field" type="text" placeholder="e.g. Kurunegala, Polgahawela" value={pForm.service_areas} onChange={p("service_areas")} />
                </div>
                <div className="col g-6">
                  <label className="form-label">Service Charge (LKR)</label>
                  <input className="input-field" type="number" min="0" step="0.01" placeholder="150.00" value={pForm.service_charge} onChange={p("service_charge")} />
                </div>
              </div>
            </Section>

            <div className="divider" />

            <Section title="Policies" sub="Prescription handling and refund rules shown to patients.">
              <div className="col g-14">
                <div className="col g-6">
                  <label className="form-label">Prescription Policy</label>
                  <textarea className="input-field textarea-lg" placeholder="e.g. Valid prescriptions required for Schedule 1 medicines…" value={pForm.prescription_policy} onChange={p("prescription_policy")} />
                </div>
                <div className="col g-6">
                  <label className="form-label">Refund Policy</label>
                  <textarea className="input-field textarea-lg" placeholder="e.g. Unopened medicines may be returned within 7 days…" value={pForm.refund_policy} onChange={p("refund_policy")} />
                </div>
              </div>
            </Section>

            {pSuccess && <div className="msg-box msg-box-success mt-20">✓ {pSuccess}</div>}
            {pError   && <div className="msg-box msg-box-error mt-20">⚠ {pError}</div>}

            <div className="save-footer">
              <p className="save-status">{hasChanges ? "You have unsaved changes." : "All changes saved."}</p>
              <div className="row g-10">
                {hasChanges && (
                  <button onClick={() => { if (pharma) setPForm({ pharmacy_name:pharma.pharmacy_name??"", contact_number:pharma.contact_number??"", whatsapp_number:pharma.whatsapp_number??"", address:pharma.address??"", opening_hours:pharma.opening_hours??"", estimated_delivery_time:pharma.estimated_delivery_time??"", service_areas:pharma.service_areas??"", service_charge:pharma.service_charge!=null?String(pharma.service_charge):"", prescription_policy:pharma.prescription_policy??"", refund_policy:pharma.refund_policy??"" }); }} className="btn-ghost">
                    Discard
                  </button>
                )}
                <button onClick={handleSave} disabled={!hasChanges||pSaving||pForm.pharmacy_name.trim()===""} className="btn-primary" style={{ opacity:(!hasChanges||pSaving||pForm.pharmacy_name.trim()==="") ? 0.45 : 1 }}>
                  {pSaving ? <><span className="spinner" />Saving…</> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account tab */}
        {tab === "account" && (
          <div className="fade">
            <Section title="Account Details" sub="Your login credentials. Contact support to change email or username.">
              <div className="grid-2">
                {[{label:"Username",value:user?.username},{label:"Email",value:user?.email},{label:"Account Created",value:user?.created_at?new Date(user.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):undefined},{label:"User ID",value:user?.id?`#${user.id}`:undefined}].map(f=>(
                  <div key={f.label} className="col g-6">
                    <label className="form-label">{f.label}</label>
                    <div className="input-field readonly-field">{f.value ?? "—"}</div>
                  </div>
                ))}
              </div>
              <div className="info-box">🔒 Username and email are read-only. To update credentials, contact your system administrator.</div>
            </Section>

            <div className="divider" />

            <Section title="Pharmacy Link" sub="Your pharmacy profile linked to this account.">
              <div className="grid-2">
                <div className="col g-6"><label className="form-label">Pharmacy ID</label><div className="input-field readonly-field">#{pharma?.id ?? "—"}</div></div>
                <div className="col g-6"><label className="form-label">Pharmacy Name</label><div className="input-field readonly-field">{pharma?.pharmacy_name ?? "—"}</div></div>
              </div>
            </Section>

            <div className="divider" />

            <Section title="Danger Zone" sub="Irreversible actions.">
              <div className="danger-row">
                <div>
                  <div className="danger-row-title">Sign Out</div>
                  <div className="danger-row-sub">Clear your session and return to login.</div>
                </div>
                <button onClick={() => { localStorage.removeItem("healix_token"); localStorage.removeItem("healix_user"); localStorage.removeItem("healix_pharmacy"); window.location.href = "/login"; }} className="btn-danger">
                  Sign Out
                </button>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title:string; sub:string; children:React.ReactNode }) {
  return (
    <div className="settings-section">
      <h2 className="section-title">{title}</h2>
      <p className="section-sub">{sub}</p>
      {children}
    </div>
  );
}