"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup, type SignupPayload } from "../routes/authRoutes";

const emailOk    = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const usernameOk = (v: string) => v.trim().length >= 3;
const pwOk       = (v: string) => v.length >= 8;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm_pw: "",
    pharmacy_name: "", contact_number: "", whatsapp_number: "", address: "",
    opening_hours: "", estimated_delivery_time: "",
    service_areas: "", service_charge: "",
    prescription_policy: "", refund_policy: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const step1Ok = usernameOk(form.username) && emailOk(form.email) && pwOk(form.password) && form.password === form.confirm_pw;
  const step2Ok = form.pharmacy_name.trim().length >= 2;

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload: SignupPayload = {
        username:      form.username.trim(),
        email:         form.email.trim(),
        password:      form.password,
        pharmacy_name: form.pharmacy_name.trim(),
        ...(form.contact_number          && { contact_number: form.contact_number }),
        ...(form.whatsapp_number         && { whatsapp_number: form.whatsapp_number }),
        ...(form.address                 && { address: form.address }),
        ...(form.opening_hours           && { opening_hours: form.opening_hours }),
        ...(form.estimated_delivery_time && { estimated_delivery_time: form.estimated_delivery_time }),
        ...(form.service_areas           && { service_areas: form.service_areas }),
        ...(form.service_charge          && { service_charge: form.service_charge }),
        ...(form.prescription_policy     && { prescription_policy: form.prescription_policy }),
        ...(form.refund_policy           && { refund_policy: form.refund_policy }),
      };
      await signup(payload);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#060d1a", position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="glass-card fade-up" style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: "52px 40px" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, color: "#4ade80" }}>✓</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(90deg,#4ade80,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 8px" }}>Pharmacy registered!</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Redirecting to login…</p>
          <div style={{ height: 3, background: "rgba(148,163,184,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#0369a1,#38bdf8)", animation: "grow 2.5s linear forwards" }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <div className="orb orb-blue-tl" />
      <div className="orb orb-indigo-bl" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>

        {/* ── LEFT PANEL ── */}
        <div className="fade-up" style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", borderRight: "1px solid rgba(148,163,184,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52 }}>
            <div className="icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="gradient-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>HealixPharm</span>
          </div>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: "#f1f5f9", margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Register your<br />pharmacy
          </h1>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.75, margin: "0 0 44px" }}>
            Create your account and pharmacy profile in 3 steps. You&apos;ll be managing stock, patients and reminders in minutes.
          </p>

          {[
            { n: "01", title: "Account",         desc: "Username, email & password" },
            { n: "02", title: "Pharmacy details", desc: "Name, contact & address" },
            { n: "03", title: "Policies & hours", desc: "Optional — can edit later" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, opacity: step > i+1 ? 0.45 : step === i+1 ? 1 : 0.35, transition: "opacity .3s" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: step > i+1 ? "rgba(74,222,128,0.12)" : step === i+1 ? "rgba(14,165,233,0.12)" : "rgba(148,163,184,0.05)", border: `1px solid ${step > i+1 ? "rgba(74,222,128,0.25)" : step === i+1 ? "rgba(14,165,233,0.25)" : "rgba(148,163,184,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 800, color: step > i+1 ? "#4ade80" : step === i+1 ? "#38bdf8" : "#334155" }}>
                {step > i+1 ? "✓" : s.n}
              </div>
              <div>
                <div style={{ color: step === i+1 ? "#f1f5f9" : "#475569", fontSize: 13.5, fontWeight: 600 }}>{s.title}</div>
                <div style={{ color: "#334155", fontSize: 12 }}>{s.desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(148,163,184,0.06)" }}>
            <span style={{ color: "#334155", fontSize: 13.5 }}>Already have an account? </span>
            <Link href="/login" style={{ color: "#38bdf8", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>Sign in →</Link>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px" }}>
          <div className="glass-card fade-up" style={{ width: "100%", maxWidth: 500, padding: "40px 38px", animationDelay: ".1s" }}>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 30 }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ height: 4, flex: s === step ? 2 : 1, borderRadius: 99, background: s < step ? "rgba(74,222,128,0.5)" : s === step ? "rgba(14,165,233,0.7)" : "rgba(148,163,184,0.1)", transition: "all .35s" }} />
              ))}
            </div>

            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 5px", letterSpacing: "-0.01em" }}>Create your account</h2>
                <p style={{ color: "#475569", fontSize: 13.5, margin: "0 0 22px" }}>Your login credentials for the dashboard.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  <Field label="Username">
                    <input className="input-field" type="text" placeholder="e.g. kasun_pharm" value={form.username} onChange={set("username")} autoComplete="username" />
                    {form.username && !usernameOk(form.username) && <Hint err>At least 3 characters required.</Hint>}
                  </Field>

                  <Field label="Email">
                    <input className="input-field" type="email" placeholder="you@pharmacy.lk" value={form.email} onChange={set("email")} autoComplete="email" />
                    {form.email && !emailOk(form.email) && <Hint err>Enter a valid email address.</Hint>}
                  </Field>

                  <Field label="Password">
                    <div style={{ position: "relative" }}>
                      <input className="input-field" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={set("password")} autoComplete="new-password" style={{ paddingRight: 44 }} />
                      <button onClick={() => setShowPw(v => !v)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 4, fontSize: 14 }}>{showPw ? "🙈" : "👁"}</button>
                    </div>
                    {form.password.length > 0 && (
                      <div style={{ marginTop: 7 }}>
                        <div style={{ height: 3, background: "rgba(148,163,184,0.06)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 99, transition: "width .3s,background .3s", width: form.password.length < 8 ? "30%" : form.password.length < 12 ? "65%" : "100%", background: form.password.length < 8 ? "#f87171" : form.password.length < 12 ? "#fbbf24" : "#4ade80" }} />
                        </div>
                        <span style={{ fontSize: 11.5, color: form.password.length < 8 ? "#f87171" : form.password.length < 12 ? "#fbbf24" : "#4ade80", marginTop: 3, display: "block" }}>
                          {form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Good" : "Strong"}
                        </span>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirm Password">
                    <div style={{ position: "relative" }}>
                      <input className="input-field" type={showCPw ? "text" : "password"} placeholder="Repeat password" value={form.confirm_pw} onChange={set("confirm_pw")} autoComplete="new-password" style={{ paddingRight: 44 }} />
                      <button onClick={() => setShowCPw(v => !v)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 4, fontSize: 14 }}>{showCPw ? "🙈" : "👁"}</button>
                    </div>
                    {form.confirm_pw && form.confirm_pw !== form.password && <Hint err>Passwords don&apos;t match.</Hint>}
                  </Field>
                </div>
                <button onClick={() => step1Ok && setStep(2)} disabled={!step1Ok} className="btn-primary" style={{ marginTop: 22, opacity: step1Ok ? 1 : 0.45 }}>
                  Continue →
                </button>
              </div>
            )}

            {/* ══ STEP 2 ══ */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 5px", letterSpacing: "-0.01em" }}>Pharmacy details</h2>
                <p style={{ color: "#475569", fontSize: 13.5, margin: "0 0 22px" }}>Tell us about your pharmacy.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <Field label="Pharmacy Name *">
                    <input className="input-field" type="text" placeholder="e.g. Negombo Central Pharmacy" value={form.pharmacy_name} onChange={set("pharmacy_name")} />
                  </Field>

                  <div className="grid-2">
                    <Field label="Contact Number">
                      <input className="input-field" type="tel" placeholder="+94 31 222 1234" value={form.contact_number} onChange={set("contact_number")} />
                    </Field>
                    <Field label="WhatsApp Number">
                      <input className="input-field" type="tel" placeholder="+94 77 123 4567" value={form.whatsapp_number} onChange={set("whatsapp_number")} />
                    </Field>
                  </div>

                  <Field label="Address">
                    <textarea className="input-field" placeholder="e.g. 45 Main Street, Negombo" value={form.address} onChange={set("address")} style={{ resize: "vertical", minHeight: 72 }} />
                  </Field>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button onClick={() => setStep(1)} className="btn-ghost" style={{ padding: "13px 18px", fontSize: 13.5 }}>← Back</button>
                  <button onClick={() => step2Ok && setStep(3)} disabled={!step2Ok} className="btn-primary" style={{ flex: 1, opacity: step2Ok ? 1 : 0.45 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* ══ STEP 3 ══ */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 5px", letterSpacing: "-0.01em" }}>Policies & hours</h2>
                <p style={{ color: "#475569", fontSize: 13.5, margin: "0 0 22px" }}>All optional — you can update these later in Settings.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <div className="grid-2">
                    <Field label="Opening Hours">
                      <input className="input-field" type="text" placeholder="e.g. Mon–Sat 8am–8pm" value={form.opening_hours} onChange={set("opening_hours")} />
                    </Field>
                    <Field label="Est. Delivery Time">
                      <input className="input-field" type="text" placeholder="e.g. 1–2 hours" value={form.estimated_delivery_time} onChange={set("estimated_delivery_time")} />
                    </Field>
                  </div>

                  <div className="grid-2">
                    <Field label="Service Areas">
                      <input className="input-field" type="text" placeholder="e.g. Negombo, Wattala" value={form.service_areas} onChange={set("service_areas")} />
                    </Field>
                    <Field label="Service Charge">
                      <input className="input-field" type="text" placeholder="e.g. 5% or LKR 150" value={form.service_charge} onChange={set("service_charge")} />
                    </Field>
                  </div>

                  <Field label="Prescription Policy">
                    <textarea className="input-field" placeholder="e.g. Valid prescription required for all Schedule H drugs…" value={form.prescription_policy} onChange={set("prescription_policy")} style={{ resize: "vertical", minHeight: 72 }} />
                  </Field>

                  <Field label="Refund Policy">
                    <textarea className="input-field" placeholder="e.g. No returns accepted on dispensed medications…" value={form.refund_policy} onChange={set("refund_policy")} style={{ resize: "vertical", minHeight: 72 }} />
                  </Field>
                </div>

                {error && <div className="err-box" style={{ marginTop: 16 }}><p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {error}</p></div>}

                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button onClick={() => { setStep(2); setError(""); }} className="btn-ghost" style={{ padding: "13px 18px", fontSize: 13.5 }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
                    {loading
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="spinner" />Creating account…</span>
                      : "Register Pharmacy"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function Hint({ children, err }: { children: React.ReactNode; err?: boolean }) {
  return <p style={{ margin: "5px 0 0", fontSize: 12, color: err ? "#f87171" : "#475569" }}>{children}</p>;
}