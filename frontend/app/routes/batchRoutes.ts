// app/routes/batchRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface Batch {
  id: number;
  medicine_id: number;
  batch_number: string;
  supplier_id: number | null;
  manufacture_date: string;
  expiry_date: string;
  cost_price: number;
  received_date: string;
  created_at: string;
  is_active: boolean;
  is_expired: boolean;
}

export interface CreateBatchPayload {
  medicine_id: number;
  batch_number: string;
  manufacture_date: string;
  expiry_date: string;
  cost_price: number;
  supplier_id: number | null;
  quantity_received: number;
}

// GET /batches/?include_expired=
export async function getBatches(includeExpired: boolean): Promise<Batch[]> {
  const res = await fetch(`${BASE}/batches/?include_expired=${includeExpired}`);
  return handleResponse<Batch[]>(res);
}

// POST /batches/
export async function createBatch(payload: CreateBatchPayload): Promise<Batch> {
  const res = await fetch(`${BASE}/batches/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Batch>(res);
}

// PATCH /batches/{id}/deactivate
export async function deactivateBatch(id: number): Promise<unknown> {
  const res = await fetch(`${BASE}/batches/${id}/deactivate`, { method: "PATCH" });
  return handleResponse<unknown>(res);
}