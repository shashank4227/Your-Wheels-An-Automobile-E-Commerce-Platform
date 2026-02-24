// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "YourWheels API Documentation",
      version: "1.0.0",
      description: "API docs for Admin, Buyer, Seller, Auth routes",
    },
    servers: [
      {
        url: BACKEND_URL, // Dynamically set based on environment variable
      },
    ],
  },
  apis: ["./routes/*.js"], // Adjust path to where your route files are
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwaggerDocs;
