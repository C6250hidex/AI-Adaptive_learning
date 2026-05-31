// // server/middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// /**
//  * IDENTITY PROTECTION:
//  * Ensures the user is logged in and their session is valid in MySQL.
//  */
// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       // 1. Decode and verify the JWT
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // 2. DATABASE VERIFICATION: (The Senior Step)
//       // Check if user still exists in MySQL and get fresh role data
//       const userRecord = await User.findByPk(decoded.id, {
//         attributes: ["id", "role", "username"], // Pull fresh info
//       });

//       if (!userRecord) {
//         console.log("❌ Token valid but user no longer exists in database");
//         return res
//           .status(401)
//           .json({ message: "User registry entry not found." });
//       }

//       // 3. Attach fresh user data to the request object
//       req.user = userRecord;

//       console.log(`✅ Verified: ${userRecord.username} [${userRecord.role}]`);
//       next();
//     } catch (error) {
//       console.log("❌ Authentication Node Error:", error.message);
//       res
//         .status(401)
//         .json({ message: "Session expired. Please re-authenticate." });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: "Access denied. Identity token missing." });
//   }
// };

// /**
//  * LECTURER GATEKEEPER:
//  * Allows Teachers and Admins to pass.
//  */
// const isTeacher = (req, res, next) => {
//   if (req.user && (req.user.role === "teacher" || req.user.role === "admin")) {
//     next();
//   } else {
//     console.log(
//       `🚫 Security Breach: Unauthorized ${req.user?.role} attempted Lecturer access`,
//     );
//     res
//       .status(403)
//       .json({ message: "Insufficient permissions. Lecturer level required." });
//   }
// };

// /**
//  * ROOT ADMINISTRATOR GATEKEEPER:
//  * Only allows strict Admin access.
//  */
// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     console.log(
//       `🚫 Security Breach: Unauthorized ${req.user?.role} attempted ROOT access`,
//     );
//     res
//       .status(403)
//       .json({
//         message: "Identity Rejected. Administrative clearance required.",
//       });
//   }
// };

// module.exports = { protect, isTeacher, isAdmin };

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

      // Verify user exists in MySQL
      const userRecord = await User.findByPk(decoded.id);

      if (!userRecord) {
        return res
          .status(401)
          .json({ message: "Identity purged from database." });
      }

      req.user = userRecord; // Attach the full Sequelize instance
      return next(); // CRITICAL: Added return here
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Session expired. Re-login required." });
    }
  }

  // If no token was found in the header logic above
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
};

const isTeacher = (req, res, next) => {
  if (req.user && (req.user.role === "teacher" || req.user.role === "admin")) {
    return next();
  }
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
