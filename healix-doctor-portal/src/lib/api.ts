// lib/api.ts
// Single source of truth for all backend calls.
// Replaces the local Next.js route handlers in /app/api/* which conflicted
// with the FastAPI backend's own /api/* namespace.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Doctors ────────────────────────────────────────────────────────────────

export async function fetchDoctors(params: {
  spec?: string;
  hospital?: string;
  name?: string;
}) {
  const q = new URLSearchParams();
  if (params.spec)     q.set("spec", params.spec);
  if (params.hospital) q.set("hospital", params.hospital);
  if (params.name)     q.set("name", params.name);
  const res = await fetch(`${BASE}/api/doctors?${q.toString()}`);
  return handleResponse<import("../types").Doctor[]>(res);
}

export async function fetchDoctor(doctorId: number) {
  const res = await fetch(`${BASE}/api/doctors/${doctorId}`);
  return handleResponse<import("../types").Doctor>(res);
}

// ── Slots ──────────────────────────────────────────────────────────────────

export async function fetchSlots(params: {
  doctorId: number;
  hospital: string;
  date: string;
}) {
  const q = new URLSearchParams({ hospital: params.hospital, date: params.date });
  const res = await fetch(`${BASE}/api/doctors/${params.doctorId}/slots?${q.toString()}`);
  return handleResponse<import("../types").TimeSlot[]>(res);
}

// ── Appointments ───────────────────────────────────────────────────────────

export interface BookAppointmentPayload {
  doctor_id: number;
  hospital: string;
  slot_id: number;
  slot_time: string;
  date: string;
  patient: {
    full_name: string;
    id_type: string;    // "nic" | "passport"
    id_number: string;  // the actual NIC or passport value
    email: string;
    phone: string;
    address: string;
  };
  notes?: string;
}

export async function bookAppointment(payload: BookAppointmentPayload) {
  const res = await fetch(`${BASE}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<import("../types").AppointmentResponse>(res);
}

export async function fetchAppointment(bookingRef: string) {
  const res = await fetch(`${BASE}/api/appointments/${bookingRef}`);
  return handleResponse<{
    booking_ref: string;
    doctor: string;
    hospital: string;
    slot_time: string;
    date: string;
    patient: string;
    total_fee: number;
    service_fee: number;
    status: string;
  }>(res);
}

export async function cancelAppointment(payhereOrderId: string) {
  const res = await fetch(`${BASE}/api/appointments/${payhereOrderId}/cancel`, {
    method: "POST",
  });
  return handleResponse<{ message: string; booking_ref: string }>(res);
}
// ── Search Filter Options ──────────────────────────────────────────────────
// Fetches distinct specializations and hospitals from real doctor data

export async function fetchFilterOptions(): Promise<{
  specializations: string[];
  hospitals: string[];
}> {
  const doctors = await fetchDoctors({});
  const specializations = [...new Set(doctors.map(d => d.specialization))].sort();
  const hospitals       = [...new Set(doctors.map(d => d.hospital))].sort();
  return { specializations, hospitals };
}
