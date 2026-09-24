import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const roles = ["admin", "doctor", "receptionist", "labtech", "patient"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, required: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

export default mongoose.model("User", userSchema);
