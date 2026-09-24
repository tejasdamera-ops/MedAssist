import MedicalNote from "../models/MedicalNote.js";
import Prescription from "../models/Prescription.js";
import PatientProfile from "../models/PatientProfile.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { writeAuditLog } from "../middleware/audit.js";
import { generateClinicalSummary, generatePlainExplanation } from "../services/ai.service.js";

async function patientSelfFilter(req, patientId) {
  if (req.user.role !== "patient") return true;
  const profile = await PatientProfile.findOne({ userId: req.user._id });
  return profile?._id.toString() === patientId;
}

export const createMedicalNote = asyncHandler(async (req, res) => {
  const note = await MedicalNote.create(req.body);
  await writeAuditLog({ req, action: "medicalNote.create", resourceType: "MedicalNote", resourceId: note._id, after: note.toObject() });
  res.status(201).json({ success: true, message: "Medical note created", data: note });
});

export const getMedicalNotesByPatient = asyncHandler(async (req, res) => {
  if (!(await patientSelfFilter(req, req.params.patientId))) throw new AppError("Forbidden", 403);
  const notes = await MedicalNote.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
  res.json({ success: true, message: "Medical notes loaded", data: notes });
});

export const createAiSummary = asyncHandler(async (req, res) => {
  const note = await MedicalNote.findById(req.params.id);
  if (!note) throw new AppError("Medical note not found", 404);
  const before = note.toObject();
  note.aiSummary = {
    text: await generateClinicalSummary(note),
    generatedAt: new Date(),
    reviewedByDoctor: false
  };
  await note.save();
  await writeAuditLog({ req, action: "ai.medicalSummary", resourceType: "MedicalNote", resourceId: note._id, before, after: note.toObject() });
  res.json({ success: true, message: "AI summary generated for doctor review", data: note.aiSummary });
});

export const approveAiSummary = asyncHandler(async (req, res) => {
  const note = await MedicalNote.findById(req.params.id);
  if (!note) throw new AppError("Medical note not found", 404);
  const before = note.toObject();
  note.aiSummary.reviewedByDoctor = true;
  await note.save();
  await writeAuditLog({
    req,
    action: "medicalNote.approveAiSummary",
    resourceType: "MedicalNote",
    resourceId: note._id,
    before,
    after: note.toObject()
  });
  res.json({ success: true, message: "AI summary approved", data: note.aiSummary });
});

export const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.create(req.body);
  await writeAuditLog({ req, action: "prescription.create", resourceType: "Prescription", resourceId: prescription._id, after: prescription.toObject() });
  res.status(201).json({ success: true, message: "Prescription created", data: prescription });
});

export const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  if (!(await patientSelfFilter(req, req.params.patientId))) throw new AppError("Forbidden", 403);
  const prescriptions = await Prescription.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
  res.json({ success: true, message: "Prescriptions loaded", data: prescriptions });
});

export const createAiPrescriptionExplanation = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) throw new AppError("Prescription not found", 404);
  const before = prescription.toObject();
  prescription.aiPlainExplanation = {
    text: await generatePlainExplanation(prescription),
    generatedAt: new Date()
  };
  await prescription.save();
  await writeAuditLog({
    req,
    action: "ai.prescriptionExplain",
    resourceType: "Prescription",
    resourceId: prescription._id,
    before,
    after: prescription.toObject()
  });
  res.json({ success: true, message: "Plain language explanation generated", data: prescription.aiPlainExplanation });
});
