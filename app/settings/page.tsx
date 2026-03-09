"use client";
import { useState, useEffect } from "react";
import {
  getPharmacyFromStorage,
  getUserFromStorage,
  getTokenFromStorage,
  saveAuthToStorage,
  type PharmacyResponse,
  type UserResponse,
} from "../routes/authRoutes";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SettingsTab = "pharmacy" | "account";

// ── Input style — no border shorthand ─────────────────────────────────────────
function iStyle(focused: boolean, hasError = false): React.CSSProperties {
  return {
    width: "100%", background: "rgba(6,13,26,0.9)",
    borderWidth: "1px", borderStyle: "solid",
    borderColor: hasError ? "rgba(248,113,113,0.55)" : focused ? "rgba(56,189,248,0.5)" : "rgba(148,163,184,0.1)",
    boxShadow: focused && !hasError ? "0 0 0 3px rgba(56,189,248,0.07)" : "none",
    borderRadius: 11, color: "#f1f5f9", padding: "11px 14px", fontSize: 13.5,
    fontFamily: "'DM Sans',sans-serif", outline: "none",
    boxSizing: "border-box" as const, transition: "border-color .2s, box-shadow .2s",
  };
}

function taStyle(focused: boolean): React.CSSProperties {
  return {
    ...iStyle(focused),
    resize: "vertical" as const,
    minHeight: 90,
    lineHeight: 1.6,
  };
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("pharmacy");

  // ── Pharmacy form ──────────────────────────────────────────────────────────
  const [pharma, setPharma] = useState<PharmacyResponse | null>(null);
  const [pForm, setPForm] = useState({
    pharmacy_name: "", contact_number: "", whatsapp_number: "",
    address: "", opening_hours: "", estimated_delivery_time: "",
    service_areas: "", service_charge: "", prescription_policy: "", refund_policy: "",
  });
  const [pFocused, setPFocused] = useState<string | null>(null);
  const [pSaving, setPSaving]   = useState(false);
  const [pSuccess, setPSuccess] = useState("");
  const [pError, setPError]     = useState("");

  // ── Account info (read-only) ───────────────────────────────────────────────
  const [user, setUser] = useState<UserResponse | null>(null);

  // ── Load from localStorage on mount ───────────────────────────────────────
  useEffect(() => {
    const p = getPharmacyFromStorage();
    const u = getUserFromStorage();
    setUser(u);
    if (p) {
      setPharma(p);
      setPForm({
        pharmacy_name:          p.pharmacy_name         ?? "",
        contact_number:         p.contact_number        ?? "",
        whatsapp_number:        p.whatsapp_number       ?? "",
        address:                p.address               ?? "",
        opening_hours:          p.opening_hours         ?? "",
        estimated_delivery_time: p.estimated_delivery_time ?? "",
        service_areas:          p.service_areas         ?? "",
        service_charge:         p.service_charge != null ? String(p.service_charge) : "",
        prescription_policy:    p.prescription_policy   ?? "",
        refund_policy:          p.refund_policy         ?? "",
      });
    }
  }, []);

  const pf = (k: string) => pFocused === k;

  // ── Save pharmacy ──────────────────────────────────────────────────────────
  const handleSavePharmacy = async () => {
    setPSaving(true); setPSuccess(""); setPError("");
    try {
      const token = getTokenFromStorage();
      if (!token) throw new Error("Not authenticated — please log in again.");

      const res = await fetch(`${BASE}/pharmacy/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Update failed" }));
        throw new Error(err.detail ?? "Update failed");
      }

      const data = await res.json();
      // Update localStorage so the rest of the app stays in sync
      if (user) saveAuthToStorage(token, user, data.pharmacy);
      setPharma(data.pharmacy);
      setPSuccess("Pharmacy profile updated successfully.");
      setTimeout(() => setPSuccess(""), 4000);
    } catch (e: unknown) {
      setPError(e instanceof Error ? e.message : "Failed to save");
    } finally { setPSaving(false); }
  };

  const hasChanges = pharma && (
    pForm.pharmacy_name          !== (pharma.pharmacy_name         ?? "") ||
    pForm.contact_number         !== (pharma.contact_number        ?? "") ||
    pForm.whatsapp_number        !== (pharma.whatsapp_number       ?? "") ||
    pForm.address                !== (pharma.address               ?? "") ||
    pForm.opening_hours          !== (pharma.opening_hours         ?? "") ||
    pForm.estimated_delivery_time !== (pharma.estimated_delivery_time ?? "") ||
    pForm.service_areas          !== (pharma.service_areas         ?? "") ||
    pForm.service_charge         !== (pharma.service_charge != null ? String(pharma.service_charge) : "") ||
    pForm.prescription_policy    !== (pharma.prescription_policy   ?? "") ||
    pForm.refund_policy          !== (pharma.refund_policy         ?? "")
  );

  return (
    <div style={pageWrap}>
      <style>{CSS}</style>
      <div style={gridBg} />
      <div className="orb orb1" /><div className="orb orb2" />

      <div style={{ position: "relative", zIndex: 1, padding: "40px 48px", maxWidth: 900, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={iconBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
              </svg>
            </div>
            <h1 style={pageTitle}>Settings</h1>
          </div>
          <p style={pageSub}>Manage your pharmacy profile and account details.</p>
        </div>

        {/* ── Tabs ── */}
        <div className="fade-up" style={{ display: "flex", gap: 4, background: "rgba(10,20,42,0.7)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.08)", borderRadius: 14, padding: 5, marginBottom: 28, width: "fit-content", animationDelay: ".04s" }}>
          {([
            { key: "pharmacy", icon: "🏥", label: "Pharmacy Profile" },
            { key: "account",  icon: "👤", label: "Account" },
          ] as { key: SettingsTab; icon: string; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s", background: tab === t.key ? "rgba(14,165,233,0.15)" : "transparent", color: tab === t.key ? "#38bdf8" : "#475569", fontWeight: tab === t.key ? 700 : 500, fontSize: 14 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════
            TAB: Pharmacy Profile
        ══════════════════════════════════ */}
        {tab === "pharmacy" && (
          <div className="fade-up">

            {/* Basic info */}
            <Section title="Basic Information" sub="Your pharmacy's name and contact details.">
              <div style={grid2}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Pharmacy Name *</Label>
                  <input type="text" placeholder="e.g. HealixPharm" value={pForm.pharmacy_name}
                    onChange={e => setPForm(f => ({ ...f, pharmacy_name: e.target.value }))}
                    onFocus={() => setPFocused("pn")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("pn"), pForm.pharmacy_name.trim() === "")} />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <input type="tel" placeholder="e.g. +94 37 222 1234" value={pForm.contact_number}
                    onChange={e => setPForm(f => ({ ...f, contact_number: e.target.value }))}
                    onFocus={() => setPFocused("cn")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("cn"))} />
                </div>
                <div>
                  <Label>WhatsApp Number</Label>
                  <input type="tel" placeholder="e.g. +94 77 123 4567" value={pForm.whatsapp_number}
                    onChange={e => setPForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                    onFocus={() => setPFocused("wn")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("wn"))} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Address</Label>
                  <textarea placeholder="e.g. 12 Main Street, Kurunegala" value={pForm.address}
                    onChange={e => setPForm(f => ({ ...f, address: e.target.value }))}
                    onFocus={() => setPFocused("addr")} onBlur={() => setPFocused(null)}
                    style={taStyle(pf("addr"))} />
                </div>
              </div>
            </Section>

            <Divider />

            {/* Operations */}
            <Section title="Operations" sub="Hours, delivery, and service coverage.">
              <div style={grid2}>
                <div>
                  <Label>Opening Hours</Label>
                  <input type="text" placeholder="e.g. Mon–Sat 8am–8pm" value={pForm.opening_hours}
                    onChange={e => setPForm(f => ({ ...f, opening_hours: e.target.value }))}
                    onFocus={() => setPFocused("oh")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("oh"))} />
                </div>
                <div>
                  <Label>Estimated Delivery Time</Label>
                  <input type="text" placeholder="e.g. 2–4 hours" value={pForm.estimated_delivery_time}
                    onChange={e => setPForm(f => ({ ...f, estimated_delivery_time: e.target.value }))}
                    onFocus={() => setPFocused("dt")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("dt"))} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Service Areas</Label>
                  <input type="text" placeholder="e.g. Kurunegala, Polgahawela, Mawathagama" value={pForm.service_areas}
                    onChange={e => setPForm(f => ({ ...f, service_areas: e.target.value }))}
                    onFocus={() => setPFocused("sa")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("sa"))} />
                </div>
                <div>
                  <Label>Service Charge (LKR)</Label>
                  <input type="number" min="0" step="0.01" placeholder="e.g. 150.00" value={pForm.service_charge}
                    onChange={e => setPForm(f => ({ ...f, service_charge: e.target.value }))}
                    onFocus={() => setPFocused("sc")} onBlur={() => setPFocused(null)}
                    style={iStyle(pf("sc"))} />
                </div>
              </div>
            </Section>

            <Divider />

            {/* Policies */}
            <Section title="Policies" sub="Prescription handling and refund rules shown to patients.">
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                <div>
                  <Label>Prescription Policy</Label>
                  <textarea placeholder="e.g. Valid prescriptions required for Schedule 1 medicines…" value={pForm.prescription_policy}
                    onChange={e => setPForm(f => ({ ...f, prescription_policy: e.target.value }))}
                    onFocus={() => setPFocused("pp")} onBlur={() => setPFocused(null)}
                    style={taStyle(pf("pp"))} />
                </div>
                <div>
                  <Label>Refund Policy</Label>
                  <textarea placeholder="e.g. Unopened medicines may be returned within 7 days…" value={pForm.refund_policy}
                    onChange={e => setPForm(f => ({ ...f, refund_policy: e.target.value }))}
                    onFocus={() => setPFocused("rp")} onBlur={() => setPFocused(null)}
                    style={taStyle(pf("rp"))} />
                </div>
              </div>
            </Section>

            {/* Feedback */}
            {pSuccess && (
              <div style={{ background: "rgba(74,222,128,0.06)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(74,222,128,0.2)", borderRadius: 12, padding: "12px 16px", marginTop: 20 }}>
                <p style={{ color: "#4ade80", fontSize: 13.5, margin: 0 }}>✓ {pSuccess}</p>
              </div>
            )}
            {pError && (
              <div style={{ background: "rgba(239,68,68,0.07)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginTop: 20 }}>
                <p style={{ color: "#f87171", fontSize: 13.5, margin: 0 }}>⚠ {pError}</p>
              </div>
            )}

            {/* Save bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(148,163,184,0.07)" }}>
              <p style={{ color: "#334155", fontSize: 13, margin: 0 }}>
                {hasChanges ? "You have unsaved changes." : "All changes saved."}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {hasChanges && (
                  <button onClick={() => {
                    if (pharma) setPForm({
                      pharmacy_name: pharma.pharmacy_name ?? "", contact_number: pharma.contact_number ?? "",
                      whatsapp_number: pharma.whatsapp_number ?? "", address: pharma.address ?? "",
                      opening_hours: pharma.opening_hours ?? "", estimated_delivery_time: pharma.estimated_delivery_time ?? "",
                      service_areas: pharma.service_areas ?? "",
                      service_charge: pharma.service_charge != null ? String(pharma.service_charge) : "",
                      prescription_policy: pharma.prescription_policy ?? "",
                      refund_policy: pharma.refund_policy ?? "",
                    });
                  }} style={btnGhost}>Discard</button>
                )}
                <button onClick={handleSavePharmacy} disabled={!hasChanges || pSaving || pForm.pharmacy_name.trim() === ""}
                  style={{ ...btnPrimary, width: "auto", padding: "11px 28px", opacity: (!hasChanges || pSaving || pForm.pharmacy_name.trim() === "") ? 0.45 : 1 }}>
                  {pSaving
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="spinner" />Saving…</span>
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            TAB: Account
        ══════════════════════════════════ */}
        {tab === "account" && (
          <div className="fade-up">
            <Section title="Account Details" sub="Your login credentials. Contact support to change email or username.">
              <div style={grid2}>
                <div>
                  <Label>Username</Label>
                  <div style={{ ...iStyle(false), color: "#475569", cursor: "not-allowed" }}>
                    {user?.username ?? "—"}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div style={{ ...iStyle(false), color: "#475569", cursor: "not-allowed" }}>
                    {user?.email ?? "—"}
                  </div>
                </div>
                <div>
                  <Label>Account Created</Label>
                  <div style={{ ...iStyle(false), color: "#475569", cursor: "not-allowed" }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </div>
                </div>
                <div>
                  <Label>User ID</Label>
                  <div style={{ ...iStyle(false), color: "#475569", cursor: "not-allowed" }}>
                    #{user?.id ?? "—"}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(56,189,248,0.04)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(56,189,248,0.1)", borderRadius: 10 }}>
                <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
                  🔒 Username and email are read-only. To update credentials, contact your system administrator.
                </p>
              </div>
            </Section>

            <Divider />

            <Section title="Pharmacy Link" sub="Your pharmacy profile linked to this account.">
              <div style={grid2}>
                <div>
                  <Label>Pharmacy ID</Label>
                  <div style={{ ...iStyle(false), color: "#475569", cursor: "not-allowed" }}>#{pharma?.id ?? "—"}</div>
                </div>
                <div>
                  <Label>Pharmacy Name</Label>
                  <div style={{ ...iStyle(false), color: "#475569", cursor: "not-allowed" }}>{pharma?.pharmacy_name ?? "—"}</div>
                </div>
              </div>
            </Section>

            <Divider />

            <Section title="Danger Zone" sub="Irreversible actions.">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(248,113,113,0.04)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.15)", borderRadius: 12, padding: "16px 20px" }}>
                <div>
                  <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Sign Out</div>
                  <div style={{ color: "#475569", fontSize: 13 }}>Clear your session and return to login.</div>
                </div>
                <button onClick={() => {
                  localStorage.removeItem("healix_token");
                  localStorage.removeItem("healix_user");
                  localStorage.removeItem("healix_pharmacy");
                  window.location.href = "/login";
                }} style={btnDanger}>Sign Out</button>
              </div>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15.5, color: "#f1f5f9", margin: "0 0 3px" }}>{title}</h2>
        <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>{sub}</p>
      </div>
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", color: "#64748b", fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const, marginBottom: 7 }}>{children}</label>;
}
function Divider() {
  return <div style={{ borderTop: "1px solid rgba(148,163,184,0.07)", margin: "28px 0" }} />;
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties   = { minHeight: "100vh", background: "#060d1a", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" };
const gridBg: React.CSSProperties    = { position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(148,163,184,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.025) 1px,transparent 1px)", backgroundSize: "52px 52px" };
const iconBox: React.CSSProperties   = { width: 36, height: 36, borderRadius: 10, background: "rgba(14,165,233,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center" };
const pageTitle: React.CSSProperties  = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: "-0.02em" };
const pageSub: React.CSSProperties   = { color: "#475569", fontSize: 13.5, margin: 0 };
const grid2: React.CSSProperties     = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const btnPrimary: React.CSSProperties = { width: "100%", background: "linear-gradient(90deg,#0369a1,#0e7ab5)", color: "#bae6fd", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 18px rgba(3,105,161,.28)", transition: "opacity .18s" };
const btnGhost: React.CSSProperties  = { background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,.12)", color: "#94a3b8", borderRadius: 9, padding: "7px 18px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };
const btnDanger: React.CSSProperties = { background: "rgba(248,113,113,0.08)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:rgba(14,165,233,0.04);top:-200px;right:-100px;animation:d1 24s ease-in-out infinite alternate}
  .orb2{width:400px;height:400px;background:rgba(129,140,248,0.04);bottom:-100px;left:-80px;animation:d2 28s ease-in-out infinite alternate}
  @keyframes d1{to{transform:translate(-60px,80px)}} @keyframes d2{to{transform:translate(60px,-60px)}}
  .fade-up{opacity:0;transform:translateY(16px);animation:fu .35s ease forwards}
  @keyframes fu{to{opacity:1;transform:translateY(0)}}
  .spinner{width:14px;height:14px;border:2px solid rgba(186,230,253,.2);border-top-color:#bae6fd;border-radius:50%;animation:sp .7s linear infinite;display:inline-block;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
  button:not(:disabled):hover{opacity:.82}
  textarea{font-family:'DM Sans',sans-serif}
`;