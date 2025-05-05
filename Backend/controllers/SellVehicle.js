const SellVehicle = require("../models/SellVehicle");
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
// ✅ Add a new vehicle for sale
exports.addVehicle = async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("User object:", req.user);

    if (!req.user || !req.user.userId) {
      console.warn("❌ Authentication failed - user object missing");
      return res.status(401).json({
        success: false,
        message: "Authentication failed - user object missing",
      });
    }

    const sellerId = req.user.userId;
    console.log("✅ Seller ID:", sellerId);

    // ✅ Extract and validate required fields
    const {
      type,
      brand,
      name,
      price,
      year,
      mileage,
      transmission,
      fuelType,
      color,
      imageUrl,
      totalUnits = 1,
      location = "",
      condition = "excellent",
      features = "",
      securityDeposit = 0,
      description = "",
      email,
      phoneNumber,
    } = req.body;

    if (
      !type ||
      !brand ||
      !name ||
      !price ||
      !year ||
      !mileage ||
      !transmission ||
      !fuelType ||
      !color ||
      !imageUrl
    ) {
      console.warn("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // ✅ Create a new vehicle
    const newVehicle = new SellVehicle({
      sellerId, // ✅ Correct field reference
      type,
      brand,
      name,
      price: Number(price),
      year: Number(year),
      mileage: Number(mileage),
      transmission,
      fuelType,
      color,
      imageUrl,
      totalUnits: Number(totalUnits),
      location,
      condition,
      features,
      securityDeposit: Number(securityDeposit),
      description,
      phoneNumber,
      email,
    });

    console.log("✅ New vehicle to save:", newVehicle);

    // ✅ Save to database
    const savedVehicle = await newVehicle.save();
    console.log("✅ Saved vehicle:", savedVehicle);

    res.status(201).json({
      success: true,
      message: "Vehicle listed successfully",
      vehicle: savedVehicle,
    });
  } catch (error) {
    console.error("❌ Error adding vehicle:", error.message);
    res.status(500).json({
      success: false,
      message: `Failed to add vehicle: ${error.message}`,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ✅ Get all vehicles for sale
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await SellVehicle.find().populate(
      "sellerId",
      "name email"
    );
    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles",
      error: error.message,
    });
  }
};

// ✅ Get a specific vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }
    console.log("✅ Vehicle ID Received:", id);

    const vehicle = await SellVehicle.findById(id)

    console.log("✅ Vehicle fetched:", vehicle);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error("❌ Error fetching vehicle:", error);  // This will give more context in case of failure
    res.status(500).json({
      success: false,
      message: "Error fetching vehicle",
      error: error.message, // Including the error message for debugging
    });
  }
};



exports.getRentVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "seller",
      "phoneNumber email"
    );

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    res.status(200).json({
      success: true,
      vehicle: {
        ...vehicle._doc,
        sellerId: vehicle.seller._id,
        phoneNumber: vehicle.seller.phoneNumber,
        email: vehicle.seller.email,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update a vehicle listing
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const updatedVehicle = await SellVehicle.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("❌ Error updating vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Error updating vehicle",
      error: error.message,
    });
  }
};

// ✅ Delete a vehicle listing
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const deletedVehicle = await SellVehicle.findByIdAndDelete(id);
    if (!deletedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting vehicle",
      error: error.message,
    });
  }
};

// ✅ Get vehicles listed by a specific seller
exports.getSellerVehiclesForSale = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    console.log("✅ Seller ID Received:", id);

    const vehicles = await SellVehicle.find({
      sellerId: id,
      isSold: false,
    })

    console.log("✅ Vehicles for seller:", vehicles);
  

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching seller vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles for the seller",
      error: error.message,
    });
  }
};
exports.getSoldVehicles = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    console.log("✅ Seller ID Received:", id);

    const vehicles = await SellVehicle.find({
      sellerId: id,
      isSold: true,
    }).populate("sellerId", "name email");

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching seller vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles for the seller",
      error: error.message,
    });
  }
};
