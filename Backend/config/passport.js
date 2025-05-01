const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");
require("dotenv").config(); // ✅ Load environment variables
const jwt = require("jsonwebtoken");

// ✅ Ensure required environment variables exist
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env file");
}

// ✅ Google OAuth Strategy Configuration
const configureGoogleStrategy = (role, Model, callbackURL) => {
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      passReqToCallback: true, // Add this to access the request object
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails.length) {
          console.error(`❌ No email found in Google profile for ${role}`);
          return done(null, false, { message: "No email found in Google profile" });
        }

        const email = profile.emails[0].value.toLowerCase(); // ✅ Normalize email
        console.log(`🔹 Google OAuth for ${role}: ${email}`);

        // ✅ Check if a user already exists for this role
        let user = await Model.findOne({ email });

        if (!user) {
          // ✅ Create a new user for this role
          user = new Model({
            googleId: profile.id,
            firstName: profile.name?.givenName || " ",
            lastName: profile.name?.familyName || " ",
            email,
            profilePicture: profile.photos?.[0]?.value || "",
            role, // ✅ Ensure role is stored
          });

          await user.save();
          console.log(`✅ New ${role} account created for ${email}`);
        }

        // ✅ Create JWT Token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET, // Use your secret key
          { expiresIn: "7d" } // Set token expiration
        );

        console.log(`✅ Token created for ${email}: ${token.substring(0, 20)}...`);

        // ✅ Return user object with token and id
        return done(null, { 
          id: user.id, 
          email, 
          role, 
          token 
        });
      } catch (error) {
        console.error(`❌ Error authenticating ${role}:`, error);
        return done(error, false);
      }
    }
  );
};

// ✅ Separate strategies for Buyer and Seller
passport.use(
  "buyer-google",
  configureGoogleStrategy(
    "buyer",
    Buyer,
    process.env.GOOGLE_REDIRECT_URI_BUYER || "http://localhost:3000/auth/buyer/google/callback"
  )
);

passport.use(
  "seller-google",
  configureGoogleStrategy(
    "seller",
    Seller,
    process.env.GOOGLE_REDIRECT_URI_SELLER || "http://localhost:3000/auth/seller/google/callback"
  )
);

// ✅ Serialize and Deserialize Users
passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email, role: user.role }); // ✅ Store role in session
});

passport.deserializeUser(async (data, done) => {
  try {
    const Model = data.role === "buyer" ? Buyer : Seller;
    const user = await Model.findById(data.id);

    if (!user) {
      console.warn(`⚠️ User not found in DB: ${data.id} (${data.role})`);
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    console.error("❌ Error in deserialization:", error);
    done(error, null);
  }
});

module.exports = passport;