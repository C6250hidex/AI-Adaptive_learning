const { Question, User, sequelize } = require("../models");
const { analyzeDifficulty } = require("../utils/aiEngine");
const { Op } = require("sequelize");

// 1. CREATE: Adding a single question with AI NLP Analysis
exports.addQuestion = async (req, res) => {
  try {
    const aiResult = analyzeDifficulty(req.body.questionText);

    // commit to MySQL
    const newQuestion = await Question.create({
      ...req.body,
      difficulty: aiResult.difficulty,
      aiScore: aiResult.score,
      reasoning: aiResult.reasoning,
      teacherId: req.user.id, // This links the question to the logged-in user
    });

    console.log("✅ Question committed to DB");
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. READ: Advanced Filtering for the Question Inventory
exports.getAllQuestions = async (req, res) => {
  try {
    // Extract pagination parameters with defaults
    const { page = 1, limit = 10, subject, difficulty, search } = req.query;
    const offset = (page - 1) * limit;

    // Build filtering logic
    let whereClause = {};
    if (subject) whereClause.subject = subject;
    if (difficulty) whereClause.difficulty = difficulty;
    if (search) {
      whereClause.questionText = { [Op.like]: `%${search}%` };
    }

    // findAndCountAll returns { count, rows }
    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      questions: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("QUERY ERROR:", error);
    res.status(500).json({ error: "Failed to query question registry." });
  }
};
// 3. DELETE: Removing content from the bank
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety check: Only the owner or an admin can delete
    const question = await Question.findByPk(id);
    if (!question)
      return res.status(404).json({ message: "Record not found." });

    if (req.user.role !== "admin" && question.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized deletion attempt." });
    }

    await question.destroy();
    res.json({ message: "Question successfully purged from registry." });
  } catch (error) {
    res.status(500).json({ error: "Purge cycle failed." });
  }
};
// 4. PREDICT ONLY: Real-time UI feedback for Lecturers
exports.predictOnly = (req, res) => {
  try {
    const { questionText } = req.body;

    if (!questionText || questionText.length < 5) {
      return res
        .status(400)
        .json({ message: "Insufficient text for AI analysis" });
    }

    // Call the AI Engine - it now returns EVERYTHING including reasoning
    const result = analyzeDifficulty(questionText);

    // Return exactly what the frontend expects
    res.json({
      prediction: result.difficulty,
      score: result.score,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error("PREDICT ERROR:", error);
    res.status(500).json({ error: "AI Engine processing failure" });
  }
};

// 5. BULK UPLOAD: Professional data entry (Optional feature)
exports.bulkUpload = async (req, res) => {
  try {
    const { questions } = req.body;

    // Process every question through the AI Engine in parallel
    const preparedQuestions = questions.map((q) => {
      const ai = analyzeDifficulty(q.questionText);
      return {
        ...q,
        difficulty: ai.difficulty,
        aiScore: ai.score,
        teacherId: req.user.id, // Track ownership
      };
    });

    await Question.bulkCreate(preparedQuestions);

    res.status(201).json({
      message: `AI Engine successfully indexed ${questions.length} questions into MySQL.`,
    });
  } catch (error) {
    res.status(500).json({ error: "Bulk indexing failed. Check data format." });
  }
};
// Get only unique subject names and counts (Safe for students)
exports.getSubjectList = async (req, res) => {
  try {
    const subjects = await Question.findAll({
      attributes: [
        "subject",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["subject"],
    });
    if (!subjects) return res.json([]);
    res.json(subjects);
  } catch (error) {
    console.error("SUBJECT LIST ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch subject registry",
      error: error.message,
    });
  }
};
