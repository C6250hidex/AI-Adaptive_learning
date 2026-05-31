// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

module.exports = (sequelize, DataTypes) => {
  const ExamResult = sequelize.define(
    "ExamResult",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "General Assessment",
      },
      // Numerical performance data
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Percentage calculated by the Adaptive Engine
      accuracy: {
        type: DataTypes.FLOAT,
        validate: { min: 0, max: 100 },
      },
      // Timestamp of the session
      dateTaken: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    // {
    //   // Indexes help MySQL search faster when the database gets large
    //   indexes: [{ fields: ["subject"] }, { fields: ["userId"] }],
    // },
  );

  /**
   * DATABASE RELATIONSHIPS:
   * Each exam result is linked to exactly one student.
   */
  ExamResult.associate = (models) => {
    // We use 'as: user' to make the data readable in our controllers
    // Example: Result.User.username
    ExamResult.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE", // If a user is deleted, their results are removed
    });
  };

  return ExamResult;
};
