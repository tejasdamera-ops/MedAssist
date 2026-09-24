import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { writeAuditLog } from "../middleware/audit.js";

const selectPublic = "-passwordHash";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select(selectPublic).sort({ createdAt: -1 });
  res.json({ success: true, message: "Users loaded", data: users });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email is already registered", 400);

  const passwordHash = await User.hashPassword(password || "Password123!");
  const user = await User.create({ name, email, passwordHash, role: role || "patient", phone: phone || "" });

  if (user.role === "patient") await PatientProfile.create({ userId: user._id });
  if (user.role === "doctor") await DoctorProfile.create({ userId: user._id, availability: [] });

  const result = user.toObject();
  delete result.passwordHash;
  await writeAuditLog({ req, action: "user.create", resourceType: "User", resourceId: user._id, after: result });
  res.status(201).json({ success: true, message: "User created", data: result });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  const before = user.toObject();

  for (const key of ["name", "phone", "role", "isActive"]) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  await user.save();

  const after = user.toObject();
  delete after.passwordHash;
  delete before.passwordHash;
  await writeAuditLog({ req, action: "user.update", resourceType: "User", resourceId: user._id, before, after });
  res.json({ success: true, message: "User updated", data: after });
});
