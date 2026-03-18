// app/routes/channelingRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  fee: number;
  serviceFee: number;
  experience: string;
  qualifications: string;
  available: boolean;
  initials: string;
  otherHospitals: OtherHospital[];
}

export interface OtherHospital {
  id: number;
  name: string;
  days: string;
  hours: string;
}

export interface TimeSlot {
  id: number;
  hospital: string;
  date: string;
  time: string;
  booked: boolean;
}

export interface DoctorPayload {
  name: string;
  specialization: string;
  hospital: string;
  fee: number;
  experience?: string;
  qualifications?: string;
  available?: boolean;
  initials?: string;
}

export interface OtherHospitalPayload {
  name: string;
  days?: string;
  hours?: string;
}

export interface SlotPayload {
  hospital: string;
  date: string;
  time: string;
}

// ── Doctors ──────────────────────────────────────────────────────
export async function getDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${BASE}/api/admin/doctors`);
  return handleResponse<Doctor[]>(res);
}

export async function addDoctor(payload: DoctorPayload): Promise<Doctor> {
  const res = await fetch(`${BASE}/api/admin/doctors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Doctor>(res);
}

export async function updateDoctor(id: number, payload: DoctorPayload): Promise<Doctor> {
  const res = await fetch(`${BASE}/api/admin/doctors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Doctor>(res);
}

export async function deleteDoctor(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/doctors/${id}`, { method: "DELETE" });
  return handleResponse<void>(res);
}

// ── Other Hospitals ───────────────────────────────────────────────
export async function addOtherHospital(doctorId: number, payload: OtherHospitalPayload): Promise<OtherHospital> {
  const res = await fetch(`${BASE}/api/admin/doctors/${doctorId}/other-hospitals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<OtherHospital>(res);
}

export async function deleteOtherHospital(ohId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/other-hospitals/${ohId}`, { method: "DELETE" });
  return handleResponse<void>(res);
}

// ── Slots ─────────────────────────────────────────────────────────
export async function getSlots(doctorId: number): Promise<TimeSlot[]> {
  const res = await fetch(`${BASE}/api/admin/doctors/${doctorId}/slots`);
  return handleResponse<TimeSlot[]>(res);
}

export async function addSlot(doctorId: number, payload: SlotPayload): Promise<TimeSlot> {
  const res = await fetch(`${BASE}/api/admin/doctors/${doctorId}/slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<TimeSlot>(res);
}

export async function deleteSlot(slotId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/slots/${slotId}`, { method: "DELETE" });
  return handleResponse<void>(res);
}