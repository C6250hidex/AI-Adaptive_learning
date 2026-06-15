const { User, Question, ExamResult, sequelize, Subject } = require("../models");
const { Op, Sequelize } = require("sequelize");

exports.getGlobalStats = async (req, res) => {
  try {
    // 1. High-Level KPI Totals (Parallel Execution)
    const [totalStudents, totalQuestions, totalExamsTaken, globalAvgAccuracy] =
      await Promise.all([
        User.count({ where: { role: "student" } }),
        Question.count(),
        ExamResult.count(),
        ExamResult.findAll({
          attributes: [[sequelize.fn("AVG", sequelize.col("accuracy")), "avg"]],
        }),
      ]);

    // 2. Performance by Subject (Postgres requires grouping by 'subject')
    const subjectStats = await Question.findAll({
      attributes: [
        "subject",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("aiScore")), "avgdifficulty"], // lowercase alias for Postgres
      ],
      group: ["subject"],
    });

    // 3. AI Difficulty Distribution
    const difficultyDist = await Question.findAll({
      attributes: [
        "difficulty",
        [sequelize.fn("COUNT", sequelize.col("id")), "value"],
      ],
      group: ["difficulty"],
    });

    // 4. Learning Trends (Postgres requires identical selection and grouping for DATE)
    const trends = await ExamResult.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("AVG", sequelize.col("accuracy")), "avgaccuracy"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      limit: 7,
    });

    // 5. Struggling Subjects (Postgres: Sort by the aggregate function itself)
    const strugglingSubjects = await ExamResult.findAll({
      attributes: [
        "subject",
        [sequelize.fn("AVG", sequelize.col("accuracy")), "avgscore"],
        [sequelize.fn("COUNT", sequelize.col("id")), "attempts"],
      ],
      group: ["subject"],
      order: [[sequelize.fn("AVG", sequelize.col("accuracy")), "ASC"]],
      limit: 3,
    });

    // 6. Audit Log: Recent Activity with Joins
    const recentActivity = await ExamResult.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user", // Matches ExamResult.associate as: 'user'
          attributes: ["username", "email"],
        },
      ],
    });

    // 7. Accuracy Calculation Logic (Handling Nulls for new DBs)
    const rawAvg = globalAvgAccuracy[0]?.get("avg");
    const processedAvg = rawAvg ? parseFloat(rawAvg).toFixed(1) : 0;

    // Return the professional data package
    res.json({
      kpis: {
        totalStudents,
        totalQuestions,
        totalExamsTaken,
        avgGlobalAccuracy: processedAvg,
      },
      subjectStats,
      difficultyDist,
      trends,
      strugglingSubjects,
      recentActivity,
    });
  } catch (error) {
    console.error("📊 DATA MINING ERROR:", error.message);
    res.status(500).json({
      error: "Failed to generate intelligent insights",
      details: error.message,
    });
  }
};

// 8. USER MANAGEMENT: Fetch User Registry
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user registry" });
  }
};

// 9. PERMISSION CONTROL: Promote/Demote Users
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Professional Security: Prevent "Last Admin" deletion
    if (role !== "admin") {
      const currentAdmin = await User.findByPk(id);
      if (currentAdmin && currentAdmin.role === "admin") {
        const adminCount = await User.count({ where: { role: "admin" } });
        if (adminCount <= 1) {
          return res.status(400).json({
            message:
              "Action rejected: System requires at least one root administrator.",
          });
        }
      }
    }

    await User.update({ role }, { where: { id } });
    res.json({ message: "Identity permissions updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Database update failed." });
  }
};

// 10. ACCOUNT PURGE: Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety: Admin cannot delete themselves via the UI
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        message: "Self-deletion is prohibited to prevent system lockout.",
      });
    }

    await User.destroy({ where: { id } });
    res.json({ message: "Identity successfully purged from registry." });
  } catch (error) {
    res.status(500).json({ error: "Identity deletion failed." });
  }
};
exports.createSubject = async (req, res) => {
  try {
    const { name, description, teacherId } = req.body;
    const newSubject = await Subject.create({
      name: name.trim(),
      description,
      teacherId: teacherId || null,
    });
    res
      .status(201)
      .json({
        message: "Learning module successfully indexed.",
        data: newSubject,
      });
  } catch (error) {
    res.status(500).json({ error: "Duplicate entry or database rejection." });
  }
};

// 6. DELETE SUBJECT: Removes a module
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.destroy({ where: { id } });
    res.json({ message: "Module purged from catalog." });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove subject." });
  }
};
