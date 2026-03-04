"use client";
import { useState } from "react";
import { Doctor, BookingFormData } from "../../types";
import { formatCurrency, generateAppointmentId } from "../../lib/utils";
import Button from "../ui/Button";

interface Props {
  doctor: Doctor;
  slot: string;
  onBack: () => void;
}

type Errors = Partial<Record<keyof BookingFormData, string>>;

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
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
      {error && <p style={{ color: "#f87171", fontSize: 12 }}>{error}</p>}
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

export default function BookingForm({ doctor, slot, onBack }: Props) {
  const [form, setForm] = useState<BookingFormData>({
    fullName: "", idType: "nic", nic: "", passport: "",
    email: "", phone: "", address: "", notes: "",
  });
  const [errors, setErrors]       = useState<Errors>({});
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [appointmentId]           = useState(generateAppointmentId());

  const set = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(14,165,233,0.3)";
    e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.06)";
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(148,163,184,0.1)";
    e.target.style.boxShadow = "none";
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (form.idType === "nic" && !form.nic.trim()) e.nic = "NIC number is required";
    if (form.idType === "passport" && !form.passport.trim()) e.passport = "Passport number is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setConfirmed(true);
  };

  const totalFee = doctor.fee + doctor.serviceFee;

  /* ── Confirmation ── */
  if (confirmed) {
    return (
      <div className="animate-scale-in" style={{ textAlign: "center", padding: "48px 16px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(14,165,233,0.08)",
          border: "1px solid rgba(14,165,233,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 24px",
        }}>
          ✓
        </div>
        <h2 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: 24, color: "#f1f5f9", marginBottom: 8,
        }}>
          Appointment Confirmed
        </h2>
        <p style={{ color: "#475569", marginBottom: 4, fontSize: 14 }}>
          Booking ID:{" "}
          <span style={{ color: "#7dd3fc", fontFamily: "monospace", fontWeight: 600 }}>
            {appointmentId}
          </span>
        </p>
        <p style={{ color: "#475569", marginBottom: 36, fontSize: 14 }}>
          Receipt sent to{" "}
          <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{form.email}</span>
        </p>

        <div className="glass" style={{
          padding: 24, maxWidth: 380,
          margin: "0 auto 20px", textAlign: "left",
        }}>
          {([
            ["Doctor",           doctor.name],
            ["Specialization",   doctor.specialization],
            ["Hospital",         doctor.hospital],
            ["Time Slot",        slot],
            ["Patient",          form.fullName],
            [form.idType === "nic" ? "NIC" : "Passport",
             form.idType === "nic" ? form.nic : form.passport],
            ["Consultation Fee", formatCurrency(doctor.fee)],
            ["Service Charge",   formatCurrency(doctor.serviceFee)],
            ["Total",            formatCurrency(totalFee)],
          ] as [string, string][]).map(([label, value], i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < arr.length - 1
                ? "1px solid rgba(148,163,184,0.07)" : "none",
            }}>
              <span style={{ color: "#475569", fontSize: 13 }}>{label}</span>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: label === "Total" ? "#e2e8f0" : "#cbd5e1",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          background: "rgba(14,165,233,0.05)",
          border: "1px solid rgba(14,165,233,0.1)",
          borderRadius: 10, padding: "12px 18px",
          maxWidth: 380, margin: "0 auto",
          fontSize: 13, color: "#64748b",
        }}>
          📲 WhatsApp confirmation sent to{" "}
          <span style={{ color: "#94a3b8" }}>{form.phone}</span>.
          Please arrive 10 mins early.
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back to Time Slots
      </Button>

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
          <p style={{ color: "#475569", fontSize: 13 }}>{doctor.hospital} · {slot}</p>
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
          <Field label="Full Name" required error={errors.fullName}>
            <input type="text" placeholder="As per NIC / Passport"
              value={form.fullName} onChange={e => set("fullName", e.target.value)}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </Field>

          {/* ID toggle */}
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
            <Field label="NIC Number" required error={errors.nic}>
              <input type="text" placeholder="e.g. 199012345678"
                value={form.nic} onChange={e => set("nic", e.target.value)}
                style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </Field>
          ) : (
            <Field label="Passport Number" required error={errors.passport}>
              <input type="text" placeholder="e.g. N1234567"
                value={form.passport} onChange={e => set("passport", e.target.value)}
                style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </Field>
          )}

          {/* Email + Phone — responsive grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}>
            <Field label="Email" required error={errors.email}>
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set("email", e.target.value)}
                style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input type="tel" placeholder="+94 77 123 4567"
                value={form.phone} onChange={e => set("phone", e.target.value)}
                style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </Field>
          </div>

          <Field label="Address" required error={errors.address}>
            <input type="text" placeholder="No. 12, Galle Rd, Colombo 03"
              value={form.address} onChange={e => set("address", e.target.value)}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </Field>

          <Field label="Notes for Doctor (Optional)">
            <textarea
              placeholder="Any symptoms, allergies, or notes..."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={focusInput} onBlur={blurInput}
            />
          </Field>

          {/* Fee breakdown */}
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
            Receipt emailed · WhatsApp confirmation sent to your phone
          </p>

          <Button size="lg" style={{ width: "100%" }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? "Confirming..." : "Confirm Appointment →"}
          </Button>
        </div>
      </div>
    </div>
  );
}