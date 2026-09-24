import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    timestamp: { type: Date, default: Date.now, immutable: true }
  },
  { versionKey: false }
);

function blockMutation(next) {
  next(new Error("AuditLog is append-only"));
}

auditLogSchema.pre("save", function preventEditing(next) {
  if (!this.isNew) return next(new Error("AuditLog is append-only"));
  next();
});
auditLogSchema.pre("updateOne", blockMutation);
auditLogSchema.pre("updateMany", blockMutation);
auditLogSchema.pre("findOneAndUpdate", blockMutation);
auditLogSchema.pre("deleteOne", blockMutation);
auditLogSchema.pre("deleteMany", blockMutation);
auditLogSchema.pre("findOneAndDelete", blockMutation);

export default mongoose.model("AuditLog", auditLogSchema);
