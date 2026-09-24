import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    price: { type: Number, required: true, min: 0 },
    durationMins: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
