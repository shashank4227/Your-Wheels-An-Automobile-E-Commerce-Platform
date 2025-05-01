const passport = require("passport");
const Buyer = require("../models/Buyer");

exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    async (err, user) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login");

      req.login(user, async (err) => {
        if (err) return next(err);

        try {
          const existingUser = await Buyer.findOne({ email: user.email });

          if (existingUser) {
            const token = jwt.sign(
              {
                userId: existingUser._id,
                email: existingUser.email,
                role: existingUser.role,
              },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );

            // ✅ Direct redirection based on role
            const frontendURL = process.env.FRONTEND_URL;

            if (existingUser.role === "buyer") {
              return res.redirect(
                `${frontendURL}/buyer-dashboard/${existingUser._id}?token=${token}`
              );
            } else if (existingUser.role === "seller") {
              return res.redirect(
                `${frontendURL}/seller-dashboard/${existingUser._id}?token=${token}`
              );
            }
          }

          // ✅ No user found → Ask for role selection
          return res.redirect(
            `${process.env.FRONTEND_URL}/choose-role?email=${user.email}`
          );
          
        } catch (error) {
          console.error("❌ Error in Google callback:", error);
          return res.status(500).json({ success: false, msg: "Server error" });
        }
      });
    }
  )(req, res, next);
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send(err);
    res.redirect("/");
  });
};
