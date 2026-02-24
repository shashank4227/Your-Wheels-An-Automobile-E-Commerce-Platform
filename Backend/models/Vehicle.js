const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true // ✅ Index for fast seller lookups
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      index: true // ✅ Index for fast buyer lookups (if rented)
    },
    type: {
      type: String,
      enum: ["car", "bike", "suv", "truck", "van", "scooter"],
      required: true
    },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, index: true }, // ✅ Index for price-based queries
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    transmission: {
      type: String,
      enum: ["automatic", "manual", "semi-automatic", "cvt"],
      required: true
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "plug-in-hybrid", "cng"],
      required: true
    },
    color: { type: String, required: true },
    availableFrom: { type: Date, required: true },
    availableTo: { type: Date, required: true },
    imageUrl: { type: String, required: true },
    rentHours: { type: Number, required: true },

    // ✅ Rental status
    isRented: { type: Boolean, default: false, index: true }, // ✅ Index for rental status
    rentedFrom: { type: Date },
    rentedTo: { type: Date },

    // ✅ Ratings and reviews
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: [
      {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" },
        firstName: { type: String },
        comment: { type: String },
        rating: { type: Number, min: 0, max: 5 },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // ✅ Additional features
    features: [{ type: String }],
    phoneNumber: { type: String },
    email: { type: String }
  },
  { timestamps: true }
);

// ✅ Compound index for type + price (helpful for filtered searches)
VehicleSchema.index({ type: 1, price: 1 });

// ✅ Compound index for availability range (for date-based queries)
VehicleSchema.index({ availableFrom: 1, availableTo: 1 });

// ✅ Index on rating for sorting top-rated vehicles
VehicleSchema.index({ rating: -1 });

// ✅ Optional: If searching by brand often, add brand index
VehicleSchema.index({ brand: 1 });

const Vehicle = mongoose.model("Vehicle", VehicleSchema);
module.exports = Vehicle;