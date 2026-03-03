export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  otherHospitals: OtherHospital[];
  fee: number;
  serviceFee: number;
  available: boolean;
  experience: string;
  languages: string[];
  initials: string;
  qualifications: string;
}

export interface OtherHospital {
  name: string;
  days: string;
  hours: string;
}

export interface TimeSlot {
  time: string;
  booked: boolean;
}

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

export interface Appointment {
  id: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  totalFee: number;
  status: "confirmed" | "pending" | "cancelled";
}