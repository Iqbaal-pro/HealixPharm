// app/routes/patientRoutes.ts
// STOCK_BASE = NEXT_PUBLIC_API_URL (port 8000)

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface Patient {
  id: number;
  name: string;
  phone_number: string;
  language: string;
  consent: boolean;
}

export interface CreatePatientPayload {
  name: string;
  phone_number: string;
  language?: string;
  consent?: boolean;
}

// GET /patients/
export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${BASE}/patients/`);
  return handleResponse<Patient[]>(res);
}

// POST /patients/
export async function createPatient(payload: CreatePatientPayload): Promise<{ message: string; patient_id: number }> {
  const res = await fetch(`${BASE}/patients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ message: string; patient_id: number }>(res);
}

// PUT /patients/{id}/consent
export async function updateConsent(patientId: number, consent: boolean): Promise<unknown> {
  const res = await fetch(`${BASE}/patients/${patientId}/consent`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consent }),
  });
  return handleResponse<unknown>(res);
}