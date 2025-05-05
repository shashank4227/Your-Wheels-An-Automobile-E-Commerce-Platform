const express = require("express");
const {
  adminLogin,
  getVehiclesOnSale,
  getAdminVehiclesForRent,
  getAdminSoldVehicles,
  getAdminRentedVehicles,
} = require("../controllers/Admin");

const router = express.Router();

/* ==============================
   ADMIN AUTHENTICATION ROUTE
   ============================== */
router.post("/admin-login", adminLogin);

/* ==============================
   ADMIN VEHICLE MANAGEMENT ROUTES
   ============================== */
router.get("/admin-vehicle-on-sale", getVehiclesOnSale);
router.get("/vehicles/admin", getAdminVehiclesForRent);
router.get("/sold/admin", getAdminSoldVehicles);
router.get("/rent/admin", getAdminRentedVehicles);

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
