const express = require("express");
const session = require("express-session");
const passport = require("./config/passport"); // Import Passport
const connectDB = require("./config/db"); // Connect to DB
require("dotenv").config();
const path = require("path");

// Middlewares
const rfs = require("rotating-file-stream");
const fs = require("fs");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

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

// For testing error routes
app.get("/cause-error", (req, res, next) => {
  const error = new Error("This is a test error!");
  error.statusCode = 400;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorCode = err.statusCode || 500;
  const errorMessage = encodeURIComponent(err.message || "An unexpected error occurred");
  const errorStack = encodeURIComponent(err.stack || "");
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  res.redirect(`${FRONTEND_URL}/error?code=${errorCode}&message=${errorMessage}&stack=${errorStack}`);
});


app.use("/uploads", express.static("uploads")); // For file uploads

// Using body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log Directory
const logDirectory = path.join(__dirname, "log");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create rotating file stream
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory
});

morgan.token("logging", "User requested for :url and method is :method. It is executed in :response-time ms.");
app.use(morgan("logging", { stream: accessLogStream })); // Log to file

// Enable CORS (allow frontend to talk to backend)
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Use environment variable for frontend URL
    credentials: true, // Allow cookies and authentication headers
  })
);

// Connect to database
connectDB();

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Use `secure: true` in production with HTTPS
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Parse JSON requests
app.use(express.json());

// Define Routes
app.use("/", SignUpRoutes);
app.use("/", LoginRoutes);
app.use("/", GoogleRoutes);
app.use("/", AdminRoutes);
app.use("/", BuyerRoutes);
app.use("/", SellerRoutes);
app.use("/", PaymentRoutes);
app.use("/", UserRoutes);
app.use(AuthRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from frontend dist folder
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  // For any non-API route, serve the frontend's index.html file
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Backend and frontend server running on port ${PORT}`));
} else {
  // In development, the frontend should run on its own server (e.g., Vite or React dev server)
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

