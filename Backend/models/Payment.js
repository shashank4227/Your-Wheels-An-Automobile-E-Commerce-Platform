const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true, // 🔍 index added
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true, // 🔍 index added
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true, // 🔍 index added
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true, // 🔍 index added
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
      select: false, // 🔒 sensitive
    },
    expireDate: {
      type: String,
      select: false, // 🔒 sensitive
    },
    cvv: {
      type: String,
      select: false, // 🔒 sensitive
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
      index: true, // 🔍 index added
    },
    type: {
      type: String,
      enum: ["purchase", "rental", "membership", "subscription", "one-time"],
      required: true,
      index: true, // 🔍 index added
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

// Optional: Compound index (e.g., for checking duplicates or fast lookup)
paymentSchema.index({ userId: 1, vehicleId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
