// app/routes/orderRoutes.ts
// BOT_BASE = NEXT_PUBLIC_BOT_API_URL (port 8001)

const BASE = process.env.NEXT_PUBLIC_BOT_API_URL ?? "http://localhost:8001";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface Order {
  id: number;
  token: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  phone?: string;
}

export interface OrderDetail extends Order {
  items: { medicine_id: number; medicine_name?: string; quantity: number; unit_price?: number; subtotal?: number }[];
  prescription_url: string | null;
  payment_method: string | null;
  payment_status: string;
  approved_at: string | null;
  cancelled_at: string | null;
}

export interface MedResult {
  id: number;
  name: string;
  selling_price: number;
  unit_of_measurement: string;
}

export interface ApprovalItem {
  medicine_id: number;
  quantity: number;
}

// GET /admin/orders?status=
export async function getOrders(status?: string): Promise<Order[]> {
  const qs = status ? `?status=${status}` : "";
  const res = await fetch(`${BASE}/admin/orders${qs}`);
  return handleResponse<Order[]>(res);
}

// GET /admin/orders/{id}
export async function getOrderDetail(id: number): Promise<OrderDetail> {
  const res = await fetch(`${BASE}/admin/orders/${id}`);
  return handleResponse<OrderDetail>(res);
}

// GET /admin/medicines/search?q=
export async function searchMedicines(q: string): Promise<MedResult[]> {
  const res = await fetch(`${BASE}/admin/medicines/search?q=${encodeURIComponent(q)}`);
  return handleResponse<MedResult[]>(res);
}

// POST /admin/orders/{id}/approve
export async function approveOrder(id: number, items: ApprovalItem[]): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/orders/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return handleResponse<unknown>(res);
}

// POST /admin/orders/{id}/status
export async function updateOrderStatus(id: number, status: "APPROVED" | "REJECTED"): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/orders/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse<unknown>(res);
}

// POST /admin/orders/{id}/confirm-payment
export async function confirmPayment(id: number): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/orders/${id}/confirm-payment`, { method: "POST" });
  return handleResponse<unknown>(res);
}

// POST /admin/orders/{id}/fulfill
export async function fulfillOrder(id: number): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/orders/${id}/fulfill`, { method: "POST" });
  return handleResponse<unknown>(res);
}

// POST /admin/orders/{id}/cancel
export async function cancelOrder(id: number): Promise<unknown> {
  const res = await fetch(`${BASE}/admin/orders/${id}/cancel`, { method: "POST" });
  return handleResponse<unknown>(res);
}