"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup, type SignupPayload } from "../routes/authRoutes";

const emailOk    = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const usernameOk = (v: string) => v.trim().length >= 3;
const pwOk       = (v: string) => v.length >= 8;

// ── Single source of truth for input styles — uses individual border props only
// This avoids the React "border vs borderColor" rerender warning entirely.
function iStyle(focused: boolean, hasError = false): React.CSSProperties {
  return {
    width: "100%",
    background: "rgba(6,13,26,0.9)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: hasError
      ? "rgba(248,113,113,0.55)"
      : focused
      ? "rgba(56,189,248,0.5)"
      : "rgba(148,163,184,0.1)",
    boxShadow: focused && !hasError ? "0 0 0 3px rgba(56,189,248,0.07)" : "none",
    borderRadius: 11,
    color: "#f1f5f9",
    padding: "11px 14px",
    fontSize: 13.5,
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color .2s, box-shadow .2s",
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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

  const fo = (k: string) => focused === k;

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
    <div style={pageWrap}>
      <style>{CSS}</style>
      <div style={gridBg} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="scale-in" style={{ ...card, maxWidth: 380, textAlign: "center", padding: "52px 40px" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(74,222,128,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(74,222,128,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, color: "#4ade80" }}>✓</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(90deg,#4ade80,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 8px" }}>Pharmacy registered!</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Redirecting to login…</p>
          <div style={{ height: 3, background: "rgba(148,163,184,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#0369a1,#38bdf8)", animation: "grow 2.5s linear forwards" }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageWrap}>
      <style>{CSS}</style>
      <div style={gridBg} />
      <div className="orb orb1" /><div className="orb orb2" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>

        {/* ── LEFT PANEL ── */}
        <div className="fade-up" style={leftPanel}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52 }}>
            <div style={logoBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={logoText}>HealixPharm</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: "#f1f5f9", margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Register your<br />pharmacy
          </h1>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.75, margin: "0 0 44px" }}>
            Create your account and pharmacy profile in 3 steps. You&apos;ll be managing stock, patients and reminders in minutes.
          </p>
          {[
            { n: "01", title: "Account",          desc: "Username, email & password" },
            { n: "02", title: "Pharmacy details",  desc: "Name, contact & address" },
            { n: "03", title: "Policies & hours",  desc: "Optional — can edit later" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, opacity: step > i+1 ? 0.45 : step === i+1 ? 1 : 0.35, transition: "opacity .3s" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: step > i+1 ? "rgba(74,222,128,0.12)" : step === i+1 ? "rgba(14,165,233,0.12)" : "rgba(148,163,184,0.05)", borderWidth: 1, borderStyle: "solid", borderColor: step > i+1 ? "rgba(74,222,128,0.25)" : step === i+1 ? "rgba(14,165,233,0.25)" : "rgba(148,163,184,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 800, color: step > i+1 ? "#4ade80" : step === i+1 ? "#38bdf8" : "#334155" }}>
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
          <div className="fade-up" style={{ ...card, width: "100%", maxWidth: 500, animationDelay: ".1s" }}>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 30 }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ height: 4, flex: s === step ? 2 : 1, borderRadius: 99, background: s < step ? "rgba(74,222,128,0.5)" : s === step ? "rgba(14,165,233,0.7)" : "rgba(148,163,184,0.1)", transition: "all .35s" }} />
              ))}
            </div>

            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <div className="step-in">
                <h2 style={stepH}>Create your account</h2>
                <p style={stepSub}>Your login credentials for the dashboard.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  <Field label="Username">
                    <input type="text" placeholder="e.g. kasun_pharm" value={form.username}
                      onChange={set("username")} onFocus={() => setFocused("un")} onBlur={() => setFocused(null)}
                      style={iStyle(fo("un"))} autoComplete="username" />
                    {form.username && !usernameOk(form.username) && <Hint err>At least 3 characters required.</Hint>}
                  </Field>

                  <Field label="Email">
                    <input type="email" placeholder="you@pharmacy.lk" value={form.email}
                      onChange={set("email")} onFocus={() => setFocused("em")} onBlur={() => setFocused(null)}
                      style={iStyle(fo("em"))} autoComplete="email" />
                    {form.email && !emailOk(form.email) && <Hint err>Enter a valid email address.</Hint>}
                  </Field>

                  <Field label="Password">
                    <div style={{ position: "relative" }}>
                      <input type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={form.password}
                        onChange={set("password")} onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)}
                        style={{ ...iStyle(fo("pw")), paddingRight: 44 }} autoComplete="new-password" />
                      <button onClick={() => setShowPw(v => !v)} style={eyeBtn} type="button">{showPw ? "🙈" : "👁"}</button>
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
                      <input type={showCPw ? "text" : "password"} placeholder="Repeat password" value={form.confirm_pw}
                        onChange={set("confirm_pw")} onFocus={() => setFocused("cpw")} onBlur={() => setFocused(null)}
                        style={{ ...iStyle(fo("cpw"), !!(form.confirm_pw && form.confirm_pw !== form.password)), paddingRight: 44 }}
                        autoComplete="new-password" />
                      <button onClick={() => setShowCPw(v => !v)} style={eyeBtn} type="button">{showCPw ? "🙈" : "👁"}</button>
                    </div>
                    {form.confirm_pw && form.confirm_pw !== form.password && <Hint err>Passwords don&apos;t match.</Hint>}
                  </Field>
                </div>
                <button onClick={() => step1Ok && setStep(2)} disabled={!step1Ok}
                  style={{ ...btnPrimary, marginTop: 22, opacity: step1Ok ? 1 : 0.45 }}>
                  Continue →
                </button>
              </div>
            )}

            {/* ══ STEP 2 ══ */}
            {step === 2 && (
              <div className="step-in">
                <h2 style={stepH}>Pharmacy details</h2>
                <p style={stepSub}>Tell us about your pharmacy.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <Field label="Pharmacy Name *">
                    <input type="text" placeholder="e.g. Negombo Central Pharmacy" value={form.pharmacy_name}
                      onChange={set("pharmacy_name")} onFocus={() => setFocused("pn")} onBlur={() => setFocused(null)}
                      style={iStyle(fo("pn"))} />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Contact Number">
                      <input type="tel" placeholder="+94 31 222 1234" value={form.contact_number}
                        onChange={set("contact_number")} onFocus={() => setFocused("cn")} onBlur={() => setFocused(null)}
                        style={iStyle(fo("cn"))} />
                    </Field>
                    <Field label="WhatsApp Number">
                      <input type="tel" placeholder="+94 77 123 4567" value={form.whatsapp_number}
                        onChange={set("whatsapp_number")} onFocus={() => setFocused("wn")} onBlur={() => setFocused(null)}
                        style={iStyle(fo("wn"))} />
                    </Field>
                  </div>

                  <Field label="Address">
                    <textarea placeholder="e.g. 45 Main Street, Negombo" value={form.address}
                      onChange={set("address")} onFocus={() => setFocused("addr")} onBlur={() => setFocused(null)}
                      style={{ ...iStyle(fo("addr")), resize: "vertical", minHeight: 72 }} />
                  </Field>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button onClick={() => setStep(1)} style={btnGhost}>← Back</button>
                  <button onClick={() => step2Ok && setStep(3)} disabled={!step2Ok}
                    style={{ ...btnPrimary, flex: 1, opacity: step2Ok ? 1 : 0.45 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* ══ STEP 3 ══ */}
            {step === 3 && (
              <div className="step-in">
                <h2 style={stepH}>Policies & hours</h2>
                <p style={stepSub}>All optional — you can update these later in Settings.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Opening Hours">
                      <input type="text" placeholder="e.g. Mon–Sat 8am–8pm" value={form.opening_hours}
                        onChange={set("opening_hours")} onFocus={() => setFocused("oh")} onBlur={() => setFocused(null)}
                        style={iStyle(fo("oh"))} />
                    </Field>
                    <Field label="Est. Delivery Time">
                      <input type="text" placeholder="e.g. 1–2 hours" value={form.estimated_delivery_time}
                        onChange={set("estimated_delivery_time")} onFocus={() => setFocused("edt")} onBlur={() => setFocused(null)}
                        style={iStyle(fo("edt"))} />
                    </Field>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Service Areas">
                      <input type="text" placeholder="e.g. Negombo, Wattala" value={form.service_areas}
                        onChange={set("service_areas")} onFocus={() => setFocused("sa")} onBlur={() => setFocused(null)}
                        style={iStyle(fo("sa"))} />
                    </Field>
                    <Field label="Service Charge">
                      <input type="text" placeholder="e.g. 5% or LKR 150" value={form.service_charge}
                        onChange={set("service_charge")} onFocus={() => setFocused("sc")} onBlur={() => setFocused(null)}
                        style={iStyle(fo("sc"))} />
                    </Field>
                  </div>

                  <Field label="Prescription Policy">
                    <textarea placeholder="e.g. Valid prescription required for all Schedule H drugs…" value={form.prescription_policy}
                      onChange={set("prescription_policy")} onFocus={() => setFocused("pp")} onBlur={() => setFocused(null)}
                      style={{ ...iStyle(fo("pp")), resize: "vertical", minHeight: 72 }} />
                  </Field>

                  <Field label="Refund Policy">
                    <textarea placeholder="e.g. No returns accepted on dispensed medications…" value={form.refund_policy}
                      onChange={set("refund_policy")} onFocus={() => setFocused("rp")} onBlur={() => setFocused(null)}
                      style={{ ...iStyle(fo("rp")), resize: "vertical", minHeight: 72 }} />
                  </Field>
                </div>

                {error && (
                  <div style={{ background: "rgba(239,68,68,0.07)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: "11px 14px", marginTop: 16 }}>
                    <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>⚠ {error}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button onClick={() => { setStep(2); setError(""); }} style={btnGhost}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.6 : 1 }}>
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
      <label style={{ display: "block", color: "#64748b", fontSize: 11.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const, marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

function Hint({ children, err }: { children: React.ReactNode; err?: boolean }) {
  return <p style={{ margin: "5px 0 0", fontSize: 12, color: err ? "#f87171" : "#475569" }}>{children}</p>;
}

const pageWrap: React.CSSProperties   = { minHeight: "100vh", background: "#060d1a", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" };
const gridBg: React.CSSProperties    = { position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(148,163,184,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.025) 1px,transparent 1px)", backgroundSize: "52px 52px" };
const leftPanel: React.CSSProperties  = { flex: "0 0 380px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", borderRight: "1px solid rgba(148,163,184,0.05)" };
const card: React.CSSProperties      = { background: "rgba(10,20,42,0.85)", backdropFilter: "blur(20px)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,0.09)", borderRadius: 24, boxShadow: "0 32px 80px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)", padding: "40px 38px" };
const logoBox: React.CSSProperties   = { width: 38, height: 38, borderRadius: 11, background: "rgba(14,165,233,0.1)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center" };
const logoText: React.CSSProperties  = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const stepH: React.CSSProperties     = { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(90deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 5px", letterSpacing: "-0.01em" };
const stepSub: React.CSSProperties   = { color: "#475569", fontSize: 13.5, margin: "0 0 22px" };
const eyeBtn: React.CSSProperties    = { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 4, fontSize: 14 };
const btnPrimary: React.CSSProperties = { width: "100%", background: "linear-gradient(90deg,#0369a1,#0e7ab5)", color: "#bae6fd", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 18px rgba(3,105,161,.28)", transition: "opacity .18s" };
const btnGhost: React.CSSProperties  = { background: "transparent", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(148,163,184,.12)", color: "#94a3b8", borderRadius: 12, padding: "13px 18px", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", whiteSpace: "nowrap" as const };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:500px;height:500px;background:rgba(14,165,233,0.05);top:-180px;left:-160px;animation:d1 22s ease-in-out infinite alternate}
  .orb2{width:380px;height:380px;background:rgba(129,140,248,0.04);bottom:-120px;right:-100px;animation:d2 26s ease-in-out infinite alternate}
  @keyframes d1{to{transform:translate(80px,100px)}} @keyframes d2{to{transform:translate(-60px,-70px)}}
  .fade-up{opacity:0;transform:translateY(20px);animation:fu .5s ease forwards}
  @keyframes fu{to{opacity:1;transform:translateY(0)}}
  .step-in{animation:si .25s ease forwards}
  @keyframes si{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
  .scale-in{opacity:0;transform:scale(.97);animation:scin .28s ease forwards}
  @keyframes scin{to{opacity:1;transform:scale(1)}}
  .spinner{width:15px;height:15px;border:2px solid rgba(186,230,253,.2);border-top-color:#bae6fd;border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
  @keyframes grow{from{width:0}to{width:100%}}
  button:not(:disabled):hover{opacity:.85}
  textarea{font-family:'DM Sans',sans-serif}
`;


