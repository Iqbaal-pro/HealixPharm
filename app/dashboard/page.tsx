"use client";
import StatCard from "../components/StatCard";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#0c2242]">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
          Welcome to HealiXPharm Admin Panel
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-500">

        <StatCard
          title="Total Medicines"
          value="1,240"
          color="bg-blue-500"
        />

        <StatCard
          title="Low Stock Items"
          value="18"
          color="bg-red-500"
        />

        <StatCard
          title="Pending Orders"
          value="32"
          color="bg-yellow-500"
        />

        <StatCard
          title="Registered Patients"
          value="542"
          color="bg-green-500"
        />

      </div>

    </div>
  );
}