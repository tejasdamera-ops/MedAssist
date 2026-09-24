import request from "supertest";
import app from "../src/app.js";

describe("auth", () => {
  it("registers and logs in with an access token and refresh cookie", async () => {
    const register = await request(app).post("/api/auth/register").send({
      name: "Patient One",
      email: "patient@example.com",
      password: "Password123!",
      role: "patient"
    });

    expect(register.status).toBe(201);
    expect(register.body.success).toBe(true);
    expect(register.body.data.accessToken).toBeTruthy();
    expect(register.headers["set-cookie"].join("")).toContain("refreshToken");

    const login = await request(app).post("/api/auth/login").send({
      email: "patient@example.com",
      password: "Password123!"
    });

    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe("patient");
  });
});
