module.exports = (sequelize, DataTypes) => {
  const ExamResult = sequelize.define(
    "ExamResult",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // The specific module name (e.g., "Data Science")
      // Essential for Subject Mastery Analytics
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "General Assessment",
      },
      // Quantitative Performance Data
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Percentage calculated by the AI Adaptive Engine
      accuracy: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0,
          max: 100,
        },
      },
      // Temporal Tracking for Velocity Charts
      dateTaken: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      // PROFESSIONAL OPTIMIZATION:
      // Indexes allow MySQL/Postgres to retrieve student charts instantly
      indexes: [{ fields: ["subject"] }, { fields: ["userId"] }],
      timestamps: true, // Automatically adds createdAt and updatedAt for auditing
    },
  );

  /**
   * DATABASE RELATIONSHIPS:
   * Maps many results to one Student Identity.
   */
  ExamResult.associate = (models) => {
    // We use the alias 'user' (lowercase) to match our controller logic
    // Allows us to use res.user.username in the Teacher Dashboard
    ExamResult.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE", // Purge results if student account is deleted
    });
  };

  return ExamResult;
};
