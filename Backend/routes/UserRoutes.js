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
