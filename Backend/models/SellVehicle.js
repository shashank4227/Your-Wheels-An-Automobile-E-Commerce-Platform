const mongoose = require('mongoose');

const sellVehicleSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', default: null },
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
  isSold: { type: Boolean, default: false },
  purchaseDate: { type: Date, default: null },
  paymentStatus: { type: Boolean, default: false },
  transactionId: { type: String, default: null },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

// ✅ Indexes for optimization

// Fast lookup of unsold vehicles (common frontend query)
sellVehicleSchema.index({ isSold: 1 });

// Index sellerId for filtering vehicles by seller
sellVehicleSchema.index({ sellerId: 1 });

// Index buyerId for filtering sold vehicles by buyer
sellVehicleSchema.index({ buyerId: 1 });

// Index price for sorting/filtering by price ranges
sellVehicleSchema.index({ price: 1 });

// Index brand and type if you offer brand/type filtering
sellVehicleSchema.index({ brand: 1 });
sellVehicleSchema.index({ type: 1 });

// Index createdAt for pagination/sorting by newest
sellVehicleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SellVehicle', sellVehicleSchema);