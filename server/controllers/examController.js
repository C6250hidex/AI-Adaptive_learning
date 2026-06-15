const { ExamResult, User, Question, sequelize } = require("../models");
const { Op, Sequelize } = require("sequelize");

// 1. ADAPTIVE LOGIC: Selecting the next challenge
exports.getAdaptiveQuestion = async (req, res) => {
  try {
    const { subject, attemptedIds, lastCorrect, currentDifficulty } = req.body;
    const excludedIds =
      attemptedIds && attemptedIds.length > 0 ? attemptedIds : [0];

    // Determine target difficulty
    let targetDifficulty = currentDifficulty || "Medium";
    if (lastCorrect === true) {
      if (targetDifficulty === "Easy") targetDifficulty = "Medium";
      else if (targetDifficulty === "Medium") targetDifficulty = "Hard";
    } else if (lastCorrect === false) {
      if (targetDifficulty === "Hard") targetDifficulty = "Medium";
      else if (targetDifficulty === "Medium") targetDifficulty = "Easy";
    }

    // Logic: Subject-Specific vs. General Session
    // If frontend sends "General Assessment", we treat subject as null to search all categories
    const isGeneral = !subject || subject === "General Assessment";
    let whereClause = { id: { [Op.notIn]: excludedIds } };
    if (!isGeneral) whereClause.subject = subject;

    console.log(
      `🤖 AI Engine: Picking ${targetDifficulty} question for ${subject || "Global Track"}`,
    );

    // Query 1: Try to match Difficulty
    let question = await Question.findOne({
      where: { ...whereClause, difficulty: targetDifficulty },
      order: [Sequelize.literal("RANDOM()")], // Correct Postgres Syntax
    });

    // Query 2: Fallback to any difficulty in same subject (for small banks)
    if (!question && !isGeneral) {
      question = await Question.findOne({
        where: { subject: subject, id: { [Op.notIn]: excludedIds } },
        order: [Sequelize.literal("RANDOM()")],
      });
    }

    // Query 3: Global Fallback (Ensures the exam never crashes)
    if (!question) {
      question = await Question.findOne({
        where: { id: { [Op.notIn]: excludedIds } },
        order: [Sequelize.literal("RANDOM()")],
      });
    }

    res.json(question);
  } catch (error) {
    console.error("❌ AI ENGINE ERROR:", error.message);
    res.status(500).json({ error: "Adaptive Logic Failure" });
  }
};

// 2. DATA PERSISTENCE: Committing results to MySQL/Postgres
exports.saveResult = async (req, res) => {
  try {
    const { score, totalQuestions, accuracy, subject } = req.body;

    // A. Create the result record
    const result = await ExamResult.create({
      score: parseInt(score),
      totalQuestions: parseInt(totalQuestions),
      accuracy: parseFloat(accuracy),
      subject: subject || "General Assessment",
      userId: req.user.id,
    });

    // B. PERSISTENT ADAPTATION: Update the User's level in the database
    // This allows the AI to "remember" the student for their next login.
    let newLevel = "Medium";
    if (accuracy >= 80) newLevel = "Hard";
    else if (accuracy < 45) newLevel = "Easy";

    await User.update(
      { currentLevel: newLevel },
      { where: { id: req.user.id } },
    );

    console.log(`✅ RESULT INDEXED: ${req.user.username} scored ${accuracy}%`);
    res.status(201).json({ message: "Performance indexed", data: result });
  } catch (error) {
    console.error("❌ DB COMMIT ERROR:", error.message);
    res.status(500).json({ error: "Failed to index performance data" });
  }
};

// 3. STUDENT HISTORY: Personal Analytics Feed
exports.getStudentHistory = async (req, res) => {
  try {
    const history = await ExamResult.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json([]);
  }
};

// 4. TEACHER HISTORY: Global Performance Monitoring
exports.getAllHistory = async (req, res) => {
  try {
    const history = await ExamResult.findAll({
      include: [
        {
          model: User,
          as: "user", // Ensure this matches your model alias
          attributes: ["username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json([]);
  }
};

// 5. LEADERBOARD: Social Performance Ranking (Postgres Strict Fix)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ExamResult.findAll({
      attributes: [
        "userId",
        // Use lowercase alias for Postgres stability
        [sequelize.fn("AVG", sequelize.col("accuracy")), "avgaccuracy"],
        [sequelize.fn("COUNT", sequelize.col("ExamResult.id")), "examscount"],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username"],
          where: { role: "student" },
        },
      ],
      // Postgres requires grouping by every selected non-aggregate column
      group: ["userId", "user.id", "user.username"],
      // Sort by the aggregate calculation directly to bypass alias errors
      order: [[sequelize.fn("AVG", sequelize.col("accuracy")), "DESC"]],
      limit: 5,
    });
    res.json(leaderboard || []);
  } catch (error) {
    console.error("❌ LEADERBOARD ERROR:", error.message);
    res.status(500).json([]);
  }
};
