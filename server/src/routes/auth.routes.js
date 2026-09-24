import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, refreshToken, register } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validators.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/logout", logout);

export default router;
