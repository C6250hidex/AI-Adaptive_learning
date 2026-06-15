const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * 1. IDENTITY PROTECTION:
 * Decodes the JWT and verifies the user exists in the PostgreSQL Registry.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for the Bearer token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode the token using the system secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      /**
       * DATABASE SYNC:
       * We fetch the user from MySQL/Postgres to ensure the role is fresh.
       * If an Admin demotes a Teacher, this check catches it immediately.
       */
      const userRecord = await User.findByPk(decoded.id, {
        attributes: ["id", "role", "username", "email"], // Optimization: Fetch only needed fields
      });

      if (!userRecord) {
        console.log(
          "❌ Auth: Valid token but user record no longer exists in DB.",
        );
        return res
          .status(401)
          .json({ message: "Identity rejected. Account non-existent." });
      }

      // Attach the live database record to the request object
      req.user = userRecord;

      return next(); // Proceed to the next step
    } catch (error) {
      console.error("❌ Auth Error:", error.message);
      return res
        .status(401)
        .json({ message: "Session expired or corrupted. Please re-login." });
    }
  }

  // If no token was provided at all
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. Identity token missing." });
  }
};

/**
 * 2. LECTURER GATEKEEPER:
 * Intercepts requests that require Teacher or Admin clearance.
 */
const isTeacher = (req, res, next) => {
  if (req.user && (req.user.role === "teacher" || req.user.role === "admin")) {
    return next();
  }

  console.log(
    `🚫 Permission Denied: ${req.user?.username} attempted Lecturer access.`,
  );
  return res.status(403).json({
    message: "Authorization failed. Lecturer level clearance required.",
  });
};

/**
 * 3. ROOT ADMINISTRATOR GATEKEEPER:
 * Intercepts requests that require absolute system authority.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  console.log(
    `🚫 Security Alert: ${req.user?.username} attempted Administrative access.`,
  );
  return res.status(403).json({
    message: "Identity Rejected. Root Administrator clearance required.",
  });
};

module.exports = { protect, isTeacher, isAdmin };
