jest.mock("../middleware/authMiddleware", () => {
  return (req, res, next) => {
    req.user = { userId: "seller123" }; // Inject mock user
    next();
  };
});

const request = require("supertest");
const app = require("../app"); // Adjust path to your actual app
const Seller = require("../models/Seller");
const SellVehicle = require("../models/SellVehicle");
const Vehicle = require("../models/Vehicle");
const Payment = require("../models/Payment");

// Mock the models
jest.mock("../models/Seller");
jest.mock("../models/SellVehicle");
jest.mock("../models/Vehicle");
jest.mock("../models/Payment");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-token"),
}));

// Mock mongoose.Types.ObjectId
jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    Types: {
      ObjectId: jest.fn((id) => id), // mock ObjectId to return the same ID string
    },
  };
});

describe("Seller API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "mock-secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // Seller Auth
  test("POST /seller-signup should register a new seller", async () => {
    Seller.findOne.mockResolvedValue(null);
    Seller.prototype.save = jest.fn().mockResolvedValue();
    Seller.prototype.generateAuthToken = jest.fn(() => "mock-token");

    const res = await request(app).post("/seller-signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      terms: true,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token", "mock-token");
    expect(res.body.success).toBe(true);
  });

  test("POST /seller-login should authenticate seller", async () => {
    const mockUser = {
      _id: "seller123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      comparePassword: jest.fn().mockResolvedValue(true),
      generateAuthToken: jest.fn().mockReturnValue("mock-token"),
    };

    Seller.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
    }));

    const res = await request(app).post("/seller-login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe("mock-token");
    expect(res.body.user).toMatchObject({
      sellerId: "seller123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
  });

  // Seller Info
  test("GET /seller/:id should return seller data", async () => {
    Seller.findById = jest.fn().mockResolvedValue({
      _id: "seller123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    const res = await request(app).get("/seller/seller123");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      _id: "seller123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
  });

  // Vehicle Rental
  test("GET /vehicles/seller/:id should return seller's vehicles", async () => {
    Vehicle.find.mockResolvedValue([
      { id: "v1", brand: "Honda", model: "Civic" },
    ]);

    const res = await request(app)
      .get("/vehicles/seller/seller123")
      .set("Authorization", "Bearer mock-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.vehicles.length).toBeGreaterThan(0);
  });

  test("DELETE /vehicles/:id should delete rental vehicle", async () => {
    const mockVehicle = { deleteOne: jest.fn().mockResolvedValue() };
    Vehicle.findById = jest.fn().mockResolvedValue(mockVehicle);

    const res = await request(app)
      .delete("/vehicles/v1")
      .set("Authorization", "Bearer mock-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vehicle deleted successfully");
    expect(mockVehicle.deleteOne).toHaveBeenCalled();
  });

  test("DELETE /rent-vehicles/:vehicleId should delete a rent vehicle", async () => {
    const mockVehicle = { _id: "v2", deleteOne: jest.fn().mockResolvedValue() };
    Vehicle.findById = jest.fn().mockResolvedValue(mockVehicle);

    const res = await request(app)
      .delete("/rent-vehicles/v2")
      .set("Authorization", "Bearer mock-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vehicle deleted successfully");
  });

  // Sell Vehicle
  test("POST /sellVehicles/add should add a new sell vehicle", async () => {
    const mockRequest = {
      body: {
        type: "car",
        brand: "Toyota",
        name: "Corolla",
        price: 15000,
        year: 2021,
        mileage: 5000,
        transmission: "automatic",
        fuelType: "petrol",
        color: "red",
        imageUrl: "image_url",
      },
    };

    SellVehicle.prototype.save = jest.fn().mockResolvedValue({
      ...mockRequest.body,
      sellerId: "seller123",
    });

    const res = await request(app)
      .post("/sellVehicles/add")
      .set("Authorization", "Bearer mock-token")
      .send(mockRequest.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Vehicle listed successfully");
    expect(res.body.vehicle).toEqual({
      ...mockRequest.body,
      sellerId: "seller123",
    });
  });

  test("DELETE /sell/seller/:vehicleId should delete sale vehicle", async () => {
    SellVehicle.findById = jest.fn().mockResolvedValue({
      _id: "v1",
      brand: "Toyota",
      model: "Corolla",
    });

    Vehicle.findByIdAndDelete = jest.fn().mockResolvedValue();

    const res = await request(app)
      .delete("/sell/seller/v1")
      .set("Authorization", "Bearer mock-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vehicle deleted successfully");
  });

  test("GET /seller-stats/:id should return seller stats", async () => {
    // Mock counts for SellVehicle and Vehicle
    SellVehicle.countDocuments = jest
      .fn()
      .mockResolvedValueOnce(5) // totalVehiclesSold
      .mockResolvedValueOnce(2); // totalVehiclesOnSale

    Vehicle.countDocuments = jest
      .fn()
      .mockResolvedValueOnce(3) // totalRentals
      .mockResolvedValueOnce(1); // totalVehicleOnRent

    // Mock Payment.aggregate
    Payment.aggregate = jest.fn().mockResolvedValue([{ total: 5000 }]);

    const res = await request(app).get("/seller-stats/seller123");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalVehiclesSold).toBe(5);
    expect(res.body.totalVehiclesOnSale).toBe(2);
    expect(res.body.totalRentals).toBe(3);
    expect(res.body.totalVehicleOnRent).toBe(1);
    expect(res.body.totalRevenue).toBe(5000);

    // Validate function call counts
    expect(SellVehicle.countDocuments).toHaveBeenCalledTimes(2);
    expect(Vehicle.countDocuments).toHaveBeenCalledTimes(2);
    expect(Payment.aggregate).toHaveBeenCalledTimes(1);

    // Validate structure of Payment.aggregate call
    const aggregateArg = Payment.aggregate.mock.calls[0][0];
    expect(aggregateArg).toEqual([
      {
        $match: {
          sellerId: expect.anything(), // Accept ObjectId
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [{ $eq: ["$type", "subscription"] }, 0, "$amount"],
            },
          },
        },
      },
    ]);
  });

  test("GET /seller-stats/:id should handle server error", async () => {
    SellVehicle.countDocuments.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/seller-stats/seller123");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to fetch stats");
  });

  // Seller Membership
  test("POST /seller-memberships/:id should remove membership", async () => {
    const mockSeller = {
      isMember: true,
      membershipType: "premium",
      save: jest.fn().mockResolvedValue(),
    };

    Seller.findById = jest.fn().mockResolvedValue(mockSeller);

    const res = await request(app).post("/seller-memberships/seller123");

    expect(res.statusCode).toBe(200);
    expect(mockSeller.isMember).toBe(false);
    expect(mockSeller.membershipType).toBeNull();
    expect(mockSeller.save).toHaveBeenCalled();
    expect(res.body.success).toBe(true);
  });
});
