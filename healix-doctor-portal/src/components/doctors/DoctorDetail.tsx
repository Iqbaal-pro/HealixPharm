import { Doctor } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { TIME_SLOTS } from "../../data/mockData";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import TimeSlots from "./TimeSlots";

interface Props {
  doctor: Doctor;
  selectedSlot: string;
  onSelectSlot: (time: string) => void;
  onBook: () => void;
  onBack: () => void;
}

export default function DoctorDetail({
  doctor,
  selectedSlot,
  onSelectSlot,
  onBook,
  onBack,
}: Props) {
  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← Back to Search
      </Button>

      {/* Doctor profile card */}
      <div className="card p-6 bg-gradient-to-br from-blue-950/60 to-slate-900">
        <div className="flex gap-5 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700
                          flex items-center justify-center text-white font-bold text-xl shrink-0">
            {doctor.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-white mb-1">{doctor.name}</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="blue">{doctor.specialization}</Badge>
              <Badge variant="slate">{doctor.hospital}</Badge>
              <Badge variant="green">Available Today</Badge>
            </div>
            <p className="text-slate-400 text-sm">
              {doctor.qualifications} · {doctor.experience} · {doctor.languages.join(", ")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500 mb-0.5">Consultation Fee</p>
            <p className="text-green-400 font-extrabold text-2xl">
              {formatCurrency(doctor.fee)}
            </p>
          </div>
        </div>
      </div>

      {/* Time slots */}
      <TimeSlots
        slots={TIME_SLOTS}
        selected={selectedSlot}
        onSelect={onSelectSlot}
        onBook={onBook}
      />

      {/* Other hospitals */}
      {doctor.otherHospitals.length > 0 && (
        <div className="card p-6">
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
            Also Available At Other Hospitals
          </p>
          <div className="space-y-3">
            {doctor.otherHospitals.map((h) => (
              <div
                key={h.name}
                className="flex items-center justify-between bg-slate-800/50 rounded-xl
                           px-4 py-3 border border-slate-700"
              >
                <div>
                  <p className="font-semibold text-white text-sm">{h.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{h.days} · {h.hours}</p>
                </div>
                <Badge variant="yellow">Other Location</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}