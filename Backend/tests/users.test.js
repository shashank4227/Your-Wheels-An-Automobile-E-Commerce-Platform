const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("../routes/UserRoutes"); // Adjust path
const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");

// Mock models
jest.mock("../models/Buyer");
jest.mock("../models/Seller");

const app = express();
app.use(express.json());
app.use("/", userRoutes);

const mockUserId = new mongoose.Types.ObjectId().toHexString();

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /get-users - should return all buyers and sellers", async () => {
    Buyer.find.mockResolvedValue([{ _id: mockUserId, firstName: "Buyer" }]);
    Seller.find.mockResolvedValue([{ _id: mockUserId, firstName: "Seller" }]);

    const res = await request(app).get("/get-users");

    expect(res.statusCode).toBe(200);
    expect(res.body.buyers).toHaveLength(1);
    expect(res.body.sellers).toHaveLength(1);
  });

  test("GET /get-user/:id - should return a single user", async () => {
    Buyer.findById.mockResolvedValue({ _id: mockUserId, firstName: "Buyer" });

    const res = await request(app).get(`/get-user/${mockUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("Buyer");
  });

  test("GET /get-user/:id - user not found in both collections", async () => {
    Buyer.findById.mockResolvedValue(null);
    Seller.findById.mockResolvedValue(null);

    const res = await request(app).get(`/get-user/${mockUserId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  test("PUT /update-user/:id - should update a buyer", async () => {
    const updatedUser = {
      _id: mockUserId,
      firstName: "Updated",
      lastName: "User",
      email: "user@example.com",
      role: "buyer",
    };
    Buyer.findByIdAndUpdate.mockResolvedValue(updatedUser);

    const res = await request(app)
      .put(`/update-user/${mockUserId}`)
      .send(updatedUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.firstName).toBe("Updated");
  });

  test("PUT /update-user/:id - user not found", async () => {
    Buyer.findByIdAndUpdate.mockResolvedValue(null);
    Seller.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put(`/update-user/${mockUserId}`)
      .send({ firstName: "A", lastName: "B", email: "a@b.com", role: "buyer" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  test("DELETE /delete-user/:id - should delete a user", async () => {
    Buyer.findByIdAndDelete.mockResolvedValue({ _id: mockUserId });

    const res = await request(app).delete(`/delete-user/${mockUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  test("DELETE /delete-user/:id - user not found", async () => {
    Buyer.findByIdAndDelete.mockResolvedValue(null);
    Seller.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete(`/delete-user/${mockUserId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  test("GET /users - should return buyers and sellers", async () => {
    Buyer.find.mockResolvedValue([{ firstName: "B" }]);
    Seller.find.mockResolvedValue([{ firstName: "S" }]);

    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(200);
    expect(res.body.buyers.length).toBe(1);
    expect(res.body.sellers.length).toBe(1);
  });
});
