import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMins: { type: Number, default: 30 }
  },
  { _id: false }
);

const leaveSchema = new mongoose.Schema(
  { startDate: Date, endDate: Date, reason: String },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    specialization: String,
    qualifications: [String],
    consultationFee: { type: Number, default: 0 },
    availability: [availabilitySchema],
    leaves: [leaveSchema]
  },
  { timestamps: true }
);

export default mongoose.model("DoctorProfile", doctorProfileSchema);
