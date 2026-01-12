const express = require("express");
const passport = require("passport");
const router = express.Router();
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // Fallback for safety

// ✅ Buyer Google Login Route
router.get(
  "/auth/buyer/google",
  passport.authenticate("buyer-google", { scope: ["profile", "email"] })
);

// ✅ Buyer Google Callback
router.get("/auth/buyer/google/callback", (req, res, next) => {
  passport.authenticate("buyer-google", (err, user, info) => {
    if (err) {
      console.error("❌ Buyer Google Authentication Error:", err);
      return res.redirect(`${FRONTEND_URL}/buyer-login`);
    }
    if (!user) {
      console.warn("⚠️ Buyer not found:", info);
      return res.redirect(`${FRONTEND_URL}/buyer-login`);
    }

    req.login(user, (err) => {
      if (err) {
        console.error("❌ Buyer Login Error:", err);
        return res.redirect(`${FRONTEND_URL}/buyer-login`);
      }
      console.log("✅ Buyer Authenticated:", user.email);
      return res.redirect(`${FRONTEND_URL}/buyer-dashboard/${user.id}`);
    });
  })(req, res, next);
});

// ✅ Seller Google Login Route
router.get(
  "/auth/seller/google",
  passport.authenticate("seller-google", { scope: ["profile", "email"] })
);

// ✅ Seller Google Callback
router.get("/auth/seller/google/callback", (req, res, next) => {
  passport.authenticate("seller-google", (err, user, info) => {
    if (err) {
      console.error("❌ Seller Google Authentication Error:", err);
      return res.redirect(`${FRONTEND_URL}/seller-login`);
    }
    if (!user) {
      console.warn("⚠️ Seller not found:", info);
      return res.redirect(`${FRONTEND_URL}/seller-login`);
    }

    req.login(user, (err) => {
      if (err) {
        console.error("❌ Seller Login Error:", err);
        return res.redirect(`${FRONTEND_URL}/seller-login`);
      }
      console.log("✅ Seller Authenticated:", user.email);
      return res.redirect(`${FRONTEND_URL}/seller-dashboard/${user.id}`);
    });
  })(req, res, next);
});

module.exports = router;
