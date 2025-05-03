const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

// Import Seller Controllers
const {
  sellerSignUp,
  sellerLogin,
  sellerId,
} = require("../controllers/Seller");

// Import Rental Vehicle Controllers
const {
  addVehicle,
  getSellerVehicles,
  getVehicleById,
  deleteVehicle,
  getVehiclesOnRent,
} = require("../controllers/Vehicle");

// Import Sell Vehicle Controllers (Second-hand vehicle sales)
const sellVehicleController = require("../controllers/SellVehicle");

const router = express.Router();

const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const upload = multer({ dest: "uploads/" }); // Temporary storage

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "your-wheels", // optional Cloudinary folder
    });

    fs.unlinkSync(req.file.path); // delete temp file

    res.json({ success: true, imageUrl: result.secure_url }); // Cloudinary URL
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

/* ==============================
   SELLER AUTHENTICATION ROUTES
   ============================== */
router.post("/seller-signup", sellerSignUp);
router.post("/seller-login", sellerLogin);
router.get("/seller/:id", sellerId);

/* ==============================
   IMAGE UPLOAD ROUTE
   ============================== */


/* ==============================
   RENTAL VEHICLE MANAGEMENT ROUTES
   ============================== */
router.post("/vehicles/add", authMiddleware, addVehicle); // Add vehicle for rent
router.get("/vehicles/seller/:id", authMiddleware, getSellerVehicles); // Get all seller's rental vehicles
router.get("/vehicles-on-rent/seller/:id", authMiddleware, getVehiclesOnRent); // Get all seller's rental vehicles
router.get("/vehicles/:id", authMiddleware, getVehicleById); // Get single rental vehicle
router.delete("/vehicles/:id", authMiddleware, deleteVehicle); // Delete rental vehicle

/* ==============================
   SECOND-HAND VEHICLE SALES ROUTES
   ============================== */
router.post(
  "/sellVehicles/add",
  authMiddleware,
  sellVehicleController.addVehicle
); // Add vehicle for sale
router.get("/sell/all", sellVehicleController.getAllVehicles); // Get all vehicles for sale
router.get("/sell/:id", sellVehicleController.getVehicleById); // Get specific sale vehicle
router.get("/rent/:id", sellVehicleController.getRentVehicleById); // Get specific sale vehicle
router.put(
  "/sell/update/:id",
  authMiddleware,
  sellVehicleController.updateVehicle
); // Update sale vehicle
router.delete(
  "/sell/delete/:id",
  authMiddleware,
  sellVehicleController.deleteVehicle
); // Delete sale vehicle
router.get(
  "/sell/seller/:id",
  authMiddleware,
  sellVehicleController.getSellerVehiclesForSale
);
router.get(
  "/sold/seller/:id",
  authMiddleware,
  sellVehicleController.getSoldVehicles
);

const Payment = require("../models/Payment");
const Vehicle = require("../models/Vehicle");
const SellVehicle = require("../models/SellVehicle");
const mongoose = require("mongoose");

router.get("/seller-stats/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const totalVehiclesSold = await SellVehicle.countDocuments({
      sellerId: id,
      isSold: true,
    });
    const totalVehiclesOnSale = await SellVehicle.countDocuments({
      sellerId: id,
      isSold: false,
    });
    const totalRentals = await Vehicle.countDocuments({
      seller: id,
      isRented: true,
    });
    const totalVehicleOnRent = await Vehicle.countDocuments({
      seller: id,
      isRented: false,
    });

    // Example: Calculate total revenue from sales and rentals
    console.log("Seller id: ", id);
    const totalRevenue = await Payment.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $eq: ["$type", "subscription"] },
                0, // If it's a subscription, don't add to total
                "$amount", // If it's not a subscription, add the amount
              ],
            },
          },
        },
      },
    ]);

    res.json({
      totalVehiclesSold,
      totalRentals,
      totalVehicleOnRent,
      totalVehiclesOnSale,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
const Seller = require("../models/Seller");

router.post("/seller-memberships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Seller.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    user.isMember = false;
    user.membershipType = null;
    await user.save();
    res.json({ success: true, message: "Membership removed successfully" });
  } catch (error) {
    console.error("Error removing membership:", error);
    res.status(500).json({ error: "Failed to remove membership" });
  }
});

router.delete("/sell/seller/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Find the vehicle
    const vehicle = await SellVehicle.findById(vehicleId);
    if (!vehicle) {
      console.log("Vehicle not found");
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Delete the vehicle
    await SellVehicle.findByIdAndDelete(vehicleId);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.delete("/rent-vehicles/:vehicleId", async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Find the vehicle in the database
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Delete the vehicle
    await Vehicle.findByIdAndDelete(vehicleId);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
