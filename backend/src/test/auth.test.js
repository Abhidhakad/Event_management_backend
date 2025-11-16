import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  // connect to test DB (can be your same DB, or local test DB)
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Routes", () => {
  test("POST /auth/signup should create a user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "testuser2@example.com",
        password: "Test@123",
        role: "organizer",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success", true);
  }, 20000); // 👈 increased timeout

  test("POST /auth/login should return token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "testuser@example.com",
        password: "Test@123",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken"); // ✅ fixed here
    expect(res.body.user.email).toBe("testuser@example.com");
  }, 20000);
});
