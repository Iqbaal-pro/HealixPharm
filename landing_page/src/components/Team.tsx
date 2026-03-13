"use client";
import { useEffect, useRef, useState } from "react";

const team = [
  {
    name: "Rukaiya Riyas",
    role: "Team Lead & Full Stack",
    desc: "Leads the team and oversees full stack development and system architecture.",
    skills: ["React", "Node.js", "Python"],
    img: "/team/rukaiya.jpg"
  },
  {
    name: "Nasrin Nas",
    role: "Backend & Database",
    desc: "Designs backend APIs and manages the database architecture powering HealixPharm.",
    skills: ["Python", "Flask", "MySQL"],
    img: "/team/nasrin.jpg"
  },
  {
    name: "Oneli Herath",
    role: "Frontend & UI/UX",
    desc: "Creates the user interface from Figma designs to responsive React components.",
    skills: ["Figma", "React", "CSS"],
    img: "/team/oneli.jpg"
  },
  {
    name: "Iqbaal Meedin",
    role: "WhatsApp & Twilio",
    desc: "Builds WhatsApp bot integrations using Twilio for patient communication.",
    skills: ["Twilio", "WhatsApp API", "JS"],
    img: "/team/iqbaal.jpg"
  },
  {
    name: "Theran De Alwis",
    role: "ML & Notifications",
    desc: "Develops ML models for medicine stock prediction and automated alerts.",
    skills: ["Python", "ML", "SMS APIs"],
    img: "/team/theran.jpg"
  },
  {
    name: "Maneth Liyanage",
    role: "QA & DevOps",
    desc: "Ensures quality testing and manages CI/CD deployment pipelines.",
    skills: ["Testing", "Docker", "CI/CD"],
    img: "/team/maneth.jpg"
  }
];

export default function Team() {

  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % team.length)
    }, 3500);
  };

  useEffect(() => {

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          startTimer();
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      })
    }, { threshold: 0.1 });

    if (ref.current) obs.observe(ref.current);

    return () => {
      obs.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    }

  }, []);

  const prev = () => {
    setActive(a => a === 0 ? team.length - 1 : a - 1);
    startTimer();
  };

  const next = () => {
    setActive(a => (a + 1) % team.length);
    startTimer();
  };

  const visible = [
    team[active % team.length],
    team[(active + 1) % team.length],
    team[(active + 2) % team.length]
  ];

  return (

    <section id="team" ref={ref} className="team-section reveal-up">

      <div className="team-inner">

        <div className="team-header">

          <h2 className="team-title">
            Our <span className="grad">Team</span>
          </h2>

          <p className="team-sub">
            Six students building technology to modernize Sri Lankan pharmacies.
          </p>

        </div>


        <div className="team-cards">

          {visible.map((m, i) => {

            const isCenter = i === 1;

            return (

              <div
                key={m.name}
                className={`team-card ${isCenter ? "center" : ""}`}
              >

                <div className="team-avatar">

                  <img src={m.img} alt={m.name} />

                </div>


                <div className="team-body">

                  <h3>{m.name}</h3>

                  <p className="role">{m.role}</p>

                  <p className="desc">{m.desc}</p>

                  <div className="skills">

                    {m.skills.map(s => (
                      <span key={s}>{s}</span>
                    ))}

                  </div>

                </div>

              </div>

            )

          })}

        </div>


        <div className="controls">

          <button onClick={prev}>‹</button>

          <div className="dots">

            {team.map((_, i) => (
              <button
                key={i}
                className={i === active ? "dot active" : "dot"}
                onClick={() => setActive(i)}
              />
            ))}

          </div>

          <button onClick={next}>›</button>

        </div>

      </div>


      <style jsx>{`

.team-section{
padding:140px 0;
position:relative;
}

.team-inner{
max-width:1100px;
margin:auto;
padding:0 24px;
}

.team-header{
text-align:center;
margin-bottom:70px;
}

.team-title{
font-size:48px;
font-weight:800;
margin-bottom:16px;
}

.team-sub{
font-size:18px;
color:#64748b;
max-width:500px;
margin:auto;
}

.team-cards{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:24px;
margin-bottom:40px;
}

.team-card{
background:rgba(255,255,255,0.05);
border:1px solid rgba(255,255,255,0.08);
border-radius:20px;
overflow:hidden;
backdrop-filter:blur(10px);
transition:all .4s ease;
opacity:.6;
transform:scale(.94);
}

.team-card.center{
opacity:1;
transform:scale(1.05);
box-shadow:0 30px 70px rgba(0,0,0,.25);
}

.team-card:hover{
transform:translateY(-8px) scale(1.05);
}

.team-avatar{
height:200px;
display:flex;
align-items:center;
justify-content:center;
background:linear-gradient(135deg,#38bdf820,#818cf810);
}

.team-avatar img{
width:120px;
height:120px;
border-radius:50%;
object-fit:cover;
border:3px solid rgba(255,255,255,0.3);
}

.team-body{
padding:24px;
}

.team-body h3{
font-size:20px;
margin-bottom:6px;
}

.role{
font-size:14px;
color:#38bdf8;
margin-bottom:12px;
}

.desc{
font-size:15px;
color:#64748b;
margin-bottom:16px;
line-height:1.7;
}

.skills{
display:flex;
flex-wrap:wrap;
gap:6px;
}

.skills span{
font-size:12px;
padding:5px 10px;
background:#38bdf810;
border:1px solid #38bdf830;
border-radius:999px;
}

.controls{
display:flex;
align-items:center;
justify-content:center;
gap:20px;
}

.controls button{
width:40px;
height:40px;
border-radius:50%;
border:1px solid rgba(255,255,255,0.15);
background:transparent;
color:#94a3b8;
cursor:pointer;
font-size:20px;
}

.controls button:hover{
color:#38bdf8;
border-color:#38bdf8;
}

.dots{
display:flex;
gap:6px;
}

.dot{
width:8px;
height:8px;
border-radius:50%;
background:#475569;
border:none;
cursor:pointer;
}

.dot.active{
width:24px;
border-radius:20px;
background:#38bdf8;
}

@media(max-width:900px){

.team-cards{
grid-template-columns:1fr;
}

.team-card{
opacity:1;
transform:none;
}

}

`}</style>

    </section>

  );

}