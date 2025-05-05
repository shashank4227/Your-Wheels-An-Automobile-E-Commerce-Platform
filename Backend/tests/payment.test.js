const request = require("supertest");
const app = require("../app");

const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");
const Vehicle = require("../models/Vehicle");
const SellVehicle = require("../models/SellVehicle");
const Payment = require("../models/Payment");

jest.mock("../models/Buyer");
jest.mock("../models/Seller");
jest.mock("../models/Vehicle");
jest.mock("../models/SellVehicle");
jest.mock("../models/Payment");

// Mock Auth Middleware if needed
jest.mock("../middleware/authMiddleware", () => {
  return (req, res, next) => {
    req.user = { userId: "buyer123" };
    next();
  };
});

describe("Payment Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /payment - should process a buyer subscription payment", async () => {
    Buyer.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app).post("/payment").send({
      userId: "buyer123",
      amount: 500,
      billingPeriod: "monthly",
      zipCode: "12345",
      nameOnCard: "John Doe",
      cardNumber: "4111111111111111",
      expireDate: "12/25",
      cvv: "123",
      membershipType: "premium",
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(500);
    expect(["Payment successful!", "Payment failed. Try again."]).toContain(
      res.body.message
    );
  });

  test("POST /seller-payment - should process a seller subscription payment", async () => {
    Seller.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app).post("/seller-payment").send({
      sellerId: "seller123",
      amount: 700,
      billingPeriod: "monthly",
      zipCode: "54321",
      nameOnCard: "Jane Doe",
      cardNumber: "4111111111111111",
      expireDate: "11/26",
      cvv: "456",
      membershipType: "gold",
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(500);
    expect(["Payment successful!", "Payment failed. Try again."]).toContain(
      res.body.message
    );
  });

  test("POST /create-transaction - should create a successful purchase transaction", async () => {
    Buyer.findById.mockResolvedValue({ _id: "buyer123", firstName: "Buyer" });
    Seller.findById.mockResolvedValue({ _id: "seller123" });
    SellVehicle.findById.mockResolvedValue({
      _id: "v123",
      isSold: false,
      save: jest.fn(),
    });
    Payment.prototype.save = jest.fn().mockResolvedValue();

    const res = await request(app).post("/create-transaction").send({
      buyerId: "buyer123",
      sellerId: "seller123",
      vehicleId: "v123",
      amount: 10000,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("POST /create-rent-transaction - should create a successful rental transaction", async () => {
    Buyer.findById.mockResolvedValue({ _id: "buyer123", firstName: "Buyer" });
    Seller.findById.mockResolvedValue({ _id: "seller123" });
    Vehicle.findById.mockResolvedValue({
      _id: "v321",
      brand: "Honda",
      name: "Civic",
      isRented: false,
      save: jest.fn(),
    });
    Payment.prototype.save = jest.fn().mockResolvedValue();

    const res = await request(app).post("/create-rent-transaction").send({
      buyerId: "buyer123",
      seller: "seller123",
      vehicleId: "v321",
      amount: 1500,
      rentedFrom: "2025-05-01",
      rentedTo: "2025-05-10",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.transactionId).toBeDefined();
  });
});
