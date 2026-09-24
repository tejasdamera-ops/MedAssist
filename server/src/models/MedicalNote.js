import mongoose from "mongoose";

const medicalNoteSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    chiefComplaint: String,
    historyOfPresentIllness: String,
    examinationFindings: String,
    vitals: {
      bp: String,
      pulse: Number,
      temp: Number,
      weight: Number,
      height: Number,
      spo2: Number
    },
    diagnosis: [String],
    treatmentPlan: String,
    aiSummary: {
      text: String,
      generatedAt: Date,
      reviewedByDoctor: { type: Boolean, default: false }
    },
    isFinalized: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("MedicalNote", medicalNoteSchema);
