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
    const vehicles = await Vehicle.find(); // Replace with your database query
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});
router.post("/rent-vehicle", async (req, res) => {
  try {
    const { buyerId, vehicleId } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.isRented) {
      return res.status(400).json({ message: "Vehicle is already rented" });
    }

    vehicle.isRented = true;
    vehicle.buyer = buyerId;
    await vehicle.save();

    res.status(200).json({ message: "Vehicle rented successfully", vehicle });
  } catch (error) {
    console.error("Error renting vehicle:", error);
    res.status(500).json({ error: "Failed to rent vehicle" });
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
/**
 * @swagger
 * /buyer-signup:
 *   post:
 *     summary: Register a new buyer
 *     tags: [Buyer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - terms
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *               terms:
 *                 type: boolean
 *                 description: Must accept terms and conditions
 *                 example: true
 *               role:
 *                 type: string
 *                 example: buyer
 *     responses:
 *       201:
 *         description: Buyer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: Buyer registered successfully
 *                 userId:
 *                   type: string
 *                   example: 608c1912fc13ae432600001a
 *                 role:
 *                   type: string
 *                   example: buyer
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /buyer-login:
 *   post:
 *     summary: Login an existing buyer
 *     tags: [Buyer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: 608c1912fc13ae432600001a
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *       400:
 *         description: Invalid input or user not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /buyer/{id}:
 *   get:
 *     summary: Get buyer profile
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Buyer profile info
 */

/**
 * @swagger
 * /available-vehicles:
 *   get:
 *     summary: Get available vehicles to buy
 *     tags: [Buyer]
 *     responses:
 *       200:
 *         description: List of available vehicles
 */

// /** // some error is there
//  * @swagger
//  * /buy-vehicle:
//  *   post:
//  *     summary: Buy a vehicle and complete the transaction
//  *     tags: [Buyer]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - buyerId
//  *               - vehicleId
//  *               - amount
//  *               - type
//  *             properties:
//  *               buyerId:
//  *                 type: string
//  *                 description: The ID of the buyer
//  *                 example: 608c1912fc13ae432600001a
//  *               vehicleId:
//  *                 type: string
//  *                 description: The ID of the vehicle being purchased
//  *                 example: 5f1e1bc98e7e5a3d18f1db5b
//  *               amount:
//  *                 type: number
//  *                 description: The amount of the purchase
//  *                 example: 15000
//  *               type:
//  *                 type: string
//  *                 description: The type of payment transaction (debit for buyer, credit for seller)
//  *                 enum: [debit, credit]
//  *                 example: debit
//  *     responses:
//  *       200:
//  *         description: Purchase successful
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Purchase successful
//  *       400:
//  *         description: Vehicle not available or invalid input
//  *       500:
//  *         description: Internal server error
//  */

/**
 * @swagger
 * /buy/buyer/{buyerId}:
 *   get:
 *     summary: Get all vehicles bought by a specific buyer
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the buyer
 *         example: 6638ab0f5a2c7f001e8b1234
 *     responses:
 *       200:
 *         description: List of vehicles bought by the buyer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 vehicles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6638d4ab9a1bba6a1c3cdef1
 *                       name:
 *                         type: string
 *                         example: Honda Civic
 *                       brand:
 *                         type: string
 *                         example: Honda
 *                       price:
 *                         type: number
 *                         example: 15000
 *                       year:
 *                         type: number
 *                         example: 2022
 *                       color:
 *                         type: string
 *                         example: Blue
 *                       fuelType:
 *                         type: string
 *                         example: Petrol
 *                       transmission:
 *                         type: string
 *                         example: Automatic
 *                       imageUrl:
 *                         type: string
 *                         example: https://example.com/car.jpg
 *       400:
 *         description: Invalid buyer ID
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /rent/buyer/{buyerId}:
 *   get:
 *     summary: Get vehicles rented by a specific buyer
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the buyer
 *     responses:
 *       200:
 *         description: Vehicles rented by the buyer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 vehicles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 662f631b1a6eb0c6b0c88e1d
 *                       name:
 *                         type: string
 *                         example: Honda CR-V
 *                       type:
 *                         type: string
 *                         example: SUV
 *                       price:
 *                         type: number
 *                         example: 1500
 *                       buyer:
 *                         type: string
 *                         example: 661f631b1a6eb0c6b0c88e1d
 *       400:
 *         description: Invalid buyer ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid seller ID
 *       401:
 *         description: Unauthorized - No token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       500:
 *         description: Internal server error while fetching rented vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error fetching vehicles for the seller
 *                 error:
 *                   type: string
 *                   example: Some error message
 */

// /**
//  * @swagger
//  * /rent/{vehicleId}:
//  *   get:
//  *     summary: Get rent vehicle by ID
//  *     tags: [Buyer]
//  *     parameters:
//  *       - in: path
//  *         name: vehicleId
//  *         required: true
//  *         schema: { type: string }
//  *     responses:
//  *       200:
//  *         description: Vehicle info
//  */

/**
 * @swagger
 * /rent-vehicles:
 *   get:
 *     summary: Get all available rent vehicles
 *     tags: [Buyer]
 *     responses:
 *       200:
 *         description: List of rent vehicles
 */

/**
 * @swagger
 * /buyer-stats/{id}:
 *   get:
 *     summary: Get buyer statistics
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Buyer stats like revenue, rentals, sales
 */

/**
 * @swagger
 * /buyer-memberships/{id}:
 *   post:
 *     summary: Remove membership from a buyer
 *     tags: [Buyer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the buyer whose membership is to be removed
 *         example: 661f631b1a6eb0c6b0c88e1d
 *     responses:
 *       200:
 *         description: Membership removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Membership removed successfully
 *       404:
 *         description: Buyer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: user not found
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to remove membership
 */
