import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, bodyRequired } from "../validators/common.validators.js";
import { listUsers, updateUser, createUser } from "../controllers/user.controller.js";

const router = Router();
router.use(authenticate, authorize("admin"));
router.get("/", listUsers);
router.post("/", bodyRequired, validate, createUser);
router.patch("/:id", idParam, bodyRequired, validate, updateUser);
export default router;
