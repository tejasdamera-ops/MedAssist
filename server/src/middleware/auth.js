import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import { AppError } from "../utils/AppError.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new AppError("Authentication required", 401);

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user || !user.isActive) throw new AppError("Invalid or inactive user", 401);

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid token", 401));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
}

export async function checkOwnership(req, _res, next) {
  if (!req.user) return next(new AppError("Authentication required", 401));
  if (req.user.role === "admin") return next();

  const requestedUserId = req.params.userId || req.body.userId;
  if (requestedUserId && requestedUserId === req.user._id.toString()) return next();

  if (req.user.role === "patient" && req.params.patientId) {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    if (profile && profile._id.toString() === req.params.patientId) return next();
  }

  if (req.user.role === "doctor" && req.params.doctorId) {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (profile && profile._id.toString() === req.params.doctorId) return next();
  }

  return next(new AppError("You do not own this resource", 403));
}
