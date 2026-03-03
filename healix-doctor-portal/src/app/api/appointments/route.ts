import { NextRequest, NextResponse } from "next/server";
import { generateAppointmentId } from "../../../lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorId, slot, patientDetails } = body;

    if (!doctorId || !slot || !patientDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: save to DB + send Twilio WhatsApp confirmation
    const appointment = {
      id:             generateAppointmentId(),
      doctorId,
      slot,
      patientDetails,
      status:         "confirmed",
      createdAt:      new Date().toISOString(),
    };

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}