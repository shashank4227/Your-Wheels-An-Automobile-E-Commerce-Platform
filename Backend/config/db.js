const mongoose = require("mongoose");
require("dotenv").config(); // Ensure you have a .env file with MONGO_URI

const connectDB = async () => {
  try {
    // Skip MongoDB connection if the environment is test
    if (process.env.NODE_ENV === "test") {
      console.log("🧪 Skipping MongoDB connection in test environment");
      return;
    }

    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI not defined in .env file");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
