// app/routes/authRoutes.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  pharmacy_name: string;
  contact_number?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  opening_hours?: string | null;
  estimated_delivery_time?: string | null;
  service_areas?: string | null;
  service_charge?: number | null;  // fixed: was string, backend expects float
  prescription_policy?: string | null;
  refund_policy?: string | null;
}

export interface LoginPayload {
  username_or_email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface PharmacyResponse {
  id: number;
  user_id: number;
  pharmacy_name: string;
  contact_number: string | null;
  whatsapp_number: string | null;
  address: string | null;
  opening_hours: string | null;
  estimated_delivery_time: string | null;
  service_areas: string | null;
  service_charge: number | null;  // fixed: was string, backend returns float
  prescription_policy: string | null;
  refund_policy: string | null;
  created_at: string;
}

export interface SignupResponse {
  message: string;
  user: UserResponse;
  pharmacy: PharmacyResponse;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: "bearer";
  user: UserResponse;
  pharmacy: PharmacyResponse;
}

export interface MeResponse {
  user: UserResponse;
  pharmacy: PharmacyResponse;
  token_claims: {
    user_id: number;
    pharmacy_id: number;
    exp: number;
  };
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignupResponse>(res);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${BASE}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<MeResponse>(res);
}

export function saveAuthToStorage(data: LoginResponse): void {
  localStorage.setItem("healix_token",    data.access_token);
  localStorage.setItem("healix_user",     JSON.stringify(data.user));
  localStorage.setItem("healix_pharmacy", JSON.stringify(data.pharmacy));
}

export function getTokenFromStorage(): string | null {
  return localStorage.getItem("healix_token");
}

export function getUserFromStorage(): UserResponse | null {
  const raw = localStorage.getItem("healix_user");
  return raw ? (JSON.parse(raw) as UserResponse) : null;
}

export function getPharmacyFromStorage(): PharmacyResponse | null {
  const raw = localStorage.getItem("healix_pharmacy");
  return raw ? (JSON.parse(raw) as PharmacyResponse) : null;
}

export function clearAuthStorage(): void {
  localStorage.removeItem("healix_token");
  localStorage.removeItem("healix_user");
  localStorage.removeItem("healix_pharmacy");
}

export function isLoggedIn(): boolean {
  return !!getTokenFromStorage();
}