import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import PatientProfile from "../models/PatientProfile.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAuditLog } from "../middleware/audit.js";
import {
  assertDoctorAvailable,
  assertNoAppointmentConflict,
  dateOnly,
  nextQueueNumber
} from "../services/appointment.service.js";

async function scopedAppointmentQuery(req) {
  if (req.user.role === "admin" || req.user.role === "receptionist") return {};

  if (req.user.role === "doctor") {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    return { doctorId: profile?._id };
  }

  if (req.user.role === "patient") {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    return { patientId: profile?._id };
  }

  return { _id: null };
}

export const listAppointments = asyncHandler(async (req, res) => {
  const query = await scopedAppointmentQuery(req);
  if (req.query.date) query.date = dateOnly(req.query.date);
  if (req.query.status) query.status = req.query.status;

  const appointments = await Appointment.find(query)
    .populate("patientId doctorId departmentId serviceId")
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, message: "Appointments loaded", data: appointments });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    date: dateOnly(req.body.date),
    createdBy: req.user._id,
    queueNumber: await nextQueueNumber(req.body.date)
  };

  await assertDoctorAvailable(payload);
  await assertNoAppointmentConflict(payload);

  const appointment = await Appointment.create(payload);
  await writeAuditLog({
    req,
    action: "appointment.create",
    resourceType: "Appointment",
    resourceId: appointment._id,
    after: appointment.toObject()
  });

  res.status(201).json({ success: true, message: "Appointment created", data: appointment });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const scope = await scopedAppointmentQuery(req);
  const appointment = await Appointment.findOne({ _id: req.params.id, ...scope }).populate(
    "patientId doctorId departmentId serviceId"
  );
  if (!appointment) throw new AppError("Appointment not found", 404);
  res.json({ success: true, message: "Appointment loaded", data: appointment });
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);

  const before = appointment.toObject();
  const payload = {
    doctorId: appointment.doctorId,
    date: dateOnly(req.body.date),
    startTime: req.body.startTime,
    endTime: req.body.endTime
  };

  await assertDoctorAvailable(payload);
  await assertNoAppointmentConflict({ ...payload, excludeId: appointment._id });

  appointment.date = payload.date;
  appointment.startTime = payload.startTime;
  appointment.endTime = payload.endTime;
  appointment.status = "confirmed";
  await appointment.save();

  await writeAuditLog({
    req,
    action: "appointment.reschedule",
    resourceType: "Appointment",
    resourceId: appointment._id,
    before,
    after: appointment.toObject()
  });

  res.json({ success: true, message: "Appointment rescheduled", data: appointment });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);

  const before = appointment.toObject();
  appointment.status = "cancelled";
  appointment.cancelReason = req.body.cancelReason || "Cancelled";
  await appointment.save();

  await writeAuditLog({
    req,
    action: "appointment.cancel",
    resourceType: "Appointment",
    resourceId: appointment._id,
    before,
    after: appointment.toObject()
  });

  res.json({ success: true, message: "Appointment cancelled", data: appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);

  const before = appointment.toObject();
  appointment.status = req.body.status;
  await appointment.save();

  await writeAuditLog({
    req,
    action: "appointment.status",
    resourceType: "Appointment",
    resourceId: appointment._id,
    before,
    after: appointment.toObject()
  });

  res.json({ success: true, message: "Appointment status updated", data: appointment });
});

export const doctorAvailability = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id);
  if (!doctor) throw new AppError("Doctor profile not found", 404);

  const requestedDate = dateOnly(req.query.date);
  const bookings = await Appointment.find({
    doctorId: doctor._id,
    date: requestedDate,
    status: { $nin: ["cancelled", "no-show"] }
  }).select("startTime endTime status");

  const dayOfWeek = requestedDate.getUTCDay();
  const availability = doctor.availability.filter((slot) => slot.dayOfWeek === dayOfWeek);

  res.json({
    success: true,
    message: "Doctor availability loaded",
    data: { date: requestedDate, availability, bookings }
  });
});
