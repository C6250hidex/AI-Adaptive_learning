const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { protect, isTeacher } = require("../middleware/authMiddleware");

router.get("/list-subjects", protect, questionController.getSubjectList);

router.use(isTeacher);

router.post("/", protect, questionController.addQuestion);

router.get("/", protect, questionController.getAllQuestions);

router.post("/predict", protect, questionController.predictOnly);

router.post("/bulk-upload", protect, questionController.bulkUpload);

router.delete("/:id", protect, questionController.deleteQuestion);

module.exports = router;
