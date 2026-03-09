// app/routes/prescriptionRoutes.ts
// Maps to: /prescriptions/* endpoints in prescription_routes.py

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrescriptionRecord {
  id: number;
  patient_id: number;
  uploaded_by_staff_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;
  quantity_given: number;
  is_continuous: boolean;
  created_at: string;
  remaining_days: number;   // from calculate_remaining_days()
  is_completed: boolean;    // remaining_days <= 0
}

export interface PendingPrescription {
  id: string;          // S3 key or unique identifier
  image_url: string;   // presigned S3 URL to display the image
  received_at: string; // ISO timestamp from WhatsApp bot
  phone_number?: string;
}

export interface CreatePrescriptionPayload {
  patient_id: number;
  uploaded_by_staff_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;   // ISO date string
  quantity_given: number;
  is_continuous: boolean;
  s3_key?: string;      // reference back to the S3 image
}

export interface PrescriptionResponse {
  id: number;           // auto-incremented by DB
  patient_id: number;
  uploaded_by_staff_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;
  quantity_given: number;
  is_continuous: boolean;
  created_at: string;
}

export interface IssuePayload {
  prescription_id: number;
  medicine_id: number;
  quantity: number;
}

export interface IssueResponse {
  message: string;
  remaining_stock: number;
  exported_data: {
    patient_id: number;
    prescription_id: number;
    medicine_id: number;
    quantity_issued: number;
    issued_date: string | null;
  };
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── GET /prescriptions/?completed_only=true ───────────────────────────────────
// Returns prescriptions where remaining_days <= 0
// (start_date + quantity_given/dose_per_day - today <= 0)
export async function getCompletedPrescriptions(): Promise<PrescriptionRecord[]> {
  const res = await fetch(`${BASE}/prescriptions/?completed_only=true`);
  return handleResponse<PrescriptionRecord[]>(res);
}

// ── GET /prescriptions/ ───────────────────────────────────────────────────────
// Returns all prescriptions. Pass completed_only=false for active only.
export async function getAllPrescriptions(completedOnly?: boolean): Promise<PrescriptionRecord[]> {
  const qs = completedOnly !== undefined ? `?completed_only=${completedOnly}` : "";
  const res = await fetch(`${BASE}/prescriptions/${qs}`);
  return handleResponse<PrescriptionRecord[]>(res);
}

// ── GET /prescriptions/pending ────────────────────────────────────────────────
// Returns list of prescription images pending review from AWS S3.
// Backend fetches S3 keys and generates presigned URLs automatically.
// ⚠ Endpoint to be implemented on backend when AWS integration is ready.
export async function getPendingPrescriptions(): Promise<PendingPrescription[]> {
  const res = await fetch(`${BASE}/prescriptions/pending`);
  return handleResponse<PendingPrescription[]>(res);
}

// ── POST /prescriptions/ ──────────────────────────────────────────────────────
// Saves a new prescription to the database. ID is auto-incremented by DB.
// Pharmacist fills this in manually after viewing the S3 image.
// ⚠ Endpoint to be implemented on backend.
export async function createPrescription(
  payload: CreatePrescriptionPayload
): Promise<PrescriptionResponse> {
  const res = await fetch(`${BASE}/prescriptions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<PrescriptionResponse>(res);
}

// ── POST /prescriptions/issue ─────────────────────────────────────────────────
// Issues medicine against a saved prescription.
// All 3 params sent as query params — matches backend exactly.
export async function issueMedicine(payload: IssuePayload): Promise<IssueResponse> {
  const qs = new URLSearchParams({
    prescription_id: String(payload.prescription_id),
    medicine_id:     String(payload.medicine_id),
    quantity:        String(payload.quantity),
  });
  const res = await fetch(`${BASE}/prescriptions/issue?${qs}`, {
    method: "POST",
  });
  return handleResponse<IssueResponse>(res);
}