const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const { cacheMiddleware, clearCache } = require("../middleware/cacheMiddleware");
const cloudinary = require("../utils/cloudinary");

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

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});


/* ==============================
   SELLER AUTHENTICATION ROUTES
   ============================== */
router.post("/seller-signup", sellerSignUp);
router.post("/seller-login", sellerLogin);
router.get("/seller/:id", cacheMiddleware(3600), sellerId); // Cache seller profile for 1 hour

/* ==============================
   IMAGE UPLOAD ROUTE
   ============================== */

   const { Readable } = require("stream");
   const upload = multer({ storage: multer.memoryStorage() });
   
   router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
     if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
   
     try {
       const streamUpload = (buffer) => {
         return new Promise((resolve, reject) => {
           const stream = cloudinary.uploader.upload_stream(
             { folder: "your-wheels" },
             (error, result) => {
               if (result) resolve(result);
               else reject(error);
             }
           );
           Readable.from(buffer).pipe(stream);
         });
       };
   
       const result = await streamUpload(req.file.buffer);
       res.json({ success: true, imageUrl: result.secure_url });
     } catch (err) {
       res.status(500).json({ success: false, message: "Upload failed", error: err.message });
     }
   });
   
   

/* ==============================
   RENTAL VEHICLE MANAGEMENT ROUTES
   ============================== */
// Clear vehicle cache when adding a new vehicle
router.post(
  "/vehicles/add", 
  authMiddleware, 
  clearCache("cache:*/vehicles/seller/*"),
  addVehicle
);

// Cache seller vehicles for 5 minutes
router.get(
  "/vehicles/seller/:id", 
  authMiddleware, 
  cacheMiddleware(300, (req) => `cache:seller:${req.params.id}:vehicles`),
  getSellerVehicles
);

// Cache vehicles on rent for 5 minutes
router.get(
  "/vehicles-on-rent/seller/:id", 
  authMiddleware, 
  cacheMiddleware(300, (req) => `cache:seller:${req.params.id}:vehicles-on-rent`),
  getVehiclesOnRent
);

// Cache individual vehicle data for 10 minutes
router.get(
  "/vehicles/:id", 
  authMiddleware, 
  cacheMiddleware(600, (req) => `cache:vehicle:${req.params.id}`),
  getVehicleById
);

// Clear vehicle caches when deleting a vehicle
router.delete(
  "/vehicles/:id", 
  authMiddleware,
  clearCache((req) => `cache:vehicle:${req.params.id}`),
  clearCache("cache:*/vehicles/seller/*"),
  deleteVehicle
);

/* ==============================
   SECOND-HAND VEHICLE SALES ROUTES
   ============================== */
// Clear relevant caches when adding a vehicle for sale
router.post(
  "/sellVehicles/add",
  authMiddleware,
  clearCache("cache:sell/all"),
  clearCache((req) => `cache:sell/seller:${req.body.sellerId || req.user.id}`),
  sellVehicleController.addVehicle
);

// Cache all vehicles for sale for 5 minutes
router.get(
  "/sell/all", 
  cacheMiddleware(300, () => "cache:sell/all"),
  sellVehicleController.getAllVehicles
);

// Cache specific sale vehicle for 10 minutes
router.get(
  "/sell/:id", 
  cacheMiddleware(600, (req) => `cache:sell:${req.params.id}`),
  sellVehicleController.getVehicleById
);

// Cache specific rent vehicle for 10 minutes
router.get(
  "/rent/:id", 
  cacheMiddleware(600, (req) => `cache:rent:${req.params.id}`),
  sellVehicleController.getRentVehicleById
);

// Clear caches when updating a vehicle for sale
router.put(
  "/sell/update/:id",
  authMiddleware,
  clearCache((req) => `cache:sell:${req.params.id}`),
  clearCache("cache:sell/all"),
  clearCache((req) => `cache:sell/seller:*`),
  sellVehicleController.updateVehicle
);

// Clear caches when deleting a vehicle for sale
router.delete(
  "/sell/delete/:id",
  authMiddleware,
  clearCache((req) => `cache:sell:${req.params.id}`),
  clearCache("cache:sell/all"),
  clearCache((req) => `cache:sell/seller:*`),
  sellVehicleController.deleteVehicle
);

// Cache seller's vehicles for sale for 5 minutes
router.get(
  "/sell/seller/:id",
  authMiddleware,
  sellVehicleController.getSellerVehiclesForSale
);

// Cache sold vehicles for 15 minutes
router.get(
  "/sold/seller/:id",
  authMiddleware,
  cacheMiddleware(900, (req) => `cache:sold/seller:${req.params.id}`),
  sellVehicleController.getSoldVehicles
);

const Payment = require("../models/Payment");
const Vehicle = require("../models/Vehicle");
const SellVehicle = require("../models/SellVehicle");
const mongoose = require("mongoose");

// Cache seller stats for 10 minutes
router.get(
  "/seller-stats/:id", 
  cacheMiddleware(600, (req) => `cache:seller:${req.params.id}:stats`),
  async (req, res) => {
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
      // console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
);

const Seller = require("../models/Seller");

// Clear seller cache when updating membership
router.post(
  "/seller-memberships/:id",
  clearCache((req) => `cache:seller:${req.params.id}`),
  clearCache((req) => `cache:seller:${req.params.id}:stats`),
  async (req, res) => {
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
  }
);

// Clear sell vehicle cache on deletion
router.delete(
  "/sell/seller/:vehicleId",
  clearCache((req) => `cache:sell:${req.params.vehicleId}`),
  clearCache("cache:sell/all"),
  clearCache("cache:sell/seller:*"),
  async (req, res) => {
    try {
      const { vehicleId } = req.params;

      // Find the vehicle
      const vehicle = await SellVehicle.findById(vehicleId);
      if (!vehicle) {
        console.log("Vehicle not found");
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Delete the vehicle
      await Vehicle.findByIdAndDelete(vehicleId);

      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
);

// Clear rent vehicle cache on deletion
router.delete(
  "/rent-vehicles/:vehicleId",
  clearCache((req) => `cache:vehicle:${req.params.vehicleId}`),
  clearCache((req) => `cache:rent:${req.params.vehicleId}`),
  clearCache("cache:*/vehicles/seller/*"),
  async (req, res) => {
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
  }
);

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

