import multer from "multer";
import { AppError } from "../utils/AppError.js";

const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    cb(null, safeName);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError("Only PNG, JPG, and PDF uploads are allowed", 400));
    }
    cb(null, true);
  }
});
