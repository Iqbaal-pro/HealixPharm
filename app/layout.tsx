"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages where navbar & sidebar should NOT appear
  const hideLayout =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/";

  return (
    <html lang="en">
      <body>
        {hideLayout ? (
          children
        ) : (
          <div className="flex min-h-screen">

            {/* Sidebar */}
            {sidebarOpen && (
              <Sidebar closeSidebar={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

              {/* Navbar */}
              <Navbar
                toggleSidebar={() => setSidebarOpen(true)}
                sidebarOpen={sidebarOpen}
              />

              <main className="flex-1 bg-gray-100 p-6">
                {children}
              </main>

            </div>
          </div>
        )}
      </body>
    </html>
  );
}