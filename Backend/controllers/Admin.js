const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const SellVehicle = require("../models/SellVehicle");
const Vehicle = require("../models/Vehicle");

dotenv.config();

// Admin login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const allowedAdmins = JSON.parse(process.env.ALLOWED_ADMINS);

    const admin = allowedAdmins.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (admin) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({
        message: "Login successful",
        token,
        email: admin.email,
      });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
};

// Get vehicles on sale
exports.getVehiclesOnSale = async (req, res) => {
  try {
    const vehicles = await SellVehicle.find({ isSold: false });

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles for the admin",
      error: error.message,
    });
  }
};

// Get admin vehicles for rent
exports.getAdminVehiclesForRent = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isRented: false }).populate({
      path: "buyer",
      select: "firstName lastName email",
    });

    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get admin sold vehicles
exports.getAdminSoldVehicles = async (req, res) => {
  try {
    const vehicles = await SellVehicle.find({ isSold: true });

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

// Get admin rented vehicles
exports.getAdminRentedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isRented: true });

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

// Update vehicle status (placeholder without Redis)
exports.updateVehicleStatus = async (req, res) => {
  try {
    // Implement DB updates for vehicle status here

    // Cache clearing removed (no Redis)

    res.status(200).json({
      success: true,
      message: "Vehicle status updated",
    });
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating vehicle status",
      error: error.message,
    });
  }
};
