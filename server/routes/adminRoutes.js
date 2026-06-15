const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

/**
 * ADMINISTRATIVE CONTROL & INTELLIGENT MONITORING NODES
 * Hierarchy: ROOT ADMINISTRATOR ONLY
 */

// --- 1. GLOBAL SYSTEM ANALYTICS ---
// ACCESS: Fetches real-time MySQL/Postgres data mining for the Global Charts
router.get("/analytics", protect, isAdmin, adminController.getGlobalStats);

// --- 2. IDENTITY REGISTRY MANAGEMENT ---
// ACCESS: Retrieves every verified academic identity (Student & Teacher)
router.get("/users", protect, isAdmin, adminController.getAllUsers);

// --- 3. PERMISSION & ROLE MODULATION ---
// ACCESS: Allows the Admin to promote Students to Teachers or demote as required
router.put("/users/:id", protect, isAdmin, adminController.updateUserRole);

// --- 4. IDENTITY PURGE (SYSTEM SAFETY) ---
// ACCESS: Permanently removes a user account from the registry
router.delete("/users/:id", protect, isAdmin, adminController.deleteUser);

/**
 * NEW: ACADEMIC CATALOG NODES
 * These support the 'Manage Subjects' module in the Admin Sidebar
 */

// 5. SUBJECT REGISTRY: Add a new Learning Module to the catalog
// Logic handles unique subject naming and initial teacher assignment
router.post("/subjects", protect, isAdmin, adminController.createSubject);

// 6. SUBJECT PURGE: Permanently remove a module from the Course Discovery list
router.delete("/subjects/:id", protect, isAdmin, adminController.deleteSubject);

module.exports = router;
