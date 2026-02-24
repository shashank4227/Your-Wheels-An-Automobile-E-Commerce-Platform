const Payment = require('../models/Payment');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
exports.processPayment = async (req, res) => {
  const {
    userId, amount, billingPeriod, zipCode,
    nameOnCard, cardNumber, expireDate, cvv, membershipType
  } = req.body;

  if (!membershipType) {
    return res.status(400).json({ success: false, message: "Membership type is required" });
  }

  try {
    // ✅ Simulate Payment Success
    const paymentSuccess = Math.random() > 0.1;

    const payment = new Payment({
      buyerId:userId,
      amount,
      billingPeriod,
      zipCode,
      nameOnCard,
      cardNumber,
      expireDate,
      cvv,
      status: paymentSuccess ? 'successful' : 'failed',
      type: "subscription",
    });

    await payment.save();

    if (paymentSuccess) {
      // ✅ Update Buyer Model
      await Buyer.findByIdAndUpdate(userId, {
        isMember: true,
        membershipType
      });

      return res.status(200).json({ success: true, message: 'Payment successful!' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment failed. Try again.' });
    }
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

exports.sellerPayment = async (req, res) => {
  const {
    sellerId, amount, billingPeriod, zipCode,
    nameOnCard, cardNumber, expireDate, cvv, membershipType
  } = req.body;

  if (!membershipType) {
    return res.status(400).json({ success: false, message: "Membership type is required" });
  }

  try {
    // ✅ Simulate Payment Success
    const paymentSuccess = Math.random() > 0.1;

    const payment = new Payment({
      sellerId,
      amount,
      billingPeriod,
      zipCode,
      nameOnCard,
      cardNumber,
      expireDate,
      cvv,
      status: paymentSuccess ? 'successful' : 'failed',
      type: "subscription",
    });

    await payment.save();

    if (paymentSuccess) {
      // ✅ Update Buyer Model
      await Seller.findByIdAndUpdate(sellerId, {
        isMember: true,
        membershipType
      });

      return res.status(200).json({ success: true, message: 'Payment successful!' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment failed. Try again.' });
    }
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

const mongoose = require("mongoose");
exports.transactionsUserId = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);

    let transactions = [];

    // ✅ Check buyerId first
    if (await Payment.exists({ buyerId: id })) {
      transactions = await Payment.find({ buyerId: id }).sort({ createdAt: -1 }).lean();
    } 
    // ✅ If buyerId doesn't exist, check sellerId
    else if (await Payment.exists({ sellerId: id })) {
      transactions = await Payment.find({ sellerId: id }).sort({ createdAt: -1 }).lean();
    }

    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: "No transactions found" });
    }

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};


const Vehicle = require("../models/Vehicle");
const crypto = require("crypto");

exports.createRentTransaction = async (req, res) => {
  try {
    const { buyerId, seller, vehicleId, amount,rentedFrom,rentedTo } = req.body;

    if (!buyerId || !seller|| !vehicleId || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Validate buyer and seller
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return res.status(404).json({ success: false, message: "Buyer not found" });

    const sellerUser = await Seller.findById( seller );
    if (!sellerUser) return res.status(404).json({ success: false, message: "Seller not found" });

    // ✅ Check if vehicle exists and is not rented
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    if (vehicle.isRented) {
      return res.status(400).json({ success: false, message: "Vehicle is already rented" });
    }

    // ✅ Mark vehicle as rented
    vehicle.isRented = true;
    vehicle.buyer = buyerId;
    vehicle.rentedFrom = rentedFrom;
    vehicle.rentedTo = rentedTo;

    await vehicle.save();

    // ✅ Generate unique transaction ID
    const transactionId = crypto.randomBytes(16).toString("hex");

    // ✅ Create transaction record
    const newTransaction = new Payment({
      buyerId,
      sellerId:seller,
      vehicleId,
      amount,
      status: "successful",
      type: "rental",
      description: `Vehicle ${vehicle.brand} ${vehicle.name} rented by ${buyer.firstName}`,
      transactionId,
    });

    await newTransaction.save();

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully!",
      transactionId,
    });
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.Alltransactions= async (req, res) => {
  try {
    

    const transactions = await Payment.find().sort({ createdAt: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: "No transactions found" });
    }

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};


