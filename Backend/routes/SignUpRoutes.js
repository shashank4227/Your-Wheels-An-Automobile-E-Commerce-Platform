// routes/signup.js

const express = require("express");
const router = express.Router();

// ✅ Import controllers
const { googleAuth } = require("../controllers/Signup");
// ❌ The line `const google = require("../controllers/Google")` was unused — removed

// ✅ Routes for Signup & Authentication
router.post("/google-auth", googleAuth);    // Google OAuth login/signup

// ✅ Export router
module.exports = router;
