// routes/signup.js

const express = require("express");
const router = express.Router();

// ✅ Import controllers
const { sendotp, verifyotp, googleAuth } = require("../controllers/Signup");
// ❌ The line `const google = require("../controllers/Google")` was unused — removed

// ✅ Routes for Signup & Authentication
router.post("/send-otp", sendotp);          // Send OTP to user
router.post("/verify-otp", verifyotp);      // Verify OTP entered by user
router.post("/google-auth", googleAuth);    // Google OAuth login/signup

// ✅ Export router
module.exports = router;
