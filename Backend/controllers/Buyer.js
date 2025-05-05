const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Buyer = require("../models/Buyer");
const SellVehicle = require("../models/SellVehicle");
const Payment = require("../models/Payment");
const Seller = require("../models/Seller");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

// Buyer Signup
exports.buyerSignUp = async (req, res) => {
  const { firstName, lastName, email, password, terms } = req.body;

  if (!firstName || !lastName || !email || !password || !terms) {
    return res.status(400).json({ success: false, msg: "All fields are required." });
  }

  try {
    let existingUser = await Buyer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists." });
    }

    const newUser = new Buyer({ firstName, lastName, email, password, role: "buyer" });
    await newUser.save();
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
    const user = await Buyer.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "No User found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = user.generateAuthToken();

    res.json({
      message: "Login successful",
      token,
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

// ✅ Get Available Vehicles (without Redis cache)
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await SellVehicle.find({ isSold: false });
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ success: false, message: "Error retrieving vehicles", error });
  }
};

// ✅ Buy Vehicle
exports.buyVehicle = async (req, res) => {
  try {
    const { buyerId, vehicleId, amount } = req.body;

    const vehicle = await SellVehicle.findById(vehicleId).populate("sellerId");
    if (!vehicle || vehicle.isSold) {
      return res.status(400).json({ success: false, message: "Vehicle not available" });
    }

    vehicle.isSold = true;
    await vehicle.save();

    await Payment.create({ userId: buyerId, amount: -amount });
    await Payment.create({ userId: vehicle.sellerId._id, amount });

    res.status(200).json({ success: true, message: "Purchase successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error processing purchase", error });
  }
};

// ✅ Buyer bought vehicles
exports.getBuyerBoughtVehicles = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid seller ID" });
  }

  try {
    const vehicles = await SellVehicle.find({ buyerId: id });
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("❌ Error fetching seller vehicles:", error);
    res.status(500).json({ success: false, message: "Error fetching vehicles", error: error.message });
  }
};

// ✅ Buyer rented vehicles
exports.getBuyerRentedVehicles = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid seller ID" });
  }

  try {
    const vehicles = await Vehicle.find({ buyer: id });
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("❌ Error fetching rented vehicles:", error);
    res.status(500).json({ success: false, message: "Error fetching vehicles", error: error.message });
  }
};
