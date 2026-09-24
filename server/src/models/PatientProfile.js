import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dob: Date,
    gender: { type: String, enum: ["female", "male", "nonbinary", "other", "prefer-not-to-say"] },
    bloodGroup: String,
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    allergies: [String],
    chronicConditions: [String],
    insuranceInfo: mongoose.Schema.Types.Mixed,
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("PatientProfile", patientProfileSchema);
