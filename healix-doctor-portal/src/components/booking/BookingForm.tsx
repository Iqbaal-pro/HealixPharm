
"use client";
import { useState } from "react";
import { Doctor, BookingFormData } from "../../types";
import { formatCurrency, generateAppointmentId } from "../../lib/utils";
import Button from "../ui/Button";

interface Props {
  doctor: Doctor;
  slot: string;
  hospital: string;
  onBack: () => void;
}

type Errors = Partial<Record<keyof BookingFormData, string>>;

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: "#475569",
        letterSpacing: 1, textTransform: "uppercase" as const,
      }}>
        {label}{required && <span style={{ color: "#64748b", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "6px 10px", borderRadius: 7,
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
        }}>
          <span style={{ color: "#f87171", fontSize: 11 }}>⚠</span>
          <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}
      {!error && hint && (
        <p style={{ color: "#334155", fontSize: 11, margin: 0 }}>{hint}</p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(6,13,26,0.9)",
  border: "1px solid rgba(148,163,184,0.1)",
  borderRadius: 10,
  padding: "11px 14px",
  color: "#f1f5f9",
  fontSize: 14,
  fontFamily: "DM Sans, sans-serif",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "rgba(248,113,113,0.4)",
  boxShadow: "0 0 0 3px rgba(248,113,113,0.06)",
};

const validInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "rgba(74,222,128,0.3)",
  boxShadow: "0 0 0 3px rgba(74,222,128,0.04)",
};

function validateFullName(name: string): string | null {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 3) return "Please enter your full name";
  if (!/^[a-zA-Z\s.'-]+$/.test(name)) return "Name should only contain letters";
  return null;
}
function validateNIC(nic: string): string | null {
  const old = /^\d{9}[VXvx]$/;
  const neo = /^\d{12}$/;
  if (!nic.trim()) return "NIC number is required";
  if (!old.test(nic) && !neo.test(nic)) return "Valid formats: 901234567V or 199012345678";
  return null;
}
function validatePassport(p: string): string | null {
  if (!p.trim()) return "Passport number is required";
  if (!/^[A-Za-z]{1,2}\d{7}$/.test(p)) return "Valid format: N1234567 (1-2 letters + 7 digits)";
  return null;
}
function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email (e.g. name@gmail.com)";
  return null;
}
function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (!phone.trim()) return "Phone number is required";
  if (!/^(\+94|0)[0-9]{9}$/.test(cleaned)) return "Enter a valid Sri Lankan number (e.g. 077 123 4567)";
  return null;
}
function validateAddress(address: string): string | null {
  if (!address.trim()) return "Address is required";
  if (address.trim().length < 10) return "Please enter your full address";
  return null;
}

export default function BookingForm({ doctor, slot, hospital, onBack }: Props) {
  const [form, setForm] = useState<BookingFormData>({
    fullName: "", idType: "nic", nic: "", passport: "",
    email: "", phone: "", address: "", notes: "",
  });
  const [errors, setErrors]       = useState<Errors>({});
  const [touched, setTouched]     = useState<Partial<Record<keyof BookingFormData, boolean>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [appointmentId]           = useState(generateAppointmentId());

  const set = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const getFieldStyle = (key: keyof BookingFormData): React.CSSProperties => {
    if (errors[key]) return errorInputStyle;
    if (touched[key] && form[key]) return validInputStyle;
    return inputStyle;
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof BookingFormData
  ) => {
    setTouched(t => ({ ...t, [key]: true }));
    let err: string | null = null;
    if (key === "fullName") err = validateFullName(form.fullName);
    if (key === "nic")      err = validateNIC(form.nic);
    if (key === "passport") err = validatePassport(form.passport);
    if (key === "email")    err = validateEmail(form.email);
    if (key === "phone")    err = validatePhone(form.phone);
    if (key === "address")  err = validateAddress(form.address);
    if (err) {
      setErrors(prev => ({ ...prev, [key]: err! }));
    } else {
      e.target.style.borderColor = "rgba(74,222,128,0.3)";
      e.target.style.boxShadow   = "0 0 0 3px rgba(74,222,128,0.04)";
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!e.target.style.borderColor.includes("113,113")) {
      e.target.style.borderColor = "rgba(14,165,233,0.3)";
      e.target.style.boxShadow   = "0 0 0 3px rgba(14,165,233,0.06)";
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const n = validateFullName(form.fullName); if (n) e.fullName = n;
    if (form.idType === "nic") {
      const v = validateNIC(form.nic); if (v) e.nic = v;
    } else {
      const v = validatePassport(form.passport); if (v) e.passport = v;
    }
    const em = validateEmail(form.email);     if (em) e.email   = em;
    const ph = validatePhone(form.phone);     if (ph) e.phone   = ph;
    const ad = validateAddress(form.address); if (ad) e.address = ad;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      setTouched({
        fullName: true, nic: true, passport: true,
        email: true, phone: true, address: true,
      });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setConfirmed(true);
  };

  const totalFee = doctor.fee + doctor.serviceFee;

  /* ── Confirmation ── */
  if (confirmed) {
    return (
      <div className="animate-scale-in" style={{ padding: "32px 0" }}>

        {/* Success header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, margin: "0 auto 14px", color: "#4ade80",
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: 22, color: "#f1f5f9", marginBottom: 4,
          }}>
            Appointment Confirmed
          </h2>
          <p style={{ color: "#475569", fontSize: 13 }}>
            Your booking has been successfully placed
          </p>
        </div>

        {/* Booking ID — horizontal pill */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px", borderRadius: 12,
          background: "rgba(3,105,161,0.08)",
          border: "1px solid rgba(14,165,233,0.18)",
          maxWidth: 420, margin: "0 auto 20px",
          gap: 12,
        }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 600, color: "#475569",
              letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5,
            }}>
              Booking Reference
            </p>
            <p style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: 20, color: "#f1f5f9", lineHeight: 1,
            }}>
              {appointmentId}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(appointmentId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: copied ? "rgba(74,222,128,0.1)" : "rgba(148,163,184,0.06)",
              border: copied
                ? "1px solid rgba(74,222,128,0.25)"
                : "1px solid rgba(148,163,184,0.12)",
              color: copied ? "#4ade80" : "#64748b",
              cursor: "pointer", transition: "all 0.2s",
            }}
            title="Copy booking reference"
          >
            {copied ? (
              // Checkmark icon
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              // Copy icon
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="1" width="8" height="10" rx="1.5"
                  stroke="currentColor" strokeWidth="1.4"/>
                <path d="M1 4.5V12C1 12.6 1.4 13 2 13H9"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Sent indicators */}
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 8, maxWidth: 420, margin: "0 auto 20px",
        }}>
          {[
            { icon: "💬", label: "WhatsApp confirmation sent to", value: form.phone },
            { icon: "📱", label: "SMS confirmation sent to",       value: form.phone },
            { icon: "✉️", label: "Receipt emailed to",             value: form.email },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 10,
              background: "rgba(74,222,128,0.04)",
              border: "1px solid rgba(74,222,128,0.1)",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                  {item.label}
                </p>
                <p style={{
                  fontSize: 14, fontWeight: 600, color: "#cbd5e1",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.value}
                </p>
              </div>
              <div style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#4ade80",
              }}>
                ✓
              </div>
            </div>
          ))}
        </div>

        {/* Receipt */}
        <div className="glass" style={{
          padding: "22px 24px",
          maxWidth: 420, margin: "0 auto 16px",
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: "#475569",
            letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14,
          }}>
            Appointment Details
          </p>
          {([
            ["Doctor",           doctor.name],
            ["Specialization",   doctor.specialization],
            ["Hospital",         hospital],
            ["Time Slot",        slot],
            ["Date",             new Date().toLocaleDateString("en-LK", {
                                   weekday: "long", year: "numeric",
                                   month: "long", day: "numeric",
                                 })],
            ["Patient",          form.fullName],
            [form.idType === "nic" ? "NIC" : "Passport",
             form.idType === "nic" ? form.nic : form.passport],
            ["Consultation Fee", formatCurrency(doctor.fee)],
            ["Service Charge",   formatCurrency(doctor.serviceFee)],
            ["Total",            formatCurrency(totalFee)],
          ] as [string, string][]).map(([label, value], i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", padding: "10px 0",
              borderBottom: i < arr.length - 1
                ? "1px solid rgba(148,163,184,0.07)" : "none",
            }}>
              <span style={{ color: "#64748b", fontSize: 13, flexShrink: 0 }}>{label}</span>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: label === "Total" ? "#f1f5f9" : "#cbd5e1",
                textAlign: "right", maxWidth: "58%",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Arrive early */}
        <div style={{
          background: "rgba(14,165,233,0.04)",
          border: "1px solid rgba(14,165,233,0.08)",
          borderRadius: 10, padding: "12px 18px",
          maxWidth: 420, margin: "0 auto 24px",
          fontSize: 13, color: "#64748b",
          lineHeight: 1.7, textAlign: "center",
        }}>
          Please arrive{" "}
          <strong style={{ color: "#cbd5e1" }}>10 minutes early</strong>{" "}
          and quote reference{" "}
          <strong style={{ color: "#7dd3fc" }}>{appointmentId}</strong>{" "}
          at reception.
        </div>

        {/* Book another */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => window.location.href = "/channel"}
            className="btn-glow"
            style={{ padding: "11px 32px", fontSize: 14 }}
          >
            Book Another Appointment
          </button>
        </div>

      </div>
    );
  }

  /* ── Form ── */
  return (
    <div>
      {/* Summary banner */}
      <div className="glass animate-fade-up" style={{
        padding: "14px 18px", marginBottom: 16,
        display: "flex", alignItems: "center",
        gap: 14, flexWrap: "wrap",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: "#0c2340",
          border: "1px solid rgba(14,165,233,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#7dd3fc", fontWeight: 700, fontSize: 13,
          fontFamily: "Syne, sans-serif", flexShrink: 0,
        }}>
          {doctor.initials}
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <p style={{
            fontWeight: 600, color: "#f1f5f9", fontSize: 14,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {doctor.name}
          </p>
          <p style={{ color: "#475569", fontSize: 13 }}>{hospital} · {slot}</p>
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", flexShrink: 0 }}>
          {formatCurrency(doctor.fee)}
        </p>
      </div>

      <div className="glass animate-fade-up-2" style={{ padding: "24px 20px" }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: "#475569",
          letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 22,
        }}>
          Patient Details
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Field label="Full Name" required error={errors.fullName}
            hint="As it appears on your NIC or Passport">
            <input type="text" placeholder="e.g. Kamal Perera"
              value={form.fullName} onChange={e => set("fullName", e.target.value)}
              style={getFieldStyle("fullName")} onFocus={handleFocus}
              onBlur={e => handleBlur(e, "fullName")} />
          </Field>

          <div>
            <label style={{
              fontSize: 11, fontWeight: 600, color: "#475569",
              letterSpacing: 1, textTransform: "uppercase" as const,
              display: "block", marginBottom: 8,
            }}>
              ID Type <span style={{ color: "#64748b" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["nic", "passport"] as const).map(type => (
                <button key={type} onClick={() => set("idType", type)} style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "DM Sans, sans-serif", cursor: "pointer",
                  transition: "all 0.2s",
                  border: form.idType === type
                    ? "1px solid rgba(14,165,233,0.3)"
                    : "1px solid rgba(148,163,184,0.1)",
                  background: form.idType === type
                    ? "rgba(14,165,233,0.08)" : "transparent",
                  color: form.idType === type ? "#7dd3fc" : "#475569",
                }}>
                  {type === "nic" ? "NIC" : "Passport"}
                </button>
              ))}
            </div>
          </div>

          {form.idType === "nic" ? (
            <Field label="NIC Number" required error={errors.nic}
              hint="Old: 901234567V · New: 199012345678">
              <input type="text" placeholder="e.g. 199012345678"
                value={form.nic} onChange={e => set("nic", e.target.value)}
                style={getFieldStyle("nic")} onFocus={handleFocus}
                onBlur={e => handleBlur(e, "nic")} />
            </Field>
          ) : (
            <Field label="Passport Number" required error={errors.passport}
              hint="1-2 letters followed by 7 digits (e.g. N1234567)">
              <input type="text" placeholder="e.g. N1234567"
                value={form.passport} onChange={e => set("passport", e.target.value)}
                style={getFieldStyle("passport")} onFocus={handleFocus}
                onBlur={e => handleBlur(e, "passport")} />
            </Field>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}>
            <Field label="Email" required error={errors.email}
              hint="We'll send your receipt here">
              <input type="email" placeholder="name@example.com"
                value={form.email} onChange={e => set("email", e.target.value)}
                style={getFieldStyle("email")} onFocus={handleFocus}
                onBlur={e => handleBlur(e, "email")} />
            </Field>
            <Field label="Phone" required error={errors.phone}
              hint="Sri Lankan number (e.g. 077 123 4567)">
              <input type="tel" placeholder="077 123 4567"
                value={form.phone} onChange={e => set("phone", e.target.value)}
                style={getFieldStyle("phone")} onFocus={handleFocus}
                onBlur={e => handleBlur(e, "phone")} />
            </Field>
          </div>

          <Field label="Address" required error={errors.address}
            hint="Your current residential address">
            <input type="text" placeholder="No. 12, Galle Rd, Colombo 03"
              value={form.address} onChange={e => set("address", e.target.value)}
              style={getFieldStyle("address")} onFocus={handleFocus}
              onBlur={e => handleBlur(e, "address")} />
          </Field>

          <Field label="Notes for Doctor (Optional)">
            <textarea
              placeholder="Any symptoms, allergies, or notes..."
              value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={3} style={{ ...getFieldStyle("notes"), resize: "none" }}
              onFocus={handleFocus} onBlur={e => handleBlur(e, "notes")} />
          </Field>

          <div style={{
            background: "rgba(6,13,26,0.6)", borderRadius: 12,
            padding: "16px 18px",
            border: "1px solid rgba(148,163,184,0.07)",
          }}>
            {[
              ["Consultation Fee", formatCurrency(doctor.fee)],
              ["Service Charge",   formatCurrency(doctor.serviceFee)],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                marginBottom: 10, fontSize: 14,
              }}>
                <span style={{ color: "#475569" }}>{label}</span>
                <span style={{ color: "#94a3b8" }}>{value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "rgba(148,163,184,0.07)", marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 15 }}>Total</span>
              <span style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700,
                fontSize: 17, color: "#e2e8f0",
              }}>
                {formatCurrency(totalFee)}
              </span>
            </div>
          </div>

          <p style={{ color: "#334155", fontSize: 12, textAlign: "center" }}>
            Receipt emailed · WhatsApp & SMS confirmation sent to your phone
          </p>

          <Button size="lg" style={{ width: "100%" }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? "Confirming..." : "Confirm Appointment"}
          </Button>

        </div>
      </div>
    </div>
  );
}