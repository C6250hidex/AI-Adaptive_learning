const { User, Question, ExamResult, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.getGlobalStats = async (req, res) => {
  try {
    // 1. High-Level KPI Totals (Parallel Execution for speed)
    const [totalStudents, totalQuestions, totalExamsTaken, globalAvgAccuracy] =
      await Promise.all([
        User.count({ where: { role: "student" } }),
        Question.count(),
        ExamResult.count(),
        ExamResult.findAll({
          attributes: [[sequelize.fn("AVG", sequelize.col("accuracy")), "avg"]],
        }),
      ]);

    // 2. Performance by Subject (Comparing AI Difficulty vs Student Performance)
    const subjectStats = await Question.findAll({
      attributes: [
        "subject",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("aiScore")), "avgDifficulty"],
      ],
      group: ["subject"],
    });

    // 3. AI Difficulty Distribution (Visualizing the "Brain's" output)
    const difficultyDist = await Question.findAll({
      attributes: [
        "difficulty",
        [sequelize.fn("COUNT", sequelize.col("id")), "value"],
      ],
      group: ["difficulty"],
    });

    // 4. Learning Trends (Predictive Progression over the last 7 entries)
    const trends = await ExamResult.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("AVG", sequelize.col("accuracy")), "avgAccuracy"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      limit: 7,
    });

    // 5. NEW: Real-World Insight - Struggling Subjects
    // We mine the ExamResult table to find where students score the lowest
    const strugglingSubjects = await ExamResult.findAll({
      attributes: [
        "subject",
        [sequelize.fn("AVG", sequelize.col("accuracy")), "avgScore"],
        [sequelize.fn("COUNT", sequelize.col("id")), "attempts"],
      ],
      group: ["subject"],
      order: [[sequelize.fn("AVG", sequelize.col("accuracy")), "ASC"]],
      limit: 3,
    });

    // 6. NEW: Audit Log - Recent Activity with User Identities
    // This allows the Admin to see WHO is doing WHAT in real-time
    const recentActivity = await ExamResult.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user", // Ensure this matches your ExamResult model association
          attributes: ["username", "email"],
        },
      ],
    });

    // Return the professional data package
    res.json({
      kpis: {
        totalStudents,
        totalQuestions,
        totalExamsTaken,
        avgGlobalAccuracy: globalAvgAccuracy[0].dataValues.avg
          ? parseFloat(globalAvgAccuracy[0].dataValues.avg).toFixed(1)
          : 0,
      },
      subjectStats,
      difficultyDist,
      trends,
      strugglingSubjects,
      recentActivity,
    });
  } catch (error) {
    console.error("DATA MINING ERROR:", error);
    res.status(500).json({
      error: "Failed to generate intelligent insights",
      details: error.message,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Security: Never leak hashes
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user registry" });
  }
};

// Update user roles (The Promote/Demote logic)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent demoting the last admin (Professional Safety)
    if (role !== "admin") {
      const adminCount = await User.count({ where: { role: "admin" } });
      const userToUpdate = await User.findByPk(id);
      if (userToUpdate.role === "admin" && adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "System requires at least one Root Admin." });
      }
    }

    await User.update({ role }, { where: { id } });
    res.json({ message: "Identity permissions updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Database update failed." });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety: Admin cannot delete themselves
    if (parseInt(id) === req.user.id) {
      return res
        .status(400)
        .json({ message: "Self-deletion is prohibited via Dashboard." });
    }

    await User.destroy({ where: { id } });
    res.json({ message: "User purged from registry." });
  } catch (error) {
    res.status(500).json({ error: "Identity deletion failed." });
  }
};
