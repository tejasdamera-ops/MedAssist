import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(authenticate);
router.post("/", authorize("admin", "doctor", "receptionist", "labtech", "patient"), upload.single("file"), (req, res) => {
  res.status(201).json({
    success: true,
    message: "File uploaded",
    data: { filename: req.file.filename, path: `/uploads/${req.file.filename}` }
  });
});
export default router;
