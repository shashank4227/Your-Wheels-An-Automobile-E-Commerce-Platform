const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const User = require("../models/User"); // ✅ adjust this path as needed

// 🧠 Temporary in-memory OTP storage (consider Redis for production)
const otpStorage = {};

// HTTP email provider (Resend) config — avoids outbound SMTP restrictions
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || process.env.GMAIL_USER || "";

// ✅ Gmail Transporter Configuration (App Password required)
// Prefer STARTTLS on 587 first; many hosts block port 465.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,            // STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,         // e.g. yourwheels123@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // generated app password
  },
  family: 4,                // prefer IPv4
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// ✅ Optional SMTP connection check on server start (skip if using HTTP provider)
if (!RESEND_API_KEY) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP Connection Failed:", error.message);
    } else {
      console.log("✅ SMTP Server Ready to send emails");
    }
  });
} else {
  console.log("✉️  Using HTTP email provider (Resend) — skipping SMTP verification");
}

// Helper to detect timeout-style errors
function isTimeoutError(err) {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("etimedout") ||
    msg.includes("connection timeout")
  );
}

// Send with fallback: try 587 STARTTLS → 465 SSL → 2525 (if supported)
async function sendEmailWithFallback(mailOptions) {
  // If HTTP provider is configured, try that first to bypass blocked SMTP egress
  if (RESEND_API_KEY) {
    try {
      console.log("[OTP] Attempting HTTP email via Resend API");
      await sendEmailViaResend(mailOptions);
      return;
    } catch (httpErr) {
      console.warn(
        `[OTP] Resend API failed: ${httpErr && httpErr.message ? httpErr.message : httpErr}. Falling back to SMTP...`
      );
      // proceed to SMTP fallback chain
    }
  }

  try {
    return await transporter.sendMail(mailOptions);
  } catch (primaryErr) {
    if (!isTimeoutError(primaryErr)) throw primaryErr;
    console.warn("[OTP] Primary SMTP (587 STARTTLS) timed out. Trying 465 SSL...");

    const t465 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    try {
      return await t465.sendMail(mailOptions);
    } catch (sslErr) {
      if (!isTimeoutError(sslErr)) throw sslErr;
      console.warn("[OTP] 465 SSL also timed out. Trying port 2525 if open...");

      const t2525 = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 2525, // Note: Gmail may not accept 2525; works for providers like SendGrid/Mailgun
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      return await t2525.sendMail(mailOptions);
    }
  }
}

// Send email using Resend HTTP API
async function sendEmailViaResend(mailOptions) {
  const { from, to, subject, text } = mailOptions;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
  const apiUrl = "https://api.resend.com/emails";

  const payload = {
    from: RESEND_FROM || from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error: ${res.status} ${body}`);
  }
}

// 📩 Send OTP Controller (removed)
// exports.sendotp = async (req, res) => { /* removed by request */ };

// ✅ Verify OTP Controller (removed)
// exports.verifyotp = (req, res) => { /* removed by request */ };

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
