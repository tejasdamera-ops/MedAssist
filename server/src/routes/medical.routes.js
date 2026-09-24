import { Router } from "express";
import { body, param } from "express-validator";
import {
  approveAiSummary,
  createAiSummary,
  createMedicalNote,
  getMedicalNotesByPatient
} from "../controllers/medical.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { bodyRequired, patientIdParam } from "../validators/common.validators.js";

const router = Router();
router.use(authenticate);
router.post("/", authorize("doctor"), bodyRequired, validate, createMedicalNote);
router.get("/patient/:patientId", authorize("admin", "doctor", "patient"), patientIdParam, validate, getMedicalNotesByPatient);
router.post("/:id/ai-summary", authorize("doctor"), param("id").isMongoId(), validate, createAiSummary);
router.patch("/:id/approve-ai-summary", authorize("doctor"), param("id").isMongoId(), body("reviewedByDoctor").isBoolean(), validate, approveAiSummary);
export default router;
