const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sellerSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, select: false }, // ✅ Exclude password by default
    googleId: { type: String, unique: true, sparse: true }, // ✅ Unique + sparse for Google
    profilePicture: { type: String },
    role: { type: String, default: "seller" },
    verifiedEmail: { type: Boolean, default: false },
    isMember: { type: Boolean, default: false },
    membershipType: {
      type: String,
      enum: ["Sell Access", "Rent Access", "Premium Access"],
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Indexes for optimization (no duplicates)

// Compound unique index for email + role
sellerSchema.index({ email: 1, role: 1 }, { unique: true });

// Index on isMember if filtering by membership status
sellerSchema.index({ isMember: 1 });

// Index on membershipType if querying or grouping by type
sellerSchema.index({ membershipType: 1 });

// Index on createdAt for sorting or pagination by newest
sellerSchema.index({ createdAt: -1 });

// ✅ Hash password before saving (only if modified)
sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password method
sellerSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
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
