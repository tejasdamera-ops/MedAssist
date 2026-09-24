import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setRefreshCookie, signAccessToken, signRefreshToken } from "../utils/tokens.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email is already registered", 409);

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, phone });

  if (role === "patient") await PatientProfile.create({ userId: user._id });
  if (role === "doctor") await DoctorProfile.create({ userId: user._id, availability: [] });

  const accessToken = signAccessToken(user);
  setRefreshCookie(res, signRefreshToken(user));
  res.status(201).json({ success: true, message: "Registered", data: { user: publicUser(user), accessToken } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) throw new AppError("Invalid credentials", 401);
  if (!user.isActive) throw new AppError("Account is inactive", 403);

  user.lastLogin = new Date();
  await user.save();

  const accessToken = signAccessToken(user);
  setRefreshCookie(res, signRefreshToken(user));
  res.json({ success: true, message: "Logged in", data: { user: publicUser(user), accessToken } });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError("Refresh token missing", 401);

  const decoded = jwt.verify(token, env.jwtRefreshSecret);
  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw new AppError("Invalid refresh token", 401);

  const accessToken = signAccessToken(user);
  res.json({ success: true, message: "Token refreshed", data: { accessToken, user: publicUser(user) } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});
