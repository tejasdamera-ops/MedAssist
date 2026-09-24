import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    items: [{ description: String, amount: Number }],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["unpaid", "partial", "paid", "void"], default: "unpaid" },
    paymentHistory: [
      {
        amount: Number,
        method: String,
        date: { type: Date, default: Date.now },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
