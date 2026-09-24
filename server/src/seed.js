import mongoose from "mongoose";
import { connectDb, disconnectDb } from "./config/db.js";
import User from "./models/User.js";
import Department from "./models/Department.js";
import DoctorProfile from "./models/DoctorProfile.js";
import PatientProfile from "./models/PatientProfile.js";
import Service from "./models/Service.js";
import Appointment from "./models/Appointment.js";
import LabOrder from "./models/LabOrder.js";
import Invoice from "./models/Invoice.js";
import MedicalNote from "./models/MedicalNote.js";
import Prescription from "./models/Prescription.js";

const password = "Password123!";

async function makeUser(name, email, role, phone) {
  return User.create({ name, email, role, phone, passwordHash: await User.hashPassword(password) });
}

async function seed() {
  await connectDb();
  await Promise.all(
    [User, Department, DoctorProfile, PatientProfile, Service, Appointment, LabOrder, Invoice, MedicalNote, Prescription].map((Model) =>
      Model.deleteMany({})
    )
  );

  const admin = await makeUser("Aarav Clinic Admin", "admin@medassist.test", "admin", "555-0100");
  const receptionist = await makeUser("Riya Receptionist", "reception@medassist.test", "receptionist", "555-0101");
  const labtech = await makeUser("Kabir Lab Tech", "lab@medassist.test", "labtech", "555-0102");
  const doctorUser = await makeUser("Dr. Nisha Rao", "doctor@medassist.test", "doctor", "555-0103");
  const patientUser = await makeUser("Meera Patient", "patient@medassist.test", "patient", "555-0104");

  const cardiology = await Department.create({ name: "Cardiology", description: "Heart and vascular care" });
  const general = await Department.create({ name: "General Medicine", description: "Primary care and follow-up visits" });

  const doctor = await DoctorProfile.create({
    userId: doctorUser._id,
    department: general._id,
    specialization: "Internal Medicine",
    qualifications: ["MBBS", "MD"],
    consultationFee: 750,
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "13:00", slotDurationMins: 30 },
      { dayOfWeek: 3, startTime: "09:00", endTime: "13:00", slotDurationMins: 30 },
      { dayOfWeek: 5, startTime: "14:00", endTime: "18:00", slotDurationMins: 30 }
    ]
  });

  await Department.findByIdAndUpdate(general._id, { headDoctorId: doctor._id });

  const patient = await PatientProfile.create({
    userId: patientUser._id,
    dob: new Date("1992-04-12"),
    gender: "female",
    bloodGroup: "B+",
    address: "42 MG Road, Bengaluru",
    emergencyContact: { name: "Anika", phone: "555-0199", relationship: "Sister" },
    allergies: ["Penicillin"],
    chronicConditions: ["Mild asthma"],
    insuranceInfo: { provider: "Demo Health", policyNumber: "DH-456789" }
  });

  const consult = await Service.create({ name: "General Consultation", department: general._id, price: 750, durationMins: 30 });
  await Service.create({ name: "ECG", department: cardiology._id, price: 1200, durationMins: 20 });

  const nextMonday = new Date();
  nextMonday.setUTCDate(nextMonday.getUTCDate() + ((8 - nextMonday.getUTCDay()) % 7 || 7));
  nextMonday.setUTCHours(0, 0, 0, 0);

  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    departmentId: general._id,
    serviceId: consult._id,
    date: nextMonday,
    startTime: "09:00",
    endTime: "09:30",
    status: "confirmed",
    queueNumber: 1,
    reasonForVisit: "Follow-up for cough and fatigue",
    createdBy: receptionist._id
  });

  const note = await MedicalNote.create({
    appointmentId: appointment._id,
    patientId: patient._id,
    doctorId: doctor._id,
    chiefComplaint: "Persistent cough",
    examinationFindings: "Clear chest, mild throat irritation",
    vitals: { bp: "118/76", pulse: 78, temp: 98.6, weight: 62, height: 165, spo2: 98 },
    diagnosis: ["Upper respiratory tract irritation"],
    treatmentPlan: "Hydration, rest, and prescribed antihistamine"
  });

  await Prescription.create({
    medicalNoteId: note._id,
    patientId: patient._id,
    doctorId: doctor._id,
    medications: [{ name: "Cetirizine", dosage: "10mg", frequency: "Once nightly", duration: "5 days", instructions: "Avoid driving if drowsy" }],
    followUpDate: new Date(nextMonday.getTime() + 7 * 24 * 60 * 60 * 1000)
  });

  await LabOrder.create({
    patientId: patient._id,
    doctorId: doctor._id,
    testName: "Complete Blood Count",
    testCode: "CBC",
    priority: "routine",
    status: "result-ready",
    sampleCollectedBy: labtech._id,
    sampleCollectedAt: new Date(),
    resultData: { hemoglobin: "13.2 g/dL", wbc: "6900/uL", platelets: "250k/uL" }
  });

  await Invoice.create({
    patientId: patient._id,
    appointmentId: appointment._id,
    items: [{ description: "General Consultation", amount: 750 }],
    subtotal: 750,
    tax: 37.5,
    discount: 0,
    total: 787.5,
    status: "partial",
    paymentHistory: [{ amount: 300, method: "card", receivedBy: receptionist._id }]
  });

  console.log("Seeded MedAssist demo data.");
  console.log(`Demo password for all users: ${password}`);
  await disconnectDb();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
