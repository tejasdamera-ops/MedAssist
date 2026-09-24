import LabOrder from "../models/LabOrder.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAuditLog } from "../middleware/audit.js";

export const createLabOrder = asyncHandler(async (req, res) => {
  const order = await LabOrder.create(req.body);
  await writeAuditLog({ req, action: "labOrder.create", resourceType: "LabOrder", resourceId: order._id, after: order.toObject() });
  res.status(201).json({ success: true, message: "Lab order created", data: order });
});

export const listLabOrders = asyncHandler(async (_req, res) => {
  const orders = await LabOrder.find().sort({ createdAt: -1 });
  res.json({ success: true, message: "Lab orders loaded", data: orders });
});

async function transition(req, res, status, patch = {}) {
  const order = await LabOrder.findById(req.params.id);
  if (!order) throw new AppError("Lab order not found", 404);
  const before = order.toObject();
  Object.assign(order, patch, { status });
  await order.save();
  await writeAuditLog({ req, action: `labOrder.${status}`, resourceType: "LabOrder", resourceId: order._id, before, after: order.toObject() });
  res.json({ success: true, message: `Lab order marked ${status}`, data: order });
}

export const collectSample = asyncHandler((req, res) =>
  transition(req, res, "sample-collected", { sampleCollectedBy: req.user._id, sampleCollectedAt: new Date() })
);
export const enterResult = asyncHandler((req, res) =>
  transition(req, res, "result-ready", { resultData: req.body.resultData, resultFileUrl: req.body.resultFileUrl })
);
export const verifyResult = asyncHandler((req, res) =>
  transition(req, res, "verified", { verifiedBy: req.user._id, verifiedAt: new Date() })
);
export const releaseResult = asyncHandler((req, res) =>
  transition(req, res, "released", { releasedAt: new Date() })
);
