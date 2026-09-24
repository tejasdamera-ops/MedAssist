import { useMemo } from "react";
import { StatusBadge } from "./StatusBadge";

export function Calendar({ availability = [], bookings = [], selectedSlot, onSelectSlot }) {
  const slots = useMemo(() => {
    return availability.flatMap((window) => {
      const [startHour, startMinute] = window.startTime.split(":").map(Number);
      const [endHour, endMinute] = window.endTime.split(":").map(Number);
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      const result = [];
      for (let cursor = start; cursor + window.slotDurationMins <= end; cursor += window.slotDurationMins) {
        const slotStart = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
        const slotEndMins = cursor + window.slotDurationMins;
        const slotEnd = `${String(Math.floor(slotEndMins / 60)).padStart(2, "0")}:${String(slotEndMins % 60).padStart(2, "0")}`;
        const booking = bookings.find((item) => item.startTime < slotEnd && item.endTime > slotStart);
        result.push({ startTime: slotStart, endTime: slotEnd, booking });
      }
      return result;
    });
  }, [availability, bookings]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot.startTime}
          disabled={Boolean(slot.booking)}
          onClick={() => onSelectSlot?.(slot)}
          className={`rounded-md border p-3 text-left text-sm ${
            selectedSlot?.startTime === slot.startTime ? "border-clinic-teal bg-clinic-mint" : "border-clinic-line bg-white"
          } ${slot.booking ? "cursor-not-allowed opacity-60" : "hover:border-clinic-teal"}`}
        >
          <div className="font-medium">
            {slot.startTime} - {slot.endTime}
          </div>
          <div className="mt-2">{slot.booking ? <StatusBadge status={slot.booking.status} /> : <span className="text-slate-500">Available</span>}</div>
        </button>
      ))}
    </div>
  );
}
