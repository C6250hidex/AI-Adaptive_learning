module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // Identity Label
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: [3, 100],
        },
      },
      // Security Credential: Unique Identity
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      // Hashed Key
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // ACCESS CONTROL: The 3-Tier Hierarchy
      role: {
        type: DataTypes.ENUM("admin", "teacher", "student"),
        defaultValue: "student",
      },
      // AI COGNITIVE MEMORY: Remembers the student's mastery level
      currentLevel: {
        type: DataTypes.ENUM("Easy", "Medium", "Hard"),
        defaultValue: "Medium",
      },
      // PERFORMANCE REWARD: Gamification metric
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      // PROFESSIONAL AUDITING & PERFORMANCE
      timestamps: true, // Tracks 'createdAt' for 'Member Since' stats
      indexes: [
        { fields: ["email"] }, // Speeds up the login process
        { fields: ["role"] }, // Speeds up the Admin User Management filters
      ],
      hooks: {
        // Senior Touch: Ensure data is always sanitized at the DB level
        beforeCreate: (user) => {
          user.email = user.email.toLowerCase().trim();
          user.username = user.username.trim();
        },
      },
    },
  );

  /**
   * DATABASE ASSOCIATIONS:
   * Programmatic mapping of the 3-Tier ecosystem logic.
   */
  User.associate = (models) => {
    // 1. STUDENT RELATIONSHIP: Links identity to academic performance logs
    User.hasMany(models.ExamResult, {
      foreignKey: "userId",
      as: "results",
      onDelete: "CASCADE", // Clean database: remove results if student is purged
    });

    // 2. TEACHER RELATIONSHIP: Maps a Lecturer to their academic track
    User.hasMany(models.Subject, {
      foreignKey: "teacherId",
      as: "managedSubjects",
    });

    // 3. CONTENT OWNERSHIP: Traceability of AI-generated content
    User.hasMany(models.Question, {
      foreignKey: "teacherId",
      as: "contributedQuestions",
    });
  };

  return User;
};
