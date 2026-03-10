"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1500);
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
        .input-field {
          width:100%;
          background:rgba(6,13,26,0.9);
          border:1px solid rgba(148,163,184,0.1);
          border-radius:10px;
          color:#f1f5f9;
          font-family:'DM Sans',sans-serif;
          font-size:14px;
          padding:12px 16px;
          outline:none;
          transition:all 0.2s ease;
          box-sizing:border-box;
        }
        .input-field::placeholder{color:#475569}
        .input-field:focus{
          border-color:rgba(14,165,233,0.3);
          box-shadow:0 0 0 3px rgba(14,165,233,0.06);
        }
        .btn-primary {
          width:100%;
          padding:13px;
          background:linear-gradient(90deg,#0369a1 0%,#0369a1 60%,#0e7ab5 100%);
          color:#bae6fd;
          border-radius:10px;
          box-shadow:0 4px 12px rgba(3,105,161,0.2);
          font-family:'DM Sans',sans-serif;
          font-weight:600;
          font-size:15px;
          border:none;
          cursor:pointer;
          transition:all 0.2s ease;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }
        .btn-primary:hover{
          box-shadow:0 4px 20px rgba(14,165,233,0.3);
          transform:translateY(-1px);
          filter:brightness(1.08);
        }
        .btn-primary:active{transform:translateY(0)}
        .btn-google {
          width:100%;
          padding:11px;
          background:rgba(6,13,26,0.6);
          border:1px solid rgba(148,163,184,0.1);
          border-radius:10px;
          cursor:pointer;
          color:#94a3b8;
          font-size:13px;
          font-family:'DM Sans',sans-serif;
          font-weight:500;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          transition:all 0.2s ease;
          box-sizing:border-box;
        }
        .btn-google:hover{
          background:rgba(148,163,184,0.06);
          color:#cbd5e1;
          border-color:rgba(148,163,184,0.2);
        }
      `}</style>

      {/* Aurora */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:"#060d1a", overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:520, height:520, top:-120, left:-80, borderRadius:"9999px", filter:"blur(80px)", background:"rgba(14,165,233,0.07)", animation:"drift1 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:420, height:420, top:"40%", right:-100, borderRadius:"9999px", filter:"blur(80px)", background:"rgba(14,165,233,0.05)", animation:"drift2 24s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:340, height:340, bottom:-60, left:"30%", borderRadius:"9999px", filter:"blur(80px)", background:"rgba(129,140,248,0.05)", animation:"drift3 20s ease-in-out infinite" }} />
      </div>

      <div style={{
        position:"relative", zIndex:1,
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"40px 16px", fontFamily:"'DM Sans',sans-serif",
      }}>

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
        <div className="fade-2" style={{
          width:"100%", maxWidth:420,
          background:"rgba(10,20,42,0.8)",
          backdropFilter:"blur(16px)",
          WebkitBackdropFilter:"blur(16px)",
          border:"1px solid rgba(148,163,184,0.08)",
          borderRadius:20,
          boxShadow:"inset 0 1px 0 rgba(255,255,255,0.03)",
          padding:"36px 32px",
        }}>

          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24, color:"#f1f5f9", letterSpacing:"-0.02em", margin:0, marginBottom:6 }}>
              Welcome back
            </h1>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>
              Sign in to your HealixPharm account
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com" required autoComplete="email" />
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <label style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize:12, color:"#38bdf8", textDecoration:"none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position:"relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  style={{ paddingRight:44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#475569", fontSize:16, padding:0, lineHeight:1 }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={{ marginTop:4 }}>
              <button type="submit" className="btn-primary">
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite", flexShrink:0 }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Signing in...
                  </>
                ) : "Sign in →"}
              </button>
            </div>

          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(148,163,184,0.08)" }} />
            <span style={{ fontSize:12, color:"#334155" }}>or</span>
            <div style={{ flex:1, height:1, background:"rgba(148,163,184,0.08)" }} />
          </div>

          {/* Google */}
          <button type="button" className="btn-google"
            onClick={() => { setLoading(true); setTimeout(() => router.push("/dashboard"), 1500); }}>
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

        </div>

        <p className="fade-3" style={{ marginTop:24, fontSize:14, color:"#475569" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color:"#38bdf8", textDecoration:"none", fontWeight:500 }}>Create one</Link>
        </p>

      </div>
    </>
  );
}