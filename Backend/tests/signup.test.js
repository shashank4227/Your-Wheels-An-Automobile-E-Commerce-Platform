const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/SignUpRoutes"); // Adjust path if needed
const signupController = require("../controllers/Signup");
const googleController = require("../controllers/Google");

// Mock the controller functions
jest.mock("../controllers/Signup");
jest.mock("../controllers/Google");

const app = express();
app.use(express.json());
app.use("/", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // OTP routes removed by request

  test("POST /google - should trigger googleAuth", async () => {
    signupController.googleAuth.mockImplementation((req, res) => {
      res
        .status(200)
        .json({ success: true, message: "Google Auth successful" });
    });

    const res = await request(app)
      .post("/google")
      .send({ token: "fake_token" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Google Auth successful");
    expect(signupController.googleAuth).toHaveBeenCalled();
  });
});
