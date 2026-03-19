"use client";

import "./globals.css";
import { useState, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { isLoggedIn } from "./routes/authRoutes";

const AUTH_PAGES = ["/", "/login", "/signup", "/register"];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  const [authChecked, setAuthChecked] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthPage) {
      setAuthChecked(true);
      return;
    }
    if (!isLoggedIn()) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [pathname, isAuthPage, router]);

  const handleToggleSidebar = () => {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <html lang="en">
      <head>
        <title>HealixPharm</title>
        <meta name="description" content="Smart Pharmacy Management System" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {isAuthPage ? (
          <>{children}</>
        ) : !authChecked ? (
          /* Blank screen while checking token — avoids flash of protected content */
          <div style={{ minHeight: "100vh", background: "#0d1b2e" }} />
        ) : (
          <div style={{ display: "flex", minHeight: "100vh", background: "#0d1b2e" }}>

            {/* Aurora */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 600, height: 600, top: -200, left: -100, borderRadius: "9999px", filter: "blur(100px)", background: "rgba(14,165,233,0.05)" }} />
              <div style={{ position: "absolute", width: 400, height: 400, bottom: 0, right: -100, borderRadius: "9999px", filter: "blur(100px)", background: "rgba(129,140,248,0.04)" }} />
            </div>

            {/* Sidebar */}
            <Sidebar collapsed={collapsed} />

            {/* Main */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}>
              <Navbar onToggleSidebar={handleToggleSidebar} />
              <main style={{ flex: 1, overflowY: "auto" }}>
                {children}
              </main>
            </div>

          </div>
        )}
      </body>
    </html>
  );
}