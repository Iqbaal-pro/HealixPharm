// app/routes/adjustmentRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface Adjustment {
  id: number;
  medicine_id: number;
  batch_id: number;
  adjustment_quantity: number;
  adjustment_type: string;
  reason: string | null;
  staff_id: number;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
}

export type AdjType = "expired" | "damaged" | "waste" | "correction" | "returned";

const ENDPOINTS: Record<AdjType, string> = {
  expired:    "/stock-adjustments/expired",
  damaged:    "/stock-adjustments/damaged",
  waste:      "/stock-adjustments/waste",
  correction: "/stock-adjustments/correction",
  returned:   "/stock-adjustments/returned",
};

// GET /stock-adjustments/history
export async function getAdjustmentHistory(): Promise<Adjustment[]> {
  const res = await fetch(`${BASE}/stock-adjustments/history`);
  return handleResponse<Adjustment[]>(res);
}

// POST /stock-adjustments/{type}
export async function submitAdjustment(
  type: AdjType,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${BASE}${ENDPOINTS[type]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<unknown>(res);
}

// POST /stock-adjustments/{id}/approve
export async function approveAdjustment(id: number, approvedBy: number): Promise<unknown> {
  const res = await fetch(`${BASE}/stock-adjustments/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_by: approvedBy }),
  });
  return handleResponse<unknown>(res);
}