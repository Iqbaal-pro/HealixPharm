// app/routes/inventoryRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface InventoryItem {
  id: number;
  medicine_id: number;
  batch_id: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_damaged: number;
  quantity_expired: number;
  reorder_level: number;
  reorder_quantity: number | null;
  turnover_rate: number | null;
  last_stock_update: string;
  last_dispensed_at: string | null;
  // removed minimum_stock_threshold — column does not exist on backend Inventory model
}

export interface AddStockPayload {
  medicine_id: number;
  batch_id: number;
  batch_number: string;
  expiry_date: string;
  quantity_added: number;
  cost_price: number;
  supplier_id: number;
  supplier_name: string;
  staff_id: number;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const res = await fetch(`${BASE}/inventory/`);
  return handleResponse<InventoryItem[]>(res);
}

export async function addStock(payload: AddStockPayload): Promise<unknown> {
  const res = await fetch(`${BASE}/inventory/add-stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<unknown>(res);
}