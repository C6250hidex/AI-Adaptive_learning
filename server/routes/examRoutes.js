const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { protect, isTeacher, isAdmin } = require("../middleware/authMiddleware");

router.post("/next-question", protect, examController.getAdaptiveQuestion);

router.post("/save-result", protect, examController.saveResult);

router.get("/history", protect, examController.getStudentHistory);

router.get("/history/all", protect, isTeacher, examController.getAllHistory);

router.get("/leaderboard", protect, examController.getLeaderboard);

module.exports = router;
