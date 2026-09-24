import mongoose from "mongoose";

export const appointmentStatuses = [
  "requested",
  "confirmed",
  "checked-in",
  "in-progress",
  "completed",
  "cancelled",
  "no-show"
];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: appointmentStatuses, default: "requested" },
    queueNumber: Number,
    reasonForVisit: String,
    cancelReason: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);
