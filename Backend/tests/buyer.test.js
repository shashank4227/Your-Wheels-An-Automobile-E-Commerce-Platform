const request = require("supertest");
const app = require("../app"); // Adjust path to your actual app
const mongoose = require("mongoose");

// Mock the Mongoose models
jest.mock("../models/Buyer");
jest.mock("../models/SellVehicle");
jest.mock("../models/Payment");
jest.mock("../models/Vehicle");

const Buyer = require("../models/Buyer");
const SellVehicle = require("../models/SellVehicle");
const Payment = require("../models/Payment");
const Vehicle = require("../models/Vehicle");

describe("Buyer API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /buyer-signup should register a new buyer", async () => {
    Buyer.findOne.mockResolvedValue(null);
    Buyer.prototype.save = jest.fn().mockResolvedValue();
    Buyer.prototype.generateAuthToken = jest.fn(() => "mock-token");

    const res = await request(app).post("/buyer-signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      terms: true,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /buyer-login should authenticate buyer", async () => {
    const mockUser = {
      _id: "user123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      comparePassword: jest.fn().mockResolvedValue(true),
      generateAuthToken: jest.fn(() => "mock-token"),
    };

    Buyer.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app).post("/buyer-login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("mock-token");
  });

  test("GET /available-vehicles should return available vehicles", async () => {
    SellVehicle.find.mockResolvedValue([
      { id: "v1", name: "Car A", isSold: false },
    ]);

    const res = await request(app).get("/available-vehicles");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.vehicles.length).toBeGreaterThan(0);
  });

  test("POST /rent-vehicle should return error if vehicle is already rented", async () => {
    Vehicle.findById = jest.fn().mockResolvedValue({
      _id: "v1",
      isRented: true,
      save: jest.fn(),
    });

    const res = await request(app).post("/rent-vehicle").send({
      buyerId: "buyer123",
      vehicleId: "v1",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Vehicle is already rented");
  });

  test("POST /buyer-memberships/:id should remove membership", async () => {
    const mockSave = jest.fn().mockResolvedValue();
    const mockBuyer = {
      _id: "buyer123",
      isMember: true,
      membershipType: "premium",
      save: mockSave, // ✅ mock the save method directly on the object
    };

    Buyer.findById = jest.fn().mockResolvedValue(mockBuyer);

    const res = await request(app).post("/buyer-memberships/buyer123");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Membership removed successfully");
    expect(mockSave).toHaveBeenCalledTimes(1); // ✅ check that save was called
    expect(mockBuyer.isMember).toBe(false); // ✅ confirm membership was removed
    expect(mockBuyer.membershipType).toBe(null);
  });

  test("PUT /buyer/:vehicleId/rating should add rating to vehicle", async () => {
    const vehicleId = "507f1f77bcf86cd799439011";
    const userId = "507f1f77bcf86cd799439012";

    const mockVehicle = {
      _id: vehicleId,
      reviews: [],
      rating: 0,
      save: jest.fn().mockResolvedValue(),
    };

    const mockBuyer = {
      _id: userId,
      firstName: "John",
    };

    Vehicle.findById = jest.fn().mockResolvedValue(mockVehicle);
    Buyer.findById = jest.fn().mockResolvedValue(mockBuyer);

    const res = await request(app).put(`/buyer/${vehicleId}/rating`).send({
      userId,
      rating: 5,
      comment: "Great car!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Rating added successfully");
    expect(mockVehicle.reviews.length).toBe(1);
    expect(mockVehicle.reviews[0]).toMatchObject({
      buyer: userId,
      firstName: "John",
      rating: 5,
      comment: "Great car!",
    });
  });

  test("GET /buyer-stats/:id should return buyer stats with correct revenue calculation", async () => {
    const buyerId = "507f191e810c19729de860ea"; // Valid ObjectId string

    SellVehicle.countDocuments = jest.fn().mockResolvedValue(5);
    Vehicle.countDocuments = jest.fn().mockResolvedValue(2);
    Payment.aggregate = jest.fn().mockResolvedValue([{ total: 10000 }]);

    const res = await request(app).get(`/buyer-stats/${buyerId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalVehiclesBought).toBe(5);
    expect(res.body.totalRentedVehicles).toBe(2);
    expect(res.body.totalRevenue).toBe(10000);

    expect(Payment.aggregate).toHaveBeenCalled();
  });

  test("GET /buyer/:id should return 404 for non-existent buyer", async () => {
    Buyer.findById.mockResolvedValue(null);

    const res = await request(app).get("/buyer/non-existent-id");

    expect(res.statusCode).toBe(404);
    expect(res.body.msg).toBe("User not found"); // Update message here
  });
});
