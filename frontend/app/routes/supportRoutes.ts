// app/routes/supportRoutes.ts
// BOT_BASE = NEXT_PUBLIC_BOT_API_URL (port 8001)

const BASE = process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8001";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  user_phone: string | null;
  created_at: string;
}

// GET /admin/support/queue
export async function getSupportQueue(): Promise<SupportTicket[]> {
  const res = await fetch(`${BASE}/admin/support/queue`);
  return handleResponse<SupportTicket[]>(res);
}

// POST /admin/support/tickets/{id}/accept
export async function acceptTicket(ticketId: number, agentName: string): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/support/tickets/${ticketId}/accept?agent_name=${encodeURIComponent(agentName)}`, { method: "POST" });
  return handleResponse<unknown>(res);
}

// POST /admin/support/tickets/{id}/send
export async function sendAgentMessage(ticketId: number, body: string): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/support/tickets/${ticketId}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  return handleResponse<unknown>(res);
}

// POST /admin/support/tickets/{id}/close
export async function closeTicket(ticketId: number): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/support/tickets/${ticketId}/close`, { method: "POST" });
  return handleResponse<unknown>(res);
}

export interface SupportMessage {
  id: number;
  sender_type: "USER" | "AGENT";
  body: string;
  created_at: string;
}

// GET /admin/support/tickets/{id}/messages
export async function getTicketMessages(ticketId: number): Promise<SupportMessage[]> {
  const res = await fetch(`${BASE}/admin/support/tickets/${ticketId}/messages`);
  return handleResponse<SupportMessage[]>(res);
}