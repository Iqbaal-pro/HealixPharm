// app/routes/analyticsRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ReorderRec {
  medicine_id: number;
  medicine_name?: string;
  current_quantity: number;   // fixed: was current_stock
  reorder_quantity: number;   // fixed: was recommended_order
  daily_average: number;      // fixed: was daily_avg
  days_remaining: number;
}

// Backend GET /analytics/high-demand returns: medicine_id, medicine_name, total_consumed
export interface HighDemand {
  medicine_id: number;
  medicine_name?: string;
  total_consumed: number;     // fixed: was total_dispensed
}

// Backend GET /analytics/slow-moving returns: medicine_id, medicine_name, quantity_available, times_dispensed
export interface SlowMoving {
  medicine_id: number;
  medicine_name?: string;
  quantity_available: number; // fixed: was current_stock
  times_dispensed: number;    // fixed: was days_since_dispensed
}

// Backend GET /analytics/stockout-analysis returns: medicine_id, medicine_name, stockout_events
export interface StockoutRisk {
  medicine_id: number;
  medicine_name?: string;
  stockout_events: number;    // fixed: was current_stock / daily_avg / days_to_stockout
}

export async function getReorderRecommendations(token: string | null): Promise<ReorderRec[]> {
  const res = await fetch(`${BASE}/analytics/reorder-recommendations`, { headers: authHeader(token) });
  return handleResponse<ReorderRec[]>(res);
}

export async function getHighDemand(token: string | null): Promise<HighDemand[]> {
  const res = await fetch(`${BASE}/analytics/high-demand`, { headers: authHeader(token) });
  return handleResponse<HighDemand[]>(res);
}

export async function getSlowMoving(token: string | null): Promise<SlowMoving[]> {
  const res = await fetch(`${BASE}/analytics/slow-moving`, { headers: authHeader(token) });
  return handleResponse<SlowMoving[]>(res);
}

export async function getStockoutAnalysis(token: string | null): Promise<StockoutRisk[]> {
  const res = await fetch(`${BASE}/analytics/stockout-analysis`, { headers: authHeader(token) });
  return handleResponse<StockoutRisk[]>(res);
}

export const analyticsExportUrl = `${BASE}/analytics/export`;