"use client";

import { useState } from "react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const [search, setSearch] = useState("");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .search-input {
          width: 100%;
          background: rgba(6,13,26,0.9);
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 10px;
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 9px 14px 9px 38px;
          outline: none;
          transition: all 0.2s;
        }
        .search-input::placeholder { color: #334155; }
        .search-input:focus {
          border-color: rgba(14,165,233,0.3);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.06);
        }
        .icon-btn {
          background: rgba(148,163,184,0.06);
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 10px;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .icon-btn:hover {
          background: rgba(148,163,184,0.1);
          color: #94a3b8;
        }
      `}</style>

      <header style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "rgba(6,13,26,0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        gap: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="icon-btn"
          style={{ border: "none" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="#334155" strokeWidth="2"
            style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search medicines, patients, orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Notification bell */}
          <button className="icon-btn" style={{ position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: "absolute", top: 7, right: 7,
              width: 7, height: 7, borderRadius: "50%",
              background: "#ef4444",
              border: "1.5px solid #060d1a",
            }} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "rgba(148,163,184,0.08)" }} />

          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#0369a1,#818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
            cursor: "pointer", flexShrink: 0,
            fontFamily: "'Syne',sans-serif",
          }}>A</div>
        </div>
      </header>
    </>
  );
}