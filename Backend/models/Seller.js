const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sellerSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true},
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, select: false }, // ✅ Exclude password by default in queries
    googleId: { type: String, unique: true, sparse: true }, // ✅ Unique for Google sign-in
    profilePicture: { type: String }, // Store Google profile picture URL
    role: { type: String, default: "seller" },
    verifiedEmail: { type: Boolean, default: false },
    isMember: {
      type: Boolean,
      default: false
    },membershipType: { type: String, enum: ['Sell Access', 'Rent Access', 'Premium Access'], default: null }
  },
  { timestamps: true }
);

// ✅ Unique index for email + role (allows same email for different roles)
sellerSchema.index({ email: 1, role: 1 }, { unique: true });

// ✅ Hash password before saving (only for normal login)
sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password for login
sellerSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false; // Prevent errors if password is missing
  return bcrypt.compare(password, this.password);
};

// ✅ Generate JWT token
sellerSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;
