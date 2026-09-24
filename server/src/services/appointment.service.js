import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { AppError } from "../utils/AppError.js";

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function dateOnly(date) {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

export async function assertDoctorAvailable({ doctorId, date, startTime, endTime }) {
  if (toMinutes(startTime) >= toMinutes(endTime)) {
    throw new AppError("Appointment end time must be after start time", 422);
  }

  const doctor = await DoctorProfile.findById(doctorId);
  if (!doctor) throw new AppError("Doctor profile not found", 404);

  const requestedDate = dateOnly(date);
  const dayOfWeek = requestedDate.getUTCDay();
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  const isOnLeave = doctor.leaves.some((leave) => {
    if (!leave.startDate || !leave.endDate) return false;
    return requestedDate >= dateOnly(leave.startDate) && requestedDate <= dateOnly(leave.endDate);
  });
  if (isOnLeave) throw new AppError("Doctor is on leave for this date", 409);

  const window = doctor.availability.find(
    (slot) =>
      slot.dayOfWeek === dayOfWeek &&
      start >= toMinutes(slot.startTime) &&
      end <= toMinutes(slot.endTime)
  );
  if (!window) throw new AppError("Requested time is outside doctor availability", 409);
}

export async function assertNoAppointmentConflict({ doctorId, date, startTime, endTime, excludeId = null }) {
  const query = {
    doctorId,
    date: dateOnly(date),
    status: { $nin: ["cancelled", "no-show"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };
  if (excludeId) query._id = { $ne: excludeId };

  const conflict = await Appointment.findOne(query).lean();
  if (conflict) throw new AppError("Doctor already has an appointment in that time window", 409);
}

export async function nextQueueNumber(date) {
  const last = await Appointment.findOne({ date: dateOnly(date) }).sort({ queueNumber: -1 }).lean();
  return (last?.queueNumber || 0) + 1;
}

export { dateOnly };
