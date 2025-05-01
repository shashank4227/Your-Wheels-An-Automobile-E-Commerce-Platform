const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Load allowed admins from environment or config
    const allowedAdmins = JSON.parse(process.env.ALLOWED_ADMINS);

    // Find the admin with matching credentials
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
const SellVehicle = require("../models/SellVehicle");
// ✅ Get vehicles listed by a specific seller
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
const Vehicle = require("../models/Vehicle");
// ✅ Get All Vehicles for the admin
exports.getAdminVehiclesForRent = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isRented: false })
      .populate({
        path: "buyer",
        select: "firstName lastName email", // Select only needed fields
      });
    console.log(vehicles);

    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


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
