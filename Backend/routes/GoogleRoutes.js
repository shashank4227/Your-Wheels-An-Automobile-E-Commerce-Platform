const express = require("express");
const {
  googleLogin,
  googleCallback,
  logout,
} = require("../controllers/Google");
const { set } = require("mongoose");

const router = express.Router();

router.get("/auth/google", googleLogin);
router.get("/auth/google/callback", googleCallback);
router.get("/logout", logout);

// In your routes file (e.g., auth.routes.js)
const passport = require("../config/passport"); // Adjust path as needed

// Seller Google OAuth Routes
router.get(
  "/auth/seller/google",
  passport.authenticate("seller-google", { scope: ["profile", "email"] })
);
// In your auth.routes.js file
router.get(
  "/auth/seller/google/callback",
  passport.authenticate("seller-google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Get the token and id from the user object
    const { token, id } = req.user;

    // Redirect directly to the seller dashboard with token as query parameter
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/seller-dashboard/${id}?token=${token}`);
  }
);
// Buyer Google OAuth Routes (if needed)
router.get(
  "/auth/buyer/google",
  passport.authenticate("buyer-google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/buyer/google/callback",
  passport.authenticate("buyer-google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const { token, id } = req.user;
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/buyer-dashboard/${id}?token=${token}`);
  }
);

module.exports = router;

module.exports = router;
