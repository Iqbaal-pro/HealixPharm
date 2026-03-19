//   app/routes/prescriptionRoutes.ts
//   STOCK_BASE  = NEXT_PUBLIC_API_URL       (Stock Management – port 8000)
//   BOT_BASE    = NEXT_PUBLIC_BOT_API_URL   (WhatsApp Bot     – port 8001)

const STOCK_BASE = process.env.NEXT_PUBLIC_API_URL     ?? "http://localhost:8000";
const BOT_BASE   = process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8001";

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

export interface PendingPrescription {
  order_id: number;
  token: string;
  phone: string;
  patient_id: number | null;
  prescription_url: string | null;
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
  staff_id: number;
  medicine_id: number;
  medicine_name: string;
  dose_per_day: number;
  start_date: string;
  quantity_given: number;
  is_continuous: boolean;
  reminder_type: "TIME_BASED" | "MEAL_BASED";
  meals?: string;
  meal_times?: string;
}

export interface PrescriptionResponse {
  id: number;
  message: string;
  prescription_id: number;
  patient_id?: number;
  uploaded_by_staff_id?: number;
  medicine_id?: number;
  medicine_name: string;
  dose_per_day?: number;
  start_date?: string;
  end_date?: string;
  quantity_given?: number;
  is_continuous?: boolean;
  meals?: string;
  meal_times?: string;
  created_at?: string;
  reminders_scheduled?: number;
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

export interface BillItem {
  medicine_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface NotifyBillPayload {
  patient_phone: string;
  items: BillItem[];
  total_amount: number;
  reminders_scheduled: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function getPendingPrescriptions(): Promise<PendingPrescription[]> {
  const res = await fetch(`${BOT_BASE}/admin/orders?status=PENDING_VERIFICATION`);
  const orders = await handleResponse<any[]>(res);
  // Map OrderSimpleSchema → PendingPrescription shape
  return orders.map(o => ({
    order_id:         o.id,
    token:            o.token,
    phone:            o.phone ?? "",
    patient_id:       o.patient_id ?? null,
    prescription_url: o.prescription_url ?? null,
    created_at:       o.created_at,
  }));
}

export async function getOrderDetail(orderId: number) {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}`);
  return handleResponse<unknown>(res);
}

export async function searchMedicines(q: string): Promise<MedicineSearchResult[]> {
  const res = await fetch(`${BOT_BASE}/admin/medicines/search?q=${encodeURIComponent(q)}`);
  return handleResponse<MedicineSearchResult[]>(res);
}

export async function approveOrder(orderId: number, items: ApprovalItem[]) {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return handleResponse<unknown>(res);
}

export async function updateOrderStatus(orderId: number, status: "APPROVED" | "REJECTED") {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse<unknown>(res);
}

export async function confirmPayment(orderId: number) {
  const res = await fetch(`${BOT_BASE}/admin/orders/${orderId}/confirm-payment`, {
    method: "POST",
  });
  return handleResponse<unknown>(res);
}

// POST /admin/notify/prescription-issued — send WhatsApp bill + reminder confirmation
export async function notifyPrescriptionIssued(payload: NotifyBillPayload): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BOT_BASE}/admin/notify/prescription-issued`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false, message: "WhatsApp notification failed" };
    return handleResponse<{ success: boolean; message: string }>(res);
  } catch {
    return { success: false, message: "Could not reach notification service" };
  }
}

export async function getAllPrescriptions(completedOnly?: boolean): Promise<PrescriptionRecord[]> {
  const qs = completedOnly !== undefined ? `?completed_only=${completedOnly}` : "";
  const res = await fetch(`${STOCK_BASE}/prescriptions/${qs}`);
  return handleResponse<PrescriptionRecord[]>(res);
}

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

export async function issueMedicine(payload: IssuePayload): Promise<IssueResponse> {
  const qs = new URLSearchParams({
    prescription_id: String(payload.prescription_id),
    medicine_id:     String(payload.medicine_id),
    quantity:        String(payload.quantity),
  });
  const res = await fetch(`${STOCK_BASE}/prescriptions/issue?${qs}`, { method: "POST" });
  return handleResponse<IssueResponse>(res);
}

// ── Storage / Image routes (BOT_BASE /api/...) ────────────────────────────────

// GET /api/storage/presigned-url?key=...&expires_in=3600
// Returns a fresh S3 presigned URL for any prescription image key
export async function getPresignedUrl(key: string): Promise<string> {
  const qs = new URLSearchParams({ key, expires_in: "3600" });
  const res = await fetch(`${BOT_BASE}/api/storage/presigned-url?${qs}`);
  const data = await handleResponse<{ url: string }>(res);
  return data.url;
}

// POST /api/storage/upload-prescription?prescription_id=...
// Uploads a prescription image file to S3, returns the s3_key
export async function uploadPrescriptionImage(
  file: File,
  prescriptionId: string
): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    `${BOT_BASE}/api/storage/upload-prescription?prescription_id=${encodeURIComponent(prescriptionId)}`,
    { method: "POST", body: formData }
  );
  return handleResponse<{ key: string }>(res);
}

// POST /api/image/check-clarity
// Checks if an image is clear enough before uploading
export async function checkImageClarity(
  file: File
): Promise<{ is_clear: boolean; message: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BOT_BASE}/api/image/check-clarity`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<{ is_clear: boolean; message: string }>(res);
}