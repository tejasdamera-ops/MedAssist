import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    medicalNoteId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalNote", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
      }
    ],
    followUpDate: Date,
    aiPlainExplanation: {
      text: String,
      generatedAt: Date
    },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
