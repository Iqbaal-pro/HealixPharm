// app/routes/settingsRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface UpdatePharmacyPayload {
  pharmacy_name:           string | null;
  contact_number:          string | null;
  whatsapp_number:         string | null;
  address:                 string | null;
  opening_hours:           string | null;
  estimated_delivery_time: string | null;
  service_areas:           string | null;
  service_charge:          number | null;  // fixed: consistent with authRoutes — backend expects float
  prescription_policy:     string | null;
  refund_policy:           string | null;
}

export interface UpdatePharmacyResponse {
  message: string;
  pharmacy: {
    id: number;
    user_id: number;
    pharmacy_name: string;
    contact_number: string | null;
    whatsapp_number: string | null;
    address: string | null;
    opening_hours: string | null;
    estimated_delivery_time: string | null;
    service_areas: string | null;
    service_charge: number | null;
    prescription_policy: string | null;
    refund_policy: string | null;
    created_at: string;
  };
}

export async function updatePharmacy(
  payload: UpdatePharmacyPayload,
  token: string,
): Promise<UpdatePharmacyResponse> {
  const res = await fetch(`${BASE}/pharmacy/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<UpdatePharmacyResponse>(res);
}