import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import dotenv from "dotenv";
import { jest } from "@jest/globals";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

jest.setTimeout(60000);

let organizerToken = "";
let adminToken = "";
let userToken = "";
let eventId = "";

describe("Integration Test: Full Booking Flow", () => {
  test("1️ Organizer logs in and creates an event (pending)", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "organizer123@gmail.com",
        password: "Organizer@123",
      });

    organizerToken = loginRes.body.accessToken;
    expect(loginRes.statusCode).toBe(200);

    const eventRes = await request(app)
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        title: "Winter Music Fest",
        description: "A big New Year concert event",
        location: "bhopal",
        date: "2025-12-31",
        seats: 200,
      });

    expect(eventRes.statusCode).toBe(201);
    expect(eventRes.body.event.status).toBe("pending");
    eventId = eventRes.body.event._id;
  });

  test("2️ Admin logs in and approves the event", async () => {
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin123@gmail.com",
        password: "Admin@123",
      });

    adminToken = adminRes.body.accessToken;
    expect(adminRes.statusCode).toBe(200);

    const approveRes = await request(app)
  .patch(`/api/v1/admin/events/${eventId}/status`)
  .set("Authorization", `Bearer ${adminToken}`)
  .send({ status: "approved" });

    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.data.status).toBe("approved");

  });

  test("3️ User logs in and books the approved event", async () => {
    const userRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "testuser@example.com",
        password: "Test@123",
      });

    userToken = userRes.body.accessToken;
    expect(userRes.statusCode).toBe(200);

    const bookingRes = await request(app)
      .post("/api/v1/bookings/")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        eventId: eventId, // ✅ changed from eventId to event
        seats: 2,
      });
     


    expect(bookingRes.statusCode).toBe(201);
    expect(bookingRes.body).toHaveProperty("data");

  });

  test("4️ Verify user’s booking appears in their booking list", async () => {
    const res = await request(app)
      .get("/api/v1/bookings/my")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data?.length).toBeGreaterThan(0);
  });
});
