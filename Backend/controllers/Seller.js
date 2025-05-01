const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");

// Buyer Signup
exports.sellerSignUp = async (req, res) => {
  const { firstName, lastName, email, password, terms } = req.body;

  if (!firstName || !lastName || !email || !password || !terms) {
    return res.status(400).json({ success: false, msg: "All fields are required." });
  }

  try {
    let existingUser = await Seller.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists." });
    }

    // ✅ Create new buyer and save
    const newUser = new Seller({ firstName, lastName, email, password, role: "seller" });
    await newUser.save();

    // ✅ Generate token using schema method
    const token = newUser.generateAuthToken();

    res.status(201).json({ 
      success: true, 
      msg: "Seller registered successfully", 
      userId: newUser._id, 
      role: "seller", 
      token 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// ✅ Get Buyer by ID
exports.sellerId = async (req, res) => {
  try {
    const user = await Seller.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
exports.sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Retrieve user with password field explicitly selected
    const user = await Seller.findOne({ email }).select("+password");
console.log(user)
    if (!user) {
      return res.status(400).json({ message: "No User found" });
    }

    // ✅ Compare password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT using schema method
    const token = user.generateAuthToken();

    res.json({
      message: "Login successful",
      token, 
      user: {
        sellerId: user._id,  // ✅ Correct
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};