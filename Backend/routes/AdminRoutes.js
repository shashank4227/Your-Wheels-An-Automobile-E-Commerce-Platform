const express = require("express");
const { 
  adminLogin,
  getVehiclesOnSale,
  getAdminVehiclesForRent,
  getAdminSoldVehicles,
  getAdminRentedVehicles
} = require("../controllers/Admin");
const { cacheMiddleware, clearCache } = require("../middleware/cacheMiddleware");

const router = express.Router();

/* ==============================
   ADMIN AUTHENTICATION ROUTE
   ============================== */
router.post("/admin-login", adminLogin);

/* ==============================
   ADMIN VEHICLE MANAGEMENT ROUTES
   ============================== */
// Get vehicles on sale (cached for 5 minutes)
router.get(
  "/admin-vehicle-on-sale",
  cacheMiddleware(300, "admin:vehicles:sale"), // Cache for 5 minutes
  getVehiclesOnSale
);

// Get vehicles for rent (cached for 5 minutes)
router.get(
  "/vehicles/admin",
  cacheMiddleware(300, "admin:vehicles:rent"), // Cache for 5 minutes
  getAdminVehiclesForRent
);

// Get sold vehicles (cached for 15 minutes)
router.get(
  "/sold/admin",
  cacheMiddleware(900, "admin:vehicles:sold"), // Cache for 15 minutes
  getAdminSoldVehicles
);

// Get rented vehicles (cached for 15 minutes)
router.get(
  "/rent/admin",
  cacheMiddleware(900, "admin:vehicles:rented"), // Cache for 15 minutes
  getAdminRentedVehicles
);

/* ==============================
   ADMIN CACHE MANAGEMENT ROUTES
   ============================== */
// Clear specific cache
router.post(
  "/clear-cache",
  (req, res) => {
    const { cacheKey } = req.body;
    if (!cacheKey) {
      return res.status(400).json({ success: false, message: "Cache key is required" });
    }
    
    clearCache(cacheKey)(req, res, () => {
      res.json({ success: true, message: `Cache cleared for ${cacheKey}` });
    });
  }
);

// Clear all admin-related caches
router.post(
  "/clear-all-caches",
  clearCache("admin:*"),
  (req, res) => {
    res.json({ success: true, message: "All admin caches cleared" });
  }
);

module.exports = router;
/**
 * @swagger
 * /admin-login:
 *   post:
 *     summary: Admin login with predefined credentials
 *     tags: [Admin]
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
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
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
 *                 email:
 *                   type: string
 *                   example: admin@example.com
 *       401:
 *         description: Invalid credentials
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
 * /admin-vehicle-on-sale:
 *   get:
 *     summary: Get vehicles on sale
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of vehicles on sale
 */

/**
 * @swagger
 * /vehicles/admin:
 *   get:
 *     summary: Get vehicles for rent
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of vehicles for rent
 */

/**
 * @swagger
 * /sold/admin:
 *   get:
 *     summary: Get sold vehicles
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of sold vehicles
 */

/**
 * @swagger
 * /rent/admin:
 *   get:
 *     summary: Get rented vehicles
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of rented vehicles
 */
