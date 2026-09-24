import { Router } from "express";
import { param } from "express-validator";
import {
  collectSample,
  createLabOrder,
  enterResult,
  listLabOrders,
  releaseResult,
  verifyResult
} from "../controllers/lab.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { bodyRequired } from "../validators/common.validators.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("admin", "doctor", "labtech"), listLabOrders);
router.post("/", authorize("doctor"), bodyRequired, validate, createLabOrder);
router.patch("/:id/collect", authorize("labtech"), param("id").isMongoId(), validate, collectSample);
router.patch("/:id/result", authorize("labtech"), param("id").isMongoId(), bodyRequired, validate, enterResult);
router.patch("/:id/verify", authorize("labtech"), param("id").isMongoId(), validate, verifyResult);
router.patch("/:id/release", authorize("labtech"), param("id").isMongoId(), validate, releaseResult);
export default router;
