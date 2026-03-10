"use client";

import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  return (
    <>
      {/* Aurora */}
      <div style={{position:"fixed",inset:0,zIndex:0,background:"#060d1a",overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",width:600,height:600,top:-150,left:-100,borderRadius:"9999px",filter:"blur(90px)",background:"rgba(14,165,233,0.07)",animation:"drift1 18s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:500,height:500,top:"40%",right:-120,borderRadius:"9999px",filter:"blur(90px)",background:"rgba(14,165,233,0.05)",animation:"drift2 24s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:400,height:400,bottom:-80,left:"35%",borderRadius:"9999px",filter:"blur(90px)",background:"rgba(129,140,248,0.05)",animation:"drift3 20s ease-in-out infinite"}}/>
      </div>

      <div style={{
        position:"relative", zIndex:1,
        minHeight:"100vh",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"40px 24px", textAlign:"center",
      }}>

        {/* Logo */}
        <div className="fade-1" style={{marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12}}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:"linear-gradient(135deg,#0369a1,#818cf8)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:700, color:"#fff",
              fontFamily:"'Syne',sans-serif",
              boxShadow:"0 0 24px rgba(14,165,233,0.2)",
            }}>H</div>
            <span style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:26, color:"#f1f5f9", letterSpacing:"-0.02em",
            }}>
              Healix<span className="gradient-text">Pharm</span>
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="fade-2" style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(14,165,233,0.08)",
          border:"1px solid rgba(14,165,233,0.18)",
          borderRadius:99, padding:"6px 16px", marginBottom:28,
        }}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
          <span style={{fontSize:12,color:"#7dd3fc",fontWeight:500,letterSpacing:"0.04em"}}>
            Smart Pharmacy Management
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-2" style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(32px,6vw,62px)",
          lineHeight:1.1, letterSpacing:"-0.03em",
          color:"#f1f5f9", margin:0, marginBottom:18, maxWidth:680,
        }}>
          The smarter way to{" "}
          <span className="gradient-text">run your pharmacy</span>
        </h1>

        {/* Tagline */}
        <p className="fade-3" style={{
          fontSize:"clamp(14px,2vw,17px)",
          color:"#64748b", lineHeight:1.7,
          maxWidth:480, margin:"0 0 44px",
        }}>
          Automate inventory, track prescriptions and connect with patients — all in one place.
        </p>

        {/* Buttons */}
        <div className="fade-4" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          <button className="btn-primary" onClick={()=>router.push("/signup")}>
            Get started →
          </button>
          <button className="btn-ghost" onClick={()=>router.push("/login")}>
            Sign in
          </button>
        </div>

      </div>
    </>
  );
}