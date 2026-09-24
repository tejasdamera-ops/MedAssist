import User from "../src/models/User.js";
import Department from "../src/models/Department.js";
import DoctorProfile from "../src/models/DoctorProfile.js";
import PatientProfile from "../src/models/PatientProfile.js";
import Service from "../src/models/Service.js";
import { signAccessToken } from "../src/utils/tokens.js";

export async function createUser(role, email = `${role}@test.local`) {
  const user = await User.create({
    name: `${role} user`,
    email,
    role,
    passwordHash: await User.hashPassword("Password123!")
  });
  return { user, token: signAccessToken(user) };
}

export async function appointmentFixture() {
  const admin = await createUser("admin", "admin@test.local");
  const receptionist = await createUser("receptionist", "reception@test.local");
  const doctorUser = await createUser("doctor", "doctor@test.local");
  const patientUser = await createUser("patient", "patient@test.local");
  const department = await Department.create({ name: "General" });
  const doctor = await DoctorProfile.create({
    userId: doctorUser.user._id,
    department: department._id,
    availability: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00", slotDurationMins: 30 }]
  });
  const patient = await PatientProfile.create({ userId: patientUser.user._id });
  const service = await Service.create({ name: "Consultation", department: department._id, price: 100, durationMins: 30 });
  const monday = new Date("2030-01-07T00:00:00.000Z");

  return { admin, receptionist, doctorUser, patientUser, department, doctor, patient, service, monday };
}
