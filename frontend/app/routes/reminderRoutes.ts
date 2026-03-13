// app/routes/reminderRoutes.ts
// STOCK_BASE = NEXT_PUBLIC_API_URL (port 8000)

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface PendingReminder {
  id: number;
  prescription_id: number;
  reminder_time: string;
  channel: string;
  status: string;
  dose_number: number;    // 0 = refill/one-time, 1+ = dose N of day
  meal_timing: string | null;
  one_time: boolean;
}

export interface ReminderResult {
  message: string;
  reminder_id?: number;
  patient?: string;
  medicine?: string;
}

// POST /reminders/send-one-time/{prescription_id}
export async function sendOneTimeReminder(prescriptionId: number): Promise<ReminderResult> {
  const res = await fetch(`${BASE}/reminders/send-one-time/${prescriptionId}`, { method: "POST" });
  return handleResponse<ReminderResult>(res);
}

// POST /reminders/mark-continuous/{prescription_id}
export async function markContinuous(prescriptionId: number, isContinuous: boolean): Promise<unknown> {
  const res = await fetch(`${BASE}/reminders/mark-continuous/${prescriptionId}?is_continuous=${isContinuous}`, { method: "POST" });
  return handleResponse<unknown>(res);
}

// GET /reminders/pending
export async function getPendingReminders(): Promise<PendingReminder[]> {
  const res = await fetch(`${BASE}/reminders/pending`);
  return handleResponse<PendingReminder[]>(res);
}

// POST /reminders/process
export async function processReminders(): Promise<{ message: string; results: unknown[] }> {
  const res = await fetch(`${BASE}/reminders/process`, { method: "POST" });
  return handleResponse<{ message: string; results: unknown[] }>(res);
}