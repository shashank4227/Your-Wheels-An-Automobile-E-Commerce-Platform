const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    amount: {
      type: Number,
      required: true,
    },
    zipCode: {
      type: String,
    },
    nameOnCard: {
      type: String,
    },
    cardNumber: {
      type: String,
      select: false, // Hide sensitive info
    },
    expireDate: {
      type: String,
      select: false, // Hide sensitive info
    },
    cvv: {
      type: String,
      select: false, // Hide sensitive info
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["purchase", "rental", "membership", "subscription", "one-time"],
      required: true,
    },
    description: {
      type: String,
    },
    savings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
