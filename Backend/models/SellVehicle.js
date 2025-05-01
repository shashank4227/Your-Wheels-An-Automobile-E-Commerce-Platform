const mongoose = require('mongoose');

const sellVehicleSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', default: null }, // Buyer ID when sold
  type: { type: String, required: true },
  brand: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  transmission: { type: String, required: true },
  fuelType: { type: String, required: true },
  color: { type: String, required: true },
  totalUnits: { type: Number, required: true },
  location: { type: String, required: true },
  condition: { type: String, required: true },
  features: { type: String },
  insuranceRequired: { type: Boolean, default: true },
  securityDeposit: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isSold: { type: Boolean, default: false }, // New field to track sale status
  purchaseDate: { type: Date, default: null }, // Date of purchase
  paymentStatus: { type: Boolean, default: false }, // Payment completed or not
  transactionId: { type: String, default: null }, // Store transaction ID
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('SellVehicle', sellVehicleSchema);
