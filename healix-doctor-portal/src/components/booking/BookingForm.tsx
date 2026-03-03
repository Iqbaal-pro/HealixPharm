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

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export default function BookingForm({ doctor, slot, onBack }: Props) {
  const [form, setForm] = useState<BookingFormData>({
    fullName: "", idType: "nic", nic: "", passport: "",
    email: "", phone: "", address: "", notes: "",
  });
  const [errors, setErrors]     = useState<Errors>({});
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const appointmentId = useState(generateAppointmentId())[0];

  const set = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.fullName.trim())  e.fullName = "Full name is required";
    if (form.idType === "nic" && !form.nic.trim())
      e.nic = "NIC number is required";
    if (form.idType === "passport" && !form.passport.trim())
      e.passport = "Passport number is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email is required";
    if (!form.phone.trim())   e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setConfirmed(true);
  };

  const totalFee = doctor.fee + doctor.serviceFee;

  /* ── Confirmation screen ── */
  if (confirmed) {
    return (
      <div className="text-center py-10 px-4">
        <div className="text-6xl mb-5"></div>
        <h2 className="text-2xl font-extrabold text-green-400 mb-2">
          Appointment Confirmed!
        </h2>
        <p className="text-slate-400 mb-1">
          Booking ID:{" "}
          <span className="text-white font-mono font-bold">{appointmentId}</span>
        </p>
        <p className="text-slate-400 mb-8">
          Receipt sent to{" "}
          <span className="text-white font-semibold">{form.email}</span>
        </p>

        <div className="card p-6 max-w-sm mx-auto text-left mb-6">
          {[
            ["Doctor",           doctor.name],
            ["Specialization",   doctor.specialization],
            ["Hospital",         doctor.hospital],
            ["Time",             slot],
            ["Patient",          form.fullName],
            [form.idType === "nic" ? "NIC" : "Passport",
             form.idType === "nic" ? form.nic : form.passport],
            ["Consultation Fee", formatCurrency(doctor.fee)],
            ["Service Charge",   formatCurrency(doctor.serviceFee)],
            ["Total",            formatCurrency(totalFee)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between py-2 border-b border-slate-800 last:border-0"
            >
              <span className="text-slate-500 text-sm">{label}</span>
              <span
                className={`text-sm font-semibold ${
                  label === "Total" ? "text-green-400" : "text-white"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4
                        max-w-sm mx-auto text-sm text-blue-300">
          📲 WhatsApp confirmation sent to{" "}
          <strong>{form.phone}</strong>. Please arrive 10 mins early.
        </div>
      </div>
    );
  }

  /* ── Booking form ── */
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        ← Back to Time Slots
      </Button>

      {/* Appointment summary banner */}
      <div className="card p-4 flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700
                        flex items-center justify-center text-white font-bold shrink-0">
          {doctor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{doctor.name}</p>
          <p className="text-slate-400 text-sm">{doctor.hospital} · {slot}</p>
        </div>
        <p className="text-green-400 font-extrabold text-lg shrink-0">
          {formatCurrency(doctor.fee)}
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
          Patient Details
        </p>

        {/* Full name */}
        <Field label="Full Name" required error={errors.fullName}>
          <input
            type="text"
            placeholder="As per NIC / Passport"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className="input-base"
          />
        </Field>

        {/* ID type toggle */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            ID Type <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            {(["nic", "passport"] as const).map((type) => (
              <button
                key={type}
                onClick={() => set("idType", type)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  form.idType === type
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                {type === "nic" ? "NIC" : "Passport"}
              </button>
            ))}
          </div>
        </div>

        {form.idType === "nic" ? (
          <Field label="NIC Number" required error={errors.nic}>
            <input
              type="text"
              placeholder="e.g. 199012345678 or 901234567V"
              value={form.nic}
              onChange={(e) => set("nic", e.target.value)}
              className="input-base"
            />
          </Field>
        ) : (
          <Field label="Passport Number" required error={errors.passport}>
            <input
              type="text"
              placeholder="e.g. N1234567"
              value={form.passport}
              onChange={(e) => set("passport", e.target.value)}
              className="input-base"
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email Address" required error={errors.email}>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="input-base"
            />
          </Field>
          <Field label="Phone Number" required error={errors.phone}>
            <input
              type="tel"
              placeholder="+94 77 123 4567"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="input-base"
            />
          </Field>
        </div>

        <Field label="Address" required error={errors.address}>
          <input
            type="text"
            placeholder="No. 12, Galle Rd, Colombo 03"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="input-base"
          />
        </Field>

        <Field label="Notes for Doctor (Optional)">
          <textarea
            placeholder="Any symptoms, allergies, or notes..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className="input-base resize-none"
          />
        </Field>

        {/* Fee breakdown */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 space-y-2">
          {[
            ["Consultation Fee", formatCurrency(doctor.fee)],
            ["Service Charge",   formatCurrency(doctor.serviceFee)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="text-slate-200">{value}</span>
            </div>
          ))}
          <div className="border-t border-slate-600 pt-2 flex justify-between">
            <span className="font-bold text-white">Total</span>
            <span className="font-extrabold text-green-400 text-lg">
              {formatCurrency(totalFee)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          📧 Receipt emailed · 📲 WhatsApp confirmation sent to your phone
        </p>

        <Button
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Confirming..." : "Confirm Appointment & Pay →"}
        </Button>
      </div>
    </div>
  );
}