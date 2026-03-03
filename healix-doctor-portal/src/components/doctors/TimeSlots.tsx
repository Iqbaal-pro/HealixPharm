"use client";
import { TimeSlot } from "../../types";
import Button from "../ui/Button";

interface Props {
  slots: TimeSlot[];
  selected: string;
  onSelect: (time: string) => void;
  onBook: () => void;
}

export default function TimeSlots({ slots, selected, onSelect, onBook }: Props) {
  return (
    <div className="card p-6">
      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-5">
         Available Time Slots — Today
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={slot.booked}
            onClick={() => !slot.booked && onSelect(slot.time)}
            className={`
              py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border
              ${slot.booked
                ? "bg-slate-800/40 text-slate-600 border-slate-800 line-through cursor-not-allowed"
                : selected === slot.time
                  ? "bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-600 hover:text-white cursor-pointer"
              }
            `}
          >
            {slot.time}
            {slot.booked && <span className="ml-1">✗</span>}
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4
                        flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">
              Selected Time
            </p>
            <p className="text-white font-bold text-lg">{selected}</p>
          </div>
          <Button size="lg" onClick={onBook}>
            Book This Slot →
          </Button>
        </div>
      )}
    </div>
  );
}