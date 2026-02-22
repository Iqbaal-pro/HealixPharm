"use client";

import Link from "next/link";

type NavbarProps = {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
};

export default function Navbar({
  toggleSidebar,
  sidebarOpen,
}: NavbarProps) {
  return (
    <nav className="w-full bg-[#0c2242] text-white px-6 py-4 flex justify-between items-center shadow-md">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">

        {/* ☰ Button (Hide when sidebar open) */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="text-2xl font-bold"
          >
            ☰
          </button>
        )}

        <h1 className="text-xl font-bold tracking-wide">
          HealiXPharm
        </h1>
      </div>

      {/* RIGHT SIDE - Logout ALWAYS visible */}
      <Link
        href="/login"
        className="bg-white text-[#0c2242] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
      >
        Logout
      </Link>

    </nav>
  );
}