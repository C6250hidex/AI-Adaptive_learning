module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    "Question",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // The core assessment item context
      questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // Assessment Options (Multiple Choice Matrix)
      optionA: { type: DataTypes.STRING, allowNull: false },
      optionB: { type: DataTypes.STRING, allowNull: false },
      optionC: { type: DataTypes.STRING, allowNull: false },
      optionD: { type: DataTypes.STRING, allowNull: false },

      // Psychometric Key
      correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["A", "B", "C", "D"]],
        },
      },
      // Module Classification
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "General",
      },

      // --- AI INTELLIGENCE METRICS ---

      // Predicted Difficulty Level (Easy, Medium, Hard)
      difficulty: {
        type: DataTypes.ENUM("Easy", "Medium", "Hard"),
        defaultValue: "Medium",
      },
      // Raw Numeric complexity score from Heuristic NLP
      aiScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      // Explainable AI (XAI) Justification string
      reasoning: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Ownership: Links to the Lecturer who indexed the item
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      // PROFESSIONAL SYSTEM OPTIMIZATION:
      // Indexes ensure the Adaptive Engine runs in O(1) or O(log n) time
      indexes: [
        { fields: ["subject"] },
        { fields: ["difficulty"] },
        { fields: ["teacherId"] },
      ],
      timestamps: true, // Tracks creation for content auditing
    },
  );

  /**
   * DATABASE RELATIONSHIPS:
   * Maps content ownership to the User Registry.
   */
  Question.associate = (models) => {
    Question.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "teacher",
      onDelete: "SET NULL", // Keep knowledge bank intact if teacher account is purged
    });
  };

  return Question;
};
