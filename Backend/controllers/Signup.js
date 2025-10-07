const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const User = require("../models/User"); // ✅ adjust this path as needed

// 🧠 Temporary in-memory OTP storage (consider Redis for production)
const otpStorage = {};

// ✅ Gmail Transporter Configuration (App Password required)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,               // ✅ SSL port for production
  secure: true,            // ✅ must be true for port 465
  auth: {
    user: process.env.GMAIL_USER,         // e.g. yourwheels123@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // generated app password
  },
  connectionTimeout: 10000, // 10 seconds timeout
});

// ✅ Optional SMTP connection check on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error.message);
  } else {
    console.log("✅ SMTP Server Ready to send emails");
  }
});

// 📩 Send OTP Controller
exports.sendotp = async (req, res) => {
  const startTs = new Date().toISOString();
  console.log(`[OTP] ${startTs} - Received send-otp request`);
  const { email } = req.body;
  if (!email) {
    console.warn("[OTP] Validation failed: missing email in request body");
    return res.status(400).json({ error: "Email is required" });
  }
  console.log(`[OTP] Using email: ${email}`);

  // Remove any old OTP for the same email
  delete otpStorage[email];
  console.log("[OTP] Cleared any existing OTP for this email (if present)");

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 mins expiry
  console.log(
    `[OTP] Generated OTP and stored with expiry at ${new Date(
      otpStorage[email].expiresAt
    ).toISOString()}`
  );
  if (process.env.NODE_ENV !== "production") {
    console.log(`[OTP] (dev) OTP value: ${otp}`);
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
  };
  console.log("[OTP] Mail options prepared (from, to, subject)");
  try {
    const tOpts = transporter && transporter.options ? transporter.options : {};
    console.log(
      `[OTP] Preparing to send via host=${tOpts.host || "?"} port=${
        tOpts.port || "?"
      } secure=${String(tOpts.secure)}`
    );

    await transporter.sendMail(mailOptions);
    console.log(
      `[OTP] Email dispatch success to ${email} at ${new Date().toISOString()}`
    );
    if (process.env.NODE_ENV !== "production") {
      console.log(`📨 (dev) OTP sent to ${email}: ${otp}`);
    }
    res.json({ success: true, msg: "OTP sent successfully!" });
  } catch (error) {
    const now = new Date().toISOString();
    const code = error && error.code ? error.code : "-";
    const respCode = error && error.responseCode ? error.responseCode : "-";
    const command = error && error.command ? error.command : "-";
    console.error(
      `❌ [OTP] ${now} - sendMail failed: message="${
        error && error.message ? error.message : error
      }" code=${code} responseCode=${respCode} command=${command}`
    );
    if (process.env.NODE_ENV !== "production") {
      console.error("[OTP] Full error:", error);
    }
    res.status(500).json({ error: "Failed to send OTP. Try again later." });
  }
};

// ✅ Verify OTP Controller
exports.verifyotp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email & OTP required" });

  const storedOtp = otpStorage[email];
  if (!storedOtp) {
    return res.status(400).json({ error: "No OTP found. Request a new one." });
  }

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStorage[email];
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }

  if (String(storedOtp.otp) === String(otp)) {
    delete otpStorage[email];
    return res.json({ success: true, msg: "OTP verified successfully!" });
  } else {
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }
};

// 🌐 Google Authentication
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if not found
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        password: "", // Google users don't need password
        role: "buyer",
        profilePicture: picture,
      });
      await user.save();
    } else {
      // If user exists, inform client
      return res.status(200).json({ token: null, user, message: "User already exists" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// 🧪 Optional route to test SMTP in production
exports.testSMTP = async (req, res) => {
  try {
    await transporter.verify();
    res.send("✅ SMTP connection OK");
  } catch (e) {
    res.status(500).send("❌ SMTP failed: " + e.message);
  }
};
