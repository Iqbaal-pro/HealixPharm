"use client";

import Link from "next/link";

type SidebarProps = {
  closeSidebar: () => void;
};

export default function Sidebar({ closeSidebar }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-[#0c2242] text-white p-6 shadow-lg">
      
      {/* Close Button */}
      <div className="flex justify-end mb-6">
        <button onClick={closeSidebar} className="text-xl">
          ✕
        </button>
      </div>

      <ul className="space-y-4 text-sm font-medium">
        <li>
          <Link href="/dashboard" onClick={closeSidebar}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/stock-management" onClick={closeSidebar}>
            Stock Management
          </Link>
        </li>
        <li>
          <Link href="/prescription-queue" onClick={closeSidebar}>
            Prescription Queue
          </Link>
        </li>
         <li>
          <Link href="/orders-deliveries" onClick={closeSidebar}>
            Orders and Deliveries
          </Link>
        </li>
        <li>
          <Link href="/registered-patients" onClick={closeSidebar}>
            Registered Patients
          </Link>
        </li>  
      </ul>

      <div className="pt-6">
         
          <Link href="/settings" onClick={closeSidebar}>
            Settings
          </Link>
        
      </div>
    </aside>
  );
}