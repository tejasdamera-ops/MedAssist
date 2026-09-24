import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: String,
    headDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
