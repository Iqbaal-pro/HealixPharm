"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { login, saveAuthToStorage } from "../routes/authRoutes";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [form, setForm] = useState({ username_or_email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username_or_email.trim() || !form.password) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await login({ username_or_email: form.username_or_email.trim(), password: form.password });
      saveAuthToStorage(res);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes drift1 { 0%,100%{transform:translate(0,0)}33%{transform:translate(40px,-30px)}66%{transform:translate(-20px,20px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)}33%{transform:translate(-50px,40px)}66%{transform:translate(30px,-20px)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0)}50%{transform:translate(25px,35px)} }
        @keyframes fadeInUp { 0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-1{animation:fadeInUp 0.5s ease 0.08s both}
        .fade-2{animation:fadeInUp 0.5s ease 0.16s both}
        .fade-3{animation:fadeInUp 0.5s ease 0.24s both}
        .login-input {
          width:100%; background:rgba(6,13,26,0.9);
          border:1px solid rgba(148,163,184,0.1); border-radius:10px;
          color:#f1f5f9; font-family:'DM Sans',sans-serif; font-size:14px;
          padding:12px 16px; outline:none; transition:all 0.2s ease; box-sizing:border-box;
        }
        .login-input::placeholder{color:#475569}
        .login-input:focus{ border-color:rgba(14,165,233,0.3); box-shadow:0 0 0 3px rgba(14,165,233,0.06); }
        .btn-primary {
          width:100%; padding:13px;
          background:linear-gradient(90deg,#0369a1 0%,#0369a1 60%,#0e7ab5 100%);
          color:#bae6fd; border-radius:10px; box-shadow:0 4px 12px rgba(3,105,161,0.2);
          font-family:'DM Sans',sans-serif; font-weight:600; font-size:15px;
          border:none; cursor:pointer; transition:all 0.2s ease;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed}
        .btn-primary:not(:disabled):hover{ box-shadow:0 4px 20px rgba(14,165,233,0.3); transform:translateY(-1px); filter:brightness(1.08); }
      `}</style>

      {/* Aurora */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:"#060d1a", overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:520, height:520, top:-120, left:-80, borderRadius:"9999px", filter:"blur(80px)", background:"rgba(14,165,233,0.07)", animation:"drift1 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:420, height:420, top:"40%", right:-100, borderRadius:"9999px", filter:"blur(80px)", background:"rgba(14,165,233,0.05)", animation:"drift2 24s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:340, height:340, bottom:-60, left:"30%", borderRadius:"9999px", filter:"blur(80px)", background:"rgba(129,140,248,0.05)", animation:"drift3 20s ease-in-out infinite" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 16px", fontFamily:"'DM Sans',sans-serif" }}>

        {/* Logo */}
        <div className="fade-1" style={{ marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#0369a1,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff", fontFamily:"'Syne',sans-serif" }}>H</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, color:"#f1f5f9", letterSpacing:"-0.02em" }}>
              Healix<span style={{ background:"linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Pharm</span>
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="fade-2" style={{ width:"100%", maxWidth:420, background:"rgba(10,20,42,0.8)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", border:"1px solid rgba(148,163,184,0.08)", borderRadius:20, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.03)", padding:"36px 32px" }}>

          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24, color:"#f1f5f9", letterSpacing:"-0.02em", margin:0, marginBottom:6 }}>Welcome back</h1>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>Sign in to your HealixPharm account</p>
          </div>

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>Username or Email</label>
              <input
                type="text" className="login-input"
                placeholder="username or you@example.com"
                value={form.username_or_email} onChange={set("username_or_email")}
                autoComplete="username" required
              />
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>Password</label>
              </div>
              <div style={{ position:"relative" }}>
                <input
                  type={showPassword ? "text" : "password"} className="login-input"
                  placeholder="••••••••" value={form.password} onChange={set("password")}
                  autoComplete="current-password" required style={{ paddingRight:44 }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:1, display:"flex" }}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", fontSize:13 }}>
                {error}
              </div>
            )}

            <div style={{ marginTop:4 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite", flexShrink:0 }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Signing in…
                  </>
                ) : "Sign in"}
              </button>
            </div>

          </form>
        </div>

        <p className="fade-3" style={{ marginTop:24, fontSize:14, color:"#475569" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color:"#38bdf8", textDecoration:"none", fontWeight:500 }}>Create one</Link>
        </p>

      </div>
    </>
  );
}