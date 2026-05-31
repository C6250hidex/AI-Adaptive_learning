// server/controllers/examController.js
const { ExamResult, User, Question, sequelize } = require("../models");
const { Op, Sequelize } = require("sequelize");

// A. FETCH ADAPTIVE QUESTION
exports.getAdaptiveQuestion = async (req, res) => {
  try {
    const { subject, attemptedIds, lastCorrect, currentDifficulty } = req.body;
    const excludedIds =
      attemptedIds && attemptedIds.length > 0 ? attemptedIds : [0];

    let targetDifficulty = currentDifficulty || "Medium";
    if (lastCorrect === true) {
      if (targetDifficulty === "Easy") targetDifficulty = "Medium";
      else if (targetDifficulty === "Medium") targetDifficulty = "Hard";
    } else if (lastCorrect === false) {
      if (targetDifficulty === "Hard") targetDifficulty = "Medium";
      else if (targetDifficulty === "Medium") targetDifficulty = "Easy";
    }

    let whereClause = { id: { [Op.notIn]: excludedIds } };
    if (subject) whereClause.subject = subject;

    let question = await Question.findOne({
      where: { ...whereClause, difficulty: targetDifficulty },
      order: [Sequelize.literal("RAND()")],
    });

    if (!question) {
      question = await Question.findOne({
        where: whereClause,
        order: [Sequelize.literal("RAND()")],
      });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.saveResult = async (req, res) => {
  try {
    // 1. Log incoming data to terminal
    console.log("📥 ATTEMPTING TO SAVE RESULT FOR:", req.user.username);
    console.log("📊 DATA RECEIVED:", req.body);

    const { score, totalQuestions, accuracy, subject } = req.body;

    // 2. Create record in MySQL
    const result = await ExamResult.create({
      score: parseInt(score),
      totalQuestions: parseInt(totalQuestions),
      accuracy: parseFloat(accuracy),
      subject: subject || "General Assessment",
      userId: req.user.id, // Linked via Auth Middleware
    });

    // 3. Log success
    console.log("✅ SUCCESS: Exam record indexed in MySQL. ID:", result.id);

    res.status(201).json({ message: "Performance recorded", data: result });
  } catch (error) {
    console.error("❌ DATABASE COMMIT FAILED:", error.message);
    res.status(500).json({ error: "Failed to index results" });
  }
};

// C. GET STUDENT HISTORY (For the Chart)
exports.getStudentHistory = async (req, res) => {
  try {
    const history = await ExamResult.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    console.log(
      `📊 PULLING HISTORY FOR ${req.user.username}: ${history.length} records`,
    );
    res.json(history);
  } catch (error) {
    res.status(500).json([]);
  }
};

// D. GET ALL HISTORY (For Teachers)
exports.getAllHistory = async (req, res) => {
  try {
    const history = await ExamResult.findAll({
      include: [{ model: User, as: "user", attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(history);
  } catch (error) {
    res.status(500).json([]);
  }
};

// E. GET LEADERBOARD (Fixes the 500 error)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ExamResult.findAll({
      attributes: [
        "userId",
        [sequelize.fn("AVG", sequelize.col("accuracy")), "avgAccuracy"],
        [sequelize.fn("COUNT", sequelize.col("ExamResult.id")), "examsCount"],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username"],
          where: { role: "student" },
        },
      ],
      group: ["userId", "user.id", "user.username"],
      order: [[sequelize.literal("avgAccuracy"), "DESC"]],
      limit: 5,
    });
    res.json(leaderboard || []);
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error.message);
    res.status(500).json([]);
  }
};
