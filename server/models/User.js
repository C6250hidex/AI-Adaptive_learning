module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: [3, 20], // Professional constraint
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // The 3-Tier Access System
      role: {
        type: DataTypes.ENUM("admin", "teacher", "student"),
        defaultValue: "student",
      },
      // AI Memory: System remembers student performance across sessions
      currentLevel: {
        type: DataTypes.ENUM("Easy", "Medium", "Hard"),
        defaultValue: "Medium",
      },
      // Gamification/Progress Metric (Optional but professional)
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      // Professional auditing: Tracks when accounts are created/updated
      timestamps: true,
      indexes: [{ fields: ["email"] }, { fields: ["role"] }],
    },
  );

  /**
   * DATABASE ASSOCIATIONS:
   * Defines how Users interact with other tables in MySQL.
   */
  User.associate = (models) => {
    // 1. STUDENT RELATIONSHIP: A student has many exam results
    User.hasMany(models.ExamResult, {
      foreignKey: "userId",
      as: "results",
      onDelete: "CASCADE",
    });

    // 2. TEACHER RELATIONSHIP: A teacher can manage multiple subjects
    User.hasMany(models.Subject, {
      foreignKey: "teacherId",
      as: "managedSubjects",
    });

    // 3. CONTENT OWNERSHIP: A teacher owns the questions they upload
    User.hasMany(models.Question, {
      foreignKey: "teacherId",
      as: "contributedQuestions",
    });
  };

  return User;
};
