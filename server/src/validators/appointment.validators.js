import { body, param, query } from "express-validator";
import { appointmentStatuses } from "../models/Appointment.js";

export const createAppointmentValidator = [
  body("patientId").isMongoId(),
  body("doctorId").isMongoId(),
  body("departmentId").isMongoId(),
  body("serviceId").isMongoId(),
  body("date").isISO8601(),
  body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body("endTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body("reasonForVisit").optional().trim().isLength({ max: 1000 })
];

export const appointmentIdValidator = [param("id").isMongoId()];

export const rescheduleAppointmentValidator = [
  param("id").isMongoId(),
  body("date").isISO8601(),
  body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body("endTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/)
];

export const statusAppointmentValidator = [
  param("id").isMongoId(),
  body("status").isIn(appointmentStatuses)
];

export const doctorAvailabilityValidator = [
  param("id").isMongoId(),
  query("date").isISO8601()
];
