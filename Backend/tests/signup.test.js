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

  test("POST /send-otp - should trigger sendotp", async () => {
    signupController.sendotp.mockImplementation((req, res) => {
      res.status(200).json({ success: true, message: "OTP sent" });
    });

    const res = await request(app).post("/send-otp").send({ email: "test@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP sent");
    expect(signupController.sendotp).toHaveBeenCalled();
  });

  test("POST /verify-otp - should trigger verifyotp", async () => {
    signupController.verifyotp.mockImplementation((req, res) => {
      res.status(200).json({ success: true, message: "OTP verified" });
    });

    const res = await request(app)
      .post("/verify-otp")
      .send({ email: "test@example.com", otp: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP verified");
    expect(signupController.verifyotp).toHaveBeenCalled();
  });

  test("POST /google - should trigger googleAuth", async () => {
    signupController.googleAuth.mockImplementation((req, res) => {
      res.status(200).json({ success: true, message: "Google Auth successful" });
    });

    const res = await request(app).post("/google").send({ token: "fake_token" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Google Auth successful");
    expect(signupController.googleAuth).toHaveBeenCalled();
  });
});
