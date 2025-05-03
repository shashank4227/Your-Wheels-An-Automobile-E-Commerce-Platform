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

// Mock the models
jest.mock("../models/Seller");
jest.mock("../models/SellVehicle");
jest.mock("../models/Vehicle");

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-token"),
}));

describe("Seller API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "mock-secret"; // Ensure token generation is mockable
  });

  /* ==============================
     SELLER AUTHENTICATION ROUTES
   ============================== */
  test("POST /seller-signup should register a new seller", async () => {
    Seller.findOne.mockResolvedValue(null); // No seller exists
    Seller.prototype.save = jest.fn().mockResolvedValue();
    Seller.prototype.generateAuthToken = jest.fn(() => "mock-token");

    const res = await request(app).post("/seller-signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      terms: true, // Ensure terms is included in the request
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token", "mock-token");
    expect(res.body.success).toBe(true);
  });

  test('POST /seller-login should authenticate seller', async () => {
    const mockUser = {
      _id: 'seller123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      comparePassword: jest.fn().mockResolvedValue(true),
      generateAuthToken: jest.fn().mockReturnValue('mock-token'),
    };

    // Mock the database call
    Seller.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
    }));

    const res = await request(app)
      .post('/seller-login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBe("mock-token");

    expect(res.body.user).toMatchObject({
      sellerId: 'seller123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
  });

  /* ==============================
     VEHICLE MANAGEMENT ROUTES
   ============================== */
   

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

  test('DELETE /vehicles/:id should delete rental vehicle', async () => {
    // Mock vehicle object with deleteOne method
    const mockVehicle = {
      deleteOne: jest.fn().mockResolvedValue()
    };
  
    // Mock Vehicle.findById to return the mockVehicle
    Vehicle.findById = jest.fn().mockResolvedValue(mockVehicle);
  
    const res = await request(app)
      .delete('/vehicles/v1')
      .set('Authorization', 'Bearer mock-token');
  
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Vehicle deleted successfully');
    expect(Vehicle.findById).toHaveBeenCalledWith('v1');
    expect(mockVehicle.deleteOne).toHaveBeenCalled();
  });

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

    // Mock the save method of SellVehicle
    SellVehicle.prototype.save = jest.fn().mockResolvedValue({
      ...mockRequest.body,
      sellerId: "seller123", // Added to match the final response
    });

    const response = await request(app)
      .post("/sellVehicles/add")
      .set("Authorization", "Bearer mock-token") // Header still passed, optional now
      .send(mockRequest.body)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Vehicle listed successfully");
    expect(response.body.vehicle).toEqual({
      ...mockRequest.body,
      sellerId: "seller123",
    });
  });

  test("DELETE /sell/seller/:vehicleId should delete sale vehicle", async () => {
    // Mock the findById method to return a vehicle object
    SellVehicle.findById = jest.fn().mockResolvedValue({
      _id: "v1", // Vehicle ID
      brand: "Toyota",
      model: "Corolla",
    });

    // Mock the delete operation
    Vehicle.findByIdAndDelete = jest.fn().mockResolvedValue();

    const res = await request(app)
      .delete("/sell/seller/v1") // Using mock ID v1
      .set("Authorization", "Bearer mock-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vehicle deleted successfully");
  });
});
