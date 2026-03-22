import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spec     = searchParams.get("spec")     ?? "";
  const hospital = searchParams.get("hospital") ?? "";
  const name     = searchParams.get("name")     ?? "";

  const q = new URLSearchParams();
  if (spec)     q.set("spec", spec);
  if (hospital) q.set("hospital", hospital);
  if (name)     q.set("name", name);

  try {
    const res  = await fetch(`${BACKEND}/api/doctors?${q.toString()}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}