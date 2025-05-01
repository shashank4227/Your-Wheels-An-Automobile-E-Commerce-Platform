const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
     
    },
    lastName: {
      type: String,
      trim: true,
     
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String, // Required only for normal login
    },
    googleId: {
      type: String,
      sparse: true, // ✅ Allows multiple null values for Google sign-in
    },
    profilePicture: {
      type: String, // Store Google profile picture URL
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Create a compound unique index for email + role (allows same email for different roles)
userSchema.index({ email: 1, role: 1 }, { unique: true });

// ✅ Hash password before saving (only for normal login)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare password for login
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// ✅ Remove old index after successful connection
mongoose.connection.once("open", async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.some(col => col.name === "users")) {
      const indexes = await mongoose.connection.db.collection("users").indexes();
      if (indexes.some(index => index.name === "email_1")) {
        await mongoose.connection.db.collection("users").dropIndex("email_1");
        console.log("✅ Old unique index on email removed");
      }
    }
  } catch (err) {
    console.error("Error dropping old index:", err.message);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
