import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
      <div className="mb-6 flex items-center gap-3">
        <div>
          
        </div>
        <div className="text-left">
          {/*<p className="text-blue-400 text-xs font-bold tracking-widest uppercase">
            HealixPharm
          </p>*/}
          <h1 className="text-2xl font-extrabold text-white">eChannelling Portal</h1>
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
        Book a Doctor <br />
        <span className="text-blue-400">Instantly</span>
      </h2>
      <p className="text-slate-400 text-lg mb-8 max-w-md">
        Find specialists, check availability and confirm your appointment — all in minutes.
      </p>

      <Link
        href="/channel"
        className="btn-primary px-8 py-4 text-lg inline-block rounded-xl"
      >
        Find a Doctor
      </Link>

      <div className="mt-16 grid grid-cols-3 gap-12">
        {[
          { value: "50+", label: "Doctors" },
          { value: "8",   label: "Hospitals" },
          { value: "24/7",label: "Booking" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-extrabold text-blue-400">{s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}