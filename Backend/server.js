// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { initializeRedis, getRedisClient } = require("./config/redis");
const setupSwaggerDocs = require("./swagger");
const app = require("./app");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  let server;

  try {
    // ✅ Initialize Redis before anything else
    await initializeRedis();
    console.log("✅ Redis initialized successfully");

    // ✅ Setup Swagger and other middlewares
    setupSwaggerDocs(app);

    // ✅ Start Express server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
      if (process.env.NODE_ENV === "production") {
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

        try {
          const redisClient = getRedisClient();
          if (redisClient && !redisClient.isMock) {
            await redisClient.quit();
            console.log("✅ Redis connection closed.");
          }
        } catch (err) {
          console.error("❌ Error closing Redis connection:", err);
        }

        process.exit(0);
      });

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

  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
