const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

/**
 * INTELLIGENT MONITORING ROUTES
 * Access: Root Admin Only
 */

// 1. GLOBAL ANALYTICS: Fetches MySQL aggregations for the charts
router.get("/analytics", protect, isAdmin, adminController.getGlobalStats);

// 2. USER REGISTRY: Fetches all registered Students and Teachers
router.get("/users", protect, isAdmin, adminController.getAllUsers);

// 3. PERMISSION CONTROL: Allows Admin to Promote/Demote users (Student <-> Teacher)
router.put("/users/:id", protect, isAdmin, adminController.updateUserRole);

// 4. IDENTITY PURGE: Allows Admin to permanently delete a user account
router.delete("/users/:id", protect, isAdmin, adminController.deleteUser);

module.exports = router;
