const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Buyer = require("../models/Buyer");
const SellVehicle = require("../models/SellVehicle");
const Payment = require("../models/Payment");
const Seller = require("../models/Seller");
const mongoose=require("mongoose");
// Buyer Signup
exports.buyerSignUp = async (req, res) => {
  const { firstName, lastName, email, password, terms } = req.body;

  if (!firstName || !lastName || !email || !password || !terms) {
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required." });
  }

  try {
    let existingUser = await Buyer.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists." });
    }

    // ✅ Create new buyer and save
    const newUser = new Buyer({
      firstName,
      lastName,
      email,
      password,
      role: "buyer",
    });
    await newUser.save();

    // ✅ Generate token using schema method
    const token = newUser.generateAuthToken();

    res.status(201).json({
      success: true,
      msg: "Buyer registered successfully",
      userId: newUser._id,
      role: "buyer",
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// ✅ Get Buyer by ID
exports.buyerId = async (req, res) => {
  try {
    const user = await Buyer.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.buyerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Retrieve user with password field explicitly selected
    const user = await Buyer.findOne({ email }).select("+password");

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
      token, // Send JWT to the client
      user: {
        userId: user._id,
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

exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await SellVehicle.find({ isSold: false });
    console.log("Retrieved Vehicles:", vehicles); // Debugging line
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving vehicles", error });
  }
};

exports.buyVehicle = async (req, res) => {
  try {
    const { buyerId, vehicleId, amount } = req.body;

    const vehicle = await SellVehicle.findById(vehicleId).populate("sellerId");
    if (!vehicle || vehicle.isSold) {
      return res
        .status(400)
        .json({ success: false, message: "Vehicle not available" });
    }

    // Update Vehicle Status
    vehicle.isSold = true;
    await vehicle.save();

    // Add transaction for buyer
    await Payment.create({
      userId: buyerId,
      amount: -amount, // Deducting amount from buyer
    });

    // Add transaction for seller
    await Payment.create({
      userId: vehicle.sellerId._id,
      amount: amount, // Adding amount to seller
    });

    // Notify seller (Assuming we use a messaging system)
    console.log(
      `Notification: Buyer purchased ${vehicle.name}. Seller: ${vehicle.sellerId.email}`
    );

    res.status(200).json({ success: true, message: "Purchase successful" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error processing purchase", error });
  }
};

// ✅ Get vehicles listed by a specific seller
exports.getBuyerBoughtVehicles = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    console.log("✅ Seller ID Received:", id);

    const vehicles = await SellVehicle.find({ buyerId: id })

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching seller vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles for the seller",
      error: error.message,
    });
  }
};
// ✅ Get vehicles listed by a specific buyer
const Vehicle = require("../models/Vehicle");
exports.getBuyerRentedVehicles = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    console.log("✅ Seller ID Received:", id);

    const vehicles = await Vehicle.find({ buyer: id })

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching seller vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles for the seller",
      error: error.message,
    });
  }
};