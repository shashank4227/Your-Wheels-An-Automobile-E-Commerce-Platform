const express = require("express");
const router = express.Router();
const Buyer = require("../models/Buyer"); // Adjust the path if necessary
const Seller = require("../models/Seller");

// Fetch all users
router.get("/get-users", async (req, res) => {
    try {
        const buyers = await Buyer.find();
        const sellers = await Seller.find();
        res.json({ buyers, sellers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
});
router.get("/get-user/:id", async (req, res) => {
    try {
        let user = await Buyer.findById(req.params.id);
        if (!user) user = await Seller.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

router.put("/update-user/:id", async (req, res) => {
    try {
        const { firstName, lastName, email, role } = req.body;

        // Fields to update
        const updateFields = { firstName, lastName, email, role };

        // Try updating in Buyers collection
        let updatedUser = await Buyer.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        // If not found in Buyers, try Sellers collection
        if (!updatedUser) {
            updatedUser = await Seller.findByIdAndUpdate(
                req.params.id,
                updateFields,
                { new: true }
            );
        }

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user", details: error.message });
    }
});

// Delete user
router.delete("/delete-user/:id", async (req, res) => {
    try {
        let deletedUser = await Buyer.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            deletedUser = await Seller.findByIdAndDelete(req.params.id);
        }

        if (!deletedUser) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

router.get("/users", async (req, res) => {
    try {
        const buyers = await Buyer.find();
        const sellers = await Seller.find();
        console.log(buyers)
        console.log(sellers)
        res.json({ buyers, sellers });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
})



module.exports = router;


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all buyers and sellers
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Successfully retrieved buyers and sellers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buyers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 661f631b1a6eb0c6b0c88e1d
 *                       name:
 *                         type: string
 *                         example: John Buyer
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: buyer@example.com
 *                 sellers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 661f6ab91a7eb1dabc12002a
 *                       name:
 *                         type: string
 *                         example: Sarah Seller
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: seller@example.com
 *       500:
 *         description: Failed to fetch users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch users
 */

/**
 * @swagger
 * /update-user/{id}:
 *   put:
 *     summary: Update a buyer or seller by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *         example: 661f6ab91a7eb1dabc12002a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               role:
 *                 type: string
 *                 example: buyer
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 661f6ab91a7eb1dabc12002a
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john.doe@example.com
 *                     role:
 *                       type: string
 *                       example: buyer
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Failed to update user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to update user
 *                 details:
 *                   type: string
 *                   example: Error details here
 */

/**
 * @swagger
 * /delete-user/{id}:
 *   delete:
 *     summary: Delete a user (buyer or seller) by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user (buyer or seller) to delete
 *         example: 661f631b1a6eb0c6b0c88e1d
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Failed to delete user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to delete user
 */
