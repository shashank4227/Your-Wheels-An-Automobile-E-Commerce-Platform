const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");



const jwt = require("jsonwebtoken");
require("dotenv").config();

const otpStorage = {}; // Temporary storage for OTPs


// Email transporter setup (configurable via environment variables)
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || (process.env.NODE_ENV === "production" ? 465 : 587));
const SMTP_SECURE = process.env.SMTP_SECURE
  ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
  : SMTP_PORT === 465; // secure on 465, STARTTLS on 587
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  tls: SMTP_SECURE
    ? undefined
    : {
        // allow STARTTLS; don't reject self-signed in non-production only
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
});

// Optional: verify transporter on startup (non-blocking)
transporter.verify((err) => {
  if (err) {
    console.error("Email transporter verification failed:", err.message);
  } else {
    console.log("Email transporter ready (", SMTP_HOST, ":", SMTP_PORT, ")");
  }
});

// Send OTP Controller
exports.sendotp = async (req, res) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Sending OTP...");
  }
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // ✅ Remove previous OTP if exists
  delete otpStorage[email];

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: SMTP_FROM || "no-reply@yourwheels.app",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. This code will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production") {
      console.log(`OTP sent to ${email}: ${otp}`);
    } else {
      console.log(`OTP email dispatched to ${email}`);
    }
    res.json({ success: true, msg: "OTP sent successfully!" });
  } catch (error) {
    const isAuthError =
      error && (String(error.message).includes("Invalid login") || String(error.message).includes("authentication"));
    const responseMessage = isAuthError
      ? "Email service authentication failed. Please contact support."
      : "Failed to send OTP. Try again later.";

    console.error("Error sending OTP:", error && error.message ? error.message : error);
    res.status(500).json({ error: responseMessage });
  }
};

// Verify OTP Controller
exports.verifyotp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email & OTP required" });

  const storedOtp = otpStorage[email];

  if (!storedOtp) {
    return res.status(400).json({ error: "No OTP found. Request a new one." });
  }

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStorage[email];
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }

  if (storedOtp.otp == otp) {
    delete otpStorage[email];
    return res.json({ success: true, msg: "OTP verified successfully!" });
  } else {
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }
};

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleAuth = async (req, res) => {
  try {
    const { googleToken } = req.body;

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        password: "", // No password for Google-auth users
        role: "buyer",
        profilePicture: picture,
      });
      await user.save();
    } else {
      // If user already exists, send a specific message
      return res.status(200).json({ token: null, user, message: "User already exists" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
