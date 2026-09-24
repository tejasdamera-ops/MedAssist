import Invoice from "../models/Invoice.js";
import PatientProfile from "../models/PatientProfile.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAuditLog } from "../middleware/audit.js";

function totals(items, tax = 0, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const total = Math.max(subtotal + Number(tax || 0) - Number(discount || 0), 0);
  return { subtotal, tax, discount, total };
}

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.create({ ...req.body, ...totals(req.body.items || [], req.body.tax, req.body.discount) });
  await writeAuditLog({ req, action: "invoice.create", resourceType: "Invoice", resourceId: invoice._id, after: invoice.toObject() });
  res.status(201).json({ success: true, message: "Invoice created", data: invoice });
});

export const addPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new AppError("Invoice not found", 404);
  const before = invoice.toObject();
  invoice.paymentHistory.push({ ...req.body, receivedBy: req.user._id });
  const paid = invoice.paymentHistory.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  invoice.status = paid >= invoice.total ? "paid" : paid > 0 ? "partial" : "unpaid";
  await invoice.save();
  await writeAuditLog({ req, action: "invoice.payment", resourceType: "Invoice", resourceId: invoice._id, before, after: invoice.toObject() });
  res.json({ success: true, message: "Payment recorded", data: invoice });
});

export const listInvoices = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === "patient") {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) return res.json({ success: true, message: "Invoices loaded", data: [] });
    query.patientId = profile._id;
  } else if (req.query.patientId) {
    query.patientId = req.query.patientId;
  }
  const invoices = await Invoice.find(query)
    .populate({ path: "patientId", populate: { path: "userId", select: "name email phone" } })
    .sort({ createdAt: -1 });
  res.json({ success: true, message: "Invoices loaded", data: invoices });
});

export const getInvoicesByPatient = asyncHandler(async (req, res) => {
  if (req.user.role === "patient") {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    if (profile?._id.toString() !== req.params.patientId) throw new AppError("Forbidden", 403);
  }
  const invoices = await Invoice.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
  res.json({ success: true, message: "Invoices loaded", data: invoices });
});
