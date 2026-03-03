import { Doctor } from "../../types";
import { formatCurrency } from "../../lib/utils";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface Props {
  doctor: Doctor;
  onChannel: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onChannel }: Props) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:border-blue-800 transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700
                      flex items-center justify-center text-white font-bold text-sm shrink-0">
        {doctor.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-base truncate">{doctor.name}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge variant="blue">{doctor.specialization}</Badge>
          <Badge variant="slate">{doctor.hospital}</Badge>
          {doctor.available
            ? <Badge variant="green">Available</Badge>
            : <Badge variant="red">Fully Booked</Badge>
          }
        </div>
      </div>

      {/* Fee + Action */}
      <div className="text-right shrink-0">
        <p className="text-green-400 font-bold text-base mb-2">
          {formatCurrency(doctor.fee)}
        </p>
        <Button
          variant={doctor.available ? "primary" : "secondary"}
          size="sm"
          disabled={!doctor.available}
          onClick={() => doctor.available && onChannel(doctor)}
        >
          {doctor.available ? "Channel 🩺" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}