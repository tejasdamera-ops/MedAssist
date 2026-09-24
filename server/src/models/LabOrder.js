import mongoose from "mongoose";

const labOrderSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    testName: { type: String, required: true },
    testCode: String,
    priority: { type: String, enum: ["routine", "urgent", "stat"], default: "routine" },
    status: {
      type: String,
      enum: ["ordered", "sample-collected", "processing", "result-ready", "verified", "released"],
      default: "ordered"
    },
    sampleCollectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sampleCollectedAt: Date,
    resultData: mongoose.Schema.Types.Mixed,
    resultFileUrl: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
    releasedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("LabOrder", labOrderSchema);
