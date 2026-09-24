import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import labRoutes from "./routes/lab.routes.js";
import medicalRoutes from "./routes/medical.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import {
  departmentRoutes,
  doctorRoutes,
  notificationRoutes,
  patientRoutes,
  serviceRoutes
} from "./routes/resource.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = env.frontendOrigin ? env.frontendOrigin.split(",").map((o) => o.trim().replace(/\/$/, "")) : [];
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowed.length === 0 || allowed.includes(cleanOrigin) || allowed.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ success: true, message: "MedAssist API healthy" }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-notes", medicalRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/lab-orders", labRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
