import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listAuditLogs = asyncHandler(async (_req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(500);
  res.json({ success: true, message: "Audit logs loaded", data: logs });
});
