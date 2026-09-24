import { Router } from "express";
import Department from "../models/Department.js";
import Service from "../models/Service.js";
import DoctorProfile from "../models/DoctorProfile.js";
import PatientProfile from "../models/PatientProfile.js";
import Notification from "../models/Notification.js";
import { crudController } from "../controllers/generic.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { bodyRequired, idParam } from "../validators/common.validators.js";

function makeCrudRouter(Model, resourceType, roles) {
  const router = Router();
  const controller = crudController(Model, resourceType);
  router.use(authenticate);
  router.get("/", authorize(...roles.read), controller.list);
  router.get("/:id", authorize(...roles.read), idParam, validate, controller.get);
  router.post("/", authorize(...roles.write), bodyRequired, validate, controller.create);
  router.patch("/:id", authorize(...roles.write), idParam, bodyRequired, validate, controller.update);
  return router;
}

export const departmentRoutes = makeCrudRouter(Department, "Department", {
  read: ["admin", "doctor", "receptionist", "patient"],
  write: ["admin"]
});

export const serviceRoutes = makeCrudRouter(Service, "Service", {
  read: ["admin", "doctor", "receptionist", "patient"],
  write: ["admin"]
});

export const doctorRoutes = makeCrudRouter(DoctorProfile, "DoctorProfile", {
  read: ["admin", "doctor", "receptionist", "patient"],
  write: ["admin"]
});

export const patientRoutes = makeCrudRouter(PatientProfile, "PatientProfile", {
  read: ["admin", "doctor", "receptionist"],
  write: ["admin", "receptionist"]
});

export const notificationRoutes = makeCrudRouter(Notification, "Notification", {
  read: ["admin", "doctor", "receptionist", "labtech", "patient"],
  write: ["admin", "doctor", "receptionist", "labtech"]
});
