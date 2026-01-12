const Vehicle = require("../models/Vehicle");
const Seller = require("../models/Seller");

// ✅ Add Vehicle
exports.addVehicle = async (req, res) => {
    try {
      // ✅ Ensure user is authenticated before proceeding
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
      }
  
      const { 
        type, brand, name, price, year, mileage, 
        transmission, fuelType, color, availableFrom, availableTo, imageUrl, rentHours,phoneNumber,email
      } = req.body;
  
      const sellerId = req.user.userId; // ✅ Extract from JWT token
  
      // ✅ Validate required fields
      if (!imageUrl) {
        return res.status(400).json({ success: false, message: "Vehicle image is required" });
      }
  
      // ✅ Create a new vehicle with correct seller assignment
      const newVehicle = new Vehicle({
        seller: req.user.userId, // ✅ Correct seller assignment
        type,
        brand,
        name,
        price,
        year,
        mileage,
        transmission,
        fuelType,
        color,
        availableFrom,
        availableTo,
        imageUrl,
        rentHours,
        isRented: false, // ✅ Default to not rented
        phoneNumber,
        email,
      });
  
      await newVehicle.save();
      res.status(201).json({ success: true, message: "Vehicle listed successfully", vehicle: newVehicle });
    } catch (error) {
      console.error("Error adding vehicle:", error.message || error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

// ✅ Get All Vehicles of a Seller
exports.getSellerVehicles = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    if (!sellerId) {
        return res.status(401).json({ success: false, message: "Unauthorized: Seller ID missing" });
      }
    const vehicles = await Vehicle.find({ seller: sellerId ,isRented:false});

    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const Buyer = require("../models/Buyer");

exports.getVehiclesOnRent = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Seller ID missing" });
    }

    // Fetch vehicles with buyer details populated
    const vehicles = await Vehicle.find({ seller: sellerId, isRented: true }).populate("buyer");

    // Extract buyer details separately
    const buyers = vehicles.map(vehicle => vehicle.buyer);
    console.log(buyers);

    res.status(200).json({ success: true, vehicles, buyers });
  } catch (error) {
    console.error("Error retrieving vehicles:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get a Single Vehicle
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete a Vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    await vehicle.deleteOne();
    res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
