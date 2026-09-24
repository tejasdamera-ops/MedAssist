import { Router } from "express";
import { param } from "express-validator";
import {
  createAiPrescriptionExplanation,
  createPrescription,
  getPrescriptionsByPatient
} from "../controllers/medical.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { bodyRequired, patientIdParam } from "../validators/common.validators.js";

const router = Router();
router.use(authenticate);
router.post("/", authorize("doctor"), bodyRequired, validate, createPrescription);
router.get("/patient/:patientId", authorize("admin", "doctor", "patient"), patientIdParam, validate, getPrescriptionsByPatient);
router.post("/:id/ai-explain", authorize("doctor", "patient"), param("id").isMongoId(), validate, createAiPrescriptionExplanation);
export default router;
