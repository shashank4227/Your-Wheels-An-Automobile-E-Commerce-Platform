const express = require("express");
const { buyerSignUp, buyerId, buyerLogin } = require("../controllers/Buyer");
const {
  getAvailableVehicles,
  buyVehicle,
  getBuyerBoughtVehicles,
  getBuyerRentedVehicles
} = require("../controllers/Buyer");
const Vehicle = require("../models/Vehicle");
const SellVehicle = require("../models/SellVehicle");
const router = express.Router();

router.post("/buyer-signup", buyerSignUp);
router.post("/buyer-login", buyerLogin);
router.get("/buyer/:id", buyerId);
router.get("/available-vehicles", getAvailableVehicles);
router.post("/buy-vehicle", buyVehicle);

const authMiddleware = require("../middleware/authMiddleware");
const Payment = require("../models/Payment"); // Model for storing purchases

// ✅ Get bought vehicles for a specific user
router.get("/buyer/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find purchased vehicles based on buyer ID
    const vehicles = await SellVehicle.find({ buyerId: id }).populate(
      "vehicleId"
    );

    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ message: "No vehicles found" });
    }

    // ✅ Format data to send necessary vehicle details
    const formattedVehicles = vehicles.map((purchase) => ({
      _id: purchase.vehicleId._id,
      brand: purchase.vehicleId.brand,
      name: purchase.vehicleId.name,
      type: purchase.vehicleId.type,
      year: purchase.vehicleId.year,
      mileage: purchase.vehicleId.mileage,
      location: purchase.vehicleId.location,
      phoneNumber: purchase.vehicleId.phoneNumber,
      email: purchase.vehicleId.email,
      price: purchase.vehicleId.price,
      transmission: purchase.vehicleId.transmission,
      fuelType: purchase.vehicleId.fuelType,
      condition: purchase.vehicleId.condition,
      description: purchase.vehicleId.description,
      features: purchase.vehicleId.features,
      imageUrl: purchase.vehicleId.imageUrl,
    }));

    res.status(200).json({ vehicles: formattedVehicles });
  } catch (error) {
    console.error("Error fetching bought vehicles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/buy/buyer/:id", authMiddleware, getBuyerBoughtVehicles);
router.get("/rent/buyer/:id", authMiddleware, getBuyerRentedVehicles);
router.get("/rent/:vehicleId", authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vehicle details" });
  }
});

router.get("/rent-vehicles", async (req, res) => {
  try {
    // Fetch only available vehicles where isRented = false
    const vehicles = await Vehicle.find({ isRented: false });
    res.status(200).json(vehicles);
  } catch (err) {
    console.error("Error fetching available vehicles:", err);
    res.status(500).json({ error: "Failed to fetch available vehicles" });
  }
});

const mongoose = require("mongoose");

router.get("/buyer-stats/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const totalVehiclesBought = await SellVehicle.countDocuments({ buyerId: id, isSold: true });
    const totalRentedVehicles = await Vehicle.countDocuments({ buyer: id, isRented: true });
    
    // Example: Calculate total revenue from sales and rentals
    const totalRevenue = await Payment.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(id) } },
      { $group: { 
        _id: null, 
        total: { $sum: {
          $cond: [
            { $eq: ["$type", "subscription"] },
            0,  // If it's a subscription, don't add to total
            "$amount"  // If it's not a subscription, add the amount
          ]
        } }
      } }
    ]);

    res.json({
      totalVehiclesBought,
      totalRentedVehicles,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

const Buyer = require("../models/Buyer");

router.post("/buyer-memberships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Buyer.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "user not found" });
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
router.put("/buyer/:vehicleId/rating", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { userId, rating, comment } = req.body;

    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: "Invalid vehicle ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // ✅ Check if user exists
    const userExists = await Buyer.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const firstName = userExists.firstName;

    // ✅ Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // ✅ Always add a new review (DO NOT update existing one)
    vehicle.reviews.push({
      buyer: userId,
      firstName,
      rating,
      comment,
      createdAt: new Date(),
    });

    // ✅ Recalculate the average rating
    const totalRatings = vehicle.reviews.length;
    const sumRatings = vehicle.reviews.reduce((sum, r) => sum + r.rating, 0);
    vehicle.rating = totalRatings ? sumRatings / totalRatings : 0;

    // ✅ Save updated vehicle
    await vehicle.save();

    return res.status(200).json({ message: "Rating added successfully", vehicle });
  } catch (error) {
    console.error("🚨 Error adding rating:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
