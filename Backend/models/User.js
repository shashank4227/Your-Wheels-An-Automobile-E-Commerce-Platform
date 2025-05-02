const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
      // ❌ DO NOT add `unique: true` here; we handle uniqueness via compound index
    },
    password: {
      type: String, // Required only for normal login
      select: false // ✅ Exclude password by default in queries for security
    },
    googleId: {
      type: String,
      sparse: true // ✅ Allows multiple null values (unique only when present)
    },
    profilePicture: { type: String },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true // ✅ Ensure role is always defined
    },
    verifiedEmail: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// ✅ Compound unique index for (email + role)
userSchema.index({ email: 1, role: 1 }, { unique: true });

// ✅ Index googleId separately for faster Google lookups
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// ✅ Index createdAt for pagination/sorting (if needed)
userSchema.index({ createdAt: -1 });

// ✅ Hash password before saving (only if changed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password during login
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// ✅ Remove old single-field index on `email` if it exists
mongoose.connection.once("open", async () => {
  try {
    const collection = mongoose.connection.db.collection("users");
    const indexes = await collection.indexes();
    const oldEmailIndex = indexes.find(index => index.name === "email_1");
    if (oldEmailIndex) {
      await collection.dropIndex("email_1");
      console.log("✅ Old unique index on email removed");
    }
  } catch (err) {
    console.error("Error dropping old index:", err.message);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;