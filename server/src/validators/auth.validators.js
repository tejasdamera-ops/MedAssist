import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").isIn(["admin", "doctor", "receptionist", "labtech", "patient"]),
  body("phone").optional().trim()
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
];
