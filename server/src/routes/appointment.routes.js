import { Router } from "express";
import {
  cancelAppointment,
  createAppointment,
  doctorAvailability,
  getAppointment,
  listAppointments,
  rescheduleAppointment,
  updateAppointmentStatus
} from "../controllers/appointment.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  appointmentIdValidator,
  createAppointmentValidator,
  doctorAvailabilityValidator,
  rescheduleAppointmentValidator,
  statusAppointmentValidator
} from "../validators/appointment.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "doctor", "receptionist", "patient"), listAppointments);
router.post("/", authorize("admin", "receptionist", "patient"), createAppointmentValidator, validate, createAppointment);
router.get("/doctor/:id/availability", doctorAvailabilityValidator, validate, doctorAvailability);
router.get("/:id", appointmentIdValidator, validate, getAppointment);
router.patch("/:id/reschedule", authorize("admin", "receptionist"), rescheduleAppointmentValidator, validate, rescheduleAppointment);
router.patch("/:id/cancel", authorize("admin", "receptionist", "patient"), appointmentIdValidator, validate, cancelAppointment);
router.patch("/:id/status", authorize("admin", "doctor", "receptionist"), statusAppointmentValidator, validate, updateAppointmentStatus);

export default router;
