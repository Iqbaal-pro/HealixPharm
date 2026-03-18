import { Doctor, TimeSlot } from "../types";

export const SPECIALIZATIONS: string[] = [
  "General Practitioner", "Cardiologist", "Dermatologist",
  "Neurologist", "Orthopedic Surgeon", "Pediatrician",
  "Psychiatrist", "Gynecologist", "Ophthalmologist",
  "ENT Specialist", "Diabetologist", "Urologist",
];

export const HOSPITALS: string[] = [
  "Colombo National Hospital", "Lanka Hospital", "Asiri Medical",
  "Nawaloka Hospital", "Durdans Hospital", "Hemas Hospital",
  "Central Hospital", "Ninewells Hospital",
];

export const TIME_SLOTS: TimeSlot[] = [
  { time: "08:00 AM", booked: false }, { time: "08:30 AM", booked: true  },
  { time: "09:00 AM", booked: false }, { time: "09:30 AM", booked: true  },
  { time: "10:00 AM", booked: false }, { time: "10:30 AM", booked: false },
  { time: "11:00 AM", booked: true  }, { time: "02:00 PM", booked: false },
  { time: "02:30 PM", booked: false }, { time: "03:00 PM", booked: true  },
  { time: "03:30 PM", booked: false }, { time: "04:00 PM", booked: false },
  { time: "04:30 PM", booked: true  }, { time: "05:00 PM", booked: false },
];

const SLOTS_A: TimeSlot[] = [
  { time: "06:00 PM", booked: false }, { time: "06:30 PM", booked: true  },
  { time: "07:00 PM", booked: false }, { time: "07:30 PM", booked: false },
  { time: "08:00 PM", booked: true  },
];

const SLOTS_B: TimeSlot[] = [
  { time: "05:00 PM", booked: false }, { time: "05:30 PM", booked: false },
  { time: "06:00 PM", booked: true  }, { time: "06:30 PM", booked: false },
  { time: "07:00 PM", booked: false },
];

const SLOTS_C: TimeSlot[] = [
  { time: "09:00 AM", booked: false }, { time: "09:30 AM", booked: false },
  { time: "10:00 AM", booked: true  }, { time: "10:30 AM", booked: false },
  { time: "11:00 AM", booked: false },
];

export const DOCTORS: Doctor[] = [
  {
    id: 1, name: "Dr. Ayesha Perera", specialization: "Cardiologist",
    hospital: "Lanka Hospital",
    otherHospitals: [
      { name: "Nawaloka Hospital", days: "Mon, Wed", hours: "6:00 PM – 8:00 PM", timeSlots: SLOTS_A },
      { name: "Asiri Medical",     days: "Fri",      hours: "5:00 PM – 7:00 PM", timeSlots: SLOTS_B },
    ],
    fee: 3500, serviceFee: 150, available: true,
    initials: "AP",
  },
  {
    id: 2, name: "Dr. Nuwan Silva", specialization: "General Practitioner",
    hospital: "Nawaloka Hospital",
    otherHospitals: [
      { name: "Central Hospital", days: "Tue, Thu", hours: "5:00 PM – 7:00 PM", timeSlots: SLOTS_B },
    ],
    fee: 2000, serviceFee: 150, available: true,
    initials: "NS", 
  },
  {
    id: 3, name: "Dr. Roshani Fernando", specialization: "Dermatologist",
    hospital: "Asiri Medical", otherHospitals: [],
    fee: 2800, serviceFee: 150, available: false,
    initials: "RF", 
  },
  {
    id: 4, name: "Dr. Kamal Jayawardena", specialization: "Neurologist",
    hospital: "Colombo National Hospital",
    otherHospitals: [
      { name: "Lanka Hospital", days: "Sat", hours: "9:00 AM – 12:00 PM", timeSlots: SLOTS_C },
    ],
    fee: 4000, serviceFee: 150, available: true,
    initials: "KJ",
  },
  {
    id: 5, name: "Dr. Priya Wijesinghe", specialization: "Pediatrician",
    hospital: "Durdans Hospital",
    otherHospitals: [
      { name: "Hemas Hospital", days: "Mon, Fri", hours: "4:00 PM – 6:00 PM", timeSlots: SLOTS_A },
    ],
    fee: 2500, serviceFee: 150, available: true,
    initials: "PW",
  },
  {
    id: 6, name: "Dr. Sanath Rathnayake", specialization: "Orthopedic Surgeon",
    hospital: "Hemas Hospital", otherHospitals: [],
    fee: 4500, serviceFee: 150, available: true,
    initials: "SR",
  },
];