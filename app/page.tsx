import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-white px-6">
      <section className="flex flex-col items-center text-center max-w-md w-full">

        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="HealiXPharm Logo"
            width={180}
            height={180}
            priority
          />
        </div>

        {/* Tagline */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#0c2242] mb-4">
          Smart, Connected Pharmacy Care
        </h1>
        <p className="text-lg text-[#0c2242] mb-10">
          Automation + AI to simplify pharmacy management & patient care
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-[#0c2242] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="border-2 border-[#0c2242] text-[#0c2242] px-6 py-3 rounded-lg font-semibold hover:bg-[#0c2242] hover:text-white transition"
          >
            Sign Up
          </Link>
        </div>

      </section>
    </main>
  );
}
