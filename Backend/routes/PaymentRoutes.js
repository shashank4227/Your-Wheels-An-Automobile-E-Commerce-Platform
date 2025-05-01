const express = require("express");
const router = express.Router();
const {
  processPayment,
  transactionsUserId,
  sellerPayment,
  Alltransactions,
} = require("../controllers/Payment");

router.post("/payment", processPayment);
router.post("/seller-payment", sellerPayment);
router.get("/transactions/:id", transactionsUserId);
router.get("/admin/transactions", Alltransactions);

const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");
const Payment = require("../models/Payment");
const SellVehicle = require("../models/SellVehicle");

router.post("/create-transaction", async (req, res) => {
  const { buyerId, sellerId, vehicleId, amount } = req.body;

  // ✅ Validate required fields
  if (!buyerId || !sellerId || !vehicleId || !amount) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // ✅ Validate buyer and seller existence
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res
        .status(404)
        .json({ success: false, message: "Buyer not found" });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // ✅ Fetch vehicle and check if it exists
    const vehicle = await SellVehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    // ✅ Check if vehicle is already sold
    if (vehicle.isSold) {
      return res
        .status(400)
        .json({ success: false, message: "Vehicle is already sold" });
    }

    // ✅ Update vehicle as sold and assign buyer
    vehicle.buyerId = buyerId;
    vehicle.isSold = true;
    await vehicle.save(); // ✅ Save updated vehicle status

    // ✅ Create new transaction
    const newTransaction = new Payment({
      buyerId,
      sellerId,
      vehicleId,
      amount,
      status: "successful", // ✅ Mark as successful after confirmation
      type: "purchase",
      description: `Vehicle ${vehicle._id} purchased by ${buyer.firstName}`,
    });

    await newTransaction.save();

    return res
      .status(201)
      .json({ success: true, message: "Transaction created successfully!" });
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const { createRentTransaction } = require("../controllers/Payment");

router.post("/create-rent-transaction", createRentTransaction);

module.exports = router;
