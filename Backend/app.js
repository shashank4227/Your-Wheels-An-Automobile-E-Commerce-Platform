const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");
const connectDB = require("./config/db");
require("dotenv").config();
const path = require("path");

const rfs = require("rotating-file-stream");
const fs = require("fs");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

// Route imports
const SignUpRoutes = require("./routes/SignUpRoutes");
const GoogleRoutes = require("./routes/GoogleRoutes");
const LoginRoutes = require("./routes/LoginRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const BuyerRoutes = require("./routes/BuyerRoutes");
const SellerRoutes = require("./routes/SellerRoutes");
const AuthRoutes = require("./routes/authRoutes");
const PaymentRoutes = require("./routes/PaymentRoutes");
const UserRoutes = require("./routes/UserRoutes");

const app = express();

// Connect to DB
connectDB();

// Middleware setup
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging setup
const logDirectory = path.join(__dirname, "log");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});
morgan.token(
  "logging",
  "User requested for :url and method is :method. It is executed in :response-time ms."
);
app.use(morgan("logging", { stream: accessLogStream }));

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Session and Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", SignUpRoutes);
app.use("/", LoginRoutes);
app.use("/", GoogleRoutes);
app.use("/", AdminRoutes);
app.use("/", BuyerRoutes);
app.use("/", SellerRoutes);
app.use("/", PaymentRoutes);
app.use("/", UserRoutes);
app.use(AuthRoutes);

// Error simulation route
app.get("/cause-error", (req, res, next) => {
  const error = new Error("This is a test error!");
  error.statusCode = 400;
  next(error);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorCode = err.statusCode || 500;
  const errorMessage = encodeURIComponent(
    err.message || "An unexpected error occurred"
  );
  const errorStack = encodeURIComponent(err.stack || "");
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  res.redirect(
    `${FRONTEND_URL}/error?code=${errorCode}&message=${errorMessage}&stack=${errorStack}`
  );
});

// Serve frontend (optional here; usually moved to server.js)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
  });
}

module.exports = app;
