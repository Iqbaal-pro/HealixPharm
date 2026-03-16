// app/routes/mohRoutes.ts
// BOT_BASE = NEXT_PUBLIC_BOT_API_URL (port 8001)

const BASE = process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8001";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface MOHAlert {
  id: number;
  disease_name: string;
  region: string;
  threat_level: string;
  start_date: string;
  end_date: string;
  status: string;
  broadcast_sent: boolean;
  created_at: string;
}

export interface CreateAlertPayload {
  disease_name: string;
  region: string;
  threat_level: string;
  start_date: string;
  end_date: string;
}

// POST /admin/moh-alert/create
export async function createMOHAlert(payload: CreateAlertPayload): Promise<MOHAlert> {
  const res = await fetch(`${BASE}/admin/moh-alert/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<MOHAlert>(res);
}