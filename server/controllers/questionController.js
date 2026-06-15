const { Question, User, sequelize } = require("../models");
const { analyzeDifficulty } = require("../utils/aiEngine");
const { Op } = require("sequelize");

/**
 * 1. CREATE: Single question entry with AI NLP Analysis
 */
exports.addQuestion = async (req, res) => {
  try {
    const { questionText, subject } = req.body;

    if (!questionText || !subject) {
      return res
        .status(400)
        .json({ message: "Context and Subject are required." });
    }

    // AI HEURISTICS: Get difficulty and reasoning from the NLP engine
    const aiResult = analyzeDifficulty(questionText);

    // Commit to PostgreSQL
    const newQuestion = await Question.create({
      ...req.body,
      subject: subject.trim(),
      difficulty: aiResult.difficulty,
      aiScore: aiResult.score,
      reasoning: aiResult.reasoning,
      teacherId: req.user.id, // Verified by protect middleware
    });

    console.log(`✅ [DB] Question indexed: ${aiResult.difficulty} level.`);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("❌ [SAVE ERROR]:", error.message);
    res.status(500).json({ error: "Database rejected the entry." });
  }
};

/**
 * 2. READ: Advanced Filtering & Pagination (Optimized for Postgres)
 */
exports.getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, difficulty, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    if (subject) whereClause.subject = subject;
    if (difficulty) whereClause.difficulty = difficulty;

    // Postgres Specific: Use iLike for case-insensitive search
    if (search) {
      whereClause.questionText = { [Op.iLike]: `%${search}%` };
    }

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
    });
  } catch (error) {
    console.error("❌ [QUERY ERROR]:", error.message);
    res.status(500).json({ error: "Registry query failed." });
  }
};

/**
 * 3. DELETE: Permanent record removal with ownership guard
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);

    if (!question)
      return res.status(404).json({ message: "Record not found." });

    // Security Guard: Admins can delete anything, Teachers only their own
    if (req.user.role !== "admin" && question.teacherId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Authorization rejected: Ownership required." });
    }

    await question.destroy();
    res.json({ message: "Record purged from database." });
  } catch (error) {
    res.status(500).json({ error: "Deletion cycle failed." });
  }
};

/**
 * 4. PREDICT ONLY: Real-time UI feedback loop
 */
exports.predictOnly = (req, res) => {
  try {
    const { questionText } = req.body;

    if (!questionText || questionText.length < 10) {
      return res
        .status(400)
        .json({ message: "Insufficient text for heuristic analysis." });
    }

    const result = analyzeDifficulty(questionText);

    res.json({
      prediction: result.difficulty,
      score: result.score,
      reasoning: result.reasoning,
    });
  } catch (error) {
    res.status(500).json({ error: "AI node connectivity issue." });
  }
};

/**
 * 5. BULK UPLOAD: Optimized Batch indexing
 */
exports.bulkUpload = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions))
      return res.status(400).json({ message: "Invalid array format." });

    const prepared = questions.map((q) => {
      const ai = analyzeDifficulty(q.questionText);
      return {
        ...q,
        difficulty: ai.difficulty,
        aiScore: ai.score,
        reasoning: ai.reasoning,
        teacherId: req.user.id,
      };
    });

    await Question.bulkCreate(prepared);
    res
      .status(201)
      .json({ message: `Successfully indexed ${questions.length} entries.` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Bulk indexing failed. Verify column mapping." });
  }
};

/**
 * 6. SUBJECT LIST: Category mapping for Course Discovery (Postgres Fix)
 */
exports.getSubjectList = async (req, res) => {
  try {
    const subjects = await Question.findAll({
      attributes: [
        "subject",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["subject"], // Required for Postgres aggregations
    });

    res.json(subjects || []);
  } catch (error) {
    console.error("❌ [SUBJECT LIST ERROR]:", error.message);
    res.status(500).json({ message: "Failed to fetch registry metadata." });
  }
};
