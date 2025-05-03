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

  
  
  
  test("GET /buyer/:id should return buyer data", async () => {
    Buyer.findById.mockResolvedValue({
      _id: "b1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    const res = await request(app).get("/buyer/b1");

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("John");
  });
});
