const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    type: {
      type: String,
      enum: ["car", "bike", "suv", "truck", "van", "scooter"],
      required: true,
    },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    transmission: {
      type: String,
      enum: ["automatic", "manual", "semi-automatic", "cvt"],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "plug-in-hybrid", "cng"],
      required: true,
    },
    color: { type: String, required: true },
    availableFrom: { type: Date, required: true },
    availableTo: { type: Date, required: true },
    imageUrl: { type: String, required: true },
    rentHours: { type: Number, required: true },

    // ✅ New Fields
    isRented: { type: Boolean, default: false }, // ✅ Track if vehicle is currently rented
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" }, // ✅ Link to buyer if rented
    rentedFrom: { type: Date }, // ✅ Start date of rental
    rentedTo: { type: Date }, // ✅ End date of rental

    // ✅ Ratings and Reviews
    rating: { type: Number, min: 0, max: 5, default: 0 }, // ✅ Average rating
    reviews: [
      {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" }, // ✅ Link to buyer
        firstName:{type:String},
        comment: { type: String },
        rating: { type: Number, min: 0, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ Additional Features
    features: [{ type: String }], // ✅ Additional vehicle features
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
