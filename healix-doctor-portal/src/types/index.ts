// Mirrors the backend _doctor_to_dict() response exactly
export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  otherHospitals: OtherHospital[];
  fee: number;
  serviceFee: number; // returned as 0 from /api/doctors; real value comes at booking time
  available: boolean;
  initials: string;
  qualifications?: string;
  experience?: string;
}

// Mirrors the backend OtherHospital model — NO timeSlots field
// Slots for other hospitals are fetched via GET /api/doctors/{id}/slots?hospital=...
export interface OtherHospital {
  id: number;
  name: string;
  days: string;
  hours: string;
}

// Mirrors the backend TimeSlot response
export interface TimeSlot {
  id: number;
  time: string;
  date: string;
  booked: boolean;
}

// Used by the booking form (frontend only — mapped before sending to backend)
export interface BookingFormData {
  fullName: string;
  idType: "nic" | "passport";
  nic: string;
  passport: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface SearchFilters {
  specialization: string;
  hospital: string;
  date: string;
  doctorName: string;
}

// What the backend returns after POST /api/appointments
export interface AppointmentResponse {
  booking_ref: string;
  appointment_id: number;
  status: string;
  service_fee: number;
  total_fee: number;
  payhere: {
    merchant_id: string;
    order_id: string;
    amount: string;
    currency: string;
    hash: string;
    notify_url: string;
    return_url: string;
    cancel_url: string;
    items: string;
  };
}