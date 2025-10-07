// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const setupSwaggerDocs = require("./swagger");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const MONGO_URI = process.env.MONGO_URI;

// ✅ Ensure MongoDB URI is defined
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

const startServer = async () => {
  let server;

  try {
    // ✅ Connect to MongoDB before starting the server
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // ✅ Setup Swagger and middlewares after DB is connected
    setupSwaggerDocs(app);

    // ✅ Start Express server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      if (NODE_ENV === "production") {
        console.log("🌐 Frontend is being served from the backend");
      }
    });

    // ✅ Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        console.log("🛑 Server closed.");

        try {
          await mongoose.connection.close();
          console.log("✅ MongoDB connection closed.");
        } catch (err) {
          console.error("❌ Error closing MongoDB connection:", err);
        }

        process.exit(0);
      });

      // Force shutdown if not closed within 5 sec
      setTimeout(() => {
        console.error("⏱️ Could not close connections in time, forcing shutdown");
        process.exit(1);
      }, 5000);
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("unhandledRejection", (err) => {
      console.error("💥 UNHANDLED REJECTION! Shutting down...");
      console.error(err);
      if (server) server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
      console.error(err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
