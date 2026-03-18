"use client";
import { useState } from "react";
import { Doctor, BookingFormData } from "../../types";
import { bookAppointment } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import Button from "../ui/Button";

interface Props {
  doctor: Doctor;
  slot: string;
  slotId: number;
  date: string;
  hospital: string;
  onBack: () => void;
}

type Errors = Partial<Record<keyof BookingFormData, string>>;

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1, textTransform: "uppercase" as const }}>
        {label}{required && <span style={{ color: "#64748b", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
          <span style={{ color: "#f87171", fontSize: 11 }}>⚠</span>
          <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}
      {!error && hint && <p style={{ color: "#334155", fontSize: 11, margin: 0 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(6,13,26,0.9)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, fontFamily: "DM Sans, sans-serif", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" as const };
const errorInputStyle: React.CSSProperties = { ...inputStyle, borderColor: "rgba(248,113,113,0.4)", boxShadow: "0 0 0 3px rgba(248,113,113,0.06)" };
const validInputStyle: React.CSSProperties = { ...inputStyle, borderColor: "rgba(74,222,128,0.3)",  boxShadow: "0 0 0 3px rgba(74,222,128,0.04)"  };

function validateFullName(n: string) { if (!n.trim()) return "Full name is required"; if (n.trim().length < 3) return "Please enter your full name"; if (!/^[a-zA-Z\s.',-]+$/.test(n)) return "Name should only contain letters"; return null; }
function validateNIC(n: string)      { if (!n.trim()) return "NIC number is required"; if (!/^\d{9}[VXvx]$/.test(n) && !/^\d{12}$/.test(n)) return "Valid formats: 901234567V or 199012345678"; return null; }
function validatePassport(p: string) { if (!p.trim()) return "Passport number is required"; if (!/^[A-Za-z]{1,2}\d{7}$/.test(p)) return "Valid format: N1234567"; return null; }
function validateEmail(e: string)    { if (!e.trim()) return "Email is required"; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Enter a valid email"; return null; }
function validatePhone(p: string)    { const c = p.replace(/[\s\-()]/g, ""); if (!p.trim()) return "Phone is required"; if (!/^(\+94|0)[0-9]{9}$/.test(c)) return "Enter a valid Sri Lankan number (e.g. 077 123 4567)"; return null; }
function validateAddress(a: string)  { if (!a.trim()) return "Address is required"; if (a.trim().length < 10) return "Please enter your full address"; return null; }

export default function BookingForm({ doctor, slot, slotId, date, hospital, onBack }: Props) {
  const [form, setForm]     = useState<BookingFormData>({ fullName: "", idType: "nic", nic: "", passport: "", email: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof BookingFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [payhereData, setPayhereData] = useState<{
    booking_ref: string; total_fee: number; service_fee: number;
    payhere: { merchant_id: string; order_id: string; amount: string; currency: string; hash: string; notify_url: string; return_url: string; cancel_url: string; items: string };
  } | null>(null);

  const set = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => { setForm(f => ({ ...f, [key]: value })); if (errors[key]) setErrors(e => ({ ...e, [key]: undefined })); };
  const getFieldStyle = (key: keyof BookingFormData): React.CSSProperties => { if (errors[key]) return errorInputStyle; if (touched[key] && form[key]) return validInputStyle; return inputStyle; };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof BookingFormData) => {
    setTouched(t => ({ ...t, [key]: true }));
    let err: string | null = null;
    if (key === "fullName") err = validateFullName(form.fullName);
    if (key === "nic")      err = validateNIC(form.nic);
    if (key === "passport") err = validatePassport(form.passport);
    if (key === "email")    err = validateEmail(form.email);
    if (key === "phone")    err = validatePhone(form.phone);
    if (key === "address")  err = validateAddress(form.address);
    if (err) setErrors(prev => ({ ...prev, [key]: err! }));
    else { e.target.style.borderColor = "rgba(74,222,128,0.3)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.04)"; }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!e.target.style.borderColor.includes("113,113")) { e.target.style.borderColor = "rgba(14,165,233,0.3)"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.06)"; }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const n = validateFullName(form.fullName); if (n) e.fullName = n;
    if (form.idType === "nic") { const v = validateNIC(form.nic); if (v) e.nic = v; }
    else { const v = validatePassport(form.passport); if (v) e.passport = v; }
    const em = validateEmail(form.email); if (em) e.email = em;
    const ph = validatePhone(form.phone); if (ph) e.phone = ph;
    const ad = validateAddress(form.address); if (ad) e.address = ad;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); setTouched({ fullName: true, nic: true, passport: true, email: true, phone: true, address: true }); return; }
    setLoading(true);
    setApiError("");
    const id_number = form.idType === "nic" ? form.nic : form.passport;
    try {
      const result = await bookAppointment({
        doctor_id: doctor.id, hospital, slot_id: slotId, slot_time: slot, date, notes: form.notes,
        patient: { full_name: form.fullName, id_type: form.idType, id_number, email: form.email, phone: form.phone, address: form.address },
      });
      setPayhereData({ booking_ref: result.booking_ref, total_fee: result.total_fee, service_fee: result.service_fee, payhere: result.payhere });
    } catch (err: any) {
      setApiError(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    if (!payhereData) return;
    const ph = payhereData.payhere;
    const form_el = document.createElement("form");
    form_el.method = "POST";
    form_el.action = "https://sandbox.payhere.lk/pay/checkout"; // change to live URL in production
    const fields: Record<string, string> = {
      merchant_id: ph.merchant_id, return_url: ph.return_url, cancel_url: ph.cancel_url,
      notify_url: ph.notify_url, order_id: ph.order_id, items: ph.items,
      currency: ph.currency, amount: ph.amount, hash: ph.hash,
      first_name: form.fullName.split(" ")[0], last_name: form.fullName.split(" ").slice(1).join(" ") || "-",
      email: form.email, phone: form.phone, address: form.address, city: "Colombo", country: "Sri Lanka",
    };
    Object.entries(fields).forEach(([k, v]) => { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; form_el.appendChild(i); });
    document.body.appendChild(form_el);
    form_el.submit();
  };

  if (payhereData) {
    return (
      <div className="animate-scale-in" style={{ padding: "32px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px", color: "#38bdf8" }}>🔒</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#f1f5f9", marginBottom: 4 }}>Booking Reserved</h2>
          <p style={{ color: "#475569", fontSize: 13 }}>Your slot is held. Complete payment to confirm.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 12, background: "rgba(3,105,161,0.08)", border: "1px solid rgba(14,165,233,0.18)", maxWidth: 420, margin: "0 auto 20px", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>Booking Reference</p>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9", lineHeight: 1 }}>{payhereData.booking_ref}</p>
          </div>
        </div>
        <div className="glass" style={{ padding: "22px 24px", maxWidth: 420, margin: "0 auto 20px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Payment Summary</p>
            {([
              ["Doctor",            doctor.name],
              ["Hospital",          hospital],
              ["Date",              new Date(date + "T00:00:00").toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
              ["Time Slot",         slot],
              ["Consultation Fee",  `${formatCurrency(payhereData.total_fee - payhereData.service_fee)} (paid to doctor in person)`],
              ["Service Charge",    formatCurrency(payhereData.service_fee)],
              ["Pay Now",           formatCurrency(payhereData.service_fee)],
            ] as [string, string][]).map(([label, value], i, arr) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(148,163,184,0.07)" : "none" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: label === "Total" ? 700 : 600, color: label === "Total" ? "#f1f5f9" : "#cbd5e1", textAlign: "right", maxWidth: "60%" }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
          <button onClick={handlePayNow} style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "linear-gradient(90deg, #0369a1, #4f46e5)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 12 }}>
            Pay {formatCurrency(payhereData.service_fee)} via PayHere
          </button>
          <p style={{ color: "#334155", fontSize: 12 }}>You will be redirected to PayHere's secure payment page.</p>
          <p style={{ color: "#1e293b", fontSize: 11, marginTop: 6 }}>Your slot is held for 15 minutes. If payment is not completed, it will be released.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="glass animate-fade-up" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#0c2340", border: "1px solid rgba(14,165,233,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7dd3fc", fontWeight: 700, fontSize: 13, fontFamily: "Syne, sans-serif", flexShrink: 0 }}>{doctor.initials}</div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <p style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doctor.name}</p>
          <p style={{ color: "#475569", fontSize: 13 }}>{hospital} · {slot} · {new Date(date + "T00:00:00").toLocaleDateString("en-LK", { month: "short", day: "numeric" })}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{formatCurrency(doctor.fee)}</p>
          <p style={{ fontSize: 11, color: "#334155" }}>+ service charge</p>
        </div>
      </div>

      <div className="glass animate-fade-up-2" style={{ padding: "24px 20px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 22 }}>Patient Details</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Full Name" required error={errors.fullName} hint="As it appears on your NIC or Passport">
            <input type="text" placeholder="e.g. Kamal Perera" value={form.fullName} onChange={e => set("fullName", e.target.value)} style={getFieldStyle("fullName")} onFocus={handleFocus} onBlur={e => handleBlur(e, "fullName")} />
          </Field>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1, textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>ID Type <span style={{ color: "#64748b" }}>*</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["nic", "passport"] as const).map(type => (
                <button key={type} onClick={() => set("idType", type)} style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", transition: "all 0.2s", border: form.idType === type ? "1px solid rgba(14,165,233,0.3)" : "1px solid rgba(148,163,184,0.1)", background: form.idType === type ? "rgba(14,165,233,0.08)" : "transparent", color: form.idType === type ? "#7dd3fc" : "#475569" }}>
                  {type === "nic" ? "NIC" : "Passport"}
                </button>
              ))}
            </div>
          </div>
          {form.idType === "nic" ? (
            <Field label="NIC Number" required error={errors.nic} hint="Old: 901234567V · New: 199012345678">
              <input type="text" placeholder="e.g. 199012345678" value={form.nic} onChange={e => set("nic", e.target.value)} style={getFieldStyle("nic")} onFocus={handleFocus} onBlur={e => handleBlur(e, "nic")} />
            </Field>
          ) : (
            <Field label="Passport Number" required error={errors.passport} hint="1-2 letters followed by 7 digits (e.g. N1234567)">
              <input type="text" placeholder="e.g. N1234567" value={form.passport} onChange={e => set("passport", e.target.value)} style={getFieldStyle("passport")} onFocus={handleFocus} onBlur={e => handleBlur(e, "passport")} />
            </Field>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <Field label="Email" required error={errors.email} hint="We'll send your receipt here">
              <input type="email" placeholder="name@example.com" value={form.email} onChange={e => set("email", e.target.value)} style={getFieldStyle("email")} onFocus={handleFocus} onBlur={e => handleBlur(e, "email")} />
            </Field>
            <Field label="Phone" required error={errors.phone} hint="Sri Lankan number (e.g. 077 123 4567)">
              <input type="tel" placeholder="077 123 4567" value={form.phone} onChange={e => set("phone", e.target.value)} style={getFieldStyle("phone")} onFocus={handleFocus} onBlur={e => handleBlur(e, "phone")} />
            </Field>
          </div>
          <Field label="Address" required error={errors.address} hint="Your current residential address">
            <input type="text" placeholder="No. 12, Galle Rd, Colombo 03" value={form.address} onChange={e => set("address", e.target.value)} style={getFieldStyle("address")} onFocus={handleFocus} onBlur={e => handleBlur(e, "address")} />
          </Field>
          <Field label="Notes for Doctor (Optional)">
            <textarea placeholder="Any symptoms, allergies, or notes..." value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} style={{ ...getFieldStyle("notes"), resize: "none" }} onFocus={handleFocus} onBlur={e => handleBlur(e, "notes")} />
          </Field>
          <div style={{ background: "rgba(6,13,26,0.6)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(148,163,184,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}><span style={{ color: "#475569" }}>Consultation Fee</span><span style={{ color: "#94a3b8" }}>{formatCurrency(doctor.fee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}><span style={{ color: "#475569" }}>Service Charge</span><span style={{ color: "#94a3b8" }}>Calculated at checkout</span></div>
            <div style={{ height: 1, background: "rgba(148,163,184,0.07)", marginBottom: 10 }} />
            <div style={{ height: 1, background: "rgba(148,163,184,0.07)", marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Consultation Fee</span>
              <span style={{ color: "#475569", fontSize: 13 }}>
                {formatCurrency(doctor.fee)}
                <span style={{ fontSize: 11, color: "#334155", marginLeft: 6 }}>(paid to doctor in person)</span>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 15 }}>You Pay Now</span>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "#38bdf8" }}>Service charge only</span>
            </div>
          </div>
          {apiError && <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 13 }}>{apiError}</div>}
          <Button size="lg" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Reserving Slot..." : "Reserve & Proceed to Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}