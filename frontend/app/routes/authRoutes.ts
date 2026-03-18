// app/routes/authRoutes.ts
// STOCK_BASE = NEXT_PUBLIC_API_URL (port 8000)

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

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
  service_charge: number | null;
  prescription_policy: string | null;
  refund_policy: string | null;
  created_at: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  pharmacy_name: string;
  contact_number?: string;
  whatsapp_number?: string;
  address?: string;
  opening_hours?: string;
  estimated_delivery_time?: string;
  service_areas?: string;
  service_charge?: number;
  prescription_policy?: string;
  refund_policy?: string;
}

export interface SignupResponse {
  message: string;
  user: UserResponse;
  pharmacy: PharmacyResponse;
}

export interface LoginPayload {
  username_or_email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: UserResponse;
  pharmacy: PharmacyResponse;
}

export interface MeResponse {
  user: UserResponse;
  pharmacy: PharmacyResponse;
  token_claims: {
    user_id: string;
    pharmacy_id: number;
    exp: number;
  };
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

// POST /auth/signup
export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignupResponse>(res);
}

// POST /auth/login
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

// GET /auth/me  (requires Bearer token)
export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<MeResponse>(res);
}

// ── Storage helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY   = "healix_token";
const USER_KEY    = "healix_user";
const PHARMACY_KEY = "healix_pharmacy";

export function saveAuthToStorage(data: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY,    data.access_token);
  localStorage.setItem(USER_KEY,     JSON.stringify(data.user));
  localStorage.setItem(PHARMACY_KEY, JSON.stringify(data.pharmacy));
}

export function getTokenFromStorage(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserFromStorage(): UserResponse | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getPharmacyFromStorage(): PharmacyResponse | null {
  const raw = localStorage.getItem(PHARMACY_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PHARMACY_KEY);
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}