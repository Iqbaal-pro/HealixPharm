import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl"></span>
          <span className="font-extrabold text-white text-sm">HealixPharm</span>
          <span className="text-slate-600 text-sm">/ eChannelling</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
          Live
        </div>
      </div>
    </nav>
  );
}