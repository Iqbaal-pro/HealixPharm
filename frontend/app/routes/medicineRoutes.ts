// app/routes/medicineRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface Medicine {
  id: number;
  name: string;
  sku: string;
  dosage_form: string;
  strength: string | null;
  unit_of_measurement: string;
  category: string | null;
  manufacturer: string | null;
  cost_price: number;
  selling_price: number;
  minimum_stock_threshold: number;
  maximum_stock_level: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateMedicinePayload {
  name: string;
  sku: string;
  dosage_form: string;
  strength?: string;
  unit_of_measurement: string;
  category?: string;
  manufacturer?: string;
  cost_price: number;
  selling_price: number;
  minimum_stock_threshold: number;
  maximum_stock_level?: number;
}

export interface UpdateMedicinePayload {
  name?: string;
  dosage_form?: string;
  strength?: string;
  unit_of_measurement?: string;
  category?: string;
  manufacturer?: string;
  cost_price?: number;
  selling_price?: number;
  minimum_stock_threshold?: number;
  maximum_stock_level?: number;
}

// GET /medicines/
export async function getMedicines(search?: string, category?: string): Promise<Medicine[]> {
  const params = new URLSearchParams();
  if (search)   params.set("search", search);
  if (category) params.set("category", category);
  const res = await fetch(`${BASE}/medicines/?${params.toString()}`);
  return handleResponse<Medicine[]>(res);
}

// POST /medicines/
export async function createMedicine(payload: CreateMedicinePayload): Promise<Medicine> {
  const res = await fetch(`${BASE}/medicines/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Medicine>(res);
}

// PUT /medicines/{id}
export async function updateMedicine(id: number, payload: UpdateMedicinePayload): Promise<Medicine> {
  const res = await fetch(`${BASE}/medicines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Medicine>(res);
}

// DELETE /medicines/{id}
export async function deactivateMedicine(id: number): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/medicines/${id}`, { method: "DELETE" });
  return handleResponse<{ message: string }>(res);
}
