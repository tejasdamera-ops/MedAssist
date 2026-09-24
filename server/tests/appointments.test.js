import request from "supertest";
import app from "../src/app.js";
import { appointmentFixture } from "./helpers.js";

describe("appointments", () => {
  it("rejects overlapping appointments for the same doctor", async () => {
    const fx = await appointmentFixture();
    const payload = {
      patientId: fx.patient._id,
      doctorId: fx.doctor._id,
      departmentId: fx.department._id,
      serviceId: fx.service._id,
      date: fx.monday.toISOString(),
      startTime: "09:00",
      endTime: "09:30",
      reasonForVisit: "First visit"
    };

    const first = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${fx.receptionist.token}`)
      .send(payload);
    expect(first.status).toBe(201);

    const conflict = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${fx.receptionist.token}`)
      .send({ ...payload, startTime: "09:15", endTime: "09:45" });
    expect(conflict.status).toBe(409);
  });

  it("protects appointment creation from unauthorized roles", async () => {
    const fx = await appointmentFixture();
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${fx.doctorUser.token}`)
      .send({
        patientId: fx.patient._id,
        doctorId: fx.doctor._id,
        departmentId: fx.department._id,
        serviceId: fx.service._id,
        date: fx.monday.toISOString(),
        startTime: "09:00",
        endTime: "09:30"
      });

    expect(response.status).toBe(403);
  });
});
