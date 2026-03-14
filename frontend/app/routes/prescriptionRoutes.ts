//   app/routes/prescriptionRoutes.ts
//   STOCK_BASE  = NEXT_PUBLIC_API_URL       (Stock Management – port 8000)
//   BOT_BASE    = NEXT_PUBLIC_BOT_API_URL   (WhatsApp Bot     – port 8001)

const STOCK_BASE = process.env.NEXT_PUBLIC_API_URL     ?? "http://localhost:8000";
const BOT_BASE   = process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8001";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PrescriptionRecord {
  id: number;
  patient_id: number;
  uploaded_by_staff_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;
  end_date: string;
  quantity_given: number;
  is_continuous: boolean;
  meals?: string;
  meal_times?: string;
  created_at: string;
  remaining_days: number;
  is_completed: boolean;
}

// Returned by GET /admin/prescriptions/queue  (BOT_BASE)
export interface PendingPrescription {
  order_id: number;
  token: string;
  phone: string;
  prescription_url: string | null;  // fresh presigned S3 URL
  created_at: string;
}

export interface MedicineSearchResult {
  id: number;
  name: string;
  selling_price: number;
  unit_of_measurement: string;
}

export interface ApprovalItem {
  medicine_id: number;
  quantity: number;
}

export interface CreatePrescriptionPayload {
  patient_id: number;
  uploaded_by_staff_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;
  quantity_given: number;
  is_continuous: boolean;
  meals?: string;
  meal_times?: string;   // comma-separated HH:MM, one per dose — e.g. "08:00,13:00,19:00"
}

export interface PrescriptionResponse {
  id: number;
  patient_id: number;
  uploaded_by_staff_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;
  end_date: string;
  quantity_given: number;
  is_continuous: boolean;
  meals?: string;
  meal_times?: string;
  created_at: string;
  reminders_scheduled: number;
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

// ── BOT_BASE endpoints ────────────────────────────────────────────────────────

// GET /admin/prescriptions/queue  — pending WhatsApp orders with S3 presigned URLs
export async function getPendingPrescriptions(): Promise<PendingPrescription[]> {
  const res = await fetch(`${BOT_BASE}/admin/prescriptions/queue`);
  return handleResponse<PendingPrescription[]>(res);
}

// GET /admin/orders/{id}
export async function getOrderDetail(orderId: number) {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}`);
  return handleResponse<unknown>(res);
}

// GET /admin/medicines/search?q=
export async function searchMedicines(q: string): Promise<MedicineSearchResult[]> {
  const res = await fetch(`${BOT_BASE}/admin/medicines/search?q=${encodeURIComponent(q)}`);
  return handleResponse<MedicineSearchResult[]>(res);
}

// POST /admin/orders/{id}/approve
export async function approveOrder(orderId: number, items: ApprovalItem[]) {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return handleResponse<unknown>(res);
}

// POST /admin/orders/{id}/status
export async function updateOrderStatus(orderId: number, status: "APPROVED" | "REJECTED") {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse<unknown>(res);
}

// POST /admin/orders/{id}/confirm-payment
export async function confirmPayment(orderId: number) {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}/confirm-payment`, {
    method: "POST",
  });
  return handleResponse<unknown>(res);
}

// ── STOCK_BASE endpoints ──────────────────────────────────────────────────────

// GET /prescriptions/?completed_only=
export async function getAllPrescriptions(completedOnly?: boolean): Promise<PrescriptionRecord[]> {
  const qs = completedOnly !== undefined ? `?completed_only=${completedOnly}` : "";
  const res = await fetch(`${STOCK_BASE}/prescriptions/${qs}`);
  return handleResponse<PrescriptionRecord[]>(res);
}

// POST /prescriptions/
export async function createPrescription(
  payload: CreatePrescriptionPayload
): Promise<PrescriptionResponse> {
  const res = await fetch(`${STOCK_BASE}/prescriptions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<PrescriptionResponse>(res);
}

// POST /prescriptions/issue
export async function issueMedicine(payload: IssuePayload): Promise<IssueResponse> {
  const qs = new URLSearchParams({
    prescription_id: String(payload.prescription_id),
    medicine_id:     String(payload.medicine_id),
    quantity:        String(payload.quantity),
  });
  const res = await fetch(`${STOCK_BASE}/prescriptions/issue?${qs}`, { method: "POST" });
  return handleResponse<IssueResponse>(res);
}