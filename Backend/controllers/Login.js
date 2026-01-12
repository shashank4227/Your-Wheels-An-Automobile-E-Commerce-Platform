const Buyer = require('../models/Buyer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();



const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
exports.googleLogin = async (req, res) => {
    try {
      const { token } = req.body;
  
      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const userEmail = payload.email;
  
      // Check if user exists in the database
      const user = await User.findOne({ email: userEmail });
  
      if (!user) {
        return res.status(401).json({ message: "Account not found. Please sign up first." });
      }
  
      // Generate JWT for login
      const jwtToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
  
      res.status(200).json({ message: "Login successful", token: jwtToken });
    } catch (error) {
      console.error("Google Login Error:", error);
      res.status(401).json({ message: "Invalid Google login. Please try again." });
    }
};
  
