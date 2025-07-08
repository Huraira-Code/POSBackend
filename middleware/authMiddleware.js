const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = (requiredRole) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
// console.log("Authenticated:", decoded);

      // Role check from token first
 //   Support both single role and array of roles
if (
  requiredRole &&
  !(
    (Array.isArray(requiredRole) && requiredRole.includes(decoded.role)) ||
    decoded.role === requiredRole
  )
) {
  // console.warn("Access denied. Role required:", requiredRole, "but got:", decoded.role);
  return res.status(403).json({ message: "Access denied" });
}



      // Attach base info from token
      req.user = { ...decoded };

      // Optional: fetch user from DB only if additional info is needed
      if (requiredRole === "user") {
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Only add `admin` field — don't overwrite token contents
        req.user.admin = user.admin || null;
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token", error: err.message });
    }
  };
};

module.exports = { verifyToken };
