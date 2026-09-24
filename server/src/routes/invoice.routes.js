import { Router } from "express";
import { param } from "express-validator";
import { addPayment, createInvoice, getInvoicesByPatient, listInvoices } from "../controllers/invoice.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { bodyRequired, patientIdParam } from "../validators/common.validators.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("admin", "receptionist", "patient"), listInvoices);
router.post("/", authorize("admin", "receptionist"), bodyRequired, validate, createInvoice);
router.patch("/:id/payment", authorize("admin", "receptionist"), param("id").isMongoId(), bodyRequired, validate, addPayment);
router.get("/patient/:patientId", authorize("admin", "receptionist", "patient"), patientIdParam, validate, getInvoicesByPatient);
export default router;
