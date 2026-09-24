import { Router } from "express";
import { listAuditLogs } from "../controllers/audit.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, authorize("admin"));
router.get("/", listAuditLogs);
export default router;
