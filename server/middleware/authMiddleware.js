// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify user exists in MySQL/Postgres
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User no longer exists." });
      }

      req.user = user; // Attach the database user object
      return next(); // Success
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
};

const isTeacher = (req, res, next) => {
  // Check if req.user was set by 'protect'
  if (req.user && (req.user.role === "teacher" || req.user.role === "admin")) {
    return next();
  }
  console.log(
    `🚫 Permission Denied: ${req.user?.username || "Unknown"} attempted Lecturer access.`,
  );
  return res
    .status(403)
    .json({ message: "Insufficient permissions. Lecturer level required." });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Identity Rejected. Admin level required." });
};

module.exports = { protect, isTeacher, isAdmin };
