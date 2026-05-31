const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { protect, isTeacher } = require("../middleware/authMiddleware");

router.post("/", protect, isTeacher, questionController.addQuestion);
router.get("/", protect, isTeacher, questionController.getAllQuestions);
router.post("/predict", protect, isTeacher, questionController.predictOnly);
router.post("/bulk-upload", protect, isTeacher, questionController.bulkUpload);
router.delete("/:id", protect, isTeacher, questionController.deleteQuestion);
router.get("/list-subjects", protect, questionController.getSubjectList);

module.exports = router;
