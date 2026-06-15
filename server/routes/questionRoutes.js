const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { protect, isTeacher } = require("../middleware/authMiddleware");

// 1. Student-safe route
router.get("/list-subjects", protect, questionController.getSubjectList);

// 2. CRITICAL: Global Protection for everything below
// This ensures 'req.user' is always set before 'isTeacher' runs
router.use(protect);

// 3. Lecturer/Admin routes
router.get("/", isTeacher, questionController.getAllQuestions);
router.post("/", isTeacher, questionController.addQuestion);
router.post("/predict", isTeacher, questionController.predictOnly);
router.post("/bulk-upload", isTeacher, questionController.bulkUpload);
router.delete("/:id", isTeacher, questionController.deleteQuestion);

module.exports = router;
