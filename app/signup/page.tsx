"use client";

import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // Redirect to register form page
    router.push("/register");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#e1e6f0] px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-center text-[#0c2242] mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Join HealiXPharm today
        </p>

        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <button
            type="submit"
            className="w-full bg-[#0c2242] text-white py-3 rounded-lg font-semibold"
          >
            Sign Up
          </button>
        </form>

      </div>
    </main>
  );
}