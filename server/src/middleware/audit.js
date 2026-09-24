import AuditLog from "../models/AuditLog.js";

export async function writeAuditLog({ req, action, resourceType, resourceId, before = null, after = null }) {
  if (!req.user) return;

  await AuditLog.create({
    userId: req.user._id,
    role: req.user.role,
    action,
    resourceType,
    resourceId,
    changes: { before, after },
    ipAddress: req.ip
  });
}
