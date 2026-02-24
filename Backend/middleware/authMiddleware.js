const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID missing in token" });
    }
    

    // ✅ Convert ObjectId to String before comparing
    if (req.params.id && decoded.userId.toString() !== req.params.id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: User ID mismatch" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};
