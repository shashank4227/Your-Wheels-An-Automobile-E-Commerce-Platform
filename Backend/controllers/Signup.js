const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");



const jwt = require("jsonwebtoken");
require("dotenv").config();

const otpStorage = {}; // Temporary storage for OTPs


// Email transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // ✅ Port for TLS
  secure: false, // ✅ false for TLS
  auth: {
    user: "yourwheels123@gmail.com",
    pass: "fjbd wpjz xhqa ezoa", // ✅ Use App Password (2FA required)
  },
  tls: {
    rejectUnauthorized: false, // ✅ Allow self-signed certificates
  },
});

// Send OTP Controller
exports.sendotp = async (req, res) => {
  console.log("Sending OTP...");
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // ✅ Remove previous OTP if exists
  delete otpStorage[email];

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: "yourwheels123@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. This code will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ success: true, msg: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ error: "Failed to send OTP. Try again later." });
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
