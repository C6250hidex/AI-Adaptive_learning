const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Import the full controller object
const { protect } = require("../middleware/authMiddleware");

/**
 * IDENTITY & ACCESS MANAGEMENT ROUTES
 */

// 1. PUBLIC: Register a new Student or Teacher identity
router.post("/register", authController.register);

// 2. PUBLIC: Authenticate credentials and issue a 24h JWT Token
router.post("/login", authController.login);

router.put("/change-password", protect, authController.changePassword);

// 3. PROTECTED: Live Database Identity Sync
// This is called by the React AuthContext on every refresh to verify the MySQL session
router.get("/me", protect, authController.getMe);

module.exports = router;
