import { NextRequest, NextResponse } from "next/server";
import { DOCTORS } from "../../../data/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get("specialization") ?? "";
  const hospital       = searchParams.get("hospital") ?? "";
  const name           = searchParams.get("name") ?? "";

  let results = [...DOCTORS];
  if (specialization)
    results = results.filter((d) => d.specialization === specialization);
  if (hospital)
    results = results.filter((d) => d.hospital === hospital);
  if (name)
    results = results.filter((d) =>
      d.name.toLowerCase().includes(name.toLowerCase())
    );

  return NextResponse.json({ doctors: results });
}