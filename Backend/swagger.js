// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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
        url: "http://localhost:3000", // Update if hosted elsewhere
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
