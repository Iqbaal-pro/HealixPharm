// app/routes/alertRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface StockAlert {
  id: number;
  medicine_id: number;
  batch_id: number | null;
  alert_type: string;
  current_quantity: number;
  threshold_value: number;
  is_active: boolean;
  is_acknowledged: boolean;
  acknowledged_by: number | null;
  acknowledged_at: string | null;
  created_at: string;
  resolved_at: string | null;
}

// GET /stock-alerts/
export async function getAlerts(token: string | null): Promise<StockAlert[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/stock-alerts/`, { headers });
  return handleResponse<StockAlert[]>(res);
}

// POST /stock-alerts/{id}/acknowledge
export async function acknowledgeAlert(
  id: number,
  acknowledgedBy: number,
  token: string | null
): Promise<unknown> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/stock-alerts/${id}/acknowledge`, {
    method: "POST",
    headers,
    body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
  });
  return handleResponse<unknown>(res);
}