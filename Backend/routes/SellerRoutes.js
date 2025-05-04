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
/**
 * @swagger
 * /seller-signup:
 *   post:
 *     summary: Register a new seller
 *     tags: [Seller]
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
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Pass@1234
 *               googleId:
 *                 type: string
 *                 example: "google-oauth2|1234567890"
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/profile.jpg
 *               verifiedEmail:
 *                 type: boolean
 *                 example: false
 *               isMember:
 *                 type: boolean
 *                 example: false
 *               membershipType:
 *                 type: string
 *                 enum: [Sell Access, Rent Access, Premium Access]
 *                 example: Sell Access
 *               role:
 *                 type: string
 *                 example: seller
 *               terms:
 *                 type: boolean
 *                 description: Must accept terms and conditions
 *                 example: true
 *     responses:
 *       201:
 *         description: Seller registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seller registered successfully
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /seller-login:
 *   post:
 *     summary: Seller login with email and password
 *     tags: [Seller]
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
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 example: seller123
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
 *                     sellerId:
 *                       type: string
 *                       example: 661f631b1a6eb0c6b0c88e1d
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: seller@example.com
 *       400:
 *         description: Invalid credentials or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - bearerAuth: []
 * /sellVehicles/add:
 *   post:
 *     summary: Add a new vehicle for sale
 *     tags: [SellVehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - brand
 *               - name
 *               - price
 *               - year
 *               - mileage
 *               - transmission
 *               - fuelType
 *               - color
 *               - imageUrl
 *             properties:
 *               type:
 *                 type: string
 *                 example: Sedan
 *               brand:
 *                 type: string
 *                 example: Toyota
 *               name:
 *                 type: string
 *                 example: Corolla
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 20000
 *               year:
 *                 type: integer
 *                 example: 2020
 *               mileage:
 *                 type: number
 *                 format: float
 *                 example: 15000
 *               transmission:
 *                 type: string
 *                 example: Automatic
 *               fuelType:
 *                 type: string
 *                 example: Petrol
 *               color:
 *                 type: string
 *                 example: Red
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/car-image.jpg
 *               totalUnits:
 *                 type: integer
 *                 example: 1
 *               location:
 *                 type: string
 *                 example: New York
 *               condition:
 *                 type: string
 *                 example: Excellent
 *               features:
 *                 type: string
 *                 example: Sunroof, Leather seats
 *               securityDeposit:
 *                 type: number
 *                 format: float
 *                 example: 500
 *               description:
 *                 type: string
 *                 example: A well-maintained Toyota Corolla with low mileage.
 *               email:
 *                 type: string
 *                 format: email
 *                 example: seller@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Vehicle listed successfully
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
 *                   example: Vehicle listed successfully
 *                 vehicle:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d48e2f0e6eb21d1081c7df
 *                     sellerId:
 *                       type: string
 *                       example: 60d48e2f0e6eb21d1081c7de
 *                     type:
 *                       type: string
 *                       example: Sedan
 *                     brand:
 *                       type: string
 *                       example: Toyota
 *                     name:
 *                       type: string
 *                       example: Corolla
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 20000
 *                     year:
 *                       type: integer
 *                       example: 2020
 *                     mileage:
 *                       type: number
 *                       format: float
 *                       example: 15000
 *                     transmission:
 *                       type: string
 *                       example: Automatic
 *                     fuelType:
 *                       type: string
 *                       example: Petrol
 *                     color:
 *                       type: string
 *                       example: Red
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/car-image.jpg
 *       400:
 *         description: Missing required fields
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
 *                   example: All required fields must be provided
 *       401:
 *         description: Authentication failed - user object missing
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
 *                   example: Authentication failed - user object missing
 *       500:
 *         description: Internal server error
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
 *                   example: "Failed to add vehicle: Error message"
 *                 stack:
 *                   type: string
 *                   example: |
 *                     Error stack trace (visible in development only)
 */


/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 */

/**
 * @swagger
 * /seller-stats/{id}:
 *   get:
 *     summary: Get seller statistics
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Seller ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller stats
 */

/**
 * @swagger
 * /vehicles/add:
 *   post:
 *     summary: Add a new vehicle for rent
 *     tags: [RentVehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - brand
 *               - name
 *               - price
 *               - year
 *               - mileage
 *               - transmission
 *               - fuelType
 *               - color
 *               - imageUrl
 *             properties:
 *               type:
 *                 type: string
 *                 example: SUV
 *               brand:
 *                 type: string
 *                 example: Honda
 *               name:
 *                 type: string
 *                 example: CR-V
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 100
 *               year:
 *                 type: integer
 *                 example: 2022
 *               mileage:
 *                 type: number
 *                 format: float
 *                 example: 12000
 *               transmission:
 *                 type: string
 *                 example: Automatic
 *               fuelType:
 *                 type: string
 *                 example: Petrol
 *               color:
 *                 type: string
 *                 example: Blue
 *               availableFrom:
 *                 type: string
 *                 format: date
 *                 example: 2025-05-01
 *               availableTo:
 *                 type: string
 *                 format: date
 *                 example: 2025-05-10
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/car-image.jpg
 *               rentHours:
 *                 type: number
 *                 format: float
 *                 example: 24
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: renter@example.com
 *     responses:
 *       201:
 *         description: Vehicle listed successfully
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
 *                   example: "Vehicle listed successfully"
 *                 vehicle:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d48e2f0e6eb21d1081c7df
 *                     seller:
 *                       type: string
 *                       example: 60d48e2f0e6eb21d1081c7de
 *                     type:
 *                       type: string
 *                       example: SUV
 *                     brand:
 *                       type: string
 *                       example: Honda
 *                     name:
 *                       type: string
 *                       example: CR-V
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 100
 *                     year:
 *                       type: integer
 *                       example: 2022
 *                     mileage:
 *                       type: number
 *                       format: float
 *                       example: 12000
 *                     transmission:
 *                       type: string
 *                       example: Automatic
 *                     fuelType:
 *                       type: string
 *                       example: Petrol
 *                     color:
 *                       type: string
 *                       example: Blue
 *                     availableFrom:
 *                       type: string
 *                       format: date
 *                       example: 2025-05-01
 *                     availableTo:
 *                       type: string
 *                       format: date
 *                       example: 2025-05-10
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/car-image.jpg
 *                     rentHours:
 *                       type: number
 *                       format: float
 *                       example: 24
 *                     isRented:
 *                       type: boolean
 *                       example: false
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     email:
 *                       type: string
 *                       example: renter@example.com
 *       400:
 *         description: Missing required fields
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
 *                   example: "Vehicle image is required"
 *       401:
 *         description: Unauthorized - User ID missing
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
 *                   example: "Unauthorized: User ID missing"
 *       500:
 *         description: Internal server error
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
 *                   example: "Server error"
 */

/**
 * @swagger
 * /sell/seller/{vehicleId}:
 *   delete:
 *     summary: Delete a second-hand vehicle listing by ID
 *     tags: [Sell]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vehicle to delete
 *         example: 661f631b1a6eb0c6b0c88e1d
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle not found
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server Error
 *                 error:
 *                   type: string
 *                   example: Error details here
 */

/**
 * @swagger
 * /rent-vehicles/{vehicleId}:
 *   delete:
 *     summary: Delete a rented vehicle listing by ID
 *     tags: [Rent]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vehicle to delete
 *         example: 661f631b1a6eb0c6b0c88e1d
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle not found
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server Error
 *                 error:
 *                   type: string
 *                   example: Error details here
 */

/**
 * @swagger
 * /seller-memberships/{id}:
 *   post:
 *     summary: Remove membership from a seller by ID
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the seller whose membership needs to be removed
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
 *         description: Seller not found
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
 *                   example: User not found
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to remove membership
 */

