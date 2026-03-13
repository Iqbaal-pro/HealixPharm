"use client";

import "./globals.css";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup";

  return (
    <html lang="en">
      <head>
        <title>HealixPharm</title>
        <meta name="description" content="Smart Pharmacy Management System" />
      </head>
      <body>
        {isAuthPage ? (

          <>{children}</>

        ) : (

          <div style={{ display:"flex", minHeight:"100vh", background:"#0d1b2e" }}>

            {/* Aurora */}
            <div style={{
              position:"fixed", inset:0, zIndex:0,
              pointerEvents:"none", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", width:600, height:600, top:-200, left:-100, borderRadius:"9999px", filter:"blur(100px)", background:"rgba(14,165,233,0.05)" }}/>
              <div style={{ position:"absolute", width:400, height:400, bottom:0, right:-100, borderRadius:"9999px", filter:"blur(100px)", background:"rgba(129,140,248,0.04)" }}/>
            </div>

            {/* Sidebar */}
            <Sidebar collapsed={collapsed} />

            {/* Main */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, position:"relative", zIndex:1 }}>
              <Navbar onToggleSidebar={() => setCollapsed(c => !c)} />
              <main style={{ flex:1, overflowY:"auto" }}>
                {children}
              </main>
            </div>

          </div>

        )}
      </body>
    </html>
  );
}