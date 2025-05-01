const express = require("express");
const {  sendotp, verifyotp, googleAuth } = require("../controllers/Signup"); 
const google = require("../controllers/Google")
const router = express.Router();

// Define routes
router.post("/send-otp", sendotp);
router.post("/verify-otp", verifyotp);
router.post("/google", googleAuth);  // Google OAuth API




module.exports = router;
