// src/routes/authRoutes.ts
// Maps to: /auth/* endpoints in auth_routes.py

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SignupPayload {
  // Required
  username: string;
  email: string;
  password: string;
  pharmacy_name: string;
  // Optional
  contact_number?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  opening_hours?: string | null;
  estimated_delivery_time?: string | null;
  service_areas?: string | null;
  prescription_policy?: string | null;
  refund_policy?: string | null;
}

export interface LoginPayload {
  username_or_email: string; // accepts username OR email
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

// ── Helper ────────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── POST /auth/signup ─────────────────────────────────────────────────────────
// Creates a new user + pharmacy profile in one call.
// Backend: auth_routes.py → signup()
// Only required fields: username, email, password, pharmacy_name.
// All other fields are optional and can be set later via PUT /pharmacy/me.
export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignupResponse>(res);
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
// Authenticates a user. Returns a JWT access_token (custom HMAC, not JWT lib).
// Token must be saved and sent as: Authorization: Bearer <token>
// Token expires in 24 hours (86400s) — see auth_token_service.py.
// Backend: auth_routes.py → login()
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<LoginResponse>(res);
}

// ── GET /auth/me ──────────────────────────────────────────────────────────────
// Returns the currently authenticated user + pharmacy profile.
// Requires a valid Bearer token in the Authorization header.
// Backend: auth_routes.py → auth_me()
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

// ── Token helpers (localStorage) ──────────────────────────────────────────────
// Convenience functions to save/read/clear auth state in the browser.

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