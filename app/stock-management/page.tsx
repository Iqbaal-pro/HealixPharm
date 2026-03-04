"use client";

import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes drift1{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,-30px)}66%{transform:translate(-20px,20px)}}
        @keyframes drift2{0%,100%{transform:translate(0,0)}33%{transform:translate(-50px,40px)}66%{transform:translate(30px,-20px)}}
        @keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(25px,35px)}}
        @keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}

        .fade-1{animation:fadeInUp 0.6s ease 0.1s both}
        .fade-2{animation:fadeInUp 0.6s ease 0.2s both}
        .fade-3{animation:fadeInUp 0.6s ease 0.3s both}
        .fade-4{animation:fadeInUp 0.6s ease 0.4s both}
        .fade-5{animation:fadeInUp 0.6s ease 0.5s both}

        .btn-primary{
          padding:13px 32px;
          background:linear-gradient(90deg,#0369a1 0%,#0369a1 60%,#0e7ab5 100%);
          color:#bae6fd;
          border-radius:10px;
          box-shadow:0 4px 12px rgba(3,105,161,0.25);
          font-family:'DM Sans',sans-serif;
          font-weight:600;
          font-size:15px;
          border:none;
          cursor:pointer;
          transition:all 0.2s ease;
        }
        .btn-primary:hover{
          box-shadow:0 4px 24px rgba(14,165,233,0.35);
          transform:translateY(-2px);
          filter:brightness(1.08);
        }
        .btn-primary:active{transform:translateY(0)}

        .btn-ghost{
          padding:13px 32px;
          background:rgba(148,163,184,0.06);
          color:#94a3b8;
          border-radius:10px;
          border:1px solid rgba(148,163,184,0.15);
          font-family:'DM Sans',sans-serif;
          font-weight:500;
          font-size:15px;
          cursor:pointer;
          transition:all 0.2s ease;
        }
        .btn-ghost:hover{
          background:rgba(148,163,184,0.1);
          color:#cbd5e1;
          border-color:rgba(148,163,184,0.25);
          transform:translateY(-2px);
        }
        .btn-ghost:active{transform:translateY(0)}

        .feature-card{
          background:rgba(10,20,42,0.8);
          backdrop-filter:blur(16px);
          border:1px solid rgba(148,163,184,0.08);
          border-radius:18px;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);
          padding:28px 24px;
          transition:transform 0.22s, border-color 0.22s, box-shadow 0.22s;
        }
        .feature-card:hover{
          transform:translateY(-4px);
          border-color:rgba(14,165,233,0.2);
          box-shadow:0 8px 28px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .stat-card{
          background:rgba(10,20,42,0.6);
          backdrop-filter:blur(12px);
          border:1px solid rgba(148,163,184,0.07);
          border-radius:14px;
          padding:20px 24px;
          text-align:center;
        }
      `}</style>

      {/* Aurora Background */}
      <div style={{position:"fixed",inset:0,zIndex:0,background:"#060d1a",overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",width:600,height:600,top:-150,left:-100,borderRadius:"9999px",filter:"blur(90px)",background:"rgba(14,165,233,0.07)",animation:"drift1 18s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:500,height:500,top:"40%",right:-120,borderRadius:"9999px",filter:"blur(90px)",background:"rgba(14,165,233,0.05)",animation:"drift2 24s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:400,height:400,bottom:-80,left:"35%",borderRadius:"9999px",filter:"blur(90px)",background:"rgba(129,140,248,0.05)",animation:"drift3 20s ease-in-out infinite"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",background:"transparent"}}>

        {/* ── Navbar ── */}
        <nav style={{
          height:64, display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 40px",
          background:"rgba(6,13,26,0.7)",
          backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,0.04)",
          position:"sticky", top:0, zIndex:10,
        }}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#0369a1,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>H</div>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:"#f1f5f9",letterSpacing:"-0.02em"}}>
              Healix<span style={{background:"linear-gradient(90deg,#38bdf8,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Pharm</span>
            </span>
          </div>

          {/* Nav buttons */}
          <div style={{display:"flex",gap:10}}>
            <button className="btn-ghost" style={{padding:"8px 20px",fontSize:13}} onClick={()=>router.push("/login")}>
              Sign in
            </button>
            <button className="btn-primary" style={{padding:"8px 20px",fontSize:13}} onClick={()=>router.push("/signup")}>
              Get started
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          textAlign:"center", padding:"100px 24px 80px",
        }}>
          {/* Badge */}
          <div className="fade-1" style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(14,165,233,0.08)",
            border:"1px solid rgba(14,165,233,0.2)",
            borderRadius:99, padding:"6px 16px", marginBottom:28,
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
            <span style={{fontSize:12,color:"#7dd3fc",fontWeight:500,letterSpacing:"0.04em"}}>
              Smart Pharmacy Platform — Now Live
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-2" style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:"clamp(36px, 6vw, 68px)",
            lineHeight:1.08, letterSpacing:"-0.03em",
            color:"#f1f5f9", margin:0, marginBottom:20,
            maxWidth:780,
          }}>
            The smarter way to{" "}
            <span style={{background:"linear-gradient(90deg,#38bdf8,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              manage your pharmacy
            </span>
          </h1>

          {/* Subheadline */}
          <p className="fade-3" style={{
            fontSize:"clamp(15px, 2vw, 18px)",
            color:"#64748b", lineHeight:1.7,
            maxWidth:560, margin:"0 0 40px",
          }}>
            HealixPharm automates inventory, tracks prescriptions, sends refill reminders via WhatsApp, and keeps your pharmacy running without manual errors.
          </p>

          {/* CTA Buttons */}
          <div className="fade-4" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <button className="btn-primary" onClick={()=>router.push("/signup")}>
              Get started free →
            </button>
            <button className="btn-ghost" onClick={()=>router.push("/login")}>
              Sign in to dashboard
            </button>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="fade-4" style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))",
          gap:16, maxWidth:900, margin:"0 auto 80px",
          padding:"0 24px",
        }}>
          {[
            { value:"99.9%", label:"Uptime" },
            { value:"< 2s",  label:"Avg response time" },
            { value:"10k+",  label:"Prescriptions processed" },
            { value:"24/7",  label:"WhatsApp bot active" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,background:"linear-gradient(90deg,#38bdf8,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>
                {s.value}
              </div>
              <div style={{fontSize:12,color:"#475569",fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── Features ── */}
        <section style={{maxWidth:1000,margin:"0 auto 100px",padding:"0 24px"}}>
          <div className="fade-4" style={{textAlign:"center",marginBottom:48}}>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"clamp(24px,4vw,36px)",color:"#f1f5f9",letterSpacing:"-0.02em",margin:0,marginBottom:10}}>
              Everything your pharmacy needs
            </h2>
            <p style={{color:"#475569",fontSize:15,margin:0}}>
              One platform. Every workflow covered.
            </p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                ),
                accent:"#38bdf8",
                title:"Smart Inventory",
                desc:"Track stock levels, batch numbers and expiry dates in real-time. FEFO dispatch enforced automatically.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                  </svg>
                ),
                accent:"#818cf8",
                title:"Prescription Queue",
                desc:"Manage incoming prescriptions, track dispensing status and maintain a full audit trail.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                ),
                accent:"#4ade80",
                title:"WhatsApp Bot",
                desc:"Patients order medicines, channel doctors and get refill reminders — all through WhatsApp.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                ),
                accent:"#f59e0b",
                title:"Refill Reminders",
                desc:"Automated SMS and WhatsApp alerts sent to patients before they run out of medication.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="1" y="3" width="15" height="13" rx="2"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                ),
                accent:"#a78bfa",
                title:"Delivery Tracking",
                desc:"Manage medicine deliveries, track status and notify patients automatically on dispatch.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ),
                accent:"#ef4444",
                title:"Low Stock Alerts",
                desc:"Get notified before medicines run out. Critical items flagged instantly with reorder suggestions.",
              },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div style={{
                  width:44, height:44, borderRadius:12,
                  background:`${f.accent}14`,
                  border:`1px solid ${f.accent}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:f.accent, marginBottom:18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9",margin:0,marginBottom:8,letterSpacing:"-0.01em"}}>
                  {f.title}
                </h3>
                <p style={{fontSize:13.5,color:"#64748b",lineHeight:1.65,margin:0}}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section style={{
          textAlign:"center", padding:"60px 24px 100px",
          borderTop:"1px solid rgba(148,163,184,0.06)",
        }}>
          <h2 className="fade-5" style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(24px,4vw,40px)",color:"#f1f5f9",letterSpacing:"-0.02em",margin:0,marginBottom:12}}>
            Ready to modernise your pharmacy?
          </h2>
          <p className="fade-5" style={{color:"#475569",fontSize:15,marginBottom:36}}>
            Join HealixPharm today — free to get started.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={()=>router.push("/signup")}>
              Create free account →
            </button>
            <button className="btn-ghost" onClick={()=>router.push("/login")}>
              Sign in
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          borderTop:"1px solid rgba(148,163,184,0.06)",
          padding:"24px 40px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:12,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#0369a1,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Syne',sans-serif"}}>H</div>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#334155"}}>HealixPharm</span>
          </div>
          <span style={{fontSize:12,color:"#1e3a5f"}}>© 2025 HealixPharm. All rights reserved.</span>
        </footer>

      </div>
    </>
  );
}